/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  InputNumber,
  Modal,
  message,
  Card,
  Space,
  Typography,
  DatePicker,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { type EventInput } from '@fullcalendar/core';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

const { Title, Text } = Typography;

interface CookingClassSchedule {
  id: string;
  dateTime: string;
  maxSlots: number;
}

interface CookingClassScheduleCalendarProps {
  schedules: CookingClassSchedule[];
  onSchedulesChange: (schedules: CookingClassSchedule[]) => void;
  durationMinutes?: number; // event display duration; default 60
}

export default function CookingClassScheduleCalendar({
  schedules,
  onSchedulesChange,
  durationMinutes = 60,
}: CookingClassScheduleCalendarProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<CookingClassSchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDateValue, setSelectedDateValue] =
    useState<dayjs.Dayjs | null>(null);
  const [maxSlots, setMaxSlots] = useState<number>(10);

  // Convert schedules to FullCalendar events
  const events: EventInput[] = useMemo(() => {
    return schedules.map(schedule => {
      const isPastDate = dayjs(schedule.dateTime).isBefore(dayjs(), 'day');
      return {
        id: schedule.id,
        title: `${schedule.maxSlots} slots${isPastDate ? ' (Past)' : ''}`,
        start: schedule.dateTime,
        // derive an end time for display using provided duration
        end: dayjs(schedule.dateTime)
          .add(durationMinutes || 60, 'minute')
          .toISOString(),
        backgroundColor: isPastDate ? '#d9d9d9' : '#1890ff',
        borderColor: isPastDate ? '#d9d9d9' : '#1890ff',
        textColor: isPastDate ? '#8c8c8c' : '#ffffff',
        editable: !isPastDate,
        startEditable: !isPastDate,
        // fixed duration controlled by form; do not allow resize
        durationEditable: false,
        extendedProps: {
          maxSlots: schedule.maxSlots,
          originalSchedule: schedule,
          isPastDate,
        },
      };
    });
  }, [schedules, durationMinutes]);

  const handleDateSelect = useCallback((selectInfo: any) => {
    const { start, end } = selectInfo;
    const startDate = dayjs(start);
    const endDate = dayjs(end);

    // Calculate the difference in days between start and end
    const daysDifference = endDate.diff(startDate, 'day');

    // Only allow single day selection (difference should be 0 or 1 depending on FullCalendar behavior)
    if (daysDifference > 1) {
      message.warning('Please select a single day');
      return;
    }

    // Prevent selection of past dates
    if (startDate.isBefore(dayjs(), 'day')) {
      message.warning('Cannot create schedules for past dates');
      return;
    }

    setSelectedDate(startDate.format('YYYY-MM-DDTHH:mm'));
    setSelectedDateValue(startDate);
    setMaxSlots(10);
    setEditingSchedule(null);
    setIsModalVisible(true);
  }, []);

  const handleEventClick = useCallback((clickInfo: any) => {
    const { event } = clickInfo;
    const originalSchedule = event.extendedProps.originalSchedule;

    // Prevent editing past events
    if (dayjs(event.start).isBefore(dayjs(), 'day')) {
      message.warning('Cannot edit schedules for past dates');
      return;
    }

    setEditingSchedule(originalSchedule);
    const eventDate = dayjs(event.start);
    setSelectedDate(eventDate.format('YYYY-MM-DDTHH:mm'));
    setSelectedDateValue(eventDate);
    setMaxSlots(event.extendedProps.maxSlots);
    setIsModalVisible(true);
  }, []);

  const handleEventDrop = useCallback(
    (eventDropInfo: any) => {
      const { event } = eventDropInfo;
      const newDateTime = dayjs(event.start).format('YYYY-MM-DDTHH:mm');
      const originalSchedule = event.extendedProps.originalSchedule;

      // Prevent dropping to past dates
      if (dayjs(event.start).isBefore(dayjs(), 'day')) {
        message.warning('Cannot move schedules to past dates');
        // Revert the event position
        event.setStart(dayjs(originalSchedule.dateTime).toDate());
        return;
      }

      const updatedSchedules = schedules.map(schedule =>
        schedule.id === originalSchedule.id
          ? { ...schedule, dateTime: newDateTime }
          : schedule
      );

      onSchedulesChange(updatedSchedules);
      message.success('Schedule updated successfully');
    },
    [schedules, onSchedulesChange]
  );

  // Resizing is disabled (fixed duration), but keep handler no-op if fired
  const handleEventResize = useCallback(() => undefined, []);

  const handleSaveSchedule = useCallback(() => {
    if (!selectedDateValue) {
      message.error('Please select date and time');
      return;
    }

    const finalDateTime = selectedDateValue.format('YYYY-MM-DDTHH:mm');

    // Prevent saving past dates
    if (selectedDateValue.isBefore(dayjs(), 'day')) {
      message.error('Cannot create schedules for past dates');
      return;
    }

    if (maxSlots < 1 || maxSlots > 50) {
      message.error('Max slots must be between 1 and 50');
      return;
    }

    const newSchedule: CookingClassSchedule = {
      id: editingSchedule?.id || uuid(),
      dateTime: finalDateTime,
      maxSlots,
    };

    let updatedSchedules: CookingClassSchedule[];

    if (editingSchedule) {
      // Update existing schedule
      updatedSchedules = schedules.map(schedule =>
        schedule.id === editingSchedule.id ? newSchedule : schedule
      );
    } else {
      // Add new schedule
      updatedSchedules = [...schedules, newSchedule];
    }

    onSchedulesChange(updatedSchedules);
    setIsModalVisible(false);
    setEditingSchedule(null);
    setSelectedDate('');
    setSelectedDateValue(null);
    setMaxSlots(10);

    message.success(
      editingSchedule
        ? 'Schedule updated successfully'
        : 'Schedule added successfully'
    );
  }, [
    selectedDateValue,
    maxSlots,
    editingSchedule,
    schedules,
    onSchedulesChange,
  ]);

  const handleDeleteSchedule = useCallback(
    (scheduleId: string) => {
      const updatedSchedules = schedules.filter(
        schedule => schedule.id !== scheduleId
      );
      onSchedulesChange(updatedSchedules);
      message.success('Schedule deleted successfully');
    },
    [schedules, onSchedulesChange]
  );

  const handleDateChange = useCallback((dateTime: dayjs.Dayjs | null) => {
    setSelectedDateValue(dateTime);
    if (dateTime) {
      setSelectedDate(dateTime.format('YYYY-MM-DDTHH:mm'));
    }
  }, []);

  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
    setEditingSchedule(null);
    setSelectedDate('');
    setSelectedDateValue(null);
    setMaxSlots(10);
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <Title level={5} className="mb-0">
            Class Schedules ({schedules.length})
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              const tomorrow = dayjs().add(1, 'day');
              setSelectedDate(tomorrow.format('YYYY-MM-DDTHH:mm'));
              setSelectedDateValue(tomorrow);
              setMaxSlots(10);
              setEditingSchedule(null);
              setIsModalVisible(true);
            }}
          >
            Add Schedule
          </Button>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          eventDurationEditable={false}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          height="auto"
          eventContent={eventInfo => (
            <div className="p-1">
              <div className="text-xs font-medium">{eventInfo.event.title}</div>
              <div className="text-xs opacity-75">
                {dayjs(eventInfo.event.start).format('HH:mm')}
              </div>
            </div>
          )}
        />
      </Card>

      {/* Schedule List */}
      {schedules.length > 0 && (
        <Card title="Schedule List">
          <div className="space-y-2">
            {schedules.map(schedule => {
              const isPastDate = dayjs(schedule.dateTime).isBefore(
                dayjs(),
                'day'
              );
              return (
                <div
                  key={schedule.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    isPastDate ? 'bg-gray-100 opacity-60' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <Text strong className={isPastDate ? 'text-gray-500' : ''}>
                      {dayjs(schedule.dateTime).format(
                        'dddd, MMMM D, YYYY [at] HH:mm'
                      )}
                      {isPastDate && ' (Past)'}
                    </Text>
                    <div
                      className={`text-sm ${isPastDate ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Max slots: {schedule.maxSlots}
                    </div>
                  </div>
                  <Space>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      disabled={isPastDate}
                      onClick={() => {
                        if (isPastDate) {
                          message.warning(
                            'Cannot edit schedules for past dates'
                          );
                          return;
                        }
                        const scheduleDate = dayjs(schedule.dateTime);
                        setEditingSchedule(schedule);
                        setSelectedDate(schedule.dateTime);
                        setSelectedDateValue(scheduleDate);
                        setMaxSlots(schedule.maxSlots);
                        setIsModalVisible(true);
                      }}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      disabled={isPastDate}
                      onClick={() => {
                        if (isPastDate) {
                          message.warning(
                            'Cannot delete schedules for past dates'
                          );
                          return;
                        }
                        handleDeleteSchedule(schedule.id);
                      }}
                    />
                  </Space>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Add/Edit Schedule Modal */}
      <Modal
        title={editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
        open={isModalVisible}
        onOk={handleSaveSchedule}
        onCancel={handleModalCancel}
        okText={editingSchedule ? 'Update' : 'Add'}
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Date & Time
            </label>
            <DatePicker
              showTime={{ format: 'HH:mm', minuteStep: 15 }}
              value={selectedDateValue}
              onChange={handleDateChange}
              className="w-full"
              placeholder="Select date and time"
              disabledDate={current =>
                current && current < dayjs().startOf('day')
              }
              format="YYYY-MM-DD HH:mm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Max Slots</label>
            <InputNumber
              value={maxSlots}
              onChange={value => setMaxSlots(value || 10)}
              min={1}
              max={50}
              className="w-full"
              placeholder="Enter max slots"
            />
            <Text type="secondary" className="text-xs">
              Maximum number of participants for this class
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
}
