import AppIconButton from '@/components/AppIconButton';
import useOverlayPanelHelper from '@/components/Overlays/useOverlayPanelHelper';
import { api, type AdminGetCookingClassesResponse } from '@/lib/api/admin';
import type { AdminGetCookingClassBookingByScheduleIdResponse } from '@/lib/api/admin/client/models/AdminGetCookingClassBookingByScheduleIdResponse';
import {
  formatDisplayCurrency,
  toastErrorMessage,
} from '@/utils/dataTypes/string';
import { useWindowDimensions } from '@/utils/hooks/useWindowDimensions';
import {
  Button,
  DatePicker,
  Drawer,
  Empty,
  Form,
  InputNumber,
  Modal,
  Spin,
  Table,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import { SquarePen } from 'lucide-react';
import { useEffect, useState, type Dispatch } from 'react';
import AddEditCookingClass from './AddEditCookingClass';

type Props = {
  open: boolean;
  setOpen: Dispatch<boolean>;
  selectedSchedule?: {
    cookingClassId: number;
    scheduleIndex: number;
    cookingClass: AdminGetCookingClassesResponse;
    schedule: {
      availableSlots: number;
      maxSlots: number;
      dateTime: string;
      id: number;
    };
  } | null;
  onUpdateSuccess?: () => void;
  onUpdateClassInfoSuccess?: () => void;
};

const EditScheduleDrawer = ({
  open,
  setOpen,
  selectedSchedule,
  onUpdateSuccess,
  onUpdateClassInfoSuccess,
}: Props) => {
  const [form] = Form.useForm();
  const [bookings, setBookings] = useState<
    AdminGetCookingClassBookingByScheduleIdResponse[]
  >([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const onCancel = () => {
    setOpen(false);
    form.resetFields();
    setBookings([]);
  };

  const onFinish = async (values: {
    dateTime: dayjs.Dayjs | string;
    maxSlots: number;
  }) => {
    if (!selectedSchedule) return;

    try {
      setIsLoading(true);
      const { dateTime, maxSlots } = values;
      const dateTimeString = dayjs.isDayjs(dateTime)
        ? dateTime.toISOString()
        : dateTime;

      await api.cookingClass.updateCookingClassSchedule({
        id: selectedSchedule.schedule.id,
        requestBody: {
          dateTime: dateTimeString,
          maxSlots,
        },
      });

      onUpdateSuccess?.();
      onCancel();
    } catch (error) {
      toastErrorMessage(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;

    Modal.confirm({
      title: 'Delete Schedule',
      content:
        'Are you sure you want to delete this schedule? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.cookingClass.deleteCookingClassSchedules({
            requestBody: {
              id: selectedSchedule.schedule.id,
            },
          });

          onUpdateSuccess?.();
          onCancel();
        } catch (error) {
          toastErrorMessage(error);
        }
      },
    });
  };

  // Fetch bookings for a specific schedule
  const fetchBookings = async (scheduleId: number) => {
    try {
      setIsLoadingBookings(true);
      const response =
        await api.cookingClass.getCookingClassBookingByScheduleId({
          scheduleId,
        });
      setBookings(response);
    } catch (error) {
      toastErrorMessage(error);
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const { overlayPanelFooter, submitBtnRef } = useOverlayPanelHelper({
    cancelBtnProps: {
      onClick: handleDeleteSchedule,
      label: 'Delete Schedule',
      danger: true,
    },
    submitBtnProps: {
      label: 'Update Schedule',
      loading: isLoading,
    },
  });

  useEffect(() => {
    if (open && selectedSchedule?.schedule?.id) {
      fetchBookings(selectedSchedule.schedule.id);
    }
  }, [open, selectedSchedule?.schedule?.id]);

  useEffect(() => {
    if (selectedSchedule) {
      form.setFieldsValue({
        dateTime: selectedSchedule.schedule.dateTime
          ? dayjs(selectedSchedule.schedule.dateTime)
          : undefined,
        maxSlots: selectedSchedule.schedule.maxSlots || 10,
      });
    }
  }, [form, selectedSchedule]);

  return (
    <>
      <Drawer
        open={open}
        onClose={onCancel}
        footer={overlayPanelFooter}
        width={882}
        title="Edit Schedule"
      >
        <Form
          disabled={isLoading}
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          {/* Display class information */}
          {selectedSchedule?.cookingClass && (
            <div className="mb-4 rounded-lg bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedSchedule.cookingClass.name} (
                    {formatDisplayCurrency(selectedSchedule.cookingClass.price)}
                    )
                  </div>
                  <div className="text-xs text-gray-500">
                    Max slots:
                    {selectedSchedule.schedule.maxSlots} slots
                    <br />
                    <span className="text-xs text-gray-500">
                      Booked slots:{' '}
                      {selectedSchedule.schedule.maxSlots -
                        selectedSchedule.schedule.availableSlots}
                    </span>
                  </div>
                </div>
                <AppIconButton
                  icon={<SquarePen width={16} height={16} />}
                  onClick={() => setIsEditClassOpen(true)}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="dateTime"
              label="Date & Time"
              rules={[
                { required: true, message: 'Please select date and time' },
              ]}
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
              rules={[
                { required: true, message: 'Please input max slots' },
                {
                  validator: (_, value) => {
                    if (value && selectedSchedule) {
                      const bookedSlots =
                        selectedSchedule.schedule.maxSlots -
                        selectedSchedule.schedule.availableSlots;
                      if (value < bookedSlots) {
                        return Promise.reject(
                          new Error(
                            `Max slots cannot be less than ${bookedSlots} (already booked slots)`
                          )
                        );
                      }
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                min={
                  selectedSchedule
                    ? selectedSchedule.schedule.maxSlots -
                      selectedSchedule.schedule.availableSlots
                    : 1
                }
                step={1}
                precision={0}
                className="w-full"
                placeholder="Enter max slots"
              />
            </Form.Item>
          </div>

          <Button className="hidden" htmlType="submit" ref={submitBtnRef}>
            Update Schedule
          </Button>
        </Form>

        {/* Booking List */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-900">
            Bookings ({bookings.length})
          </h4>
          <Spin spinning={isLoadingBookings}>
            {bookings.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                <Table
                  dataSource={bookings}
                  pagination={false}
                  size="small"
                  rowKey="id"
                  scroll={{ x: 768 }}
                  columns={[
                    {
                      title: 'Name',
                      dataIndex: 'fullname',
                      key: 'fullname',
                      width: 120,
                    },
                    {
                      title: 'Email',
                      dataIndex: 'email',
                      key: 'email',
                      width: 150,
                      ellipsis: true,
                    },
                    {
                      title: 'Phone',
                      dataIndex: 'phone',
                      key: 'phone',
                      width: 120,
                    },
                    {
                      title: 'People',
                      dataIndex: 'numberOfPeople',
                      key: 'numberOfPeople',
                      width: 80,
                      align: 'center',
                    },
                    {
                      title: 'Payment',
                      dataIndex: 'paymentStatus',
                      key: 'paymentStatus',
                      width: 100,
                      render: (status: string) => (
                        <Tag
                          color={
                            status === 'paid'
                              ? 'green'
                              : status === 'pending'
                                ? 'orange'
                                : 'red'
                          }
                        >
                          {status}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Booking For',
                      dataIndex: 'bookingFor',
                      key: 'bookingFor',
                      width: 120,
                    },
                    {
                      title: 'Created',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      width: 100,
                      render: (date: string) => dayjs(date).format('MM/DD'),
                    },
                  ]}
                />
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
                <Empty />
              </div>
            )}
          </Spin>
        </div>
      </Drawer>

      {/* Edit Class Modal */}
      <AddEditCookingClass
        open={isEditClassOpen}
        setOpen={setIsEditClassOpen}
        selectedCookingClass={selectedSchedule?.cookingClass}
        onUpdateSuccess={() => onUpdateClassInfoSuccess?.()}
      />
    </>
  );
};

export default EditScheduleDrawer;
