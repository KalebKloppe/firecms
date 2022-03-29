import React, {
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import {
    Box,
    CircularProgress,
    Divider,
    IconButton,
    Tab,
    Tabs,
    useMediaQuery,
    useTheme
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
    Entity,
    EntityCollection,
    EntityStatus,
    EntityValues,
    ResolvedEntityCollection
} from "../../models";
import {
    CircularProgressCenter,
    EntityCollectionViewProps,
    EntityPreviewProps
} from "../components";
import { removeInitialAndTrailingSlashes } from "../util/navigation_utils";

import { CONTAINER_FULL_WIDTH, CONTAINER_WIDTH, TAB_WIDTH } from "./common";
import { ErrorBoundary } from "./ErrorBoundary";
import {
    saveEntityWithCallbacks,
    useAuthController,
    useDataSource,
    useEntityFetch,
    useFireCMSContext,
    useSideEntityController,
    useSnackbarController
} from "../../hooks";
import { canEditEntity } from "../util/permissions";
import { getResolvedCollection } from "../collections";
import { EntityFormProps } from "../../form";
import { fullPathToCollectionSegments } from "../util/paths";
import { useSideDialogContext } from "../SideDialogs";

import equal from "react-fast-compare"

const EntityCollectionView = lazy(() => import("../components/EntityCollectionView/EntityCollectionView")) as React.FunctionComponent<EntityCollectionViewProps<any>>;
const EntityForm = lazy(() => import("../../form/EntityForm")) as React.FunctionComponent<EntityFormProps<any>>;
const EntityPreview = lazy(() => import("../components/EntityPreview")) as React.FunctionComponent<EntityPreviewProps<any>>;

export interface EntityViewProps<M, UserType> {
    path: string;
    collection: EntityCollection<M>;
    entityId?: string;
    copy?: boolean;
    selectedSubPath?: string;
    formWidth?: number | string;
    onValuesAreModified: (modified: boolean) => void;
}

export const EntityView = React.memo<EntityViewProps<any, any>>(
    function EntityView<M extends { [Key: string]: any }, UserType>({
                                                                        path,
                                                                        entityId,
                                                                        selectedSubPath,
                                                                        copy,
                                                                        collection,
                                                                        onValuesAreModified,
                                                                        formWidth
                                                                    }: EntityViewProps<M, UserType>) {

        const resolvedWidth: string = typeof formWidth === "number" ? `${formWidth}px` : formWidth ?? CONTAINER_WIDTH;

        const dataSource = useDataSource();
        const sideDialogContext = useSideDialogContext();
        const sideEntityController = useSideEntityController();
        const snackbarController = useSnackbarController();
        const context = useFireCMSContext();

        const authController = useAuthController<UserType>();

        const [status, setStatus] = useState<EntityStatus>(copy ? "copy" : (entityId ? "existing" : "new"));
        const [currentEntityId, setCurrentEntityId] = useState<string | undefined>(entityId);
        const [readOnly, setReadOnly] = useState<boolean>(false);
        const [tabsPosition, setTabsPosition] = React.useState(-1);

        const [modifiedValues, setModifiedValues] = useState<EntityValues<M> | undefined>();

        const {
            entity,
            dataLoading,
            // eslint-disable-next-line no-unused-vars
            dataLoadingError
        } = useEntityFetch<M>({
            path,
            entityId: currentEntityId,
            collection,
            useCache: false
        });

        const editEnabled = entity ? canEditEntity(collection, authController, fullPathToCollectionSegments(path)) : false;

        const resolvedCollection: ResolvedEntityCollection<M> = useMemo(() => getResolvedCollection<M>({
            collection,
            path,
            entityId,
            values: modifiedValues,
            previousValues: entity?.values
        }), [collection, collection, path, entityId, modifiedValues]);

        const subcollections = resolvedCollection.subcollections;
        const customViews = resolvedCollection.views;
        const customViewsCount = customViews?.length ?? 0;

        useEffect(() => {
            if (entity)
                setReadOnly(!editEnabled);
        }, [entity, editEnabled]);

        const theme = useTheme();
        const largeLayout = useMediaQuery(theme.breakpoints.up("lg"));

        useEffect(() => {
            if (!selectedSubPath)
                setTabsPosition(-1);

            if (customViews) {
                const index = customViews
                    .map((c) => c.path)
                    .findIndex((p) => p === selectedSubPath);
                setTabsPosition(index);
            }

            if (collection.subcollections && selectedSubPath) {
                const index = collection.subcollections
                    .map((c) => c.path)
                    .findIndex((p) => p === selectedSubPath);
                setTabsPosition(index + customViewsCount);
        }
    }, [selectedSubPath]);

    const onPreSaveHookError = useCallback((e: Error) => {
        snackbarController.open({
            type: "error",
            title: "Error before saving",
            message: e?.message
        });
        console.error(e);
    }, []);

    const onSaveSuccessHookError = useCallback((e: Error) => {
        snackbarController.open({
            type: "error",
            title: `${resolvedCollection.name}: Error after saving (entity is saved)`,
            message: e?.message
        });
        console.error(e);
    }, []);

    const onSaveSuccess = useCallback((updatedEntity: Entity<M>) => {

        setCurrentEntityId(updatedEntity.id);

        snackbarController.open({
            type: "success",
            message: `${resolvedCollection.name}: Saved correctly`
        });

        setStatus("existing");
        onValuesAreModified(false);

        if (tabsPosition === -1)
            sideDialogContext.close();

    }, []);

    const onSaveFailure = useCallback((e: Error) => {

        snackbarController.open({
            type: "error",
            title: `${resolvedCollection.name}: Error saving`,
            message: e?.message
        });

        console.error("Error saving entity", path, entityId);
        console.error(e);
    }, []);

    const onEntitySave = useCallback(async ({
                                                collection,
                                                path,
                                                entityId,
                                                values,
                                                previousValues
                                            }: {
        collection: ResolvedEntityCollection<M>,
        path: string,
        entityId: string | undefined,
        values: EntityValues<M>,
        previousValues?: EntityValues<M>,
    }): Promise<void> => {

        if (!status)
            return;

        return saveEntityWithCallbacks({
            path,
            entityId,
            values,
            previousValues,
            collection,
            status,
            dataSource,
            context,
            onSaveSuccess,
            onSaveFailure,
            onPreSaveHookError,
            onSaveSuccessHookError
        });
    }, [status, collection, dataSource, context, onSaveSuccess, onSaveFailure, onPreSaveHookError, onSaveSuccessHookError]);

    const onDiscard = useCallback(() => {
        onValuesAreModified(false);
        if (tabsPosition === -1)
            sideDialogContext.close();
    }, [tabsPosition]);

    const form = !readOnly
        ? (
            <Suspense fallback={<CircularProgressCenter/>}>
                <EntityForm
                    key={`form_${path}_${entity?.id ?? "new"}`}
                    status={status}
                    path={path}
                    collection={collection}
                    onEntitySave={onEntitySave}
                    onDiscard={onDiscard}
                    onValuesChanged={setModifiedValues}
                    onModified={onValuesAreModified}
                    entity={entity}/>
            </Suspense>
        )
        : (
            <Suspense fallback={<CircularProgressCenter/>}>
                <EntityPreview
                    entity={entity as Entity<M>}
                    path={path}
                    collection={resolvedCollection}/>
            </Suspense>
        );

    const customViewsView: JSX.Element[] | undefined = customViews && customViews.map(
        (customView, colIndex) => {
            return (
                <Box
                    sx={{
                        width: TAB_WIDTH,
                        height: "100%",
                        overflow: "auto",
                        borderLeft: `1px solid ${theme.palette.divider}`,
                        [theme.breakpoints.down("lg")]: {
                            borderLeft: "inherit",
                            width: CONTAINER_FULL_WIDTH
                        }
                    }}
                    key={`custom_view_${customView.path}_${colIndex}`}
                    role="tabpanel"
                    flexGrow={1}
                    hidden={tabsPosition !== colIndex}>
                    <ErrorBoundary>
                        {customView.builder({
                            collection: resolvedCollection,
                            entity,
                            modifiedValues: modifiedValues ?? entity?.values
                        })}
                    </ErrorBoundary>
                </Box>
            );
        }
    );

    const subCollectionsViews = subcollections && subcollections.map(
        (subcollection, colIndex) => {
            const fullPath = entity ? `${entity?.path}/${entity?.id}/${removeInitialAndTrailingSlashes(subcollection.path)}` : undefined;

            return (
                <Box
                    sx={{
                        width: TAB_WIDTH,
                        height: "100%",
                        overflow: "auto",
                        borderLeft: `1px solid ${theme.palette.divider}`,
                        [theme.breakpoints.down("lg")]: {
                            borderLeft: "inherit",
                            width: CONTAINER_FULL_WIDTH
                        }
                    }}
                    key={`subcol_${subcollection.name}_${colIndex}`}
                    role="tabpanel"
                    flexGrow={1}
                    hidden={tabsPosition !== colIndex + customViewsCount}>

                    {dataLoading && <CircularProgressCenter/>}

                    {!dataLoading &&
                        (entity && fullPath
                            ? <Suspense fallback={<CircularProgressCenter/>}>
                                <EntityCollectionView
                                    fullPath={fullPath}
                                    collection={subcollection}/>
                            </Suspense>
                            : <Box m={3}
                                   display={"flex"}
                                   alignItems={"center"}
                                   justifyContent={"center"}>
                                <Box>
                                    You need to save your entity before
                                    adding additional collections
                                </Box>
                            </Box>)
                    }

                </Box>
            );
        }
    );

    const getSelectedSubPath = useCallback((value: number) => {
        if (value === -1) return undefined;

        if (customViews && value < customViewsCount) {
            return customViews[value].path;
        }

        if (subcollections) {
            return subcollections[value - customViewsCount].path;
        }

        throw Error("Something is wrong in getSelectedSubPath");
    }, [customViews, customViewsCount, subcollections]);

    const onSideTabClick = useCallback((value: number) => {
        setTabsPosition(value);
        if (entityId) {
            sideEntityController.replace({
                path,
                entityId,
                selectedSubPath: getSelectedSubPath(value),
                updateUrl: true
            });
        }
    }, [sideEntityController, entityId]);

    const header = (
        <Box sx={{
            paddingLeft: 2,
            paddingRight: 2,
            paddingTop: 2,
            display: "flex",
            alignItems: "center",
            backgroundColor: theme.palette.mode === "light" ? theme.palette.background.default : theme.palette.background.paper
        }}
        >

            <IconButton onClick={() => sideDialogContext.close()}
                        size="large">
                <CloseIcon/>
            </IconButton>

            <Tabs
                value={tabsPosition === -1 ? 0 : false}
                indicatorColor="secondary"
                textColor="inherit"
                scrollButtons="auto"
            >
                <Tab
                    label={resolvedCollection.name}
                    sx={{
                        fontSize: "0.875rem",
                        minWidth: "140px"
                    }}
                    wrapped={true}
                    onClick={() => {
                        onSideTabClick(-1);
                    }}/>
            </Tabs>

            <Box flexGrow={1}/>

            {dataLoading &&
            <CircularProgress size={16} thickness={8}/>}

            <Tabs
                value={tabsPosition >= 0 ? tabsPosition : false}
                indicatorColor="secondary"
                textColor="inherit"
                onChange={(ev, value) => {
                    onSideTabClick(value);
                }}
                sx={{
                    paddingLeft: theme.spacing(1),
                    paddingRight: theme.spacing(1),
                    paddingTop: theme.spacing(0)
                }}
                variant="scrollable"
                scrollButtons="auto"
            >

                {customViews && customViews.map(
                    (view) =>
                        <Tab
                            sx={{
                                fontSize: "0.875rem",
                                minWidth: "140px"
                            }}
                            wrapped={true}
                            key={`entity_detail_custom_tab_${view.name}`}
                            label={view.name}/>
                )}

                {subcollections && subcollections.map(
                    (subcollection) =>
                        <Tab
                            sx={{
                                fontSize: "0.875rem",
                                minWidth: "140px"
                            }}
                            wrapped={true}
                            key={`entity_detail_collection_tab_${subcollection.name}`}
                            label={subcollection.name}/>
                )}

            </Tabs>
        </Box>

    );

    const mainViewSelected = tabsPosition === -1;
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
                transition: "width 250ms ease-in-out",
            }}>
            {
                <>

                    {header}

                    <Divider/>

                    <Box sx={{
                        flexGrow: 1,
                        height: "100%",
                        width: `calc(${TAB_WIDTH} + ${resolvedWidth})`,
                        maxWidth: "100%",
                        [theme.breakpoints.down("sm")]: {
                            width: CONTAINER_FULL_WIDTH
                        },
                        display: "flex",
                        overflow: "auto",
                        flexDirection: "row"
                    }}>

                        <Box sx={{
                            position: "relative"
                        }}>
                            <Box
                                role="tabpanel"
                                hidden={!largeLayout && !mainViewSelected}
                                sx={{
                                    width: resolvedWidth,
                                    maxWidth: "100%",
                                    height: "100%",
                                    overflow: "auto",
                                    [theme.breakpoints.down("sm")]: {
                                        maxWidth: CONTAINER_FULL_WIDTH,
                                        width: CONTAINER_FULL_WIDTH
                                    }
                                }}>
                                {dataLoading
                                    ? <CircularProgressCenter/>
                                    : form}
                            </Box>
                        </Box>

                        {customViewsView}

                        {subCollectionsViews}

                    </Box>

                </>
            }

        </Box>
    );
    },
    equal
)
