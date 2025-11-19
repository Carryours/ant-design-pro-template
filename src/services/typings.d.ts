/* eslint-disable */
type RoleEnum = 'dataset-admin' | 'dataset-viewer';
type AppEnum = '3';

declare namespace API {
  type CurrentUser = {
    name?: string;
    token?: string;
    expire?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
    appID?: number;
  };

  type Response<T = never> = {
    code?: number;
    data?: T;
    msg?: string;
    message?: string;
  };

  type PublicKeyRes = {
    data: {
      rsa: string;
    };
  };

  type LoginRes = {
    data: LoginData;
  };

  type LoginData = {
    expires: string;
    token: string;
    roles: RoleInfo[];
  };

  type RoleInfo = {
    keyword: RoleEnum;
    name: string;
    app: AppEnum;
  };
}
