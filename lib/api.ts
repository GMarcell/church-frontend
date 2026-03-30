import { AxiosRequestConfig } from "axios";
import { apiClient } from "./axios";

export const api = {
  get: async <TResponse, TParams = unknown>(
    url: string,
    params?: TParams,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> => {
    const response = await apiClient.get<TResponse>(url, {
      ...config,
      params,
    });
    return response.data;
  },

  post: async <TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> => {
    const response = await apiClient.post<TResponse>(url, data, config);
    return response.data;
  },

  put: async <TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> => {
    const response = await apiClient.put<TResponse>(url, data, config);
    return response.data;
  },

  patch: async <TResponse, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> => {
    const response = await apiClient.patch<TResponse>(url, data, config);
    return response.data;
  },

  delete: async <TResponse>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> => {
    const response = await apiClient.delete<TResponse>(url, config);
    return response.data;
  },
};
