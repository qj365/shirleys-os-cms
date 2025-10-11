import AppIconButton from '@/components/AppIconButton';
import type { DropdownProps, MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { EllipsisVertical } from 'lucide-react';
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
      <AppIconButton
        type="text"
        icon={<EllipsisVertical width={20} height={20} />}
      />
    </Dropdown>
  );
};

export default AppTableActionMenu;
