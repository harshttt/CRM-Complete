import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import API_ENDPOINTS from "../constants/api-endpoints";
import { useState } from "react";

// ============ LIST ============
export const useCustomerList = ({ qData, ...options } = {}) => {
  const [query, setQuery] = useState(qData || { page: 1, limit: 20 });
  const queryResult = useQuery({
    queryKey: [API_ENDPOINTS.CUSTOMER_LIST, query],
    queryFn: async () => {
      const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER_LIST, { params: query });
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

// ============ DROPDOWN ============
export const useCustomerDropdown = (options = {}) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.CUSTOMER_DROPDOWN],
    queryFn: async () => {
      const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER_DROPDOWN);
      return res;
    },
    select: (res) => res?.data,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// ============ CREATE ============
export const useCreateCustomer = ({ onSuccess, onError, ...options } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(API_ENDPOINTS.CUSTOMER_CREATE, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CUSTOMER_LIST] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CUSTOMER_DROPDOWN] });
      if (onSuccess && typeof onSuccess === "function") onSuccess(res);
    },
    onError: (err) => {
      if (onError && typeof onError === "function") onError(err);
    },
    ...options,
  });
};

// ============ UPDATE ============
export const useUpdateCustomer = ({ onSuccess, onError, ...options } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await axiosInstance.put(`${API_ENDPOINTS.CUSTOMER_UPDATE}${id}`, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CUSTOMER_LIST] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CUSTOMER_DROPDOWN] });
      if (onSuccess && typeof onSuccess === "function") onSuccess(res);
    },
    onError: (err) => {
      if (onError && typeof onError === "function") onError(err);
    },
    ...options,
  });
};

// ============ DELETE ============
export const useDeleteCustomer = ({ onSuccess, onError, ...options } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`${API_ENDPOINTS.CUSTOMER_DELETE}${id}`);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CUSTOMER_LIST] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CUSTOMER_DROPDOWN] });
      if (onSuccess && typeof onSuccess === "function") onSuccess(res);
    },
    onError: (err) => {
      if (onError && typeof onError === "function") onError(err);
    },
    ...options,
  });
};
