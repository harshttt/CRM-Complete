import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";
import API_ENDPOINTS from "../constants/api-endpoints";

export const useRolesList = (qData = { page: 1, limit: 20 }, options = {}) => {
  const [query, setQuery] = useState({ ...qData });
  const queryResult = useQuery({
    queryKey: [API_ENDPOINTS.ROLES_LIST, query],
    queryFn: async () => {
      const res = await axiosInstance.get(API_ENDPOINTS.ROLES_LIST, {
        params: { ...query },
      });
      return res;
    },
    select: (res) => {
      return {
        ...res,
        data: res?.data?.map((item) => ({ key: item.id, ...item })),
        qData: {
          ...query,
          page: res.page,
          totalPages: res.totalPages,
          total: res.total,
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
      setQuery((prev) => ({ ...prev, ...newQData }));
    },
  };
};

export const useRoleListForDropdown = (
  qData = { page: 1, limit: 20 },
  options = {}
) => {
  const [query, setQuery] = useState({ ...qData });
  const queryResult = useQuery({
    queryKey: [API_ENDPOINTS.ROLES_LIST_FOR_DROPDOWN, query],
    queryFn: async () => {
      const res = await axiosInstance.get(
        API_ENDPOINTS.ROLES_LIST_FOR_DROPDOWN,
        { params: { ...query } }
      );
      return res;
    },
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });

  return {
    ...queryResult,
    refetchWithQuery: (newQData = {}) => {
      setQuery((prev) => ({ ...prev, ...newQData }));
    },
  };
};

export const useCreateRole = (
  qData = { page: 1, limit: 20 },
  { onSuccess, onError, options = {} }
) => {
  const queryClient = useQueryClient();
  const mutationResult = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(API_ENDPOINTS.ROLES_CREATE, data);
      return res;
    },
    onSuccess: (res) => {
            // Refresh roles list automatically
      queryClient.invalidateQueries([
        API_ENDPOINTS.ROLES_LIST,
        qData,
      ]);
      // queryClient.setQueryData(
      //   [API_ENDPOINTS.ROLES_LIST, qData],
      //   (old) =>
      //     old && {
      //       ...old,
      //       data: old.data.find((item) =>
      //         item.id === res.data.id
      //           ? old.data.map((item) =>
      //               item.id === res.data.id ? res.data : item
      //             )
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

  return {
    ...mutationResult,
  };
};

export const useUpdateRole = (
  qData = { page: 1, limit: 20 },
  { onSuccess, onError, options = {} }
) => {
  const queryClient = useQueryClient();
  const mutationResult = useMutation({
    mutationFn: async (data) => {
      const {id, ...payload} = data;
      const res = await axiosInstance.put(`${API_ENDPOINTS.ROLES_UPDATE}${id}`, payload);
      return res;
    },
    onSuccess: (res) => {
            // Refresh roles list automatically
      queryClient.invalidateQueries([
        API_ENDPOINTS.ROLES_LIST,
        qData,
      ]);
      // queryClient.setQueryData(
      //   [API_ENDPOINTS.ROLES_LIST, qData],
      //   (old) =>
      //     old && {
      //       ...old,
      //       data: old.data.find((item) =>
      //         item.id === res.data.id
      //           ? old.data.map((item) =>
      //               item.id === res.data.id ? res.data : item
      //             )
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

  return {
    ...mutationResult,
  };
};

export const useDeleteRole = ({ onSuccess, onError, ...options }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(
        `${API_ENDPOINTS.ROLES_DELETE}${id}`
      );
      return res.data;
    },

    onSuccess: (res) => {
      // Refresh roles list automatically
      queryClient.invalidateQueries([
        API_ENDPOINTS.ROLES_LIST,
        { page: 1, limit: 20 },
      ]);
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(res);
      }
    },
    onError: (error) => {
      // console.error("Delete Role Error:", error?.message);
      if (onError && typeof onError === "function") {
        onError(error);
      }
    },
  });

  return {
    ...mutation,
    deleteRole: mutation.mutate, // sync version
    deleteRoleAsync: mutation.mutateAsync, // async/await version
  };
};

export const useHardDeleteRole = ({ onSuccess, onError, ...options }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(
        `${API_ENDPOINTS.ROLES_DELETE}${id}`
      );
      return res.data;
    },

    onSuccess: (res) => {
      // Refresh roles list automatically
      queryClient.invalidateQueries([
        API_ENDPOINTS.ROLES_LIST,
        { page: 1, limit: 20 },
      ]);
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(res);
      }
    },
    onError: (error) => {
      // console.error("Delete Role Error:", error?.message);
      if (onError && typeof onError === "function") {
        onError(error);
      }
    },
  });

  return {
    ...mutation,
    deleteRole: mutation.mutate, // sync version
    deleteRoleAsync: mutation.mutateAsync, // async/await version
  };
};

export const useRestoreRole = ( {onSuccess, onError, ...options}) => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.patch(
        `${API_ENDPOINTS.ROLES_RESTORE}${id}/restore`
      );
      return res;
    },
    onSuccess: (res) => {
      // Refresh roles list automatically
      queryClient.invalidateQueries([
        API_ENDPOINTS.ROLES_LIST,
        { page: 1, limit: 20 },
      ]);
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(res);
      }
    },
    onError: (error) => {
      // console.error("Delete Role Error:", error?.message);
      if (onError && typeof onError === "function") {
        onError(error);
      }
    },
    ...options,
  });

  return {
    ...mutationResult,
  };
};

export const useFetchRolePermission = (initialId = "", options) => {
  const [id, setId] = useState('');

  const queryResult = useQuery({
    queryKey: [API_ENDPOINTS.ROLES_FETCH_PERMISSIONS, id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `${API_ENDPOINTS.ROLES_FETCH_PERMISSIONS}${id}`
      );
      return res;
    },
    select: (res) => res,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });

  useEffect(() => {
    setId(initialId);
  }, [initialId]);


  return {
    ...queryResult,
    refetchWithId: (newId) => {
      setId(newId);
    },
  };
};
