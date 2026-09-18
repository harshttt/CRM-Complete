import axios from "axios";
import config from "../config";
import util from "./util";
import API_ENDPOINTS from "../constants/api-endpoints";


const axiosInstance = axios.create({
    baseURL:config.apiUrl,
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config)=>{
        if (!config.skipAuth) {
            config.headers.Authorization = 'Bearer' + " " + util.getToken();
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
);

let refreshPromise = null;

const normalizeError = (error) => {
    const response = error.response?.data || {};
    const normalized = new Error(response.message || error.message || "Request failed");
    normalized.status = error.response?.status;
    normalized.response = error.response;
    normalized.errors = response.errors;
    return normalized;
};

axiosInstance.interceptors.response.use(
    (response)=> {
        if(typeof response.data === typeof String()){
            return {data:response.data, headers:response.headers};
        }
        return  {...response.data, headers: response.headers};
    },
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const isAuthRequest = originalRequest?.url?.includes("auth/login") ||
            originalRequest?.url?.includes("auth/refresh");

        if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest && util.getRefreshToken()) {
            originalRequest._retry = true;
            refreshPromise ||= axios.post(`${config.apiUrl}${API_ENDPOINTS.USER_REFRESH_TOKEN}`, null, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
                .then((response) => {
                    const tokenData = response.data?.data;
                    util.setTokens(tokenData || {});
                    return tokenData;
                })
                .catch((refreshError) => {
                    util.clearAuth();
                    throw refreshError;
                })
                .finally(() => {
                    refreshPromise = null;
                });

            try {
                const tokenData = await refreshPromise;
                originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                return Promise.reject(normalizeError(refreshError));
            }
        }

        let response = {};
        if(typeof error.response?.data !== 'undefined'){
            response = error.response.data;
            if(!response.message){
                response.message = error.message
            }
            if(response.errors && Array.isArray(response.errors)){
                response.message = response.errors[0].msg;
            }
            
        }else {
            response.message = error.message
        }
        const normalized = normalizeError(error);
        normalized.message = response.message || normalized.message;
        return Promise.reject(normalized);
    }
);

export default axiosInstance;