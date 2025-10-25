import AppImageUpload from '@/components/AppImageUpload/AppImageUpload';
import AppTextEditorFormField from '@/components/AppTextEditor/AppTextEditorFormField';
import useOverlayPanelHelper from '@/components/Overlays/useOverlayPanelHelper';
import {
  api,
  type AdminCreateCookingClassDto,
  type AdminGetCookingClassByIdResponse,
  type AdminGetCookingClassesResponse,
} from '@/lib/api/admin';
import { toastErrorMessage } from '@/utils/dataTypes/string';
import { useWindowDimensions } from '@/utils/hooks/useWindowDimensions';
import type { ObjectType } from '@/utils/types';
import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  type UploadFile,
} from 'antd';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
} from 'react';

type Props = {
  open: boolean;
  setOpen: Dispatch<boolean>;
  selectedCookingClass?: AdminGetCookingClassesResponse;
  onUpdateSuccess?: () => void;
};

export default function AddEditCookingClass({
  open,
  setOpen,
  selectedCookingClass,
  onUpdateSuccess,
}: Props) {
  const cookingClassId = selectedCookingClass?.id;

  const windowDimensions = useWindowDimensions();

  const isLandscapeTablet = windowDimensions?.width < 1024;

  const [form] = Form.useForm();

  const { setFieldsValue, resetFields } = form;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [imageList, setImageList] = useState<UploadFile<ObjectType>[]>([]);
  const [cookingClassDetail, setCookingClassDetail] =
    useState<AdminGetCookingClassByIdResponse | null>(null);

  const onCancel = () => {
    setOpen(false);
    resetFields();
    setImageList([]);
    setCookingClassDetail(null);
  };

  const onFinish = async (values: AdminCreateCookingClassDto) => {
    try {
      setIsLoading(true);

      const requestBody = {
        ...values,
        image: imageList[0]?.url || '',
      };

      if (cookingClassId) {
        await api.cookingClass.updateCookingClass({
          id: cookingClassId,
          requestBody: requestBody,
        });
      } else {
        await api.cookingClass.createCookingClass({
          requestBody: { ...requestBody, cookingClassSchedules: [] },
        });
      }

      message.success(
        !cookingClassId
          ? 'Cooking class created successfully'
          : 'Cooking class updated successfully'
      );

      onUpdateSuccess?.();
      onCancel();
    } catch (e) {
      toastErrorMessage(e);
    } finally {
      setIsLoading(false);
    }
  };

  const { overlayPanelFooter, submitBtnRef } = useOverlayPanelHelper({
    cancelBtnProps: {
      onClick: onCancel,
    },
    submitBtnProps: {
      label: !cookingClassId ? 'Create Cooking Class' : 'Update Cooking Class',
      loading: isLoading,
    },
  });

  // Fetch cooking class detail when editing
  const fetchCookingClassDetail = useCallback(async () => {
    if (!cookingClassId) return;

    try {
      setIsFetching(true);
      const response = await api.cookingClass.getCookingClass({
        id: cookingClassId,
      });
      setCookingClassDetail(response);
    } catch (err) {
      toastErrorMessage(err);
    } finally {
      setIsFetching(false);
    }
  }, [cookingClassId]);

  const initialValues = useMemo(() => {
    if (!cookingClassDetail) return {};

    const { name, price, description, whatToExpect, duration, address } =
      cookingClassDetail;

    return {
      name,
      price,
      description,
      whatToExpect,
      duration,
      address,
    };
  }, [cookingClassDetail]);

  useEffect(() => {
    if (cookingClassDetail?.image) {
      setImageList([
        {
          uid: '1',
          name: 'cooking-class-image',
          url: cookingClassDetail.image,
        },
      ]);
    }
  }, [cookingClassDetail]);

  useEffect(() => {
    if (cookingClassId && initialValues) {
      setFieldsValue(initialValues);
    }
  }, [initialValues, cookingClassId, setFieldsValue]);

  useEffect(() => {
    if (open && cookingClassId) {
      fetchCookingClassDetail();
    }
  }, [open, cookingClassId, fetchCookingClassDetail]);

  return (
    <Drawer
      open={open}
      onClose={onCancel}
      footer={overlayPanelFooter}
      width={isLandscapeTablet ? '90vw' : 992}
      title={!cookingClassId ? 'Create Cooking Class' : 'Update Cooking Class'}
      loading={isFetching}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="grid grid-cols-12 gap-x-4">
          <Form.Item
            name="name"
            label="Cooking Class Name"
            rules={[
              {
                required: true,
                message: 'Please input cooking class name',
                whitespace: true,
              },
            ]}
            className="col-span-12"
          >
            <Input placeholder="Enter cooking class name" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[
              { required: true, message: 'Please input price' },
              {
                type: 'number',
                min: 0,
                message: 'Price must be greater than 0',
              },
            ]}
            className="col-span-6"
          >
            <InputNumber
              prefix="£"
              placeholder="Enter price"
              min={0}
              step={0.01}
              precision={2}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[
              { required: true, message: 'Please input duration' },
              {
                type: 'number',
                min: 1,
                message: 'Duration must be at least 1 minute',
              },
            ]}
            className="col-span-6"
          >
            <InputNumber
              placeholder="Enter duration in minutes"
              min={1}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[
              {
                required: true,
                message: 'Please input address',
                whitespace: true,
              },
            ]}
            className="col-span-12"
          >
            <Input placeholder="Enter class address" maxLength={200} />
          </Form.Item>

          <div className="col-span-12">
            <AppImageUpload
              label="Cooking Class Image"
              required={true}
              imageList={imageList}
              onImageListChange={setImageList}
              uploadMaxCount={1}
              mode="productMedia"
              customUploadText={{
                main: 'Click to upload cooking class image',
                hint: 'Only .png, .jpg, or .jpeg image formats are supported',
              }}
            />
          </div>

          <div className="col-span-12">
            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: 'Please input description',
                },
              ]}
              className="col-span-12"
            >
              <Input.TextArea
                rows={4}
                placeholder="Enter cooking class description"
              />
            </Form.Item>
          </div>

          <div className="col-span-12">
            <AppTextEditorFormField
              name="whatToExpect"
              label="What to Expect"
              rules={[
                {
                  required: true,
                  message: 'Please input what to expect',
                },
              ]}
              placeholder="Enter what participants can expect from this class"
              isShowMediaFeatures={false}
            />
          </div>
        </div>

        <Button className="hidden" htmlType="submit" ref={submitBtnRef}>
          Confirm
        </Button>
      </Form>
    </Drawer>
  );
}
