/**
 * Date utility functions for IEP tracking
 */

/**
 * Calculate the number of business days (excluding weekends) between two dates
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Number of business days between the dates
 */
export const getBusinessDaysBetween = (startDate: Date, endDate: Date): number => {
  let count = 0;
  const currentDate = new Date(startDate);
  
  // Make sure we're working with the start of each day
  currentDate.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  while (currentDate < end) {
    const dayOfWeek = currentDate.getDay();
    // Only count Monday (1) through Friday (5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return count;
};

/**
 * Calculate days since a given date, optionally excluding weekends
 * @param fromDate - The starting date
 * @param excludeWeekends - Whether to exclude weekends from the count
 * @returns Number of days from the given date to today
 */
export const getDaysSince = (fromDate: Date, excludeWeekends: boolean = false): number => {
  if (excludeWeekends) {
    return getBusinessDaysSince(fromDate);
  } else {
    const today = new Date();
    return Math.floor((today.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  }
};

/**
 * Calculate business days since a given date (excluding weekends)
 * @param fromDate - The starting date
 * @returns Number of business days from the given date to today
 */
export const getBusinessDaysSince = (fromDate: Date): number => {
  const today = new Date();
  return getBusinessDaysBetween(fromDate, today);
};

/**
 * Calculate business days until a future date (excluding weekends)
 * @param toDate - The target date
 * @returns Number of business days from today to the target date
 */
export const getBusinessDaysUntil = (toDate: Date): number => {
  const today = new Date();
  return getBusinessDaysBetween(today, toDate);
};

/**
 * Add business days to a date (excluding weekends)
 * @param startDate - The starting date
 * @param businessDays - Number of business days to add
 * @returns New date after adding the business days
 */
export const addBusinessDays = (startDate: Date, businessDays: number): Date => {
  const result = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < businessDays) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    // Only count Monday (1) through Friday (5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      daysAdded++;
    }
  }
  
  return result;
};

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param date - The date to check
 * @returns True if the date is a weekend
 */
export const isWeekend = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
};
