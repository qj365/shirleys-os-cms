import { api, type AdminGetCookingClassesResponse } from '@/lib/api/admin';
import { toastErrorMessage } from '@/utils/dataTypes/string';
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
import { Form, Spin, message } from 'antd';
import dayjs from 'dayjs';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import AddNewScheduleModal from './AddNewScheduleModal';
import EditScheduleDrawer from './EditScheduleDrawer';

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

  // Fetch updated cooking class data and update selectedSchedule
  const updateSelectedScheduleWithFreshData = useCallback(async () => {
    if (!selectedSchedule?.cookingClassId) return;

    try {
      const updatedCookingClass = await api.cookingClass.getCookingClass({
        id: selectedSchedule.cookingClassId,
      });

      // Update the selectedSchedule with fresh data
      setSelectedSchedule(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cookingClass: {
            ...prev.cookingClass,
            name: updatedCookingClass.name,
            price: updatedCookingClass.price,
            image: updatedCookingClass.image,
            description: updatedCookingClass.description,
            address: updatedCookingClass.address,
            duration: updatedCookingClass.duration,
            whatToExpect: updatedCookingClass.whatToExpect,
          },
        };
      });
    } catch (error) {
      toastErrorMessage(error);
    }
  }, [selectedSchedule?.cookingClassId]);

  const onUpdateClassInfoSuccess = useCallback(async () => {
    // Refresh cooking classes data
    fetchCookingClasses();
    fetchAllCookingClasses();
    // Update selectedSchedule with fresh data
    await updateSelectedScheduleWithFreshData();
  }, [
    fetchCookingClasses,
    fetchAllCookingClasses,
    updateSelectedScheduleWithFreshData,
  ]);

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
          maxSlots: schedule.maxSlots,
          availableSlots: schedule.availableSlots,
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

    // If it's an existing schedule, open edit drawer
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
        // Prepare request body with only changed fields
        const requestBody: { dateTime?: string } = {};

        // Check if dateTime has changed
        const originalDateTime = dayjs(schedule.dateTime);
        const newDateTime = dayjs(finalDateTimeISO);

        if (!originalDateTime.isSame(newDateTime)) {
          requestBody.dateTime = finalDateTimeISO;
        }

        // Only make API call if there are changes
        if (Object.keys(requestBody).length > 0) {
          await api.cookingClass.updateCookingClassSchedule({
            id: scheduleId,
            requestBody,
          });
        }

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

  const handleEditScheduleSuccess = useCallback(() => {
    message.success('Schedule updated successfully');
    setIsEditScheduleOpen(false);
    setSelectedSchedule(null);
    fetchCookingClasses();
  }, [fetchCookingClasses]);

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
                    {eventInfo.event.extendedProps.availableSlots}/
                    {eventInfo.event.extendedProps.maxSlots} slots -{' '}
                    {dayjs(eventInfo.event.start).format('HH:mm')} -{' '}
                    {dayjs(eventInfo.event.end).format('HH:mm')}
                  </div>
                )}
              </div>
            );
          }}
        />
      </Spin>

      <EditScheduleDrawer
        open={isEditScheduleOpen}
        setOpen={setIsEditScheduleOpen}
        selectedSchedule={selectedSchedule}
        onUpdateSuccess={handleEditScheduleSuccess}
        onUpdateClassInfoSuccess={onUpdateClassInfoSuccess}
      />

      <AddNewScheduleModal
        open={isAddScheduleOpen}
        setOpen={setIsAddScheduleOpen}
        selectedDate={selectedDate}
        allCookingClasses={allCookingClasses}
        onFetchCookingClasses={fetchCookingClasses}
      />
    </div>
  );
});

CookingClassSchedules.displayName = 'CookingClassSchedules';

export default CookingClassSchedules;
