import clsx from 'clsx';
import styles from 'components/AppFormElements/AppFieldSet/AppFieldSet.module.scss';
import type { HTMLAttributes, PropsWithChildren, ReactNode } from 'react';

type AppFieldSetProps = PropsWithChildren & {
  legend: ReactNode | string;
  className?: HTMLAttributes<HTMLFieldSetElement>['className'];
};

const AppFieldSet = ({ children, legend, className }: AppFieldSetProps) => {
  return (
    <fieldset className={clsx(styles.fieldset, className)}>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  );
};

export default AppFieldSet;
