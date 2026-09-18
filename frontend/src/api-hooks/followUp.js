import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import API_ENDPOINTS from "../constants/api-endpoints";
import { useState } from "react";

// ============ LIST ============
export const useFollowUpList = ({ qData, ...options } = {}) => {
  const [query, setQuery] = useState(qData || { page: 1, limit: 20 });
  const queryResult = useQuery({
    queryKey: [API_ENDPOINTS.FOLLOW_UP_LIST, query],
    queryFn: async () => {
      const res = await axiosInstance.get(API_ENDPOINTS.FOLLOW_UP_LIST, { params: query });
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

// ============ CREATE ============
export const useCreateFollowUp = ({ onSuccess, onError, ...options } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(API_ENDPOINTS.FOLLOW_UP_CREATE, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.FOLLOW_UP_LIST] });
      if (onSuccess && typeof onSuccess === "function") onSuccess(res);
    },
    onError: (err) => {
      if (onError && typeof onError === "function") onError(err);
    },
    ...options,
  });
};

// ============ UPDATE ============
export const useUpdateFollowUp = ({ onSuccess, onError, ...options } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await axiosInstance.put(`${API_ENDPOINTS.FOLLOW_UP_UPDATE}${id}`, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.FOLLOW_UP_LIST] });
      if (onSuccess && typeof onSuccess === "function") onSuccess(res);
    },
    onError: (err) => {
      if (onError && typeof onError === "function") onError(err);
    },
    ...options,
  });
};

// ============ COMPLETE ============
export const useCompleteFollowUp = ({ onSuccess, onError, ...options } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.post(`${API_ENDPOINTS.FOLLOW_UP_COMPLETE}${id}/complete`);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.FOLLOW_UP_LIST] });
      if (onSuccess && typeof onSuccess === "function") onSuccess(res);
    },
    onError: (err) => {
      if (onError && typeof onError === "function") onError(err);
    },
    ...options,
  });
};

// ============ DELETE ============
export const useDeleteFollowUp = ({ onSuccess, onError, ...options } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`${API_ENDPOINTS.FOLLOW_UP_DELETE}${id}`);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.FOLLOW_UP_LIST] });
      if (onSuccess && typeof onSuccess === "function") onSuccess(res);
    },
    onError: (err) => {
      if (onError && typeof onError === "function") onError(err);
    },
    ...options,
  });
};
