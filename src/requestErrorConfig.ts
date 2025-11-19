import { history } from '@@/core/history';
import type { RequestError, RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import type { AxiosError, AxiosResponse } from 'axios';
import store from './store';
import { removeUserInfo } from './store/slices/userSlice';

const { getState } = store;

import { message } from 'antd';

// 错误处理方案： 错误类型
// enum ErrorShowType {
//   SILENT = 0,
//   WARN_MESSAGE = 1,
//   ERROR_MESSAGE = 2,
//   NOTIFICATION = 3,
//   REDIRECT = 9,
// }
// 与后端约定的响应数据格式
// interface ResponseStructure {
//   success: boolean;
//   data: any;
//   errorCode?: number;
//   errorMessage?: string;
//   showType?: ErrorShowType;
// }

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      const userInfo = getState().userInfo;
      // 拦截请求配置，进行个性化处理。
      return {
        ...config,
        headers: {
          'Grpc-Metadata-token': userInfo.token || '',
          ...config.headers,
        },
      };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (res: AxiosResponse) => {
      // const { data: response } = res;
      // if (res.status === 401 && res?.data?.code === 16) {
      //   history.push('/user/login');
      //   store.dispatch(removeUserInfo());
      //   return Promise.reject(new Error('登录过期，请重新登录'));
      // }
      return res;
      // if (response.code === 0 || response.code === "NoError") {
      //   // 这里框架支持自动将 response.data 赋值给返回值， 配置可见config.ts中request.dataField
      //   return response;
      // } else {
      //   console.log(response)
      //   const errMsg = response.message || response.msg;
      //   message.error(errMsg);
      //   return Promise.reject(response);
      // }
    },
  ],

  errorConfig: {
    errorHandler: (error: RequestError) => {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        message.error('登录过期，请重新登录');
        history.push('/user/login');
        store.dispatch(removeUserInfo());
      } else if (axiosError.message) {
        message.error(
          (axiosError.response?.data as { message: string })?.message ||
            axiosError.message,
        );
      } else {
        message.error(axiosError.message);
      }
    },
  },
};
