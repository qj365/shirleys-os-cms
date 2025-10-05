import type { TooltipProps } from 'antd';
import { Tooltip } from 'antd';
import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

type AppTooltipProps = PropsWithChildren & {
  disableOnMobile?: boolean;
} & TooltipProps;

const AppTooltip = ({
  disableOnMobile,
  children,
  ...tooltipProps
}: AppTooltipProps) => {
  const isTouchDevice = useMemo(
    () =>
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches,
    []
  );

  if (disableOnMobile && isTouchDevice) return <>{children}</>;

  return <Tooltip {...tooltipProps}>{children}</Tooltip>;
};

export default AppTooltip;
