import type { ObjectType } from './src/utils/types';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import pluginChecker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { NodePackageImporter } from 'sass';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default function getConfig({ mode }: ObjectType) {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    define: {
      // Provide an explicit app-level constant derived from an env var.
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      tailwindcss(),
      tsconfigPaths(),
      svgr(),
      pluginChecker({ typescript: false }),
    ],
    server: {
      port: env.VITE_APP_PORT ? Number(env.VITE_APP_PORT) : 5173,
    },
    css: {
      preprocessorOptions: {
        scss: {
          importers: [new NodePackageImporter()],
        },
      },
    },
  });
}
