import type { MouseEventHandler, PropsWithChildren } from 'react';
import { cloneElement, isValidElement } from 'react';
import type { ObjectType } from '@/utils/types';

type ToggleOverlayBtnProps = PropsWithChildren & {
  onClick: MouseEventHandler<HTMLElement>;
};

const ToggleOverlayBtn = ({ onClick, children }: ToggleOverlayBtnProps) =>
  isValidElement(children) ? (
    cloneElement(children as React.ReactElement<ObjectType>, {
      ...(children?.props ?? {}),
      onClick,
    })
  ) : children ? (
    <span className="inline-flex items-center" onClick={onClick}>
      {children}
    </span>
  ) : null;

export default ToggleOverlayBtn;
