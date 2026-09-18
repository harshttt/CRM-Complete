import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "../utils/axios"
import API_ENDPOINTS from "../constants/api-endpoints"
import { useEffect, useState } from "react";

export const useReminderCreate = ({onSuccess, onError, ...options}) => {
    const mutationResult  = useMutation({
        mutationFn: async (data) => {
            const res = await axiosInstance.post(API_ENDPOINTS.REMINDERE_CREATE, data);
            return res;
        },
        onSuccess:(res) => {
            if(onSuccess && typeof onSuccess === 'function') {
                onSuccess(res);
            }
        },
        onError:(err) => {
            if(onError && typeof onError === 'function') {
                onError(err);
            }
        },
        ...options
    });

    return {
        ...mutationResult
    }
    
}

export const useReminderList = ({qData={page:1, limit:20}, ...options}) => {
    const [query, setQuery] = useState(qData);
    const queryResult = useQuery({
        queryKey:[API_ENDPOINTS.REMINDERES_LIST, query],
        queryFn: async () => {
            const res = await axiosInstance.get(API_ENDPOINTS.REMINDERES_LIST, {params:query});
            return res;
        },
        select: res => ({
            res,
            data: res?.data?.map(item => ({
                key:item.id,
                ...item
            })),
            qData:{...query, page:res.page, limit:res.limit, totalPages:res.totalPages, total:res.total}
        }),
        keepPreviousData:true,
        refetchOnWindowFocus:false,
        ...options
    });

    useEffect(() => {
        setQuery(qData);
    },[]);

    return {
        ...queryResult,
        refetchWithQuery: newQuery => {
            setQuery(prev=> ({...prev, ...newQuery}));
        }
    }
};


export const useReminderDetail = ({initialId, ...options}) => {
    const [id, setId] = useState(initialId);
    const queryResult = useQuery({
        queryKey:[API_ENDPOINTS.REMINDERS_DETAIL, id],
        queryFn: async () => await axiosInstance.get(),
        select: res => res,
        retry:false,
        refetchOnWindowFocus:false,
        ...options
    });

    return {
        ...queryResult,
        refetchWithId:(newId) => {
            setId(prev => ({...prev, ...newId}));
        }
    }
};

export const useReminderUpdate = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();

    const mutationResult = useMutation({
        mutationFn: async ({id, ...data}) => {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.REMINDERES_UPDATE}${id}`, data);
            return res;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries([API_ENDPOINTS.REMINDERES_LIST]);

            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(data)
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
        ...mutationResult
    }
};

export const useReminderComplete = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();

    const mutationResult = useMutation({
        mutationFn: async (id) => {
            const res = await axiosInstance.patch(`${API_ENDPOINTS.REMINDER}${id}`);
            return res;
        },
        onSuccess:(res)=> {
            queryClient.invalidateQueries([API_ENDPOINTS.REMINDERES_LIST]);
            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(res);
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

export const useReminderDelete = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();

    const mutationResult = useMutation({
        mutationFn: async (id) => {
            const res = await axiosInstance.delete(`reminders/${id}`);
            return res;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries([API_ENDPOINTS.REMINDERES_LIST]);
            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(data);
            }
        },
        onError:(error) => {
            if(error && typeof error === 'function'){
                onError(error);
            }
        },
        ...options
    })

    return {
        ...mutationResult
    }
};


