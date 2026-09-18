import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react"
import axiosInstance from "../utils/axios";
import API_ENDPOINTS from "../constants/api-endpoints";


export const useTaskList = ({qData={page:1, limit:20}, ...options}) => {
    const [query, setQuery] = useState(qData);
    const queryResult = useQuery({
        queryKey:[API_ENDPOINTS.TASK_LIST, query],
        queryFn: async () => {
            const res = await axiosInstance.get(API_ENDPOINTS.TASK_LIST, {params:query});
            return res;
        },
        select:res => ({
            res,
            data: res?.data?.map(item=> ({
                key:item.id,
                ...item
            })),
            qData:{...query, page:res?.page, limit: res?.limit, totalPages: res?.totalPages, total:res?.total, completed:res?.completed, pending:res?.pending, reminderPending:res?.reminderPending},
        }),
        keepPreviousData:true,
        refetchOnWindowFocus:false,
        ...options
    });

    useEffect(()=>{
        setQuery(qData)
    },[qData]);

    return {
        ...queryResult,
        refetchWithQuery: (newQuery) => {
            setQuery(prev=>({...prev,...newQuery}));
        }
    }

};

export const useTaskSave = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();

    const mutationResult = useMutation({
        mutationFn: async (data)=> {
            const res = await axiosInstance.post('task/create', data);
            return res;
        },
        onSuccess:(data) => {
            queryClient.invalidateQueries([API_ENDPOINTS.TASK_LIST]);
            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(data);
            }
        },
        onError:(error) => {
            if(onError && typeof onError === 'function'){
                onError(error);
            }l
        },
        ...options
    });

    return {
        ...mutationResult,
    }

};

export const useTaskUpdate = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();

    const mutationResult = useMutation({
        mutationFn: async ({id, ...data})=> {
            const res = await axiosInstance.put(`${API_ENDPOINTS.TASK_UPDATE}${id}`, data);
            return res;
        },
        onSuccess:(data) => {
            queryClient.invalidateQueries([API_ENDPOINTS.TASK_LIST]);

            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(data);
            }   
        },
        onError:(error) => {
            if(onError && typeof onError === 'function'){
                onError(error);
            }
        },
        ...options
    });

    return {
        ...mutationResult,
    }
};

export const useTaskComplete = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();

    const mutationResult = useMutation({
        mutationFn: async (id) => {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.TASK_COMPLETE}${id}`);
            return res;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries([API_ENDPOINTS.TASK_LIST]);
            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(res);
            }

        },
        onError: (error) => {
            if(onError && typeof onError === 'function'){
                onError(error);
            }

        },
        ...options
    });

    return {
        ...mutationResult,
    }
};

export const useTaskDelete = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();

    const mutationResult = useMutation({
        mutationFn: async (id)=> {
            const res  = await axiosInstance.delete(`task/soft_delete/${id}`);
            return res;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries([API_ENDPOINTS.TASK_LIST]);
            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(data);
            }
        },
        onError: (error) => {
            if(onError && typeof onError === 'function'){
                onError(error);
            }
        },
        ...options
    });

    return {
        ...mutationResult,
    }

};

export const useTaskLinkToLead = () => {


}

export const useTaskPrioritization = () => {

}

