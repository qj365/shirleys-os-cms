import '@ant-design/v5-patch-for-react-19';
import '@fontsource/raleway/400.css';
import '@fontsource/raleway/500.css';
import '@fontsource/raleway/600.css';
import '@fontsource/raleway/700.css';
import { store } from 'lib/stores';
import 'nprogress/nprogress.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import type { Persistor } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import 'styles/global.scss';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  (() => {
    return (
      <StrictMode>
        <HelmetProvider>
          <Provider store={store}>
            <PersistGate
              persistor={
                (store as unknown as { __persistor: Persistor }).__persistor
              }
            >
              <App />
            </PersistGate>
          </Provider>
        </HelmetProvider>
      </StrictMode>
    );
  })()
);
