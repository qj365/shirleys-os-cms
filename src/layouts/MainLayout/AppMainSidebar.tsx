import { useAppInfoStore } from '@/lib/stores/appInfoStore';
import { getPath } from '@/routers/router-paths';
import { Menu } from 'antd';
import type { MenuInfo } from 'rc-menu/es/interface';
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AppMainSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { setSelectedMenuKeys, selectedMenuKeys, setSidebarCollapse } =
    useAppInfoStore();

  const handleClickMenuItem = useCallback(
    (info: MenuInfo) => {
      const { key: navigationPath } = info;
      setSelectedMenuKeys([navigationPath]);
      navigate(navigationPath);
      setSidebarCollapse(true);
    },
    [navigate, setSelectedMenuKeys, setSidebarCollapse]
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
              label: 'Category',
              icon: null,
            },
            {
              key: getPath('productListPage'),
              label: 'Product',
              icon: null,
            },
          ],
        },
      ]}
      onClick={handleClickMenuItem}
      selectedKeys={selectedMenuKeys}
    />
  );
};

export default AppMainSidebar;
