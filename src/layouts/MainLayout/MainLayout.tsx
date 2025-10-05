import clsx from 'clsx';
import ScrollRestoration from 'components/ScrollRestoration';
import SplashScreen from 'components/SplashScreen';
import { useGetCurrentUserQuery } from 'features/auth/query';
import { Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import style from './MainLayout.module.scss';
import { useAppDispatch, useAppSelector } from 'lib/stores';
import { sidebarCollapsedStateSelector } from 'features/appInfo/selectors';
import { getPath } from 'routers/router-paths';
import AppMainSidebar from './AppMainSidebar';
import AppTooltip from 'components/AppTooltip';
import { Button } from 'antd';
import MenuUnfoldOutlined from '@ant-design/icons/MenuUnfoldOutlined';
import MenuFoldOutlined from '@ant-design/icons/MenuFoldOutlined';
import { changeSidebarCollapsedState } from 'features/appInfo/slice';

export default function MainLayout() {
  useGetCurrentUserQuery(undefined);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isSidebarCollapsed = useAppSelector(sidebarCollapsedStateSelector);
  return (
    <div className="flex h-screen">
      <aside
        className={clsx(
          style.mainSidebarWrapper,
          isSidebarCollapsed && style.collapsed
        )}
      >
        <div className="flex items-center justify-between px-5">
          <figure
            className="mb-0 cursor-pointer"
            onClick={() => navigate(getPath('portal'))}
          >
            <div className="h-12 w-12" />
          </figure>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12" />
        </div>
        <AppMainSidebar />
      </aside>

      <div
        className={clsx(
          style.mainPageContentWrapper,
          isSidebarCollapsed && style.collapsed
        )}
      >
        <header className={style.fixedHeader}>
          <AppTooltip
            disableOnMobile
            title={`${isSidebarCollapsed ? 'Show' : 'Collapse'} menu`}
          >
            <Button
              type="text"
              icon={
                isSidebarCollapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
              onClick={() =>
                dispatch(changeSidebarCollapsedState(!isSidebarCollapsed))
              }
              className="mr-auto"
            />
          </AppTooltip>
        </header>

        <section className={style.pageContentWrapper} id="main-layout">
          <div className="mx-auto flex w-full max-w-[144rem] flex-1 flex-col px-8 pb-6">
            <Suspense
              fallback={
                <ScrollRestoration>
                  <SplashScreen fullScreen />
                </ScrollRestoration>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  );
}
