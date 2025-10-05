import loginBanner from 'assets/svg/login.svg';
import clsx from 'clsx';
import { isAuthenticatedSelector } from 'features/auth/selector';
import { useAppSelector } from 'lib/stores';
import type { PropsWithChildren, ReactNode } from 'react';
import { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPath } from 'routers/router-paths';
import logo from 'assets/logos/logo_full.webp';

type AuthLayoutProps = PropsWithChildren & {
  title: string;
  subTitle?: ReactNode;
};

const AuthLayout = ({ children, title, subTitle }: AuthLayoutProps) => {
  const navigate = useNavigate();

  const isAuthenticated = useAppSelector(isAuthenticatedSelector);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getPath('portal'));
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <section
        className={clsx(
          'flex w-1/2 items-center justify-end p-16',
          'max-1024:w-full max-1024:justify-center max-1024:p-8'
        )}
      >
        <div className="max-w-80 flex-1">
          <figure className="mb-5 h-[34px] w-[100px]">
            <img
              src={logo}
              alt="Shirleys Food CMS"
              className="h-auto w-full object-contain"
            />
          </figure>

          <h1 className="text-default mb-6 text-[36px] font-extrabold">
            {title}
          </h1>
          {subTitle && <div className="mb-7.5 text-sm">{subTitle}</div>}
          {children}
        </div>
      </section>
      <section
        className={clsx(
          'relative flex w-1/2 items-center justify-center bg-[--bg-dark] px-28 py-16',
          'max-1024:hidden'
        )}
      >
        <img src={loginBanner} alt="" className="h-100 w-100" />
      </section>
    </div>
  );
};

export default memo(AuthLayout);
