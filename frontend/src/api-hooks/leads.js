import { useState } from "react"
import axiosInstance from "../utils/axios";
import { keepPreviousData, QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API_ENDPOINTS from "../constants/api-endpoints";

export const useLeadSave = ({qData={page:1, limit:20}, onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();
     return useMutation({
        mutationFn: async data => await axiosInstance.post(API_ENDPOINTS.LEAD_CREATE, data),
        select: res => res,
        onSuccess: res => {
            queryClient.invalidateQueries([API_ENDPOINTS.LEAD_LIST, {...qData}]);
        //    queryClient.setQueryData([API_ENDPOINTS.LEAD_LIST, {...qData}], (old)=> old && ({
        //     ...old,
        //     data: old.data.find(v=> v.id === res.data.id ? old.data.map(v=> v.id === res.data.id ? res.data : v) : [res.data, ...old.data])
        //    }));
           if(onSuccess && typeof onSuccess === 'function') onSuccess(res);
        },
        onError: res => {if(onError && typeof onError === 'function') onError(res)},
        ...options
    });

};

export const useLeadSummary = ({...options}) => {
     const queryResult = useQuery({
        queryKey: [API_ENDPOINTS.LEAD_SUMMARY],
        queryFn: async () => await axiosInstance.get(API_ENDPOINTS.LEAD_SUMMARY),
        select: res => res.data,
        placeholderData: keepPreviousData,
        retry: false,
        refetchOnWindowFocus: false,
        ...options
    });

    return {
        ...queryResult  
    }
};

export const useLeadList = ({qData={page:1, limit:20}, ...options}) => {
    const [query, setQuery] = useState({...qData});
  
    const queryResult = useQuery({
        queryKey: [API_ENDPOINTS.LEAD_LIST,{...query}],
        queryFn: async () => await axiosInstance.get(API_ENDPOINTS.LEAD_LIST,{params:query}),
        placeholderData:keepPreviousData,
        select: res => ({
                res,
                data: res.data.map(item => ({
                    key:item.id,
                    ...item
                })),
                qData:{...query, page:res.page, limit:res.limit, totalPages: res.totalPages, total:res.total},
                extra:{total:res?.total, inProgress:res?.inProgress, won:res?.won, lost:res?.lost}
            }),
        retry:false,
        refetchOnWindowFocus: false,
        ...options
    });

    return {
        ...queryResult,
        refetchWithQuery: (newQData) => {
           setQuery(prev=>({...prev, ...newQData}));
        }
    }
};

export const useLeadDetail = ({initialId, ...options}) => {
    const [id, setId] = useState(initialId);
    const queryResult = useQuery({
        queryKey:[API_ENDPOINTS.LEAD_DETAIL, id],
        queryFn: async () => await axiosInstance.get(`${API_ENDPOINTS.LEAD_DETAIL}${id}`),
        select: res => res,
        retry:false,
        refetchOnWindowFocus:false,
        ...options
    });

    return {
        ...queryResult,
        refetchWithId: (newId) => {
            setId(prev=> ({...prev, ...newId}));
        }
    }
};

export const useLeadDuplicate = ({leadId, qData={page:1, limit:20}, ...options}) => {
    const [query, setQuery] = useState(qData);
  
    const queryResult = useQuery({
        queryKey: [API_ENDPOINTS.LEAD_DUPLICATE, leadId, query],
        queryFn: async () => {
         const res =  await axiosInstance.get(`${API_ENDPOINTS.LEAD_DUPLICATE}${leadId}`, {params:query});
         return res;
        },
        select: (res) => ({
            data: res.data,
            qData: {
                ...query, 
                page: res?.data?.page, 
                limit: res?.data?.limit, 
                totalPages: res?.data?.totalPages, 
                total: res?.data?.total
            },
        }),
        placeholderData:(prev) => prev,
        retry: false,
        refetchOnWindowFocus: false,
        ...options
    });

    const refetchWithQuery = useCallback((newQData) => {
        setQuery(prev => ({...prev, ...newQData}));
    }, []);

    return {
        ...queryResult,
        refetchWithQuery
    }
};      

export const useLeadDelete = ({onSuccess, onError, ...others}) => {
    const queryClient = new QueryClient();
    return useMutation({
            mutationFn: id => axiosInstance.delete(`${API_ENDPOINTS.LEAD_DELETE}${id}`),
            onSuccess: res => {
                queryClient.invalidateQueries([API_ENDPOINTS.LEAD_LIST])
                if(onSuccess && typeof onSuccess === 'function') {
                    onSuccess(res);
                }
            },
            onError: err => {if(onError && typeof onError === 'function') onError(err)},
            ...others
        }
    );
};

export const useLeadUpdate = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({id,...data}) =>{ 
            const res = await axiosInstance.put(`${API_ENDPOINTS.LEAD_UPDATE}${id}`, data);
            return res;
        },
        onSuccess: res => {
            queryClient.invalidateQueries([API_ENDPOINTS.LEAD_LIST]);
            if(onSuccess && typeof onSuccess === 'function') onSuccess(res);
        },
        onError: err => { if(onError && typeof onError === 'function') onError(err); },
        ...options
    })

};

export const useLeadAssign = ({onSuccess, onError, ...options}) => { 
    const queryClient = useQueryClient();
     return useMutation({
       mutationFn: async ({id, ...payload}) =>  await axiosInstance.put(`${API_ENDPOINTS.LEAD_ASSIGN}${id}`, payload),
        onSuccess: (res) => { 
             queryClient.invalidateQueries([API_ENDPOINTS.LEAD_LIST]);
            if(onSuccess && typeof onSuccess === 'function') onSuccess(res) 
            },
        onError: (err) => { if(onError && typeof onError === 'function') onError(err);},
        ...options
    }
)
};

