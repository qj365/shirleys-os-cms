import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { Modal } from 'antd';
import { useCallback } from 'react';

type Props = {
  isDeleting: boolean;
};

const { confirm } = Modal;

function useHandleDeleteRecord({ isDeleting }: Props) {
  const onDeleteRecord = useCallback(
    (actionLabel: string, onOk: () => void) => {
      confirm({
        title: (
          <div className="ant-modal-confirm-heading">
            <InfoCircleOutlined className="!text-[20px]" />
            <span className="text-lg font-bold text-error">Warning</span>
          </div>
        ),
        icon: null,
        content: (
          <p className="mb-4">
            Are you sure you want to delete <strong>{actionLabel}</strong>?
          </p>
        ),
        onOk,
        okButtonProps: {
          disabled: isDeleting,
          danger: true,
        },
        cancelButtonProps: {
          className: '!border !border-error !text-error hover:opacity-75',
        },
        centered: true,
      });
    },
    [isDeleting]
  );

  return { onDeleteRecord };
}

export default useHandleDeleteRecord;
