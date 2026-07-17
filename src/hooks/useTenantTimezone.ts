/**
 * useTenantTimezone
 * ────────────────────────────────────────────────────────────────────────────
 * Reads the tenant timezone from Redux auth state and exposes two conversion
 * helpers:
 *
 *   ConvertUtcToTenantTimezone(utcString, format?)
 *     - Converts a UTC ISO string from the API to the tenant's local time.
 *     - Default format: "DD-MM-YYYY HH:mm:ss"
 *
 *   ConvertTenantTimezoneToUtc(localString, format?)
 *     - Converts a local date/time string to UTC (ISO-8601).
 *     - Default format: "YYYY-MM-DDTHH:mm:ssZ"
 *
 * Implementation note:
 *   We use the browser-native Intl.DateTimeFormat API (available in Hermes &
 *   JSC on React Native) to avoid adding a moment-timezone dependency.
 */

import { useCallback } from 'react';
import { useAppSelector } from './useRedux';
import type { RootState } from '../store';

// ─── Format helpers ───────────────────────────────────────────────────────────

/**
 * Convert a Date object to the requested string format tokens:
 *   DD, MM, YYYY, HH, mm, ss
 */
const formatDate = (date: Date, format: string, timezone: string): string => {
  try {
    const formatOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: format.includes('hh') || format.includes('A') || format.includes('a'),
    };

    const parts = new Intl.DateTimeFormat('en-GB', formatOptions).formatToParts(date);

    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
    const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value ?? '';

    return format
      .replace('YYYY', get('year'))
      .replace('MM', get('month'))
      .replace('DD', get('day'))
      .replace('HH', get('hour')) // 24h
      .replace('hh', get('hour')) // 12h (will be 12h because of hour12: true)
      .replace('mm', get('minute'))
      .replace('ss', get('second'))
      .replace('A', dayPeriod.toUpperCase())
      .replace('a', dayPeriod.toLowerCase());
  } catch {
    return date.toISOString();
  }
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTenantTimezone = () => {
  const timezone: string =
    useAppSelector((state: RootState) => state.auth.tenant?.tenant_timezone) || 'UTC';

  /**
   * Convert a UTC date string received from the API to the tenant's timezone.
   * @param utcDate  - ISO 8601 UTC string, e.g. "2024-03-01T10:30:00Z"
   * @param format   - Output format tokens (DD, MM, YYYY, HH, mm, ss)
   */
  const ConvertUtcToTenantTimezone = useCallback(
    (utcDate?: string | null, format: string = 'DD-MM-YYYY HH:mm:ss'): string => {
      if (!utcDate) return '—';
      try {
        const date = new Date(utcDate);
        if (isNaN(date.getTime())) return utcDate; // return raw if unparseable
        return formatDate(date, format, timezone);
      } catch {
        return utcDate;
      }
    },
    [timezone],
  );

  /**
   * Convert a local (tenant timezone) date string to UTC ISO 8601.
   * @param localDate - Date string in the tenant timezone
   * @param format    - Output format (default: full ISO)
   */
  const ConvertTenantTimezoneToUtc = useCallback(
    (localDate?: string | Date | null, _format: string = 'YYYY-MM-DDTHH:mm:ss[Z]'): string => {
      if (!localDate) return '';
      try {
        const date = new Date(localDate);
        if (isNaN(date.getTime())) return '';
        return date.toISOString();
      } catch {
        return '';
      }
    },
    [],
  );

  return { ConvertUtcToTenantTimezone, ConvertTenantTimezoneToUtc, timezone };
};