export const useLeadUpdateStage = ({onSuccess, onError, ...options}) => {
    return useMutation({
        mutationFn: async ({id, ...payload}) => await axiosInstance.put(`${API_ENDPOINTS.LEAD_UPDATE_STAGE}${id}`, payload),
        onSuccess: res => {if(onSuccess && typeof onSuccess === 'function') onSuccess(res)},
        onError: err => {if(onError && typeof onError === 'function') onError(err)},
        ...options
    })

};

export const useLeadUpdateNextFollowUp = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient;
    return useMutation({
        mutationFn : async data => await axiosInstance.put(API_ENDPOINTS.LEAD_UPDATE_NEXT_FOLLOW_UP, data),
        onSuccess: res => {queryClient.invalidateQueries([API_ENDPOINTS.LEAD_LIST]); if(onSuccess && typeof onSuccess === 'function') onSuccess(res);},
        onError: err => {if(onError && typeof onError === 'function') onError(err)},
        ...options
    })
};

export const useLeadAddTags = ({onSuccess, onError, ...options}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async data => await axiosInstance.put(API_ENDPOINTS.LEAD_ADD_TAGS, data),
    onSuccess: res => {queryClient.invalidateQueries([API_ENDPOINTS.LEAD_LIST]); if(onSuccess && typeof onSuccess === 'function') onSuccess(res)},
    onError: err => {if(onError && typeof onError === 'function') onError(err)},
    ...options
  })
};

export const useLeadLock = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({id, ...payload}) => await axiosInstance.post(`${API_ENDPOINTS.LEAD_LOCK_HEAD}${id}`, payload),
        onSuccess: res => {queryClient.invalidateQueries([API_ENDPOINTS.LEAD_LIST]); if(onSuccess && typeof onSuccess === 'function') onSuccess(res)},
        onError: err => {if(onError && typeof onError === 'function') onError(err)},
        ...options
    })

};

export const useLeadUnlock = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({id,...payload}) => await axiosInstance.post(`${API_ENDPOINTS.LEAD_UNLOCK_HEAD}${id}`, payload),
        onSuccess: res => {queryClient.invalidateQueries([API_ENDPOINTS.LEAD_LIST]); if(onSuccess && typeof onSuccess === 'function') onSuccess(res)},
        onError: err => {if(onError && typeof onError === 'function') onError(err)},
        ...options
    })

};

export const useLeadBulkAssign = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async data => axiosInstance.post(API_ENDPOINTS.LEAD_BULK_ASSIGN, data),
        onSuccess: res => {queryClient.invalidateQueries([API_ENDPOINTS.LEAD_LIST]); if(onSuccess && typeof onSuccess === 'function') onSuccess(res)},
        onError: err => {if(onError && typeof onError === 'function') onError(err)},
        ...options
    })
    
};

export const useLeadBulkImport = ({onSuccess, onError, ...options}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async data => axiosInstance.post(API_ENDPOINTS.LEAD_BULK_IMPORT, data),
        onSuccess: res => {queryClient.invalidateQueries([API_ENDPOINTS.LEAD_LIST]); if(onSuccess && typeof onSuccess === 'function') onSuccess(res)},
        onError: err => {if(onError && typeof onError === 'function') onError(err)},
        ...options
    })
};

export const useLeadBulkExport = ({ onSuccess, onError, ...options }) => {
  const mutationResult = useMutation({
    mutationFn: async (params) => {
      const response = await axiosInstance.get(API_ENDPOINTS.LEAD_BULK_EXPORT,{params});
      return response.data;
    },

    onSuccess: (data) => {
      if (typeof onSuccess === "function") {
        onSuccess(data);
      }
    },

    onError: (error) => {
      if (typeof onError === "function") {
        onError(error);
      }
    },

    ...options,
  });

  return mutationResult;
};

export const useLeadAssignmentHistory = ({qData={page:1, limit:20}, leadId, ...options}) => {
    const [query, setQuery] =  useState(qData);
    console.log('Lead id for fetching assignment history------>', leadId);

    const queryResult = useQuery({
        queryKey:[API_ENDPOINTS.LEAD_ASSIGNMENT_HISTORY, leadId, query],
        queryFn: async () => await axiosInstance.get(`${API_ENDPOINTS.LEAD_ASSIGNMENT_HISTORY}/${leadId}`, {params:query}),
        enabled:!!leadId,
        select: res => res.data,
        placeholderData:keepPreviousData,
        retry:false,
        refetchOnWindowFocus:false,
        ...options
    });

    return {
        ...queryResult,
        refetchWithQuery: (newQData) => {
            setQuery(prev => ({...prev, ...newQData}));
        }
    }
};

export const useLeadStageHistory = ({qData={page:1, limit:20}, leadId, ...options}) => {
    const [query, setQuery] = useState(qData);
    const queryResult = useQuery({
        queryKey:[API_ENDPOINTS.LEAD_STAGE_HISTORY, leadId, query],
        queryFn: async () => await axiosInstance.get(`${API_ENDPOINTS.LEAD_STAGE_HISTORY}/${leadId}`, {params:query}),
        select: res => res.data,
        placeholderData:keepPreviousData,
        retry:false,
        refetchOnWindowFocus:false,
        ...options
    });

    return {
        ...queryResult,
        refetchWithQuery: (newQData) => {
            setQuery(prev => ({...prev, ...newQData}));
        }
    }
};

export const useLeadRecycleRestore = () => {

};
