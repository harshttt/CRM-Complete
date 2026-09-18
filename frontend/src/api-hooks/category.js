import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "../utils/axios"
import API_ENDPOINTS from "../constants/api-endpoints"
import { useState } from "react"

export const useCategoryCreate = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
        const res =  await axiosInstance.post(API_ENDPOINTS.CATEGORY_CREATE, data);
        return res;
    },
    onSuccess: (res) => {
        queryClient.invalidateQueries([API_ENDPOINTS.CATEGORY_LIST]);
        if(onSuccess && typeof onSuccess === 'function'){
            onSuccess(res);
        }

    },
    onError: (err) => {
        if(onError && typeof onError === 'function'){
            onError(err);
        }
    },
    ...options
  })
};

export const useCategoryList = ({qData={page:1, limit:20}, ...options}) => {
    const [query, setQuery] = useState(qData);

    const queryResult = useQuery({
        queryKey:[API_ENDPOINTS.CATEGORY_LIST, query],
        queryFn: async () => await axiosInstance.get(API_ENDPOINTS.CATEGORY_LIST, {params:query}),
        select:res => ({res, data:res?.data?.map(item => ({...item, key:item?.id })), qData: {...query, page:res?.page, total:res?.total, limit:res?.limit, totalPages: res?.totalPages}}),
        placeholderData:keepPreviousData,
        refetchOnMount:false,
        refetchOnWindowFocus:false,
        ...options
    });

   return ({
    ...queryResult,
    refetchWithQuery: (newQData) => {
        setQuery(prev=>({...prev, ...newQData}))
    }
   })

};

export const useCategoryUpdate = ({onSuccess, onError , ...options}) => {
    
    return useMutation({
        mutationFn: async ({id, ...data}) => {
            const res = await axiosInstance.put(`${API_ENDPOINTS.CATEGORY_UPDATE}${id}`, data);
            return res;
        },
        onSuccess: (res) => {
            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(res);
            }
        },
        onError: (err) => {
            if(onError && typeof onError === 'function'){
                onError(err);
            }
        },
        ...options
    })

};

export const useCategoryDelete = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const res = await axiosInstance.delete(`${API_ENDPOINTS.CATEGORY_DELETE}${id}`)
            return res.data;

        },
        onSuccess: (res) => {
            queryClient.invalidateQueries([API_ENDPOINTS.CATEGORY_LIST]);
            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(res);
            }
        },
        onError: (err) => {
            if(onError && typeof onError === 'function'){
                onError(err?.message);
            }

        },
        ...options
    })
};

export const useCategoryRestore = ({onSuccess, onError, ...options}) => {
    return useMutation({
        mutationFn: async (data) => {
            const res = await axiosInstance.post(API_ENDPOINTS.CATEGRORY_RESTORE, data);
            return res.data;

        },
        onSuccess: (res) => {
            if(onSuccess && typeof onSuccess === 'function'){
                 onSuccess(res)
            }
        },
        onError: (err) => {
            if(onError && typeof onError === 'function'){
                onError(err?.message);
            }
        },
        ...options
    })

};

export const useCategoryDropdown = ({qData = {page:1, limit: 20}}) => {
   const [query, setQuery] = useState(qData);
   const queryResult = useQuery({
    queryKey: [API_ENDPOINTS.CATEGORY_DROPDOWN, query],
    queryFn: async () => {
        const res = await axiosInstance.get(API_ENDPOINTS.CATEGORY_DROPDOWN,{params:query});
        return res.data;
    },
    refetchOnMount:false,
    refetchOnWindowFocus:false,
   });

   return {
    ...queryResult,
    refetchWithQuery: newQData => {
        setQuery(prev=> ({...prev, ...newQData}))
    }
   }

};

export const useCategoryDetail = ({id, ...options}) => {
     return useQuery({
        queryKey: [API_ENDPOINTS.CATEGORY_DETAIL, id],
        queryFn: async () => axiosInstance.get(`${API_ENDPOINTS.CATEGORY_DETAIL}${id}`),
        ...options
     });
};

export const useCategoryStatusToggle = () => {
    return useMutation({
        mutationFn: async () => {
            const res = await axiosInstance.put(API_ENDPOINTS.CATEGORY_TOGGLE);
            return res?.data;
        },
        onSuccess:(res)=>{
            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(res);
            }

        },
        onError:(err)=>{
            if(onError && typeof onError === 'function'){
                onError(err?.message);
            }

        }
    })

};

