import type { Dispatch, PropsWithChildren, ReactElement } from 'react';
import { useState } from 'react';
import ToggleOverlayBtn from './ToggleOverlayBtn';

type OverlayPanelWrapperProps = PropsWithChildren & {
  renderOverlayPanel: (
    open: boolean,
    setOpen: Dispatch<boolean>
  ) => ReactElement;
};

const OverlayPanelWrapper = ({
  children,
  renderOverlayPanel,
}: OverlayPanelWrapperProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ToggleOverlayBtn onClick={() => setOpen(true)}>
        {children}
      </ToggleOverlayBtn>
      {renderOverlayPanel(open, setOpen)}
    </>
  );
};

export default OverlayPanelWrapper;
