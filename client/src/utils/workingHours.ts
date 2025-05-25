// Working hours utility for calculating business hours between dates
// Working hours: Monday-Friday 9:00-22:00, Saturday 9:00-12:00, Sunday closed

export interface WorkingHoursResult {
  workingHoursRemaining: number;
  isWithinWorkingHours: boolean;
  isLateReschedule: boolean; // Less than 4 working hours notice
}

export function calculateWorkingHoursBetween(startDate: Date, endDate: Date): WorkingHoursResult {
  // If start date is after end date, return 0
  if (startDate >= endDate) {
    return {
      workingHoursRemaining: 0,
      isWithinWorkingHours: false,
      isLateReschedule: true
    };
  }

  let workingHours = 0;
  let currentDate = new Date(startDate);

  while (currentDate < endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const currentHour = currentDate.getHours();

    // Skip if it's Sunday (day 0)
    if (dayOfWeek === 0) {
      // Move to next day at 9:00 AM
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(9, 0, 0, 0);
      continue;
    }

    // Determine working hours for the day
    let startHour = 9;
    let endHour = 22;
    
    if (dayOfWeek === 6) { // Saturday
      endHour = 12;
    }

    // Skip if outside working hours
    if (currentHour < startHour) {
      // Jump to start of working hours
      currentDate.setHours(startHour, 0, 0, 0);
      continue;
    }

    if (currentHour >= endHour) {
      // Jump to next working day
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(startHour, 0, 0, 0);
      continue;
    }

    // Calculate how much working time is left in current day
    const endOfWorkingDay = new Date(currentDate);
    endOfWorkingDay.setHours(endHour, 0, 0, 0);

    // Use the earlier of end of working day or target end date
    const segmentEnd = endDate < endOfWorkingDay ? endDate : endOfWorkingDay;

    // Calculate working time in this segment
    const segmentDuration = (segmentEnd.getTime() - currentDate.getTime()) / (1000 * 60 * 60);
    workingHours += segmentDuration;

    // Move to next working day if we haven't reached the end date
    if (segmentEnd === endOfWorkingDay && endDate > endOfWorkingDay) {
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(startHour, 0, 0, 0);
    } else {
      break;
    }
  }

  const isCurrentlyWorkingHours = isWithinWorkingHours(startDate);
  
  return {
    workingHoursRemaining: Math.max(0, workingHours),
    isWithinWorkingHours: isCurrentlyWorkingHours,
    isLateReschedule: workingHours < 4
  };
}

export function isWithinWorkingHours(date: Date): boolean {
  const dayOfWeek = date.getDay();
  const hour = date.getHours();

  // Sunday is closed
  if (dayOfWeek === 0) return false;

  // Monday - Friday: 9:00 - 22:00
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    return hour >= 9 && hour < 22;
  }

  // Saturday: 9:00 - 12:00
  if (dayOfWeek === 6) {
    return hour >= 9 && hour < 12;
  }

  return false;
}