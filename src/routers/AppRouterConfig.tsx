import ErrorBoundary from '@/components/ErrorBoundary';
import MainLayout from '@/layouts/MainLayout';
import NotFoundPage from '@/modules/Miscellaneous/NotFoundPage';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';
import { privateRoutes, publicRoutes } from './constants';
import { ProtectedRoute } from './ProtectedRouteWrapper';

const AppRouterConfig = createBrowserRouter(
  createRoutesFromElements(
    <>
      {publicRoutes.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
          errorElement={<ErrorBoundary />}
        />
      ))}

      <Route element={<MainLayout />}>
        {privateRoutes.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={<ProtectedRoute>{route.element}</ProtectedRoute>}
            errorElement={<ErrorBoundary />}
          />
        ))}
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </>
  )
);

export default AppRouterConfig;
