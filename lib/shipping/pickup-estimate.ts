import type { NormalizedCourierRate } from "./types";

export type PickupCalendarConfig = {
  timeZone?: string;
  nonWorkingWeekdays?: readonly number[];
  holidays?: readonly string[];
  maxSearchDays?: number;
};

const DEFAULT_TIME_ZONE = "Asia/Kolkata";
const DEFAULT_NON_WORKING_WEEKDAYS = [0, 6] as const;
const DEFAULT_MAX_SEARCH_DAYS = 366;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type LocalDateTime = {
  date: string;
  hour: number;
  minute: number;
};

function validIsoDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function dateFromIso(value: string): Date | null {
  return validIsoDate(value) ? new Date(`${value}T00:00:00.000Z`) : null;
}

function isoFromDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function addDays(value: string, amount: number): string | null {
  const date = dateFromIso(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + amount);
  return isoFromDate(date);
}

function displayDate(value: string): string {
  const date = dateFromIso(value);
  if (!date) return "Pickup estimate unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function localDateTime(referenceTimestamp: string | Date, timeZone: string): LocalDateTime | null {
  if (typeof referenceTimestamp !== "string" && !(referenceTimestamp instanceof Date)) return null;
  const reference = referenceTimestamp instanceof Date ? new Date(referenceTimestamp.getTime()) : new Date(referenceTimestamp);
  if (Number.isNaN(reference.getTime())) return null;

  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(reference);
    const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    const date = `${values.year}-${values.month}-${values.day}`;
    const hour = Number(values.hour);
    const minute = Number(values.minute);
    if (!validIsoDate(date) || !Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
    return { date, hour, minute };
  } catch {
    return null;
  }
}

function cutoffMinutes(value: unknown): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function calendarValues(config: PickupCalendarConfig): { timeZone: string; nonWorkingWeekdays: Set<number>; holidays: Set<string>; maxSearchDays: number } | null {
  if (!config || typeof config !== "object") return null;
  const timeZone = config.timeZone ?? DEFAULT_TIME_ZONE;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone }).format();
  } catch {
    return null;
  }

  const configuredWeekdays = Array.isArray(config.nonWorkingWeekdays) ? config.nonWorkingWeekdays : DEFAULT_NON_WORKING_WEEKDAYS;
  const configuredHolidays = Array.isArray(config.holidays) ? config.holidays : [];
  const nonWorkingWeekdays = new Set(configuredWeekdays.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6));
  const holidays = new Set(configuredHolidays.filter(validIsoDate));
  const maxSearchDays = config.maxSearchDays === undefined || !Number.isInteger(config.maxSearchDays) || config.maxSearchDays < 0
    ? DEFAULT_MAX_SEARCH_DAYS
    : config.maxSearchDays;
  return { timeZone, nonWorkingWeekdays, holidays, maxSearchDays };
}

function isWorkingDay(value: string, calendar: ReturnType<typeof calendarValues>): boolean {
  if (!calendar) return false;
  const date = dateFromIso(value);
  if (!date) return false;
  return !calendar.nonWorkingWeekdays.has(date.getUTCDay()) && !calendar.holidays.has(value);
}

function nextWorkingDay(value: string, calendar: ReturnType<typeof calendarValues>): string | null {
  if (!calendar) return null;
  let candidate = value;
  for (let offset = 0; offset <= calendar.maxSearchDays; offset += 1) {
    if (isWorkingDay(candidate, calendar)) return candidate;
    candidate = addDays(candidate, 1) ?? "";
    if (!candidate) return null;
  }
  return null;
}

function applyPickupDelay(candidate: string, courier: NormalizedCourierRate): string | null {
  const from = validIsoDate(courier.pickupDelayFrom) ? courier.pickupDelayFrom : null;
  const to = validIsoDate(courier.pickupDelayTo) ? courier.pickupDelayTo : null;

  if (!from && !to) return candidate;
  if (from && to) {
    if (from > to || candidate < from || candidate > to) return candidate;
    return addDays(to, 1);
  }

  // With only one boundary, do not invent the missing end or start. If the
  // candidate could be inside the incomplete interval, no reliable date exists.
  if (from) return candidate < from ? candidate : null;
  return candidate > (to as string) ? candidate : null;
}

/**
 * Estimates a courier pickup date from serviceability metadata only.
 * This is a heuristic and never represents a scheduled Shiprocket pickup.
 */
export function estimatePickupDate(
  courier: NormalizedCourierRate,
  referenceTimestamp: string | Date,
  config: PickupCalendarConfig = {},
): string | null {
  if (!courier || typeof courier !== "object") return null;
  const cutoff = cutoffMinutes(courier.cutoffTime);
  const calendar = calendarValues(config);
  if (cutoff === null || !calendar) return null;

  const local = localDateTime(referenceTimestamp, calendar.timeZone);
  if (!local) return null;

  const beforeCutoff = local.hour * 60 + local.minute < cutoff;
  const initialDate = beforeCutoff && isWorkingDay(local.date, calendar)
    ? local.date
    : addDays(local.date, 1);
  if (!initialDate) return null;

  const candidate = nextWorkingDay(initialDate, calendar);
  if (!candidate) return null;
  const delayedCandidate = applyPickupDelay(candidate, courier);
  if (!delayedCandidate) return null;
  return nextWorkingDay(delayedCandidate, calendar);
}

/**
 * Gives an estimated pickup date a useful relative label without changing the
 * underlying ISO date. Relative labels use the pickup origin's local date.
 */
export function formatPickupEstimate(
  value: string | null,
  referenceTimestamp: string | Date = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
): string {
  if (!validIsoDate(value)) return "Pickup estimate unavailable";
  const local = localDateTime(referenceTimestamp, timeZone);
  if (!local) return displayDate(value);
  if (value === local.date) return `Today · ${displayDate(value)}`;
  const tomorrow = addDays(local.date, 1);
  if (value === tomorrow) return `Tomorrow · ${displayDate(value)}`;
  return displayDate(value);
}
