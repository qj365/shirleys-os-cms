import { Button, type ButtonProps } from 'antd';
import { useMemo, useRef } from 'react';

type TLabel = { label?: string };

type OverlayPanelHelperProps = {
  cancelBtnProps: TLabel & ButtonProps;
  submitBtnProps: TLabel & ButtonProps;
};

/** Use for get button for footer of modal/drawer and return the submit button ref */
const useOverlayPanelHelper = ({
  cancelBtnProps,
  submitBtnProps,
}: OverlayPanelHelperProps) => {
  const { label: submitBtnLabel, ...otherSubmitBtnProps } = submitBtnProps;
  const { label: cancelBtnLabel, ...otherCancelBtnProps } = cancelBtnProps;

  const submitBtnRef = useRef<HTMLButtonElement | null>(null);

  const overlayPanelFooter = useMemo(() => {
    return (
      <div className="flex justify-end gap-x-2 p-2">
        <Button type="default" {...otherCancelBtnProps}>
          {cancelBtnLabel ?? 'Cancel'}
        </Button>
        <Button
          type="primary"
          {...otherSubmitBtnProps}
          onClick={() => submitBtnRef.current?.click()}
        >
          {submitBtnLabel ?? 'Submit'}
        </Button>
      </div>
    );
  }, [
    cancelBtnLabel,
    otherCancelBtnProps,
    otherSubmitBtnProps,
    submitBtnLabel,
  ]);

  return { overlayPanelFooter, submitBtnRef };
};

export default useOverlayPanelHelper;
