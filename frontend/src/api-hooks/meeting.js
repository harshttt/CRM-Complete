import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import axiosInstance from "../utils/axios";
import API_ENDPOINTS from "../constants/api-endpoints";
import { useState } from "react";

export const useMeetingList = ({qData, onSuccess, onError, ...options}) => {
    const [query, setQuery] = useState(qData);
    const queryResult = useQuery({
        queryKey:[API_ENDPOINTS.MEETING_LIST, query],
        queryFn: async () => {
            const res = await axiosInstance.get(API_ENDPOINTS.MEETING_LIST,{params:query});
            return res;
        },
        placeholderData:keepPreviousData,
        select:res => ({
            res,
            data:res?.data?.map(item=> ({
                key:item.id,
                ...item
            })),
            qData:{...query, page:res.page, limit:res.limit, totalPages:res.totalPages, total:res.total}
        }),
        retry:false,
        refetchOnWindowFocus:false,
        ...options
    });

    return {
        ...queryResult,
        refetchWithQuery: newQData => {
            setQuery(prev=> ({...prev, ...newQData}))
        }
    }
}

export const useSchduleMeeting = ({onSuccess, onError , ...options}) => {
    const mutationResult = useMutation({
        mutationFn: async (data)=>{
            const res = await axiosInstance.post(API_ENDPOINTS.MEETING_SCHEDULE, data);
            return res;
        },
        onSuccess:(res) => {
            if(onSuccess && typeof onSuccess === 'function'){
                onSuccess(res);
            }
        },
        onError: (data) => {
            if(onError && typeof onError === 'function'){
                onError(data);
            }
        },
        ...options
    });

    return {
        ...mutationResult
    }

}

export const useCancelMeeting = ({onSuccess, onError, ...options}) => {
    const mutationResult = useMutation({
        mutationFn: async (id) => {
               const res = await axiosInstance.patch(`${API_ENDPOINTS.MEETING_CANCEL}${id}/cancel`);
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
    });

    return {
        ...mutationResult
    }
}

export const useUpdateMeeting = ({onSuccess, onError, ...options}) => {
  const mutationResult = useMutation({
    mutationFn: async ({id, ...data}) => {
       const res = await axiosInstance.put(`${API_ENDPOINTS.MEETING_UPDATE}${id}`, data);
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
  });

  return {
    ...mutationResult
  }
}
