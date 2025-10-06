import { Button, Result } from 'antd';
import notFoundBanner from '@/assets/svg/404.svg';
import AppHelmet from '@/components/AppHelmet/AppHelmet';
import { useNavigate } from 'react-router-dom';
import { getPath } from '@/routers/router-paths';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className="flex h-screen w-screen items-center justify-center p-15">
      <AppHelmet title="Page Not Found" />
      <Result
        icon={<img src={notFoundBanner} alt="404" width={350} height={350} />}
        title={<strong className="text-2xl">Page Not Found</strong>}
        subTitle="The page you are looking for does not exist. Please return to the previous page or return to the home page"
        extra={
          <div className="flex justify-center gap-x-4">
            <Button onClick={() => navigate(-1)}>Go Back</Button>
            <Button
              type="primary"
              onClick={() => navigate(getPath('portal'), { replace: true })}
            >
              Back to Home
            </Button>
          </div>
        }
      />
    </main>
  );
};

export default NotFoundPage;
