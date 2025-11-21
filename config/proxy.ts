/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  dev: {
    '/api/v1': {
      target: 'https://test-ai-dataset.tucdev.com/',
      // target: 'https://ai-dataset.tuchong.com/',
      // target: 'http://127.0.0.1:8080',
      // target: 'http://192.168.30.209:8080',
      // target: 'http://192.168.30.72:8080',
      changeOrigin: true,
      // pathRewrite: {
      //   '^/api/v1': '/api/v1',
      // },
      // pathRewrite: { '^/api/v1': '' },
    },
  },
};
