import { message } from 'antd';
import ConfigProvider from 'antd/es/config-provider';
import en_US from 'antd/es/locale/en_US';
import theme from 'antd/es/theme';
import favicon from 'assets/favicons/favicon-32x32.png';
import ScrollRestoration from 'components/ScrollRestoration';
import SplashScreen from 'components/SplashScreen';
import { appPrimaryColorSelector } from 'features/appInfo/selectors';
import { useAppSelector } from 'lib/stores';
import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import AppRouterConfig from 'routers/AppRouterConfig';
import { messageUtils } from 'utils';

function App() {
  const [messageApi, contextHolder] = message.useMessage();
  messageUtils.message = messageApi;

  const appPrimaryColor = useAppSelector(appPrimaryColorSelector);

  useEffect(() => {
    const link = document.createElement('link');
    const oldLink = document.getElementById('dynamic-favicon');

    link.id = 'dynamic-favicon';
    link.rel = 'icon';
    link.href = favicon;

    if (oldLink) {
      document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
  }, []);

  return (
    <ConfigProvider
      locale={en_US}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: appPrimaryColor,
          borderRadius: 5,
        },
      }}
    >
      <Suspense
        fallback={
          <ScrollRestoration>
            <SplashScreen fullScreen />
          </ScrollRestoration>
        }
      >
        <RouterProvider
          future={{
            v7_startTransition: true,
          }}
          router={AppRouterConfig}
        />
        {contextHolder}
      </Suspense>
    </ConfigProvider>
  );
}

export default App;
