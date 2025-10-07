import AppHelmet from '@/components/AppHelmet/AppHelmet';
import LoginForm from '@/features/auth/components/LoginForm';
import AuthLayout from '@/layouts/AuthLayout';
import type { TPageInfo } from '@/utils/types';

const LoginPage = ({ pageTitle }: TPageInfo) => {
  return (
    <AuthLayout title="Login Page">
      <AppHelmet title={pageTitle} />
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
