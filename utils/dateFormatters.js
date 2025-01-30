import { format, isToday, isYesterday, isTomorrow } from "date-fns";

export const formatTripTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  let dateStr = "";

  // Format the date part
  if (isToday(date)) {
    dateStr = "Today";
  } else if (isTomorrow(date)) {
    dateStr = "Tomorrow";
  } else if (isYesterday(date)) {
    dateStr = "Yesterday";
  } else {
    dateStr = format(date, "MMM do"); // e.g., "Mar 15th"
  }

  // Format the time part
  const timeStr = format(date, "h:mm a"); // e.g., "2:30 PM"

  return `${dateStr} at ${timeStr}`;
};

export const formatTripDuration = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return "";
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "";
  }

  const startStr = formatTripTime(startTime);
  const endStr = format(end, "h:mm a");
  return `${startStr} - ${endStr}`;
};
