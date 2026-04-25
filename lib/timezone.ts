/**
 * Timezone utility for Kenyan Time (EAT/UTC+3)
 * All date calculations in the system should use this
 */

const TIMEZONE = 'Africa/Nairobi';

/**
 * Get current time in Kenyan timezone
 */
export function getNowInKenyaTime(): Date {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
}

/**
 * Get today's start (00:00:00) in Kenyan timezone
 */
export function getTodayStartInKenyaTime(): Date {
  const kenyaTime = getNowInKenyaTime();
  return new Date(kenyaTime.getFullYear(), kenyaTime.getMonth(), kenyaTime.getDate(), 0, 0, 0, 0);
}

/**
 * Get today's end (23:59:59) in Kenyan timezone
 */
export function getTodayEndInKenyaTime(): Date {
  const todayStart = getTodayStartInKenyaTime();
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  todayEnd.setMilliseconds(-1);
  return todayEnd;
}

/**
 * Check if a date is today in Kenyan timezone
 */
export function isToday(date: string | Date): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  const todayStart = getTodayStartInKenyaTime();
  const todayEnd = getTodayEndInKenyaTime();
  return checkDate >= todayStart && checkDate <= todayEnd;
}

/**
 * Get date range for a specific day in Kenyan timezone
 */
export function getDayRangeInKenyaTime(date: Date): { start: Date; end: Date } {
  const kenyaDate = new Date(date.toLocaleString('en-US', { timeZone: TIMEZONE }));
  const start = new Date(kenyaDate.getFullYear(), kenyaDate.getMonth(), kenyaDate.getDate(), 0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  end.setMilliseconds(-1);
  return { start, end };
}
