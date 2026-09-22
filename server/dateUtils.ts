/**
 * Timezone & Date Normalization Utility for Fieldnora Dispatch Operations
 * Fieldnora operations are centered in Nairobi, Kenya (East Africa Time: UTC+3).
 * Client dispatchers, technicians, and mobile devices may be located in different timezones
 * (e.g. Africa/Nairobi, America/Los_Angeles, UTC, etc.).
 *
 * This utility ensures that "Today's Active Work Orders" never drop to 0 due to:
 * 1. UTC vs EAT (UTC+3) vs client local timezone differences across midnight
 * 2. Active in-flight jobs that remain open across day boundaries
 * 3. Date string format variations (YYYY-MM-DD vs ISO strings)
 */

export function getTodayDateStrings(clientTz?: string): Set<string> {
  const dates = new Set<string>();
  const now = new Date();

  // 1. UTC Date (e.g. '2026-09-22')
  dates.add(now.toISOString().split('T')[0]);

  // 2. East Africa Time (Africa/Nairobi - Fieldnora Headquarters, UTC+3)
  try {
    const eatDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    dates.add(eatDate);
  } catch (e) {
    // Fallback if timezone not supported
    const eatOffsetMs = 3 * 60 * 60 * 1000;
    const eatDate = new Date(now.getTime() + eatOffsetMs).toISOString().split('T')[0];
    dates.add(eatDate);
  }

  // 3. Server Local Time
  try {
    const localDate = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    dates.add(localDate);
  } catch (e) {
    // Ignore
  }

  // 4. Client Timezone if provided via header (x-timezone) or query (?tz=...)
  if (clientTz && clientTz.trim()) {
    try {
      const clientDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: clientTz.trim(),
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(now);
      dates.add(clientDate);
    } catch (e) {
      // Invalid client timezone name, ignore
    }
  }

  // 5. Also include +/- 24h day window for active jobs transition
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  return dates;
}

/**
 * Checks if a given date string represents "today" in either UTC, EAT (Nairobi), or client timezone
 */
export function isDateToday(dateStr?: string | null, clientTz?: string): boolean {
  if (!dateStr) return false;
  const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.trim();
  const todayDates = getTodayDateStrings(clientTz);
  return todayDates.has(cleanDate);
}

/**
 * Checks if job status is considered active (not completed and not cancelled)
 */
export function isJobActive(status?: string | null): boolean {
  if (!status) return false;
  const activeStatuses = ['new', 'scheduled', 'assigned', 'en_route', 'on_site', 'in_progress', 'waiting'];
  return activeStatuses.includes(status.toLowerCase());
}

/**
 * Determines if a job belongs to "Today's Active Work Orders":
 * A job qualifies if:
 * 1. It is explicitly scheduled for today (in UTC, Kenya EAT, or client timezone), OR
 * 2. It is currently in-flight/active in the field (en_route, on_site, in_progress, assigned, scheduled)
 *    even if scheduled earlier, because open dispatch jobs remain active until completed or cancelled.
 * 3. It was completed today (completed within today's date window).
 */
export function isJobTodayOrActive(
  job: { scheduledDate?: string | null; status?: string | null; updatedAt?: string | null },
  clientTz?: string
): boolean {
  // If scheduled specifically for today
  if (isDateToday(job.scheduledDate, clientTz)) {
    return true;
  }

  // If currently active and in-flight
  if (isJobActive(job.status)) {
    return true;
  }

  // If completed today
  if (job.status === 'completed') {
    if (isDateToday(job.updatedAt, clientTz) || isDateToday(job.scheduledDate, clientTz)) {
      return true;
    }
  }

  return false;
}
