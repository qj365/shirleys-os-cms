import { Button, Checkbox, Form, Input } from 'antd';
import {
  FORM_FIELD,
  FormLabels,
  FormValidations,
} from 'features/auth/components/LoginForm/constants';
import { useSignInUserMutation } from 'features/auth/query';
import { updateAuthStore } from 'features/auth/slice';
import type { TUserSignInPayload } from 'features/auth/types';
import { useAppDispatch } from 'lib/stores';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPath } from 'routers/router-paths';

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isRememberLogin, setIsRememberLogin] = useState(true);

  const [userLoginMutationFn, { isLoading, data: userSignInResponse }] =
    useSignInUserMutation();

  const handleLogin = useCallback(
    (payload: TUserSignInPayload) => {
      userLoginMutationFn(payload);
    },
    [userLoginMutationFn]
  );

  useEffect(() => {
    if (userSignInResponse?.data) {
      const { accessToken, refreshToken, agentUser } =
        userSignInResponse?.data || {};

      dispatch(
        updateAuthStore({
          refreshToken,
          accessToken,
          user: agentUser,
        })
      );

      navigate(getPath('portal'));
    }
  }, [dispatch, navigate, userSignInResponse?.data]);

  return (
    <Form form={form} layout="vertical" onFinish={handleLogin}>
      <Form.Item
        name={FORM_FIELD.USERNAME}
        label={FormLabels[FORM_FIELD.USERNAME]}
        rules={FormValidations[FORM_FIELD.USERNAME]}
      >
        <Input placeholder={FormLabels[FORM_FIELD.USERNAME]} />
      </Form.Item>

      <Form.Item
        name={FORM_FIELD.PASSWORD}
        label={FormLabels[FORM_FIELD.PASSWORD]}
        rules={FormValidations[FORM_FIELD.PASSWORD]}
      >
        <Input.Password placeholder={FormLabels[FORM_FIELD.PASSWORD]} />
      </Form.Item>

      <div className="mb-4 flex items-center justify-between gap-4">
        <Checkbox
          checked={isRememberLogin}
          onChange={e => setIsRememberLogin(e.target.checked)}
        >
          Remember me
        </Checkbox>
        <Link to="" className="text-sm hover:text-primary">
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
