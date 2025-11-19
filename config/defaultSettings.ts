import type { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  colorPrimary: '#1677ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: '图虫AIGC交付平台',
  pwa: true,
  // logo: '/static/assets/white-logo.png',
  iconfontUrl: '',
  token: {
    // 参见ts声明，demo 见文档，通过token 修改样式
    //https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F

    // Sider 侧边菜单配置
    sider: {
      colorMenuBackground: '#fff', // 菜单背景色
      colorTextMenuSelected: '#1677ff', // 菜单选中文字颜色
      colorBgMenuItemSelected: '#e6f7ff', // 菜单选中背景色
      colorTextMenuItemHover: 'rgba(0, 0, 0, 0.85)', // 菜单 hover 文字颜色
      colorBgMenuItemHover: 'rgba(0, 0, 0, 0.06)', // 菜单 hover 背景色
      colorTextMenu: 'rgba(0, 0, 0, 0.65)', // 菜单默认文字颜色
      colorTextMenuSecondary: 'rgba(0, 0, 0, 0.45)', // 菜单次要文字颜色
      colorBgMenuItemActive: 'rgba(0, 0, 0, 0.15)', // 菜单点击时背景色
    },

    // Header 顶部菜单配置（如果使用 top 或 mix 布局）
    // header: {
    //   colorHeaderTitle: 'rgba(0, 0, 0, 0.85)',     // 标题颜色
    //   colorTextMenu: 'rgba(0, 0, 0, 0.65)',        // 顶部菜单文字颜色
    //   colorTextMenuSelected: '#1890ff',            // 顶部菜单选中文字颜色
    //   colorBgMenuItemSelected: 'transparent',      // 顶部菜单选中背景色
    //   colorTextMenuActive: '#1890ff',              // 顶部菜单激活文字颜色
    //   colorBgMenuItemHover: 'rgba(0, 0, 0, 0.06)', // 顶部菜单 hover 背景色
    // },
  },
};

export default Settings;
