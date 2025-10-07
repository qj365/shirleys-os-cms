import avatar from '@/assets/images/admin.webp';
import logo from '@/assets/logos/logo-white-icon.png';
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
import { useAuthStore } from '@/lib/stores/authStore';

export default function MainLayout() {
  const navigate = useNavigate();

  const { isSidebarCollapsed, setSidebarCollapse } = useAppInfoStore();

  const { appUser } = useAuthStore();

  const windowDimensions = useWindowDimensions();

  const isShowDesktopSidebar = windowDimensions?.width > 1440;

  const sideBar = (
    <>
      <div className="flex items-center justify-between px-5">
        <figure
          className="mb-0 cursor-pointer"
          onClick={() => navigate(getPath('portal'))}
        >
          <img src={logo} alt="logo" className="max-h-9 object-contain" />
        </figure>
      </div>
      <div className="flex flex-col items-center justify-center px-8 text-center">
        <figure className="relative">
          <img
            src={avatar}
            alt={'User avatar'}
            className={clsx('block h-24 w-24 rounded-full object-cover')}
          />
          <figcaption
            className={clsx(
              'absolute left-1/2 -translate-x-1/2 -translate-y-1/2',
              'rounded-full bg-primary px-2 py-1',
              'whitespace-nowrap text-xs capitalize text-white'
            )}
          >
            {appUser?.role?.toLowerCase()}
          </figcaption>
        </figure>
      </div>
      <AppMainSidebar />
    </>
  );

  return (
    <div className="flex h-screen">
      {isShowDesktopSidebar ? (
        <aside
          className={clsx(
            style.mainSidebarWrapper,
            isSidebarCollapsed && style.collapsed,
            '!hidden min-1441:!flex'
          )}
        >
          {sideBar}
        </aside>
      ) : (
        <Drawer
          open={!isSidebarCollapsed}
          onClose={() => setSidebarCollapse(!isSidebarCollapsed)}
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
        <header className={style.fixedHeader}>
          <Button
            type="text"
            icon={
              isSidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
            }
            onClick={() => setSidebarCollapse(!isSidebarCollapsed)}
            className="mr-auto [&_.anticon]:!text-xl"
          />
          <AppUserMenu invertColor />
        </header>

        <section className={style.pageContentWrapper} id="main-layout">
          <div className="mx-auto flex min-h-screen w-full flex-1 flex-col px-8 pb-8">
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
