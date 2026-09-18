import { useQuery } from "@tanstack/react-query"
import API_ENDPOINTS from "../constants/api-endpoints"
import axiosInstance from "../utils/axios"
import { useState } from "react";


export const usePermissionList = ({qData={page:1, limit:20},options={}}) => {
    const [query, setQuery] = useState(qData);
   const queryResult = useQuery({
    queryKey:[API_ENDPOINTS.PERMISSION_LIST, query] ,
    queryFn: async () =>  await axiosInstance.get(API_ENDPOINTS.PERMISSION_LIST,{params:query}),
    select:res => ({res, data:res?.data?.map(item => ({key:item?.id, ...item})), qData:{page:res?.page, limit:res?.limit, total:res?.total, totalPages:res?.totalPages}}),
    retry:false,
    refetchOnWindowFocus:false,
    ...options
   })

   return {
    ...queryResult,
    refetchWithQuery:(newQData)=>setQuery(prev=>({...prev, ...newQData}))
   }
};
