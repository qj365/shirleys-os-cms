import MoreOutlined from '@ant-design/icons/MoreOutlined';
import type { DropdownProps, MenuProps } from 'antd';
import { Button, Dropdown } from 'antd';
import styles from './AppTableActionMenu.module.scss';

type AppTableActionMenuProps = {
  items: MenuProps['items'];
  placement?: DropdownProps['placement'];
};

const AppTableActionMenu = ({
  items,
  placement = 'bottomRight',
}: AppTableActionMenuProps) => {
  return (
    <Dropdown
      menu={{ items }}
      placement={placement}
      trigger={['click']}
      overlayClassName={styles.appTableActionMenu}
    >
      <Button type="text" htmlType="submit" icon={<MoreOutlined />} />
    </Dropdown>
  );
};

export default AppTableActionMenu;
