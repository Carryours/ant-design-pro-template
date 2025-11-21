export default [
  {
    path: '/',
    redirect: '/project',
  },
  {
    path: '/user',
    layout: false,
    routes: [{ name: '登录', path: '/user/login', component: './user/login' }],
  },
  {
    path: '/project',
    routes: [{ name: '项目列表', path: '/project', component: './project' }],
  },
  { path: '*', layout: false, component: './404' },
];
