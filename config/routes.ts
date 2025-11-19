export default [
  {
    path: '/',
    redirect: '/user/login',
  },
  {
    path: '/user',
    layout: false,
    routes: [{ name: '登录', path: '/user/login', component: './user/login' }],
  },
  { path: '*', layout: false, component: './404' },
];
