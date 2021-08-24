import { useEffect, useState } from "react";
import { Entity, EntitySchema } from "../models";
import { useDataSource } from "./useDataSource";

/**
 * @category Hooks and utilities
 */
export interface EntityFetchProps<M extends { [Key: string]: any }> {
    collectionPath?: string,
    entityId?: string,
    schema?: EntitySchema<M>,
}

/**
 * @category Hooks and utilities
 */
export type EntityFetchResult<M extends { [Key: string]: any }> = {
    entity?: Entity<M>,
    dataLoading: boolean,
    dataLoadingError?: Error
}

/**
 * This hook is used to fetch an entity.
 * It gives real time updates if the datasource supports it.
 * @param path
 * @param schema
 * @param entityId
 * @category Hooks and utilities
 */
export function useEntityFetch<M extends { [Key: string]: any }>(
    {
        collectionPath,
        entityId,
        schema
    }: EntityFetchProps<M>): EntityFetchResult<M> {

    const dataSource = useDataSource();
    const [entity, setEntity] = useState<Entity<M> | undefined>();
    const [dataLoading, setDataLoading] = useState<boolean>(true);
    const [dataLoadingError, setDataLoadingError] = useState<Error | undefined>();

    useEffect(() => {

        setDataLoading(true);

        const onEntityUpdate = (updatedEntity: Entity<M> | undefined) => {
            setEntity(updatedEntity);
            setDataLoading(false);
            setDataLoadingError(undefined);
        };

        const onError = (error: Error) => {
            console.error("ERROR", error);
            setDataLoading(false);
            setEntity(undefined);
            setDataLoadingError(error);
        };

        if (entityId && collectionPath && schema) {
            if (dataSource.listenEntity) {
                return dataSource.listenEntity<M>(
                    collectionPath,
                    entityId,
                    schema,
                    onEntityUpdate,
                    onError);
            } else {
                dataSource.fetchEntity<M>(
                    collectionPath,
                    entityId,
                    schema)
                    .then(onEntityUpdate)
                    .catch(onError);
                return () => {
                };
            }
        }
        // if no entityId is provided we do nothing
        else {
            onEntityUpdate(undefined);
            return () => {
            };
        }
    }, [entityId, schema, collectionPath]);

    return {
        entity,
        dataLoading,
        dataLoadingError
    };

}
