import { api, type AdminGetCookingClassesResponse } from '@/lib/api/admin';
import {
  formatDisplayCurrency,
  toastErrorMessage,
} from '@/utils/dataTypes/string';
import {
  type DateSelectArg,
  type EventClickArg,
  type EventDropArg,
  type EventInput,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import {
  Button,
  DatePicker,
  Form,
  InputNumber,
  Modal,
  Select,
  Spin,
  message,
} from 'antd';
import dayjs from 'dayjs';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

export interface CookingClassSchedulesRef {
  refreshData: () => void;
}

const CookingClassSchedules = forwardRef<CookingClassSchedulesRef>((_, ref) => {
  const [cookingClasses, setCookingClasses] = useState<
    AdminGetCookingClassesResponse[]
  >([]);
  const [allCookingClasses, setAllCookingClasses] = useState<
    AdminGetCookingClassesResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);

  const [selectedSchedule, setSelectedSchedule] = useState<{
    cookingClassId: number;
    scheduleIndex: number;
    cookingClass: AdminGetCookingClassesResponse;
    schedule: {
      availableSlots: number;
      maxSlots: number;
      dateTime: string;
      id: number;
    };
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: dayjs().startOf('month').toISOString(),
    end: dayjs().endOf('month').toISOString(),
  });
  const [currentView, setCurrentView] = useState<string>('dayGridMonth');

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refreshData: () => {
      fetchCookingClasses();
      fetchAllCookingClasses();
    },
  }));

  // Fetch cooking classes with date range
  const fetchCookingClasses = useCallback(
    async (startDate?: string, endDate?: string) => {
      try {
        setIsLoading(true);
        const response = await api.cookingClass.getCookingClasses({
          startDate: startDate || dateRange.start,
          endDate: endDate || dateRange.end,
        });
        setCookingClasses(response);
      } catch (error) {
        toastErrorMessage(error);
      } finally {
        setIsLoading(false);
      }
    },
    [dateRange]
  );

  // Fetch all cooking classes for search
  const fetchAllCookingClasses = useCallback(async () => {
    try {
      const response = await api.cookingClass.getCookingClasses({});
      setAllCookingClasses(response);
    } catch (error) {
      toastErrorMessage(error);
    }
  }, []);

  useEffect(() => {
    fetchCookingClasses();
    fetchAllCookingClasses();
  }, [fetchCookingClasses, fetchAllCookingClasses]);

  // Convert cooking classes to FullCalendar events
  const events: EventInput[] = useMemo(() => {
    return cookingClasses.flatMap(cookingClass => {
      if (
        !cookingClass.cookingClassSchedules ||
        cookingClass.cookingClassSchedules.length === 0
      ) {
        return [];
      }

      return cookingClass.cookingClassSchedules.map((schedule, index) => {
        // Use duration from cooking class data, default to 60 minutes if not available
        const duration =
          (
            cookingClass as AdminGetCookingClassesResponse & {
              duration?: number;
            }
          )?.duration || 60;
        return {
          id: `${cookingClass.id}-${schedule.id}`,
          title: cookingClass.name,
          start: schedule.dateTime,
          end: dayjs(schedule.dateTime).add(duration, 'minute').toISOString(),
          editable: true,
          startEditable: true,
          durationEditable: false, // Don't allow resizing, only dragging
          extendedProps: {
            cookingClass,
            schedule,
            scheduleIndex: index,
            scheduleId: schedule.id,
          },
        };
      });
    });
  }, [cookingClasses]);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const { event } = clickInfo;
    const { cookingClass, schedule, scheduleIndex, scheduleId } =
      event.extendedProps;

    // If it's an existing schedule, open edit modal
    if (scheduleIndex !== undefined && scheduleId) {
      setSelectedSchedule({
        cookingClassId: cookingClass.id,
        scheduleIndex,
        cookingClass,
        schedule: {
          ...schedule,
          id: scheduleId,
        },
      });
      setIsEditScheduleOpen(true);
    }
  }, []);

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    const { start } = selectInfo;
    const startDate = dayjs(start);

    setSelectedDate(startDate.toISOString());
    setIsAddScheduleOpen(true);
  }, []);

  const handleEventDrop = useCallback(
    async (dropInfo: EventDropArg) => {
      const { event } = dropInfo;
      const { schedule, scheduleIndex, scheduleId, cookingClass } =
        event.extendedProps;

      if (scheduleIndex === undefined || !scheduleId) return;

      const originalDateTime = dayjs(schedule.dateTime);
      const newDateTime = dayjs(event.start);
      let finalDateTime: string;

      // Handle different views
      if (currentView === 'timeGridDay') {
        // Day view: Only change time, keep the same date
        const originalDate = originalDateTime.format('YYYY-MM-DD');
        const newTime = newDateTime.format('HH:mm:ss');
        finalDateTime = originalDate + 'T' + newTime;
      } else if (currentView === 'timeGridWeek') {
        // Week view: Change both date and time
        finalDateTime = newDateTime.toISOString();
      } else {
        // Month view: Only change date, keep the same time
        const originalTime = originalDateTime.format('HH:mm:ss');
        const newDate = newDateTime.format('YYYY-MM-DD');
        finalDateTime = newDate + 'T' + originalTime;
      }

      const finalDateTimeISO = dayjs(finalDateTime).toISOString();

      try {
        // Update the schedule time using the API
        await api.cookingClass.updateCookingClassSchedule({
          id: scheduleId,
          requestBody: {
            dateTime: finalDateTimeISO,
            maxSlots: schedule.maxSlots, // Keep the same maxSlots
          },
        });

        const successMessage =
          currentView === 'timeGridDay'
            ? 'Schedule time updated successfully'
            : currentView === 'timeGridWeek'
              ? 'Schedule date and time updated successfully'
              : 'Schedule date updated successfully';

        message.success(successMessage);
        fetchCookingClasses();
      } catch (error) {
        toastErrorMessage(error);
        // Revert the event position on error
        event.setStart(dayjs(schedule.dateTime).toDate());
        event.setEnd(
          dayjs(schedule.dateTime)
            .add(
              (
                cookingClass as AdminGetCookingClassesResponse & {
                  duration?: number;
                }
              ).duration || 60,
              'minute'
            )
            .toDate()
        );
        // Force calendar to update the event display
        dropInfo.revert();
      }
    },
    [fetchCookingClasses, currentView]
  );

  const handleViewChange = useCallback(
    (view: { start: Date; end: Date }) => {
      const start = dayjs(view.start);
      const end = dayjs(view.end);
      setDateRange({
        start: start.toISOString(),
        end: end.toISOString(),
      });
      fetchCookingClasses(start.toISOString(), end.toISOString());
    },
    [fetchCookingClasses]
  );

  const handleViewChangeWithType = useCallback(
    (mountArg: { view: { type: string } }) => {
      setCurrentView(mountArg.view.type);
    },
    []
  );

  const handleAddSchedule = useCallback(
    async (values: {
      cookingClassId: string;
      maxSlots: number;
      dateTime: dayjs.Dayjs | string;
    }) => {
      try {
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
        setIsAddScheduleOpen(false);
        form.resetFields();
        fetchCookingClasses();
      } catch (error) {
        toastErrorMessage(error);
      }
    },
    [form, fetchCookingClasses]
  );

  const handleEditSchedule = useCallback(
    async (values: { dateTime: dayjs.Dayjs | string; maxSlots: number }) => {
      if (!selectedSchedule) return;

      try {
        const { dateTime, maxSlots } = values;
        const dateTimeString = dayjs.isDayjs(dateTime)
          ? dateTime.toISOString()
          : dateTime;

        // Use the updateCookingClassSchedule API with the schedule ID
        await api.cookingClass.updateCookingClassSchedule({
          id: selectedSchedule.schedule.id,
          requestBody: {
            dateTime: dateTimeString,
            maxSlots,
          },
        });

        message.success('Schedule updated successfully');
        setIsEditScheduleOpen(false);
        editForm.resetFields();
        setSelectedSchedule(null);
        fetchCookingClasses();
      } catch (error) {
        toastErrorMessage(error);
      }
    },
    [selectedSchedule, editForm, fetchCookingClasses]
  );

  const handleDeleteSchedule = useCallback(async () => {
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

          message.success('Schedule deleted successfully');
          setIsEditScheduleOpen(false);
          editForm.resetFields();
          setSelectedSchedule(null);
          fetchCookingClasses();
        } catch (error) {
          toastErrorMessage(error);
        }
      },
    });
  }, [selectedSchedule, editForm, fetchCookingClasses]);

  return (
    <div className="space-y-4">
      <Spin spinning={isLoading}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          dayMaxEvents={3}
          weekends={true}
          events={events}
          eventClick={handleEventClick}
          selectable={true}
          selectMirror={true}
          select={handleDateSelect}
          datesSet={handleViewChange}
          viewDidMount={handleViewChangeWithType}
          eventDrop={handleEventDrop}
          height="auto"
          eventContent={eventInfo => {
            // Regular event content
            return (
              <div className="w-full p-1">
                <div className="truncate text-xs font-medium">
                  {eventInfo.event.title}
                </div>
                {currentView === 'dayGridMonth' && (
                  <div className="text-xs">
                    {dayjs(eventInfo.event.start).format('HH:mm')} -{' '}
                    {dayjs(eventInfo.event.end).format('HH:mm')}
                  </div>
                )}
              </div>
            );
          }}
        />
      </Spin>

      {/* Add Schedule Modal */}
      <Modal
        title="Add New Schedule"
        open={isAddScheduleOpen}
        onCancel={() => {
          setIsAddScheduleOpen(false);
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
        >
          <Form.Item
            name="cookingClassId"
            label="Cooking Class"
            rules={[
              { required: true, message: 'Please select a cooking class' },
            ]}
          >
            <Select
              showSearch
              placeholder="Search and select a cooking class"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
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
            rules={[
              { required: true, message: 'Please input max slots' },
              {
                type: 'number',
                min: 1,
                max: 50,
                message: 'Max slots must be between 1 and 50',
              },
            ]}
          >
            <InputNumber
              min={1}
              max={50}
              className="w-full"
              placeholder="Enter max slots"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setIsAddScheduleOpen(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add Schedule
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Schedule Modal */}
      <Modal
        title="Edit Schedule"
        open={isEditScheduleOpen}
        onCancel={() => {
          setIsEditScheduleOpen(false);
          editForm.resetFields();
          setSelectedSchedule(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSchedule}
          initialValues={{
            dateTime: selectedSchedule?.schedule?.dateTime
              ? dayjs(selectedSchedule.schedule.dateTime)
              : undefined,
            maxSlots: selectedSchedule?.schedule?.maxSlots || 10,
          }}
        >
          {/* Display class information */}
          {selectedSchedule?.cookingClass && (
            <div className="mb-4 rounded-lg bg-gray-50 p-3">
              <div className="text-sm font-semibold text-gray-900">
                Class Name:{selectedSchedule.cookingClass.name} (
                {formatDisplayCurrency(selectedSchedule.cookingClass.price)})
              </div>
              <div className="text-base text-gray-700">
                available / max slots:{' '}
                {selectedSchedule.schedule.availableSlots} /{' '}
                {selectedSchedule.schedule.maxSlots} slots
              </div>
            </div>
          )}
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
            rules={[
              { required: true, message: 'Please input max slots' },
              {
                type: 'number',
                min: 1,
                max: 50,
                message: 'Max slots must be between 1 and 50',
              },
            ]}
          >
            <InputNumber
              min={1}
              max={50}
              className="w-full"
              placeholder="Enter max slots"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-between">
              <Button
                onClick={() => {
                  setIsEditScheduleOpen(false);
                  editForm.resetFields();
                  setSelectedSchedule(null);
                }}
              >
                Cancel
              </Button>
              <div className="flex space-x-2">
                <Button danger onClick={handleDeleteSchedule}>
                  Delete Schedule
                </Button>

                <Button type="primary" htmlType="submit">
                  Update Schedule
                </Button>
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

CookingClassSchedules.displayName = 'CookingClassSchedules';

export default CookingClassSchedules;
