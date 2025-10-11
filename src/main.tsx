import '@/styles/global.scss';
import '@ant-design/v5-patch-for-react-19';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
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
