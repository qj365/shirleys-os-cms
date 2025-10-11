import { useAppInfoStore } from '@/lib/stores/appInfoStore';
import { getPath } from '@/routers/router-paths';
import { Menu } from 'antd';
import { ChartColumnIncreasing, Cylinder, LayoutList } from 'lucide-react';
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
          key: 'Overview',
          label: 'Overview',
          type: 'group',
          children: [
            {
              key: getPath('portal'),
              label: 'Dashboard',
              icon: (
                <ChartColumnIncreasing
                  className="shrink-0"
                  width={20}
                  height={20}
                />
              ),
            },
          ],
        },
        {
          key: 'Product Management',
          label: 'Product Management',
          type: 'group',
          children: [
            {
              key: getPath('productCategoriesPage'),
              label: 'Category',
              icon: <LayoutList className="shrink-0" width={20} height={20} />,
            },
            {
              key: getPath('productListPage'),
              label: 'Product',
              icon: <Cylinder className="shrink-0" width={20} height={20} />,
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
