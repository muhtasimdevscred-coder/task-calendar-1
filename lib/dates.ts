import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";

export type FilterType = "all" | "week" | "month";

export function getDateRange(filter: FilterType, refDate: Date = new Date()) {
  if (filter === "week") {
    return {
      from: startOfWeek(refDate, { weekStartsOn: 1 }),
      to: endOfWeek(refDate, { weekStartsOn: 1 }),
    };
  }
  if (filter === "month") {
    return {
      from: startOfMonth(refDate),
      to: endOfMonth(refDate),
    };
  }
  return { from: null, to: null };
}

export function formatDate(d: Date | string) {
  return format(new Date(d), "EEE, MMM d, yyyy");
}

export function formatDateForInput(d: Date | string) {
  return format(new Date(d), "yyyy-MM-dd");
}
