import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import { Spin } from 'antd';
import clsx from 'clsx';

type SplashScreenProps = {
  fullScreen: boolean;
};

const SplashScreen = ({ fullScreen }: SplashScreenProps) => {
  return (
    <div
      className={clsx(
        fullScreen
          ? 'fixed left-0 top-0 h-screen w-screen bg-transparent'
          : 'h-full w-full bg-transparent'
      )}
    >
      <div className="flex h-full w-full items-center justify-center">
        <Spin
          indicator={<LoadingOutlined className="!text-[48px] text-primary" />}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
