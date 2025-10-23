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

export const publicRoutes: TRoute[] = [
  {
    path: getPath('login'),
    element: createElement(
      lazyImport(() => import('@/modules/Auth/LoginPage')),
      { pageTitle: 'Login Page' }
    ),
  },
];

export const privateRoutes: TRoute[] = [
  {
    path: getPath('portal'),
    element: createElement(
      lazyImport(() => import('@/modules/Miscellaneous/PortalPage')),
      { pageTitle: 'Portal Page' }
    ),
  },

  {
    path: getPath('productCategoriesPage'),
    element: createElement(
      lazyImport(() => import('@/modules/ProductManagement/CategoryListPage')),
      { pageTitle: 'Product Category' }
    ),
  },

  {
    path: getPath('productListPage'),
    element: createElement(
      lazyImport(() => import('@/modules/ProductManagement/ProductListPage')),
      { pageTitle: 'Product List' }
    ),
  },

  {
    path: getPath('productDetailPage', ':productId'),
    element: createElement(
      lazyImport(() => import('@/modules/ProductManagement/ProductDetailPage'))
    ),
  },

  {
    path: getPath('orderListPage'),
    element: createElement(
      lazyImport(() => import('@/modules/ProductManagement/OrderListPage')),
      { pageTitle: 'Order List' }
    ),
  },

  {
    path: getPath('orderDetailPage', ':orderId'),
    element: createElement(
      lazyImport(() => import('@/modules/ProductManagement/OrderDetailPage'))
    ),
  },

  {
    path: getPath('cookingClassListPage'),
    element: createElement(
      lazyImport(() => import('@/modules/Service/CookingClassListPage'))
    ),
  },

  {
    path: getPath('notificationPage'),
    element: createElement(
      lazyImport(() => import('@/modules/Settings/NotificationPage')),
      { pageTitle: 'Notification Settings' }
    ),
  },
];
