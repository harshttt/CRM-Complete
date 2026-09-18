import API_ENDPOINTS from '../constants/api-endpoints';
import {useQuery, useMutation} from '@tanstack/react-query';
import axios from "../utils/axios";
import axiosInstance from '../utils/axios';


export const useValidateToken = (options={}) => {
     return useQuery({
       queryKey: [API_ENDPOINTS.USER_VALIDATE_TOKEN], 
       queryFn: () => axios.post(API_ENDPOINTS.USER_VALIDATE_TOKEN),
        select:(data)=>data.data,
        retry:false,
        refetchOnWindowFocus:false,
        ...options
     }
    );
};

export const useLogin = ({onSuccess, onError}, others = {} ) => {
    return useMutation({
        mutationFn:async (data) => {
           const res = await axios.post(API_ENDPOINTS.USER_LOGIN, data);
           return res;
        },

        select:(data) => data.data,
        onSuccess:(res)=> {
            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(res);
            }
        },
        onError:(res)=> {
            if(onError && typeof onError === 'function'){
                onError(res);
            }
        },
        ...others
    });
};

export const useLogOut = ({ onSuccess, onError, ...options } = {}) => {
    const mutationResult = useMutation({
        mutationFn: async (data)=>{
            const res = await axiosInstance.post(API_ENDPOINTS.USER_LOGOUT, data);
            return res;
        },
        select: (data) => data.data,
        onSuccess: (res) => {
            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(res)
            }
        },
        onError: (res) => {
            if(onError && typeof onError === 'function'){
                onError(res);
            }
        },
        ...options
    });

    return {
        ...mutationResult
    }
};

export const useConstants = (options={}) => {
    return useQuery({
        queryKey:[API_ENDPOINTS.CONSTANTS],
        queryFn: async () => await axiosInstance.get(API_ENDPOINTS.CONSTANTS),
        select:res=> res.data,
        retry:false,
        refetchOnWindowFocus:false,
        ...options
    })
}

export const usePasswordUpdate = ({onSuccess, onError, ...options}) => {
    return useMutation({
        mutationFn: async ({id, ...data}) => {
            const res = await axiosInstance.put(`${API_ENDPOINTS.USER_UPDATE_PASSWORD}${id}/password`, data);
            return res;
        },
        onSuccess:(res) => {
            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(res);
            }
        },
        onError:(err)=>{
            if(onError && typeof onError === 'function'){
                onError(err);
            }
        },
        ...options
    })
}
