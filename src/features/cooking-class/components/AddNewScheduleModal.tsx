import { api } from '@/lib/api/admin';
import type { AdminGetCookingClassesResponse } from '@/lib/api/admin/client/models/AdminGetCookingClassesResponse';
import { toastErrorMessage } from '@/utils/dataTypes/string';
import dayjs from '@/utils/moment/dayjsConfig';
import {
  Button,
  DatePicker,
  Form,
  InputNumber,
  message,
  Modal,
  Select,
} from 'antd';
import { useCallback, useState } from 'react';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedDate: string;
  allCookingClasses: AdminGetCookingClassesResponse[];
  onFetchCookingClasses: () => void;
};

export default function AddNewScheduleModal({
  open,
  setOpen,
  selectedDate,
  allCookingClasses,
  onFetchCookingClasses,
}: Props) {
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(false);

  const handleAddSchedule = useCallback(
    async (values: {
      cookingClassId: string;
      maxSlots: number;
      dateTime: dayjs.Dayjs | string;
    }) => {
      try {
        setIsLoading(true);
        const { cookingClassId, maxSlots, dateTime } = values;
        // Convert dayjs object to ISO string if needed
        const dateTimeString = dayjs.isDayjs(dateTime)
          ? dateTime.toISOString()
          : dateTime;

        await api.cookingClass.createCookingClassSchedule({
          requestBody: {
            cookingClassId: parseInt(cookingClassId),
            maxSlots,
            dateTime: dateTimeString,
          },
        });
        message.success('Schedule created successfully');
        setOpen(false);
        form.resetFields();
        onFetchCookingClasses?.();
      } catch (error) {
        toastErrorMessage(error);
      } finally {
        setIsLoading(false);
      }
    },
    [form, onFetchCookingClasses, setOpen]
  );

  return (
    <Modal
      title="Add New Schedule"
      open={open}
      onCancel={() => {
        setOpen(false);
        form.resetFields();
      }}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAddSchedule}
        initialValues={{
          dateTime: selectedDate ? dayjs(selectedDate) : undefined,
          maxSlots: 10,
        }}
        disabled={isLoading}
      >
        <Form.Item
          name="cookingClassId"
          label="Cooking Class"
          rules={[{ required: true, message: 'Please select a cooking class' }]}
        >
          <Select
            showSearch
            placeholder="Search and select a cooking class"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={allCookingClasses.map(cookingClass => ({
              value: cookingClass.id.toString(),
              label: cookingClass.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="dateTime"
          label="Date & Time"
          rules={[{ required: true, message: 'Please select date and time' }]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm', minuteStep: 15 }}
            format="YYYY-MM-DD HH:mm"
            className="w-full"
            placeholder="Select date and time"
          />
        </Form.Item>

        <Form.Item
          name="maxSlots"
          label="Max Slots"
          rules={[{ required: true, message: 'Please input max slots' }]}
        >
          <InputNumber
            min={1}
            step={1}
            precision={0}
            className="w-full"
            placeholder="Enter max slots"
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => {
                setOpen(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Add Schedule
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
