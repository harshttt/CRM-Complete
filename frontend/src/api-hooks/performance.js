import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import API_ENDPOINTS from "../constants/api-endpoints";
import { useState } from "react";

export const usePerformanceList = ({qData={}, options={}}) => {
  const [query, setQuery] = useState({...qData});

  const queryResult = useQuery({
    queryKey:[API_ENDPOINTS.PERFORMANCE, query],
    queryFn: async () =>  await axiosInstance.get(API_ENDPOINTS.PERFORMANCE, {params:query}),
    placeholderData:keepPreviousData,
    select:res => ({data:res?.data, summary:res?.superAdminSummary}),
    retry:false,
    refetchOnWindowFocus:false,
    ...options
  });

  

  return {
    ...queryResult,
    refetchWithQuery: (newQData) => {setQuery(prev => ({...prev, ...newQData}))}
  }
};

