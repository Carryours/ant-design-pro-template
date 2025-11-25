// import { login } from '@/services/ant-design-pro/api';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { ProFormText } from '@ant-design/pro-components';
import { Helmet, history } from '@umijs/max';
import { App, Button, Form } from 'antd';
import { JSEncrypt } from 'jsencrypt';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { getRSAPublicKey, login } from '@/services/api/login';
import { updateUserInfo } from '@/store/slices/userSlice';
import Settings from '../../../../config/defaultSettings';
import './index.less';
import { RoleEnum } from '@/enums';
import store from '@/store';

// import loginBackground from '@/assets/login-background.png';
const { getState } = store;

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const [form] = Form.useForm();

  // 订阅用户名和密码的变化
  const username = Form.useWatch('username', form);
  const password = Form.useWatch('password', form);

  // 实时计算禁用状态（空字符串也视为未填）
  const disabled = !(username && password);

  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    // 登录
    getRSAPublicKey()
      .then((res) => {
        console.log(res);
        const encrypt = new JSEncrypt();
        encrypt.setPublicKey(res?.rsa);
        const password = encrypt.encrypt(values.password || '');
        if (!password) {
          message.error('加密失败！');
          return;
        }
        login({
          username: values.username || '',
          password: password,
          appID: 1,
        })
          .then((data) => {
            const isDatasetAdmin = data.roles.some(
              (role: API.RoleInfo) => role.keyword === RoleEnum.DatasetAdmin,
            );
            dispatch(
              updateUserInfo({
                token: data.token,
                expires: data.expires,
                name: values.username || '',
                roles: data.roles,
                isDatasetAdmin: isDatasetAdmin,
              }),
            );
            setLoading(false);
            const userInfo = getState().userInfo;
            const defaultLoginSuccessMessage = '登录成功！';
            message.success(defaultLoginSuccessMessage);
            const urlParams = new URL(window.location.href).searchParams;
            history.push(urlParams.get('redirect') || '/');
          })
          .catch((err) => {
            setLoading(false);
            // message.error(err?.message || err?.msg);
          });
      })
      .catch((err) => {
        setLoading(false);
        // message.error(err.message);
      });
  };

  return (
    <div className="login-container">
      <Helmet>
        <title>
          {'登录'}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      {/* 左侧背景图 */}
      <div
        className="login-left"
        style={{ backgroundImage: `url(${Settings.loginBackground})` }}
      />
      {/* 右侧登录表单 */}
      <div className="login-right">
        {/* 头部 Logo 和标题 */}
        <div className="login-header">
          <img
            src="/static/assets/logo-white.png"
            alt="logo"
            className="login-logo"
          />
          <h1 className="login-title">图虫AIGC 交付平台</h1>
        </div>
        {/* 登录表单 */}
        <div className="login-form-wrapper">
          <div className="login-form-title">账号密码登录</div>
          <Form form={form} onFinish={handleSubmit} autoComplete="off">
            <div style={{ marginBottom: '16px' }}>
              <label className="login-form-label" htmlFor="login-username">
                账号
              </label>
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: '请输入用户名',
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <ProFormText
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined style={{ color: '#999' }} />,
                    placeholder: '请输入用户名',
                    className: 'login-input',
                    id: 'login-username',
                  }}
                  noStyle
                />
              </Form.Item>
            </div>
            <div>
              <label className="login-form-label" htmlFor="login-password">
                密码
              </label>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: '请输入密码',
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <ProFormText.Password
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined style={{ color: '#999' }} />,
                    placeholder: '请输入密码',
                    className: 'login-input',
                    id: 'login-password',
                  }}
                  noStyle
                />
              </Form.Item>
            </div>
            <Form.Item>
              <Button
                loading={loading}
                disabled={disabled}
                type="primary"
                htmlType="submit"
                className="login-button"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
        {/* 底部 Logo */}
        <div className="login-footer">
          <img
            src="/static/assets/tc-slogan.png"
            alt="图虫创意"
            className="login-footer-logo"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
