import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { App } from 'antd';
import React, { type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { AvatarDropdown } from '@/components';
import store from '@/store';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import '@ant-design/v5-patch-for-react-19';

const API_BASE_URL = '/api/v1/';
const loginPath = '/user/login';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export function getInitialState(): {
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
} {
  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    return {
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  const { userInfo } = store.getState();
  return {
    logo: (
      <img
        alt="logo"
        src="/static/assets/logo-white.png"
        style={{ width: '48px', height: '48px' }}
      />
    ),
    avatarProps: {
      title: <span className="anticon">{userInfo.name || 'admin'}</span>,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    defaultCollapsed: true,
    breakpoint: false,
    token: {},
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return <>{children}</>;
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  ...errorConfig,
  timeout: 30 * 1e3,
  baseURL: API_BASE_URL,
};

export const rootContainer = (root: ReactNode) => {
  return (
    <Provider store={store}>
      <App>{root}</App>
    </Provider>
  );
};
