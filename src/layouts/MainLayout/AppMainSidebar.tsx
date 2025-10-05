import { Menu } from 'antd';
import { selectedMenuKeysSelector } from 'features/appInfo/selectors';
import { setSelectedMenuKeys } from 'features/appInfo/slice';
import { useAppDispatch, useAppSelector } from 'lib/stores';
import type { MenuInfo } from 'rc-menu/es/interface';
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AppMainSidebar = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const location = useLocation();

  const selectedMenuKeys = useAppSelector(selectedMenuKeysSelector);

  const handleClickMenuItem = useCallback(
    (info: MenuInfo) => {
      const { key: navigationPath } = info;
      dispatch(setSelectedMenuKeys([navigationPath]));
      navigate(navigationPath);
    },
    [dispatch, navigate]
  );

  useEffect(() => {
    dispatch(setSelectedMenuKeys([location.pathname]));
  }, [dispatch, location.pathname]);

  return (
    <Menu
      mode="inline"
      items={[]}
      theme="dark"
      onClick={handleClickMenuItem}
      selectedKeys={selectedMenuKeys}
    />
  );
};

export default AppMainSidebar;
