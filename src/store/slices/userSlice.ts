import { createSlice } from '@reduxjs/toolkit';

const USERINFOKEY = 'user_info';

const userInfo = JSON.parse(localStorage.getItem(USERINFOKEY) || '{}');

export const userSlice = createSlice({
  name: 'userInfo',
  initialState: {
    expires: userInfo.expires, // 这个字段暂时没用到，先存着
    token: userInfo.token,
    name: userInfo.name,
    roles: userInfo.roles,
    isDatasetAdmin: userInfo.isDatasetAdmin,
  },
  reducers: {
    updateUserInfo(
      state,
      actions: {
        payload: API.LoginData & {
          name: string;
          roles: API.RoleInfo[];
          isDatasetAdmin: boolean;
        };
      },
    ) {
      const { payload } = actions;
      localStorage.setItem(USERINFOKEY, JSON.stringify(payload));
      state.expires = payload?.expires;
      state.token = payload?.token;
      state.name = payload?.name;
      state.roles = payload?.roles;
      state.isDatasetAdmin = payload?.isDatasetAdmin;
    },
    removeUserInfo(state) {
      localStorage.removeItem(USERINFOKEY);
      state.expires = '';
      state.token = '';
      state.name = '';
      state.roles = [];
      state.isDatasetAdmin = false;
    },
  },
});

// 为每个 case reducer 函数生成 Action creators
export const { updateUserInfo, removeUserInfo } = userSlice.actions;
export default userSlice.reducer;
