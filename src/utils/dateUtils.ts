import { DateFormatOption } from '../types';

/**
 * Returns today's date in local YYYY-MM-DD format, safe from UTC shifts.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date object or YYYY-MM-DD string to local YYYY-MM-DD string.
 */
export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD safely into a local Date without UTC offset shifts.
 */
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date();
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day, 12, 0, 0); // midday avoids any daylight boundary quirks
}

/**
 * Formats a YYYY-MM-DD string according to user setting.
 */
export function formatDate(dateStr?: string, format: DateFormatOption = 'YYYY-MM-DD'): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [yyyy, mm, dd] = parts;

  switch (format) {
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${yyyy}`;
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${yyyy}`;
    case 'YYYY-MM-DD':
    default:
      return `${yyyy}-${mm}-${dd}`;
  }
}

/**
 * Formats a YYYY-MM-DD string into a full date string: "Tuesday, September 15, 2026"
 */
export function formatFullDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = parseDateString(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Friendly relative display (e.g. Today, Yesterday, Tomorrow, or "Sep 18, 2026")
 */
export function formatFriendlyDate(dateStr?: string): string {
  if (!dateStr) return '';
  const today = getTodayDateString();
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  if (dateStr === yesterday) return 'Yesterday';

  const date = parseDateString(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Checks whether a given YYYY-MM-DD is today.
 */
export function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  return dateStr === getTodayDateString();
}

/**
 * Checks whether a date is strictly before today (overdue).
 */
export function isPast(dateStr?: string): boolean {
  if (!dateStr) return false;
  return dateStr < getTodayDateString();
}

/**
 * Checks whether a date is strictly after today.
 */
export function isFuture(dateStr?: string): boolean {
  if (!dateStr) return false;
  return dateStr > getTodayDateString();
}

/**
 * Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
 */
export function getDayOfWeek(dateStr: string): number {
  return parseDateString(dateStr).getDay();
}

/**
 * Adds or subtracts days to a YYYY-MM-DD string.
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

/**
 * Formats HH:mm time to 12-hour AM/PM format.
 */
export function formatTime(timeStr?: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${mStr ?? '00'} ${ampm}`;
}

/**
 * Greeting based on local hour.
 */
export function getGreeting(): { greeting: string; period: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good morning', period: 'Morning' };
  }
  if (hour >= 12 && hour < 17) {
    return { greeting: 'Good afternoon', period: 'Afternoon' };
  }
  if (hour >= 17 && hour < 21) {
    return { greeting: 'Good evening', period: 'Evening' };
  }
  return { greeting: 'Good night', period: 'Night' };
}

/**
 * Get start of the week for a given date (0 = Sunday, 1 = Monday).
 */
export function getStartOfWeek(dateStr: string, startOfWeek: 0 | 1 = 1): string {
  const d = parseDateString(dateStr);
  const currentDay = d.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = (currentDay < startOfWeek ? 7 : 0) + currentDay - startOfWeek;
  d.setDate(d.getDate() - diff);
  return toDateString(d);
}

/**
 * Get 7 days array for current week.
 */
export function getWeekDays(dateStr: string, startOfWeek: 0 | 1 = 1): string[] {
  const start = getStartOfWeek(dateStr, startOfWeek);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
