import Axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getCookie } from 'utils/cookie';

const API = process.env.NEXT_PUBLIC_VTVL_API;

export const axiosClient = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000
});

const responseData = <T extends AxiosResponse<any, any>>(response: T) => response.data;

const handleError = (error: AxiosError) => {
  const status = error.response?.status;

  if (status == 401 || status == 403) {
    // TODO add UNAUTHORIZED handler
    return;
  }

  throw error;
};

const requestIntercepter = async (config: AxiosRequestConfig) => {
  const authToken = getCookie('access_token');

  if (authToken && config.headers) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
};

axiosClient.interceptors.request.use(requestIntercepter);

class CoreApiService {
  get = async <R>(url: string, params: AnyObject = {}) =>
    axiosClient
      .request<R>({
        method: 'get',
        url: `${API}/${url}`,
        params
      })
      .then<R>(responseData)
      .catch(handleError);

  post = async <R>(url: string, data: AnyObject = {}, { headers: headers_, ...config }: AxiosRequestConfig = {}) =>
    axiosClient
      .request<R>({
        method: 'post',
        url: `${API}/${url}`,
        headers: { ...headers_ },
        data,
        ...config
      })
      .then<R>(responseData)
      .catch(handleError);

  put = async <R>(url: string, data: AnyObject) =>
    axiosClient
      .request<R>({
        method: 'put',
        url: `${API}/${url}`,
        data
      })
      .then<R>(responseData)
      .catch(handleError);

  patch = async <R>(url: string, data: AnyObject = {}) =>
    axiosClient
      .request<R>({
        method: 'patch',
        url: `${API}/${url}`,
        data
      })
      .then<R>(responseData)
      .catch(handleError);

  delete = async <R>(url: string, data: AnyObject = {}) =>
    axiosClient
      .request<R>({
        method: 'delete',
        url: `${API}/${url}`,
        data
      })
      .then<R>(responseData)
      .catch(handleError);
}

export default new CoreApiService();
