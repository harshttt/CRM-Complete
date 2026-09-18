import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "../utils/axios"
import API_ENDPOINTS from "../constants/api-endpoints"
import { useState } from "react"


export const useListComment = ({qData, leadId, ...options}) => {
    const [query, setQuery] = useState(qData);
    const queryResult = useQuery({
        queryKey:[API_ENDPOINTS.COMMENTS_LIST,{...query}],
        queryFn: async () => {
            const res = await axiosInstance.get(`${API_ENDPOINTS.COMMENTS_LIST}${leadId}`,{params:query});
            return res;
        },
        select:res=>({res, data:res?.data?.map(item=> ({...item, key:item?.id})), qData:{page:res?.page,limit:res?.limit, total:res?.total, totalPages:res?.totalPages}}),
        retry:false,
        refetchOnWindowFocus:false,
        ...options
    });

    return {
        ...queryResult,
        refetchWithQuery: (newQData) => {
            setQuery(prev => ({prev, ...newQData}))
        }
    }
};

export const useAddComment = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({leadId,...data}) => {
            const res = await axiosInstance.post(`${API_ENDPOINTS.COMMENTS_ADD}${leadId}`, data);
            return res.data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries([API_ENDPOINTS.COMMENTS_LIST]);
            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(res)
            }
            
        },
        onError: (err) => {
            if(onError && typeof onError === 'function'){
                onError(err);
            }
        },
        ...options
    })    
}

export const useUpdateComment = ({onSuccess, onError, ...options}) => {
   const queryClient = useQueryClient();
   return useMutation({
    mutationFn: async ({id,...data}) => await axiosInstance.put(`${API_ENDPOINTS.COMMENTS_UPDATE}${id}`, data),
    onSuccess:res=> {
        queryClient.invalidateQueries([API_ENDPOINTS.COMMENTS_LIST]);
        if(onSuccess && typeof onSuccess === 'function'){
            onSuccess(res)
        }
    },
    onError: err => {
        if(onError && typeof onError === 'function'){
            onError(err)
        }
    },
    ...options
   })
}