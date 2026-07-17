/**
 * AttendanceTypes.ts
 * Shared constants, color maps, and type definitions for the Attendance feature.
 */

import colors from '../../theme/color';

/* ─── Tab definitions ──────────────────────────────────────────── */
export const TABS = ['My Attendance', 'My WFH', 'My Overtime', 'Team', 'WFH Approvals'] as const;
export type Tab = (typeof TABS)[number];

/* ─── Status → color mappings ──────────────────────────────────── */
export const STATUS_COLOR: Record<string, string> = {
  Present:  colors.success,
  Late:     colors.warning,
  Absent:   colors.error,
  Leave:    colors.primary,
  WFH:      colors.emailBlue,
  Holiday:  colors.text.muted,
  Approved: colors.success,
  Rejected: colors.error,
  Pending:  colors.warning,
};

export const STATUS_BG: Record<string, string> = {
  Present:  'rgba(16, 185, 129, 0.1)',
  Late:     'rgba(245, 158, 11, 0.1)',
  Absent:   'rgba(239, 68, 68, 0.1)',
  Leave:    'rgba(139, 92, 246, 0.1)',
  WFH:      'rgba(59, 130, 246, 0.1)',
  Holiday:  'rgba(156, 163, 175, 0.1)',
  Approved: 'rgba(16, 185, 129, 0.1)',
  Rejected: 'rgba(239, 68, 68, 0.1)',
  Pending:  'rgba(245, 158, 11, 0.1)',
};

export const ISSUE_COLOR: Record<string, string> = {
  'Incomplete hours': colors.warning,
  'Sequence missing': colors.emailBlue,
  'Ongoing':          colors.primary,
  'Late coming':      colors.error,
  'Overtime':         colors.success,
};

/* ─── Team filter type ─────────────────────────────────────────── */
export type TeamFilter = 'All' | 'Present' | 'Late' | 'Absent' | 'WFH' | 'Incomplete hours' | 'Sequence missing';
export const TEAM_FILTERS: TeamFilter[] = ['All', 'Present', 'Late', 'Absent', 'WFH', 'Incomplete hours', 'Sequence missing'];

/* ─── Time utilities ───────────────────────────────────────────── */
export const parseHmsToSeconds = (hmsStr: string): number => {
  if (!hmsStr) return 0;
  const parts = hmsStr.split(':').map(Number);
  if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  if (parts.length === 2) return (parts[0] * 3600) + (parts[1] * 60);
  return 0;
};

export const secondsToHmsString = (totalSecs: number): string => {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/* ─── Attendance summary shape ─────────────────────────────────── */
export interface AttendanceSummary {
  totalWorking:    string;
  totalOvertime:   string;
  totalBreak:      string;
  totalIncomplete: string;
  todayLeavingTime: string;
}
