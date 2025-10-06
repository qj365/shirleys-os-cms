import favicon from '@/assets/favicons/favicon-32x32.png';
import ScrollRestoration from '@/components/ScrollRestoration';
import SplashScreen from '@/components/SplashScreen';
import AppRouterConfig from '@/routers/AppRouterConfig';
import ConfigProvider from 'antd/es/config-provider';
import en_US from 'antd/es/locale/en_US';
import theme from 'antd/es/theme';
import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAppInfoStore } from './lib/stores/appInfoStore';

function App() {
  const { appPrimaryColor } = useAppInfoStore();

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
      </Suspense>
    </ConfigProvider>
  );
}

export default App;
