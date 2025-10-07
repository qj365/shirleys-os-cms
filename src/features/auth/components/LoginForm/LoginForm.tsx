import { _36_Enums_UserRole, api } from '@/lib/api/admin';
import { useAuthStore } from '@/lib/stores/authStore';
import { getPath } from '@/routers/router-paths';
import type { ObjectType } from '@/utils/types';
import { Button, Form, Input, message } from 'antd';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { login, logout } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(
    async (payload: ObjectType) => {
      try {
        setIsLoading(true);
        const { email, password } = payload || {};
        await login(email, password);

        const response = await api.admin.adminGetMe();

        if (response?.role === _36_Enums_UserRole.ADMIN) {
          navigate(getPath('portal'), {
            replace: true,
          });

          void message.success('Login successfully');
        } else {
          message.warning('Permission denied');
          await logout();
        }
      } catch {
        void message.error(
          'Login failed, please check your login information and try again later'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [login, logout, navigate]
  );

  return (
    <Form form={form} layout="vertical" onFinish={handleLogin}>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, whitespace: true }]}
      >
        <Input placeholder="Email" />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, whitespace: true }]}
      >
        <Input.Password placeholder="Password" />
      </Form.Item>

      <div className="mb-4 flex items-center justify-end gap-4">
        <Link to="#" className="text-base hover:text-primary">
          Forgot password?
        </Link>
      </div>

      <Form.Item>
        <Button
          type="primary"
          loading={isLoading}
          disabled={isLoading}
          htmlType="submit"
          className="w-full"
        >
          Login
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
