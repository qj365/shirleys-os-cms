/**
 * CONTAINING DAYJS CONFIGURATION
 * DO NOT ADD CUSTOM FUNCTIONS HERE
 */

import dayjs from 'dayjs';
import 'dayjs/locale/en';
import updateLocale from 'dayjs/plugin/updateLocale';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import timezone from 'dayjs/plugin/timezone';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(updateLocale);
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);
dayjs.extend(duration);
dayjs.extend(relativeTime);

dayjs.locale('en');

// Extend Window interface to add 'dayjs'
declare global {
  interface Window {
    dayjs: typeof dayjs;
  }
}

window.dayjs = dayjs;

export default dayjs;
