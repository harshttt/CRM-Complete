import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import API_ENDPOINTS from "../constants/api-endpoints";
import { useState } from "react";

// ============ LIST ============
export const useSalesMeetingList = ({ qData, onSuccess, onError, ...options } = {}) => {
  const [query, setQuery] = useState(qData || { page: 1, limit: 20 });
  const queryResult = useQuery({
    queryKey: [API_ENDPOINTS.SALES_MEETING_LIST, query],
    queryFn: async () => {
      const res = await axiosInstance.get(API_ENDPOINTS.SALES_MEETING_LIST, { params: query });
      return res;
    },
    placeholderData: keepPreviousData,
    select: (res) => ({
      res,
      data: res?.data?.map((item) => ({ key: item.id, ...item })),
      qData: { ...query, page: res.page, limit: res.limit, totalPages: res.totalPages, total: res.total },
    }),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });

  return {
    ...queryResult,
    refetchWithQuery: (newQData) => {
      setQuery((prev) => ({ ...prev, ...newQData }));
    },
  };
};

// ============ DETAIL ============
export const useSalesMeetingDetail = (id, options = {}) => {
  return useQuery({
    queryKey: ["salesMeetingDetail", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`${API_ENDPOINTS.SALES_MEETING_DETAIL}${id}`);
      return res;
    },
    select: (res) => res?.data,
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// ============ STATS ============
export const useSalesMeetingStats = (options = {}) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.SALES_MEETING_STATS],
    queryFn: async () => {
      const res = await axiosInstance.get(API_ENDPOINTS.SALES_MEETING_STATS);
      return res;
    },
    select: (res) => res?.data,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// ============ ASSIGNABLE EMPLOYEES ============
export const useAssignableEmployees = ({ qData, ...options } = {}) => {
  const [query, setQuery] = useState(qData || { page: 1, limit: 50 });
  const queryResult = useQuery({
    queryKey: [API_ENDPOINTS.SALES_MEETING_ASSIGNABLE_EMPLOYEES, query],
    queryFn: async () => {
      const res = await axiosInstance.get(API_ENDPOINTS.SALES_MEETING_ASSIGNABLE_EMPLOYEES, { params: query });
      return res;
    },
    select: (res) => ({
      data: res?.data?.map((item) => ({ key: item.id, ...item })),
      total: res?.total,
    }),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });

  return {
    ...queryResult,
    refetchWithQuery: (newQData) => {
      setQuery((prev) => ({ ...prev, ...newQData }));
    },
  };
};

// ============ CREATE ============
export const useCreateSalesMeeting = ({ onSuccess, onError, ...options } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(API_ENDPOINTS.SALES_MEETING_CREATE, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SALES_MEETING_LIST] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SALES_MEETING_STATS] });
      if (onSuccess && typeof onSuccess === "function") onSuccess(res);
    },
    onError: (err) => {
      if (onError && typeof onError === "function") onError(err);
    },
    ...options,
  });
};

// ============ UPDATE ============
export const useUpdateSalesMeeting = ({ onSuccess, onError, ...options } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await axiosInstance.put(`${API_ENDPOINTS.SALES_MEETING_UPDATE}${id}`, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SALES_MEETING_LIST] });
      queryClient.invalidateQueries({ queryKey: ["salesMeetingDetail"] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SALES_MEETING_STATS] });
      if (onSuccess && typeof onSuccess === "function") onSuccess(res);
    },
    onError: (err) => {
      if (onError && typeof onError === "function") onError(err);
    },
    ...options,
  });
};

// ============ LIFECYCLE MUTATIONS ============
const makeLifecycleMutation = (actionPath, { onSuccess, onError, ...options } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) => {
      const res = await axiosInstance.post(`sales-meeting/${id}/${actionPath}`, body);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SALES_MEETING_LIST] });
      queryClient.invalidateQueries({ queryKey: ["salesMeetingDetail"] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SALES_MEETING_STATS] });
      if (onSuccess && typeof onSuccess === "function") onSuccess(res);
    },
    onError: (err) => {
      if (onError && typeof onError === "function") onError(err);
    },
    ...options,
  });
};

export const useConfirmMeeting = (opts) => makeLifecycleMutation("confirm", opts);
export const useCheckInMeeting = (opts) => makeLifecycleMutation("check-in", opts);
export const useStartMeeting = (opts) => makeLifecycleMutation("start", opts);
export const useCheckOutMeeting = (opts) => makeLifecycleMutation("check-out", opts);
export const useCompleteMeeting = (opts) => makeLifecycleMutation("complete", opts);
export const useCancelSalesMeeting = (opts) => makeLifecycleMutation("cancel", opts);
export const useReopenMeeting = (opts) => makeLifecycleMutation("reopen", opts);
