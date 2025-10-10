import clsx from 'clsx';
import type { CSSProperties, PropsWithChildren } from 'react';

type AppPaperBoxProps = PropsWithChildren & {
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  hideShadow?: boolean;
  id?: string;
  styles?: CSSProperties;
};

const AppPaperBox = ({
  children,
  className,
  onClick,
  onMouseEnter,
  hideShadow,
  id,
  styles,
}: AppPaperBoxProps) => {
  return (
    <div
      className={clsx(
        'rounded-xl bg-white dark:bg-[--table-heading-color]',
        className
      )}
      style={{
        boxShadow: hideShadow ? 'none' : 'var(--wrapper-shadow)',
        ...styles,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      id={id}
    >
      {children}
    </div>
  );
};

export default AppPaperBox;
