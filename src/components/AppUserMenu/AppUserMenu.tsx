import style from '@/layouts/MainLayout/MainLayout.module.scss';
import { useAuthStore } from '@/lib/stores/authStore';
import { getPath } from '@/routers/router-paths';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import { Dropdown, type MenuProps } from 'antd';
import clsx from 'clsx';
import { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

type AppUserMenuProps = {
  invertColor?: boolean;
};

const AppUserMenu = ({ invertColor }: AppUserMenuProps) => {
  const { logout } = useAuthStore();

  const navigate = useNavigate();

  const userMenuItems = useMemo(
    (): MenuProps['items'] => [
      {
        label: 'Logout',
        icon: <LogoutOutlined />,
        key: 'logout',
        danger: true,
      },
    ],
    []
  );

  const onUserMenuClick: MenuProps['onClick'] = useCallback(
    ({ key }: { key: string }) => {
      if (key === 'logout') {
        logout();
        navigate(getPath('login'), { replace: true });
        return;
      }
    },
    [logout, navigate]
  );

  return (
    <Dropdown
      menu={{ items: userMenuItems, onClick: onUserMenuClick }}
      placement="bottomRight"
      overlayClassName="user-menu-dropdown"
      trigger={['click']}
      overlayStyle={{
        minWidth: 180,
      }}
    >
      <div
        className={clsx(
          style.userAvatarWrapper,
          invertColor && style.invertColor
        )}
      >
        <UserOutlined className="text-base" />
      </div>
    </Dropdown>
  );
};

export default memo(AppUserMenu);
