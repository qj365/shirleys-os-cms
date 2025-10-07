import logo from '@/assets/logos/logo_full.webp';
import loginBanner from '@/assets/images/login-banner.png';
import clsx from 'clsx';
import type { PropsWithChildren, ReactNode } from 'react';
import { memo } from 'react';

type AuthLayoutProps = PropsWithChildren & {
  title: string;
  subTitle?: ReactNode;
};

const AuthLayout = ({ children, title, subTitle }: AuthLayoutProps) => {
  // const navigate = useNavigate();

  // const isAuthenticated = useAppSelector(isAuthenticatedSelector);

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate(getPath('portal'));
  //   }
  // }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <section
        className={clsx(
          'flex w-1/2 items-center justify-end p-16',
          'max-1024:w-full max-1024:justify-center max-1024:p-8'
        )}
      >
        <div className="max-w-80 flex-1">
          <figure className="mb-5 h-[44px] w-[150px]">
            <img
              src={logo}
              alt="Shirleys Food CMS"
              className="h-auto w-full object-contain"
            />
          </figure>

          <h1 className="text-default mb-6 text-[36px] font-extrabold">
            {title}
          </h1>
          {subTitle && <div className="mb-7.5 text-base">{subTitle}</div>}
          {children}
        </div>
      </section>
      <section
        className={clsx(
          'relative flex h-screen w-1/2 items-center justify-center bg-[--bg-dark]',
          'max-1024:hidden'
        )}
      >
        <div className="absolute left-0 top-0 z-[1] h-full w-full bg-black/20" />
        <img src={loginBanner} alt="" className="h-full w-full object-cover" />
      </section>
    </div>
  );
};

export default memo(AuthLayout);
