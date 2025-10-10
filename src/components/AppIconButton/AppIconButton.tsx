import { Button, type ButtonProps } from 'antd';
import React from 'react';
import styles from './AppIconButton.module.scss';

interface Props extends ButtonProps {
  icon: React.ReactNode;
}

const AppIconButton = ({ icon, ...rest }: Props) => {
  return (
    <Button
      type="text"
      shape="circle"
      icon={icon}
      className={styles.iconButton}
      {...rest}
    />
  );
};

export default AppIconButton;
