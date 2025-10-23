import AppPaperBox from '@/components/AppPaperBox';
import AppTextEditorFormField from '@/components/AppTextEditor/AppTextEditorFormField';
import { Button, Form, Input, InputNumber, message } from 'antd';
import { useCallback, useState } from 'react';
import type { UploadFile } from 'antd';
import type { ObjectType } from '@/utils/types';
import CookingClassScheduleCalendar from './CookingClassScheduleCalendar';
import CookingClassImageUpload from './CookingClassImageUpload';

/**
 * Cooking Class Form Create properties:
 * name
 * description
 * price
 * image
 * duration
 * whatToExpect
 * address
 * note
 * cookingClassSchedules
 * Cooking Class Schedule properties:
 * dateTime
 * maxSlots
 *
 * Yêu cầu: Tạo 1 form để tạo mới 1 cooking class
 * Trong đó phần tạo mới cooking class schedule sẽ hiển thị UI dạng full calendar với dạng event và drag & drop để thay đổi thời gian và số lượng maxSlots
 *
 *
 */

interface CookingClassSchedule {
  id: string;
  dateTime: string;
  maxSlots: number;
}

interface CookingClassFormData {
  name: string;
  description: string;
  price: number;
  duration: number;
  whatToExpect: string;
  address: string;
  note: string;
  images: string[];
  cookingClassSchedules: CookingClassSchedule[];
}

export default function CookingClassDetail() {
  const [form] = Form.useForm<CookingClassFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedules, setSchedules] = useState<CookingClassSchedule[]>([]);
  const [imageList, setImageList] = useState<UploadFile<ObjectType>[]>([]);
  const durationMinutes = Form.useWatch('duration', form) ?? 60;

  const onFinish = useCallback(
    async (values: CookingClassFormData) => {
      try {
        setIsSubmitting(true);

        if (schedules.length === 0) {
          message.error('Please add at least one cooking class schedule');
          return;
        }

        if (imageList.length === 0) {
          message.error('Please add at least one cooking class image');
          return;
        }

        const formData = {
          ...values,
          images: imageList.map(img => img.url || ''),
          cookingClassSchedules: schedules,
        };

        console.log('Cooking Class Form Data:', formData);

        // TODO: Implement API call to create cooking class
        message.success('Cooking class created successfully!');
      } catch (error) {
        console.error('Error creating cooking class:', error);
        message.error('Failed to create cooking class. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [schedules, imageList]
  );

  const handleScheduleChange = useCallback(
    (newSchedules: CookingClassSchedule[]) => {
      setSchedules(newSchedules);
      form.setFieldValue('cookingClassSchedules', newSchedules);
    },
    [form]
  );

  const handleImageListChange = useCallback(
    (newImageList: UploadFile<ObjectType>[]) => {
      setImageList(newImageList);
      form.setFieldValue(
        'images',
        newImageList.map(img => img.url || '')
      );
    },
    [form]
  );

  return (
    <Form form={form} layout="vertical" scrollToFirstError onFinish={onFinish}>
      <AppPaperBox className="p-6">
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              >
                <Input placeholder="Enter cooking class name" maxLength={120} />
              </Form.Item>

              <Form.Item
                name="price"
                label="Price (VND)"
                rules={[
                  {
                    required: true,
                    message: 'Please input price',
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter price"
                  min={0}
                  className="w-full"
                />
              </Form.Item>

              <Form.Item
                name="duration"
                label="Duration (minutes)"
                rules={[
                  {
                    required: true,
                    message: 'Please input duration',
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter duration in minutes"
                  min={30}
                  max={480}
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
              >
                <Input placeholder="Enter class address" maxLength={200} />
              </Form.Item>
            </div>

            <AppTextEditorFormField
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: 'Please input description',
                },
              ]}
              className="mt-4"
            />

            <AppTextEditorFormField
              name="whatToExpect"
              label="What to Expect"
              rules={[
                {
                  required: true,
                  message: 'Please input what to expect',
                },
              ]}
              className="mt-4"
            />

            <Form.Item name="note" label="Note" className="mt-4">
              <Input.TextArea
                placeholder="Enter any additional notes"
                rows={3}
                maxLength={500}
                showCount
              />
            </Form.Item>
          </div>

          {/* Image Upload Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Images</h3>
            <CookingClassImageUpload
              imageList={imageList}
              onImageListChange={handleImageListChange}
              uploadMaxCount={10}
              maximumFileSize={10}
            />
          </div>

          {/* Schedule Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Class Schedules</h3>
            <CookingClassScheduleCalendar
              schedules={schedules}
              onSchedulesChange={handleScheduleChange}
              durationMinutes={durationMinutes}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 border-t pt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              size="large"
            >
              Create Cooking Class
            </Button>
          </div>
        </div>
      </AppPaperBox>
    </Form>
  );
}
