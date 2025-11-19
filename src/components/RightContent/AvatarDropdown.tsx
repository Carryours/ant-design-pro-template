import { LogoutOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { App } from 'antd';
import { stringify } from 'querystring';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { outLogin } from '@/services/api/login';
import { removeUserInfo } from '@/store/slices/userSlice';
import HeaderDropdown from '../HeaderDropdown';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({
  menu,
  children,
}) => {
  const { message } = App.useApp();
  const dispatch = useDispatch();
  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async () => {
    await outLogin().then(() => {
      dispatch(removeUserInfo());
      const { search, pathname } = window.location;
      const urlParams = new URL(window.location.href).searchParams;
      /** 此方法会跳转到 redirect 参数所在的位置 */
      const redirect = urlParams.get('redirect');
      // Note: There may be security issues, please note
      if (window.location.pathname !== '/user/login' && !redirect) {
        history.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: pathname + search,
          }),
        });
      }
    });
    // .catch((err) => {
    //   message.error(err.message);
    // });
  };

  const onMenuClick = useCallback((event: MenuInfo) => {
    const { key } = event;
    if (key === 'logout') {
      loginOut();
      return;
    }
  }, []);

  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      {children}
    </HeaderDropdown>
  );
};
