import logo from '@/assets/logos/logo_full.webp';
import AppUserMenu from '@/components/AppUserMenu/AppUserMenu';
import ScrollRestoration from '@/components/ScrollRestoration';
import SplashScreen from '@/components/SplashScreen';
import { useAppInfoStore } from '@/lib/stores/appInfoStore';
import { getPath } from '@/routers/router-paths';
import { useWindowDimensions } from '@/utils/hooks/useWindowDimensions';
import MenuFoldOutlined from '@ant-design/icons/MenuFoldOutlined';
import MenuUnfoldOutlined from '@ant-design/icons/MenuUnfoldOutlined';
import { Button, Drawer } from 'antd';
import clsx from 'clsx';
import { Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppMainSidebar from './AppMainSidebar';
import style from './MainLayout.module.scss';

export default function MainLayout() {
  const navigate = useNavigate();

  const { isSidebarCollapsed, setSidebarCollapse } = useAppInfoStore();

  const windowDimensions = useWindowDimensions();

  const isShowDesktopSidebar = windowDimensions?.width > 1440;

  const handleClose = () => setSidebarCollapse(true);

  const sideBar = (
    <>
      <div className={style.logoWrapper}>
        <figure
          className="mb-0 cursor-pointer"
          onClick={() => navigate(getPath('portal'))}
        >
          <img src={logo} alt="logo" className="max-h-7 object-contain" />
        </figure>
        {!isShowDesktopSidebar && (
          <Button type="text" className="text-lg" onClick={handleClose}>
            x
          </Button>
        )}
      </div>

      <AppMainSidebar />
    </>
  );

  return (
    <div className="flex h-screen">
      {isShowDesktopSidebar ? (
        <aside
          className={clsx(style.mainSidebarWrapper, '!hidden min-1441:!flex')}
        >
          {sideBar}
        </aside>
      ) : (
        <Drawer
          open={!isSidebarCollapsed}
          onClose={handleClose}
          placement="left"
          className={style.mainMobileSidebarWrapper}
        >
          {sideBar}
        </Drawer>
      )}

      <div
        className={clsx(
          style.mainPageContentWrapper,
          isSidebarCollapsed && style.collapsed
        )}
      >
        <header
          className={clsx(
            style.fixedHeader,
            isShowDesktopSidebar && '!justify-end'
          )}
        >
          {!isShowDesktopSidebar && (
            <Button
              type="text"
              icon={
                isSidebarCollapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
              onClick={() => setSidebarCollapse(!isSidebarCollapsed)}
              className="mr-auto [&_.anticon]:!text-xl"
            />
          )}
          <AppUserMenu invertColor />
        </header>

        <section className={style.pageContentWrapper} id="main-layout">
          <div className="mx-auto flex w-full flex-1 flex-col px-8 py-6">
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
