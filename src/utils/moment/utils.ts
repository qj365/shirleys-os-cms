import type { RangePickerProps } from 'antd/es/date-picker';
import type { ConfigType } from 'dayjs';
import { Dayjs } from 'dayjs';
import dayjs from '@/utils/moment/dayjsConfig';
import type { ObjectType } from '@/utils/types';

export const DefaultDateFormat = 'DD/MM/YYYY';
export const DefaultDateTimeFormat = 'DD/MM/YYYY, HH:mm';
export const DefaultShortDateFormat = 'D/M/YYYY';
export const DefaultLongDateFormat = `ddd, ${DefaultDateFormat}`;
export const EmptyDateTimePlaceholder = '--/--/---- --:--';
export const DefaultFullDateTimeFormat = 'DD/MM/YYYY HH:mm:ss';
export const CompactDateFormat = 'DDMMYYYY';
export const DefaultTimeFormat = 'HH:mm';
export const DefaultMonthYearFormat = 'MM/YYYY';

export const DefaultDateFormats = [
  DefaultDateFormat,
  DefaultShortDateFormat,
  'D/MM/YYYY',
  'DD/M/YYYY',
];

export const convertMillisecondsToDays = (milliseconds: number) =>
  milliseconds / (1000 * 60 * 60 * 24);

export const formatDisplayDate = (
  date: ConfigType,
  config?: {
    format?: string;
    timeZone?: string | null;
  }
) => {
  if (!date) return '-';

  const { format, timeZone } = config || {};

  return dayjs(date)
    .tz(timeZone || undefined)
    .format(format ?? 'MMM DD, YYYY');
};

export const formatDisplayTime = (
  dateTime: ConfigType,
  config?: {
    format?: string;
    timeZone?: string | null;
  }
) => {
  if (!dateTime) return '-';

  const { format, timeZone } = config || {};

  return dayjs(dateTime)
    .tz(timeZone || undefined)
    .format(format ?? 'h:mm A');
};

export const formatDisplayTimeAgo = (date: ConfigType, withSuffix?: boolean) =>
  date ? dayjs(date).fromNow(withSuffix) : '-';

export const getTimeDuration = (timeInMinute: number) => {
  const hours = Math.floor(timeInMinute / 60);
  const minutes = timeInMinute % 60;

  return `${hours}h${minutes}m`;
};

export const disabledPastDate: RangePickerProps['disabledDate'] = (
  day: Dayjs
) => day.isBefore(dayjs(), 'day');

export const disabledFutureDate: RangePickerProps['disabledDate'] = (
  day: Dayjs
) => day.isAfter(dayjs(), 'day');

/** Convert date in string DD/MM/YYYY to Dayjs object */
export const convertDateStringToObjectDate = (obj: ObjectType): ObjectType => {
  const result: ObjectType = {};
  const defaultDatePattern = /^\d{2}\/\d{2}\/\d{4}$/;

  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string' && defaultDatePattern.test(value)) {
      result[key] = dayjs(value, 'DD/MM/YYYY');
    } else {
      result[key] = value;
    }
  }

  return result;
};
