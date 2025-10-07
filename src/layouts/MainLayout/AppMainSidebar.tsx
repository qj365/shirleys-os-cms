import { useAppInfoStore } from '@/lib/stores/appInfoStore';
import { getPath } from '@/routers/router-paths';
import { Menu, Tooltip } from 'antd';
import type { MenuInfo } from 'rc-menu/es/interface';
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const renderSidebarLabel = (label: string) => {
  return (
    <Tooltip title={label} placement="right">
      {label}
    </Tooltip>
  );
};

const AppMainSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { setSelectedMenuKeys, selectedMenuKeys } = useAppInfoStore();

  const handleClickMenuItem = useCallback(
    (info: MenuInfo) => {
      const { key: navigationPath } = info;
      setSelectedMenuKeys([navigationPath]);
      navigate(navigationPath);
    },
    [navigate, setSelectedMenuKeys]
  );

  useEffect(() => {
    setSelectedMenuKeys([location.pathname]);
  }, [location.pathname, setSelectedMenuKeys]);

  return (
    <Menu
      mode="inline"
      items={[
        {
          key: 'Product Management',
          label: 'Product Management',
          type: 'group',
          children: [
            {
              key: getPath('productCategoriesPage'),
              label: renderSidebarLabel('Categories'),
              icon: null,
            },
            {
              key: getPath('productListPage'),
              label: renderSidebarLabel('Products'),
              icon: null,
            },
          ],
        },
      ]}
      theme="dark"
      onClick={handleClickMenuItem}
      selectedKeys={selectedMenuKeys}
      className="[&_.ant-menu-item-group-title]:tracking-[2px] [&_.ant-menu-title-content]:tracking-[1.5px]"
    />
  );
};

export default AppMainSidebar;
