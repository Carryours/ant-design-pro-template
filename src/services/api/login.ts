import { request } from "@umijs/max";
/** 登录接口 */
export const login = (body: API.LoginParams): Promise<API.LoginRes> => {
  return request("user/login", { method: "POST", data: body });
};

/** 获取公钥 */
export const getRSAPublicKey = (): Promise<API.PublicKeyRes> => {
  return request("user/rsa", { method: "POST" });
};

/** 退出登录接口 */
export const outLogin = () => {
  return request("user/exit", { method: "POST" });
};
