import type { ReactNode } from 'react';
import { createElement } from 'react';
import { lazyImport } from './helpers';
import { getPath } from './router-paths';

export type TBreadcrumb = {
  title: string;
  path?: string;
};

export type TRoute = {
  path: string;
  element: ReactNode;
  permissionKeys?: string[];
  pageHeader?: string;
  breadcrumbs?: TBreadcrumb[];
};

export type TPageInfo = {
  pageTitle: string;
};

export const publicRoutes: TRoute[] = [
  {
    path: getPath('login'),
    element: createElement(
      lazyImport(() => import('modules/Auth/LoginPage')),
      { pageTitle: 'Login Page' }
    ),
  },
];

export const privateRoutes: TRoute[] = [
  {
    path: getPath('portal'),
    element: createElement(
      lazyImport(() => import('modules/Miscellaneous/PortalPage')),
      { pageTitle: 'Portal Page' }
    ),
  },
];
