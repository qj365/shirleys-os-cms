import { DEFAULT_PANEL_WIDTH } from '@/components/Overlays/constants';
import useOverlayPanelHelper from '@/components/Overlays/useOverlayPanelHelper';
import { api, type AdminModifyCategoryDto } from '@/lib/api/admin';
import { toastErrorMessage } from '@/utils/dataTypes/string';
import { useWindowDimensions } from '@/utils/hooks/useWindowDimensions';
import type { ObjectType } from '@/utils/types';
import { Button, Drawer, Form, Input } from 'antd';
import { useEffect, useMemo, useState, type Dispatch } from 'react';

type Props = {
  open: boolean;
  setOpen: Dispatch<boolean>;
  selectedProductCategory?: ObjectType;
  onUpdateSuccess?: () => void;
};

const AddEditProductCategoryPanel = ({
  open,
  setOpen,
  selectedProductCategory,
  onUpdateSuccess,
}: Props) => {
  const windowDimensions = useWindowDimensions();

  const isLandscapeTablet = windowDimensions?.width < 1024;

  const [form] = Form.useForm();

  const { setFieldsValue, resetFields } = form;

  const categoryId = selectedProductCategory?.id;

  const [isLoading, setIsLoading] = useState(false);

  const onCancel = () => {
    setOpen(false);
    resetFields();
  };

  const onFinish = async (values: AdminModifyCategoryDto) => {
    try {
      setIsLoading(true);
      if (categoryId) {
        await api.admin.adminCategoryEdit({
          id: categoryId,
          requestBody: values,
        });
      } else {
        await api.admin.adminCategoryCreate({
          requestBody: values,
        });
      }

      onUpdateSuccess?.();
      onCancel();
    } catch (e) {
      toastErrorMessage(e);
    } finally {
      setIsLoading(false);
    }
  };

  const initialValues = useMemo(() => {
    const { name } = selectedProductCategory || {};

    return {
      name,
    };
  }, [selectedProductCategory]);

  const { overlayPanelFooter, submitBtnRef } = useOverlayPanelHelper({
    cancelBtnProps: {
      onClick: onCancel,
    },
    submitBtnProps: {
      label: !categoryId ? 'Create Category' : 'Update Category',
      loading: isLoading,
    },
  });

  useEffect(() => {
    if (!categoryId) return;
    setFieldsValue(initialValues);
  }, [initialValues, categoryId, setFieldsValue]);

  return (
    <Drawer
      open={open}
      onClose={onCancel}
      footer={overlayPanelFooter}
      width={isLandscapeTablet ? '90vw' : DEFAULT_PANEL_WIDTH}
      title={!categoryId ? 'Create category' : 'Update category'}
    >
      <Form
        form={form}
        initialValues={initialValues}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="name"
          label="Category name"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input placeholder="Enter category name" maxLength={50} showCount />
        </Form.Item>

        <Button className="hidden" htmlType="submit" ref={submitBtnRef}>
          Xác nhận
        </Button>
      </Form>
    </Drawer>
  );
};

export default AddEditProductCategoryPanel;
