import axios, {
    AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface CustomAxiosRequestConfig
    extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let isRefreshing = false;

let failedQueue: {
    resolve: () => void;
    reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });

    failedQueue = [];
};

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const apiPrivate = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (
    callback: () => void
) => {
    onUnauthorized = callback;
};

apiPrivate.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest =
            error.config as CustomAxiosRequestConfig;

        const status = error.response?.status;

        if (
            (status === 401 || status === 403) &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh")
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: () =>
                            resolve(
                                apiPrivate(originalRequest)
                            ),
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            return new Promise((resolve, reject) => {
                api.post("/auth/refresh")
                    .then(() => {
                        processQueue(null);

                        resolve(
                            apiPrivate(originalRequest)
                        );
                    })
                    .catch((refreshError) => {
                        processQueue(refreshError);

                        onUnauthorized?.();

                        reject(refreshError);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            });
        }

        return Promise.reject(error);
    }
);

export default apiPrivate;