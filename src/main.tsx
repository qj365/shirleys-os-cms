import '@/styles/global.scss';
import '@ant-design/v5-patch-for-react-19';
import '@fontsource/raleway/400.css';
import '@fontsource/raleway/500.css';
import '@fontsource/raleway/600.css';
import '@fontsource/raleway/700.css';
import 'nprogress/nprogress.css';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  (() => {
    return (
      <HelmetProvider>
        <App />
      </HelmetProvider>
    );
  })()
);
