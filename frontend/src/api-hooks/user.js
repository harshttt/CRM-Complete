import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import API_ENDPOINTS from "../constants/api-endpoints";
import axiosInstance from "../utils/axios";

export const useUserList = (qData = { page: 1, limit: 20 }, options = {}) => {
  const [query, setQuery] = useState({ ...qData });

  const queryResult = useQuery({
    queryKey: [API_ENDPOINTS.USER_LIST, query],
    queryFn: async () => {
      const res = await axiosInstance.get(API_ENDPOINTS.USER_LIST, {params: query});
      return res;
    },
    select: res => {
      return {
        res,
        data: res?.data?.map((item) => ({ key: item.id, ...item })),
        qData: {
          ...query,
          page: res?.page,
          total: res?.total,
          totalPages: res?.totalPages,
        },
      };
    },
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });

  return {
    ...queryResult,
    refetchWithQuery: (newQData) => {
      setQuery(prev => ({ ...prev, ...newQData }));
    },
  };
};

export const useUserDropdown = ({ qData = { page: 1, limit: 20 }, key = '', ...options }) => {
  const [query, setQuery] = useState(qData);

  const queryResult = useQuery({
    queryKey: [API_ENDPOINTS.USER_DROPDOWN, query, key],
    queryFn: async () => {
      const res = await axiosInstance.get(API_ENDPOINTS.USER_DROPDOWN, { params: query });
      return res;
    },
    select: res => {
      return {
        res,
        data: res?.data?.map((item) => ({ key: item.id, ...item })),
        qData: {
          ...query,
          page: res?.page,
          total: res?.total,
          totalPages: res?.totalPages,
        },
      };
    },
    retry: false,
    refetchOnWindowFocus: false,
    ...options
  });

  return {
    ...queryResult,
    refetchWithQuery: (newQData) => {
      setQuery(prev => ({ ...prev, ...newQData }))},
  };
};

export const useUserSearch = ({ qData = { page: 1, limit: 20 }, key = '', ...options }) => {
  const [query, setQuery] = useState(qData);

  const queryResult = useQuery({
    queryKey: [API_ENDPOINTS.USER_SEARCH, query, key],
    queryFn: async () => {
      const res = await axiosInstance.get(API_ENDPOINTS.USER_SEARCH, { params: query });
      return res;
    },
    select: res => {
      return {
        res,
        data: res?.data?.map((item) => ({ key: item.id, ...item })),
        qData: {
          ...query,
          page: res?.page,
          total: res?.total,
          totalPages: res?.totalPages,
        },
      };
    },
    retry: false,
    refetchOnWindowFocus: false,
    ...options
  });

  return {
    ...queryResult,
    refetchWithQuery: (newQData) => {
      setQuery(prev => ({ ...prev, ...newQData }))},
  };
};

export const useUserTree = (qData={page:1, limit:20}, ...options) => {
  const [query, setQuery] = useState();
  const queryResult = useQuery({queryKey:[API_ENDPOINTS.USER_LIST,query],
    queryFn: async () => {

    },
    retry:false,
    refetchOnWindowFocus: false,
    ...options
  })

  return {
    ...queryResult,
    refetchWithQuery:newQData=> setQuery(prev=>({...prev, ...newQData})),
  }
};

export const useCreateUser = ({onSuccess, onError, ...options }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) =>
      axiosInstance.post(API_ENDPOINTS.USER_CREATE, data),
    select: (data) => data.data,
    onSuccess: (res) => {
      queryClient.invalidateQueries([API_ENDPOINTS.USER_CREATE]);
      // queryClient.setQueryData(
      //   [API_ENDPOINTS.USER_LIST, { ...qData }],
      //   (old) =>
      //     old && {
      //       ...old,
      //       data: old.data.find((v) =>
      //         v.id === res.data.id
      //           ? old.data.map((v) => (v.id === res.data.id ? res.data : v))
      //           : [res.data, ...old.data]
      //       ),
      //     }
      // );
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(res);
      }
    },
    onError: (res) => {
      if (onError && typeof onError === "function") {
        onError(res);
      }
    },
    ...options,
  });
};

export const useUpdateUser = ({onSuccess, onError, ...options}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => axiosInstance.put(`${API_ENDPOINTS.USER_UPDATE}${data.id}`, data),
    select: data => data.data,
    onSuccess: res => {
      queryClient.invalidateQueries([API_ENDPOINTS.USER_LIST]);
      // queryClient.setQueryData(
      //   [API_ENDPOINTS.USER_UPDATE, { ...qData, total: null }],
      //   (old) =>
      //     old && {
      //       ...old,
      //       data: old.data.find(v => v.id === res.data.id ? old.data.map((v) => (v.id === res.data.id ? res.data : v)) : [res.data, ...old.data]
      //       ),
      //     }
      // );
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(res);
      }
    },
    onError: res => {
      if (onError && typeof onError === "function") {
        onError(res);
      }
    },
    ...options,
  });
};

export const useFetchUserPermission = (id = "", options = {}) => {
  const queryResult = useQuery({
    queryKey: [API_ENDPOINTS.PERMISSION_USER, id],
    queryFn: async () => {
      const res = await axiosInstance.get(`${API_ENDPOINTS.PERMISSION_USER}/${id}`);
      return res.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
    // initialData: { data: [], qData: { ...query } },
    ...options,
  });

  return {
    ...queryResult,
  };
};

export const useSoftDeleteUser = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`${API_ENDPOINTS.USER_DELETE}${id}`);
      return res;
    },
    onSuccess: res => {
      queryClient.invalidateQueries([API_ENDPOINTS.USER_LIST]);

      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(res);
      }
    },
    onError: res => {
      if (onError && typeof onError === "function") {
        onError(res);
      }
    },
    ...options,
  });
};

export const useHardDeleteUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete( `${API_ENDPOINTS.USER_DELETE}/${id}`);
      return res;
    },
    onSuccess: res => {
      queryClient.invalidateQueries([API_ENDPOINTS.USER_LIST]);
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(res);
      }
    },
    onError: res => {
      if (onError && typeof onError === "function") {
        onError(res);
      }
    },
    ...options,
  });
};

export const useRestoreUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.patch( `${API_ENDPOINTS.USER_RESTORE}${id}`);
      return res;
    },
    onSuccess: res => {
      queryClient.invalidateQueries([API_ENDPOINTS.USER_LIST]);
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(res);
      }
    },
    onError: res => {
      if (onError && typeof onError === "function") {
        onError(res);
      }
    },
    ...options,
  });
};
