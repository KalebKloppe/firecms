import { SaasApiError, SaasUser, SaasUserProject } from "../types";
import { handleApiResponse } from "./common";

export type ProjectsApi = ReturnType<typeof buildProjectsApi>;

export function buildProjectsApi(host: string, getBackendAuthToken: () => Promise<string>) {

    async function createNewFireCMSProject(projectId: string, googleAccessToken: string) {

        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(host + "/projects",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`,
                    "x-admin-authorization": `Bearer ${googleAccessToken}`
                },
                body: JSON.stringify({
                    projectId
                })
            })
            .then(async (res) => {
                return handleApiResponse(res, projectId).then((_) => true);
            });
    }

    async function createFirebaseWebapp(projectId: string) {

        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(host + `/projects/${projectId}/firebase_webapp`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`
                },
                body: JSON.stringify({
                    projectId
                })
            })
            .then(async (res) => {
                return handleApiResponse(res, projectId).then((_) => true);
            });
    }

    async function addSecurityRules(projectId: string, googleAccessToken: string) {

        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(host + `/projects/${projectId}/firestore_security_rules`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`,
                    "x-admin-authorization": `Bearer ${googleAccessToken}`
                }
            })
            .then(async (res) => {
                return handleApiResponse(res, projectId).then((_) => true);
            });
    }

    async function createNewUser(projectId: string,
                                 user: SaasUser): Promise<SaasUserProject> {

        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(host + "/projects/" + projectId + "/users",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`
                },
                body: JSON.stringify(user)
            })
            .then((res) => {
                return handleApiResponse<SaasUserProject>(res, projectId);
            });
    }

    async function updateUser(projectId: string,
                              uid: string,
                              user: SaasUser): Promise<SaasUserProject> {
        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(host + "/projects/" + projectId + "/users/" + uid,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`
                },
                body: JSON.stringify(user)
            })
            .then((res) => {
                return handleApiResponse<SaasUserProject>(res, projectId);
            });
    }

    async function deleteUser(projectId: string,
                              uid: string): Promise<void> {
        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(host + "/projects/" + projectId + "/users/" + uid,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`
                }
            })
            .then((res) => {
                return handleApiResponse<void>(res, projectId);
            });
    }

    const rootCollectionsCache: { [key: string]: string[] } = {};

    async function getRootCollections(projectId: string,
                                      googleAccessToken?: string): Promise<string[]> {
        if (rootCollectionsCache[projectId]) {
            return rootCollectionsCache[projectId];
        }

        const firebaseAccessToken = await getBackendAuthToken();
        const headers: {
            "Content-Type": string;
            Authorization: string;
            "x-admin-authorization"?: string;
        } = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firebaseAccessToken}`
        };

        if (googleAccessToken) {
            headers["x-admin-authorization"] = `Bearer ${googleAccessToken}`;
        }

        return fetch(host + "/projects/" + projectId + "/firestore_root_collections",
            {
                method: "GET",
                headers
            })
            .then(async (res) => {
                const result = await handleApiResponse<string[]>(res, projectId);
                rootCollectionsCache[projectId] = result;
                return result;
            });
    }

    async function createServiceAccount(googleAccessToken: string,
                                        projectId: string): Promise<SaasUserProject> {
        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(host + "/projects/" + projectId + "/service_accounts",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`,
                    "x-admin-authorization": `Bearer ${googleAccessToken}`
                }
            })
            .then(async (res) => {
                if (res.status === 409) // already exists
                    throw Error("The service account already exists for this project.")
                const data = await res.json();
                console.log("createServiceAccount res", res, data);
                return data.user as SaasUserProject;
            });
    }

    async function doDelegatedLogin(projectId: string): Promise<string> {
        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(host + "/projects/" + projectId + "/delegated_login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`
                },
                body: JSON.stringify({
                    projectId
                })
            })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new SaasApiError(data.message, data.code, projectId);
                }
                return data.data as string;
            });
    }

    async function getStripePortalLink(projectId: string): Promise<string> {
        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(`${host}/customer/stripe_portal_link?return_url=${encodeURIComponent(window.location.href)}&project_id=${projectId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`
                }
            })
            .then(async (res) => {
                const data = await res.json();
                return data.url as string;
            });
    }

    function getRemoteConfigUrl(projectId: string, revisionId?: string) {
        return `${host}/projects/${projectId}/customization/${revisionId}/remoteEntry.js`;
    }

    return {
        createNewFireCMSProject,
        createFirebaseWebapp,
        addSecurityRules,
        createServiceAccount,

        createNewUser,
        updateUser,
        deleteUser,
        getRootCollections,
        doDelegatedLogin,
        getStripePortalLink,

        getRemoteConfigUrl
    }
}
