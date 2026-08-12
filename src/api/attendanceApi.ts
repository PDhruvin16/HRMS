import { ApiClient } from '../services/apiClients';
import { API_ENDPOINTS } from './endpoints';
import moment from 'moment';
import { getServerMoment } from '../services/api';
import { getApiErrorMessage } from '../utils/errorHandler';

// ─── Today Status ──────────────────────────────────────────────────────────
export interface AttendanceStatus {
  isCheckedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  totalWorkingMinutes: number;
  status: 'Checked Out' | 'Checked In' | 'On Break' | 'Late';
}

// ─── Attendance Log (daily record) ────────────────────────────────────────
export interface AttendanceLog {
  date: string;             // YYYY-MM-DD
  dayLabel: string;         // e.g. "Tue 14 Jul"
  checkIn?: string;         // e.g. "10:06 AM"
  checkOut?: string;
  firstPunchIn?: string;
  lastPunchOut?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'WFH' | 'Holiday';
  workingHours: string;     // "2:57:02"
  targetHours: string;      // "8:30:00"
  overtime: string;         // "0:00:00"
  breakTime: string;        // "1:13:56"
  effectiveHours: string;   // "2:57:02"
  totalTimeFirstToLast?: string; // "8:15:00"
  location?: string;        // "Office" | "Home"
  issues?: AttendanceIssue[];
  punches?: PunchRecord[];
  rawPunchIn?: string | null;
  rawPunchOut?: string | null;
  leaveType?: string | null;
}

export interface PunchRecord {
  id: string;
  type: 'IN' | 'OUT';
  source: string; // e.g. "Machine", "Mobile", "Web"
  time: string;   // "13/07/2026, 10:02:39"
}

export type AttendanceIssue =
  | 'Incomplete hours'
  | 'Sequence missing'
  | 'Ongoing'
  | 'Late coming'
  | 'Overtime';

// ─── Live Server API Types ────────────────────────────────────────────────
export interface ServerPunchLog {
  id: string;
  punchTime: string;
  punchType: 'in' | 'out';
  source: string;
  deviceId: string;
  isDuplicate: boolean;
}

export interface ServerDayMetrics {
  firstPunchIn: string | null;
  lastPunchOut: string | null;
  totalHours: string;
  totalBreakTime: string;
  effectiveHours: string;
  totalOvertime: string;
  isIncompleteHours: boolean;
  isLateAfterTenAm: boolean;
  hasSequenceIssue: boolean;
  hasMissingPunchOut: boolean;
}

export interface ServerAttendanceLog {
  id: string;
  date: string; 
  punchIn: string | null;
  punchOut: string | null;
  workingMinutes: number;
  overtimeMinutes: number;
  breakMinutes: number | null;
  workingHours: number;
  status: 'present' | 'absent' | 'leave' | 'wfh' | 'late' | string; 
  punchLogs: ServerPunchLog[];
  dayMetrics: ServerDayMetrics;
  isLate: boolean;
  isEarlyExit: boolean;
  hasSequenceIssue: boolean;
  targetHours: string;
  leaveType?: string | null;
}

export interface ServerAttendanceSummary {
  totalWorkingSeconds: number;
  totalOvertimeSeconds: number;
  totalBreakSeconds: number;
  totalRequiredSeconds: number;
}

export interface ServerAttendanceResponse {
  success: boolean;
  summary: ServerAttendanceSummary;
  data: ServerAttendanceLog[];
}


// ─── Attendance Summary Stats ─────────────────────────────────────────────
export interface AttendanceSummary {
  totalWorking: string;
  totalOvertime: string;
  totalBreak: string;
  totalIncomplete: string;
  todayLeavingTime: string;
}

// ─── WFH Request ─────────────────────────────────────────────────────────
export interface WFHRequest {
  id: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedOn: string;
}

// ─── Overtime Request ─────────────────────────────────────────────────────
export interface OvertimeRequest {
  id: string;
  otId: string;
  date: string;
  hours: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedOn?: string;
}

// ─── Team Attendance ──────────────────────────────────────────────────────
export interface TeamAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  dayLabel: string;
  status: 'Present' | 'Absent' | 'Late' | 'WFH' | 'Leave';
  issues?: AttendanceIssue[];
  workingHours?: string;
}

// ─── WFH Approval Record ──────────────────────────────────────────────────
export interface WFHApprovalRecord {
  id: string;
  employeeId: string;
  requestedBy: string;
  entryType: string;
  reason: string;
  rejectionReason: string | null;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  employeeName: string;
  empCode: string;
  canApprove: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Converts seconds to a human-readable "HH:mm:ss" string, e.g. 290460 → "80:41:00" */
const secondsToHms = (secs: number): string => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/** Maps the top-level summary block from the server into the AttendanceSummary UI shape */
const serverSummaryToUi = (s: ServerAttendanceSummary): AttendanceSummary => ({
  totalWorking:    secondsToHms(s.totalWorkingSeconds),
  totalOvertime:   secondsToHms(s.totalOvertimeSeconds),
  totalBreak:      secondsToHms(s.totalBreakSeconds),
  totalIncomplete: secondsToHms(s.totalRequiredSeconds),
  todayLeavingTime: '--:--',
});

/** Formats decimal hours string (e.g. "8.50") to "H:mm:ss" string (e.g. "8:30:00") */
const decimalHoursToHms = (decimalStr: string): string => {
  const num = parseFloat(decimalStr);
  if (isNaN(num)) return '8:30:00';
  const hours = Math.floor(num);
  const minutes = Math.round((num - hours) * 60);
  return `${hours}:${String(minutes).padStart(2, '0')}:00`;
};

/** Derives the issue tags from the server flags on a single day log */
const deriveIssues = (log: ServerAttendanceLog): AttendanceIssue[] => {
  const issues: AttendanceIssue[] = [];
  if (log.isLate || log.dayMetrics?.isLateAfterTenAm) issues.push('Late coming');
  if (log.hasSequenceIssue || log.dayMetrics?.hasSequenceIssue) issues.push('Sequence missing');
  
  const isToday = log.date === getServerMoment().format('YYYY-MM-DD');
  if (!isToday && (log.dayMetrics?.isIncompleteHours || log.isEarlyExit)) {
    issues.push('Incomplete hours');
  }
  
  if (log.overtimeMinutes > 0) issues.push('Overtime');
  return issues;
};

/** Maps a ServerAttendanceLog → AttendanceLog (the shape used by UI components) */
const mapServerLog = (log: ServerAttendanceLog): AttendanceLog => {
  const m = moment(log.date);
  const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const dm = log.dayMetrics;

  const punches: PunchRecord[] = (log.punchLogs || []).map((p, i) => ({
    id: p.id,
    type: p.punchType === 'in' ? 'IN' : 'OUT',
    source: p.source === 'machine' ? 'Machine' : capitalise(p.source),
    time: moment(p.punchTime).format('DD/MM/YYYY, HH:mm:ss'),
  }));

  let computedTotalTime = (dm as any)?.totalTimeFirstToLast || (log as any)?.totalTimeFirstToLast;
  if (!computedTotalTime && (log.punchIn || dm?.firstPunchIn) && (log.punchOut || dm?.lastPunchOut)) {
    const startM = moment(log.punchIn || `${log.date} ${dm?.firstPunchIn}`);
    const endM   = moment(log.punchOut || `${log.date} ${dm?.lastPunchOut}`);
    if (startM.isValid() && endM.isValid()) {
      const diffSecs = Math.max(0, endM.diff(startM, 'seconds'));
      computedTotalTime = secondsToHms(diffSecs);
    }
  }

  return {
    date:         log.date,
    dayLabel:     m.format('ddd DD MMM'),
    checkIn:      dm?.firstPunchIn ?? undefined,
    checkOut:     dm?.lastPunchOut ?? undefined,
    firstPunchIn: dm?.firstPunchIn ?? undefined,
    lastPunchOut: dm?.lastPunchOut ?? undefined,
    status:       capitalise(log.status) as AttendanceLog['status'],
    workingHours: dm?.effectiveHours || '0:00:00',
    targetHours:  dm?.expectedWorkDurationHms || (log.targetHours ? decimalHoursToHms(log.targetHours) : '8:30:00'),
    overtime:     dm?.totalOvertime || '0:00:00',
    breakTime:    dm?.totalBreakTime || '0:00:00',
    effectiveHours: dm?.effectiveHours || '0:00:00',
    totalTimeFirstToLast: computedTotalTime || dm?.effectiveHours || '0:00:00',
    location:     log.status === 'wfh' ? 'Home' : 'Office',
    issues:       deriveIssues(log),
    punches,
    rawPunchIn:   log.punchIn,
    rawPunchOut:  log.punchOut,
    leaveType:    log.leaveType,
  };
};

// ─── Mock generators ──────────────────────────────────────────────────────
const buildMockLogs = (month: string): AttendanceLog[] => {
  const days = [
    { d: '14', ci: '10:06 AM', co: '10:34 AM', s: 'Present' as const, w: '0:28:00', ot: '0:00:00', br: '0:00:00', eff: '0:28:00', issues: ['Incomplete hours', 'Ongoing'] as AttendanceIssue[], loc: 'Office' },
    { d: '13', ci: '10:02 AM', co: '19:49 PM', s: 'Present' as const, w: '8:32:52', ot: '0:02:52', br: '1:13:56', eff: '7:18:56', issues: [] as AttendanceIssue[], loc: 'Office' },
    { d: '10', ci: '09:55 AM', co: '19:27 PM', s: 'Present' as const, w: '8:31:47', ot: '0:01:47', br: '1:00:34', eff: '7:31:13', issues: [] as AttendanceIssue[], loc: 'Office' },
    { d: '09', ci: '10:12 AM', co: '19:10 PM', s: 'Present' as const, w: '8:25:00', ot: '0:00:00', br: '0:55:00', eff: '7:30:00', issues: ['Incomplete hours'] as AttendanceIssue[], loc: 'Office' },
    { d: '08', ci: undefined,  co: undefined,  s: 'Absent'  as const, w: '0:00:00', ot: '0:00:00', br: '0:00:00', eff: '0:00:00', issues: [] as AttendanceIssue[], loc: undefined },
    { d: '07', ci: '09:05 AM', co: '18:15 PM', s: 'WFH'     as const, w: '9:10:00', ot: '0:40:00', br: '1:00:00', eff: '8:10:00', issues: [] as AttendanceIssue[], loc: 'Home' },
    { d: '06', ci: '09:40 AM', co: '18:00 PM', s: 'Late'    as const, w: '8:20:00', ot: '0:00:00', br: '1:05:00', eff: '7:15:00', issues: ['Late coming', 'Sequence missing'] as AttendanceIssue[], loc: 'Office' },
    { d: '03', ci: '09:02 AM', co: '18:00 PM', s: 'Present' as const, w: '8:58:00', ot: '0:28:00', br: '1:00:00', eff: '7:58:00', issues: ['Sequence missing'] as AttendanceIssue[], loc: 'Office' },
    { d: '02', ci: '09:10 AM', co: '18:15 PM', s: 'Present' as const, w: '9:05:00', ot: '0:35:00', br: '1:10:00', eff: '7:55:00', issues: [] as AttendanceIssue[], loc: 'Office' },
    { d: '01', ci: undefined,  co: undefined,  s: 'Leave'   as const, w: '0:00:00', ot: '0:00:00', br: '0:00:00', eff: '0:00:00', issues: [] as AttendanceIssue[], loc: undefined },
  ];

  return days.map((d) => {
    const dateStr = `${month}-${d.d}`;
    const m = moment(dateStr);
    return {
      date: dateStr,
      dayLabel: m.format('ddd DD MMM'),
      checkIn: d.ci,
      checkOut: d.co,
      firstPunchIn: d.ci,
      lastPunchOut: d.co,
      status: d.s,
      workingHours: d.w,
      targetHours: '8:30:00',
      overtime: d.ot,
      breakTime: d.br,
      effectiveHours: d.eff,
      location: d.loc,
      issues: d.issues,
      punches: d.ci ? [
        { id: 'p1', type: 'IN', source: 'Machine', time: `${m.format('DD/MM/YYYY')}, ${d.ci}` },
        ...(d.co ? [{ id: 'p2', type: 'OUT', source: 'Machine', time: `${m.format('DD/MM/YYYY')}, ${d.co}` }] : [])
      ] as PunchRecord[] : [],
    };
  });
};

const MOCK_WFH: WFHRequest[] = [];
const MOCK_OT: OvertimeRequest[] = [];

const MOCK_TEAM: TeamAttendanceRecord[] = [
  { id: '1', employeeId: 'QB082', employeeName: 'Dhruvin Patel', department: 'Engineering', date: '2026-07-14', dayLabel: '14/07/2026', status: 'Present', issues: ['Incomplete hours'], workingHours: '2:57:02' },
  { id: '2', employeeId: 'QB082', employeeName: 'Dhruvin Patel', department: 'Engineering', date: '2026-07-13', dayLabel: '13/07/2026', status: 'Present', issues: [], workingHours: '8:32:52' },
  { id: '3', employeeId: 'QB082', employeeName: 'Dhruvin Patel', department: 'Engineering', date: '2026-07-10', dayLabel: '10/07/2026', status: 'Present', issues: [], workingHours: '8:31:47' },
  { id: '4', employeeId: 'QB082', employeeName: 'Dhruvin Patel', department: 'Engineering', date: '2026-07-09', dayLabel: '09/07/2026', status: 'Present', issues: ['Incomplete hours'], workingHours: '8:25:00' },
  { id: '5', employeeId: 'QB083', employeeName: 'Priya Sharma',  department: 'Engineering', date: '2026-07-08', dayLabel: '08/07/2026', status: 'Absent', issues: [], workingHours: '0:00:00' },
  { id: '6', employeeId: 'QB083', employeeName: 'Priya Sharma',  department: 'Engineering', date: '2026-07-07', dayLabel: '07/07/2026', status: 'Present', issues: [], workingHours: '9:10:00' },
  { id: '7', employeeId: 'QB084', employeeName: 'Arjun Mehta',   department: 'Design',       date: '2026-07-06', dayLabel: '06/07/2026', status: 'Late',    issues: ['Late coming', 'Sequence missing'], workingHours: '8:20:00' },
  { id: '8', employeeId: 'QB084', employeeName: 'Arjun Mehta',   department: 'Design',       date: '2026-07-03', dayLabel: '03/07/2026', status: 'Present', issues: ['Sequence missing'], workingHours: '8:58:00' },
];

// ─── API ──────────────────────────────────────────────────────────────────
export const attendanceApi = {
  getTodayStatus: async (): Promise<AttendanceStatus> => {
    return {
      isCheckedIn: false,
      checkInTime: '',
      totalWorkingMinutes: 0,
      status: 'Checked Out',
    };
  },

  getAttendanceLogs: async (month: string): Promise<AttendanceLog[]> => {
    try {
      const response = await ApiClient.get<any>(
        `${API_ENDPOINTS.HRMS.ATTENDANCE.LOGS}?month=${month}`,
      );
      return (response as any).data || response;
    } catch {
      return buildMockLogs(month);
    }
  },

  /** Infinite-query compatible: fetches one page from /attendance/my and returns mapped logs + summary + hasMore */
  getMyAttendance: async (params: {
    page: number;
    limit: number;
    dateFrom: string;
    dateTo: string;
  }): Promise<{ logs: AttendanceLog[]; summary: AttendanceSummary | null; hasMore: boolean }> => {
    const { page, limit, dateFrom, dateTo } = params;
    if (__DEV__) {
      console.log('[DEBUG] getMyAttendance request params:', params);
    }
    try {
      const response = await ApiClient.get<any>(
        API_ENDPOINTS.HRMS.ATTENDANCE.MY,
        { params: { page, limit, dateFrom, dateTo } },
      );
      const raw = response;
      if (__DEV__) {
        console.log('[DEBUG] getMyAttendance raw response:', response);
        console.log('[DEBUG] getMyAttendance raw data count:', raw?.data?.length ?? 0);
        console.log('[DEBUG] getMyAttendance raw summary:', raw?.summary);
      }
      const serverData: ServerAttendanceLog[] = raw?.data ?? [];
      const serverSummary: ServerAttendanceSummary | null = raw?.summary ?? null;

      const mappedLogs = serverData.map(mapServerLog);
      if (__DEV__) {
        console.log('[DEBUG] getMyAttendance mappedLogs count:', mappedLogs.length);
      }
      return {
        logs:    mappedLogs,
        summary: serverSummary ? serverSummaryToUi(serverSummary) : null,
        hasMore: serverData.length === limit,
      };
    } catch (error: any) {
      const msg = getApiErrorMessage(error);
      if (__DEV__) {
        console.error('[DEBUG] getMyAttendance API call failed:', msg);
      }
      if (error && typeof error === 'object') {
        error.message = msg;
      }
      throw error;
    }
  },

  getAttendanceSummary: async (from: string, to: string): Promise<AttendanceSummary> => {
    try {
      const response = await ApiClient.get<any>(
        `${API_ENDPOINTS.HRMS.ATTENDANCE.LOGS}?from=${from}&to=${to}&summary=true`,
      );
      return (response as any).data || response;
    } catch {
      return {
        totalWorking:   '69:36:46',
        totalOvertime:  '00:17:27',
        totalBreak:     '09:15:55',
        totalIncomplete:'15:40:41',
        todayLeavingTime: '18:44:12',
      };
    }
  },

  getWFHRequests: async (): Promise<WFHRequest[]> => {
    try {
      const response = await ApiClient.get<any>('/attendance/manual/my', { params: { entryType: 'wfh' } });
      const list = response?.data || response || [];
      return list.map((item: any) => ({
        id: item.id,
        fromDate: item.startDate,
        toDate: item.endDate,
        days: moment(item.endDate).diff(moment(item.startDate), 'days') + 1,
        reason: item.reason,
        status: item.status?.toLowerCase().includes('reject') ? 'Rejected' : item.status?.toLowerCase().includes('approve') ? 'Approved' : 'Pending',
        submittedOn: item.createdAt || new Date().toISOString(),
      }));
    } catch {
      return MOCK_WFH;
    }
  },

  createWFHRequest: async (payload: Omit<WFHRequest, 'id' | 'status' | 'submittedOn'>): Promise<any> => {
    try {
      const response = await ApiClient.post<any>('/attendance/manual', {
        entryType: 'wfh',
        startDate: payload.fromDate,
        endDate: payload.toDate,
        reason: payload.reason,
      });
      return response;
    } catch (error: any) {
      const msg = getApiErrorMessage(error);
      if (error && typeof error === 'object') error.message = msg;
      throw error;
    }
  },

  getOvertimeRequests: async (): Promise<OvertimeRequest[]> => {
    try {
      const response = await ApiClient.get<any>('/attendance/manual/my', { params: { entryType: 'overtime' } });
      const list = response?.data || response || [];
      return list.map((item: any) => ({
        id: item.id,
        otId: item.id,
        date: moment(item.startDate).format('YYYY-MM-DD'),
        hours: item.totalOvertimeHms || '00:00:00',
        reason: item.reason,
        status: item.status?.toLowerCase().includes('reject') ? 'Rejected' : item.status?.toLowerCase().includes('approve') ? 'Approved' : 'Pending',
        submittedOn: item.createdAt || new Date().toISOString(),
      }));
    } catch {
      return MOCK_OT;
    }
  },

  createOvertimeRequest: async (payload: Omit<OvertimeRequest, 'id' | 'otId' | 'status'>): Promise<any> => {
    try {
      const response = await ApiClient.post<any>('/attendance/manual', {
        entryType: 'overtime',
        startDate: payload.date,
        endDate: payload.date,
        reason: payload.reason,
        totalOvertimeHms: payload.hours,
      });
      return response;
    } catch (error: any) {
      const msg = getApiErrorMessage(error);
      if (error && typeof error === 'object') error.message = msg;
      throw error;
    }
  },

  getTeamAttendance: async (params: {
    page: number;
    limit: number;
    dateFrom: string;
    dateTo: string;
  }): Promise<{ 
    data: any[]; 
    summary: { present: number; absent: number; onLeave: number; wfh: number } | null;
    hasMore: boolean; 
  }> => {
    const { page, limit, dateFrom, dateTo } = params;
    try {
      const response = await ApiClient.get<any>(
        '/attendance/team',
        { params: { page, limit, dateFrom, dateTo } },
      );
      const raw = response;
      const serverData = raw?.data ?? [];
      const serverSummary = raw?.summary ?? null;
      return {
        data: serverData,
        summary: serverSummary,
        hasMore: serverData.length === limit,
      };
    } catch (error: any) {
      const msg = getApiErrorMessage(error);
      if (__DEV__) {
        console.error('[DEBUG] getTeamAttendance API call failed:', msg);
      }
      if (error && typeof error === 'object') error.message = msg;
      throw error;
    }
  },

  getEmployeeAttendance: async (employeeId: string, params: { page: number; limit: number; from: string; to: string }): Promise<{ logs: AttendanceLog[]; summary: AttendanceSummary | null; hasMore: boolean }> => {
    const { page, limit, from, to } = params;
    try {
      const response = await ApiClient.get<any>(
        `/attendance/employee/${employeeId}`,
        { params: { page, limit, from, to } }
      );
      const raw = response;
      const serverData: ServerAttendanceLog[] = raw?.data ?? [];
      const mappedLogs = serverData.map(mapServerLog);
      
      let mappedSummary: AttendanceSummary | null = null;
      if (raw?.summary) {
        const toHms = (sec: number) => {
          const h = Math.floor(sec / 3600);
          const m = Math.floor((sec % 3600) / 60);
          const s = sec % 60;
          return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':');
        };
        mappedSummary = {
          totalWorking: toHms(raw.summary.totalWorkingSeconds || 0),
          totalOvertime: toHms(raw.summary.totalOvertimeSeconds || 0),
          totalBreak: toHms(raw.summary.totalBreakSeconds || 0),
          totalIncomplete: toHms(raw.summary.totalRequiredSeconds || 0),
          todayLeavingTime: '',
        };
      }

      return {
        logs: mappedLogs,
        summary: mappedSummary,
        hasMore: serverData.length === limit,
      };
    } catch (error: any) {
      const msg = getApiErrorMessage(error);
      if (__DEV__) {
        console.error('[DEBUG] getEmployeeAttendance API call failed:', msg);
      }
      if (error && typeof error === 'object') error.message = msg;
      throw error;
    }
  },

  checkIn: async (data: { latitude?: number; longitude?: number; note?: string }): Promise<AttendanceStatus> => {
    try {
      const response = await ApiClient.post<any>(API_ENDPOINTS.HRMS.ATTENDANCE.CHECKIN, data);
      return (response as any).data || response;
    } catch (error: any) {
      const msg = getApiErrorMessage(error);
      if (error && typeof error === 'object') error.message = msg;
      throw error;
    }
  },

  checkOut: async (data: { note?: string }): Promise<AttendanceStatus> => {
    try {
      const response = await ApiClient.post<any>(API_ENDPOINTS.HRMS.ATTENDANCE.CHECKOUT, data);
      return (response as any).data || response;
    } catch (error: any) {
      const msg = getApiErrorMessage(error);
      if (error && typeof error === 'object') error.message = msg;
      throw error;
    }
  },

  getWFHApprovals: async (): Promise<WFHApprovalRecord[]> => {
    try {
      const response = await ApiClient.get<any>('/attendance/manual/pending');
      return response?.data || response || [];
    } catch (error: any) {
      if (__DEV__) {
        console.error('[DEBUG] getWFHApprovals API call failed:', getApiErrorMessage(error));
      }
      return [];
    }
  },

  approveWFHRequest: async (requestId: string): Promise<any> => {
    try {
      const response = await ApiClient.put<any>(`/attendance/manual/${requestId}/approve`);
      return response;
    } catch (error: any) {
      const msg = getApiErrorMessage(error);
      if (error && typeof error === 'object') error.message = msg;
      throw error;
    }
  },

  rejectWFHRequest: async (requestId: string, payload: { rejectionReason: string }): Promise<any> => {
    try {
      const response = await ApiClient.put<any>(`/attendance/manual/${requestId}/reject`, payload);
      return response;
    } catch (error: any) {
      const msg = getApiErrorMessage(error);
      if (error && typeof error === 'object') error.message = msg;
      throw error;
    }
  },

  deleteWFHRequest: async (requestId: string): Promise<any> => {
    try {
      const response = await ApiClient.delete<any>(`/attendance/manual/${requestId}`);
      return response;
    } catch (error: any) {
      const msg = getApiErrorMessage(error);
      if (error && typeof error === 'object') error.message = msg;
      throw error;
    }
  },

  getPunchesByDate: async (dateStr: string): Promise<any[]> => {
    try {
      const formattedDate = dateStr && moment(dateStr, ['YYYY-MM-DD', 'DD/MM/YYYY']).isValid()
        ? moment(dateStr, ['YYYY-MM-DD', 'DD/MM/YYYY']).format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD');

      const url = `/attendance/my/punches?date=${formattedDate}`;
      const response = await ApiClient.get<any>(url);
      const rawData = response?.data?.data || response?.data || (Array.isArray(response) ? response : []);
      if (Array.isArray(rawData)) {
        return rawData.map((item: any) => ({
          id: item.id || `punch_${Date.now()}_${Math.random()}`,
          type: (item.punchType || 'in').toUpperCase() as 'IN' | 'OUT',
          time: moment(item.punchTime).isValid() ? moment(item.punchTime).format('HH:mm:ss') : item.punchTime,
          source: item.source ? item.source.charAt(0).toUpperCase() + item.source.slice(1) : 'Machine',
          isAdded: false,
        }));
      }
      return [];
    } catch (error: any) {
      if (__DEV__) {
        console.error('[DEBUG] getPunchesByDate API call failed:', getApiErrorMessage(error));
      }
      return [];
    }
  },

  submitCorrectionRequest: async (payload: {
    requestDate: string;
    reason: string;
    items: Array<{
      actionType: string;
      punchType: string;
      punchTime: string;
    }>;
  }): Promise<any> => {
    try {
      const response = await ApiClient.post<any>('/attendance/corrections', payload);
      console.log('[DEBUG] POST /attendance/corrections response:', JSON.stringify(response?.data, null, 2));
      return response?.data || response;
    } catch (error: any) {
      const msg = getApiErrorMessage(error);
      if (error && typeof error === 'object') error.message = msg;
      throw error;
    }
  },

  getCorrectionRequests: async (): Promise<any> => {
    try {
      const response = await ApiClient.get<any>('/attendance/corrections/my');
      console.log('[DEBUG] GET /attendance/corrections/my response:', JSON.stringify(response?.data, null, 2));
      return response?.data || response;
    } catch (error: any) {
      console.error('[DEBUG] GET /attendance/corrections/my failed:', getApiErrorMessage(error));
      return null;
    }
  },

  getAllCorrectionRequests: async (): Promise<any> => {
    try {
      const response = await ApiClient.get<any>('/attendance/corrections');
      console.log('[DEBUG] GET /attendance/corrections (All Approvals) response:', JSON.stringify(response?.data, null, 2));
      return response?.data || response;
    } catch (error: any) {
      console.error('[DEBUG] GET /attendance/corrections failed:', getApiErrorMessage(error));
      return null;
    }
  },

  getEmployeePunchesByDate: async (employeeId: string, dateStr: string): Promise<any[]> => {
    try {
      const formattedDate = dateStr && moment(dateStr, ['YYYY-MM-DD', 'DD/MM/YYYY']).isValid()
        ? moment(dateStr, ['YYYY-MM-DD', 'DD/MM/YYYY']).format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD');

      const url = `/attendance/employee-punches?employeeId=${encodeURIComponent(employeeId)}&date=${formattedDate}`;
      console.log('[DEBUG] GET employee-punches URL:', url);
      const response = await ApiClient.get<any>(url);
      const rawData = response?.data?.data || response?.data || (Array.isArray(response) ? response : []);
      if (Array.isArray(rawData)) {
        return rawData.map((item: any) => ({
          id: item.id || `punch_${Date.now()}_${Math.random()}`,
          type: (item.punchType || 'in').toUpperCase() as 'IN' | 'OUT',
          time: moment(item.punchTime).isValid() ? moment(item.punchTime).format('HH:mm:ss') : item.punchTime,
          source: item.source || 'machine',
          isDuplicate: Boolean(item.isDuplicate),
          isDeleted: Boolean(item.isDeleted),
          isAdded: item.source?.toLowerCase() === 'correction',
        }));
      }
      return [];
    } catch (error: any) {
      console.error('[DEBUG] getEmployeePunchesByDate failed:', getApiErrorMessage(error));
      return [];
    }
  },

  approveCorrectionRequest: async (id: string): Promise<any> => {
    try {
      const url = `/attendance/corrections/${encodeURIComponent(id)}/approve`;
      console.log('[DEBUG] PATCH approve correction URL:', url);
      const response = await ApiClient.patch<any>(url, {});
      console.log('[DEBUG] PATCH approve correction success response:', JSON.stringify(response?.data, null, 2));
      return response?.data || response;
    } catch (error: any) {
      if (error?.status === 404 || error?.response?.status === 404) {
        try {
          console.log('[DEBUG] 404 on PATCH /attendance/corrections/:id/approve, trying POST /attendance/corrections/:id/approve');
          const postRes = await ApiClient.post<any>(`/attendance/corrections/${encodeURIComponent(id)}/approve`, {});
          return postRes?.data || postRes;
        } catch (postErr: any) {
          const msg = getApiErrorMessage(postErr);
          if (postErr && typeof postErr === 'object') postErr.message = msg;
          throw postErr;
        }
      }
      const msg = getApiErrorMessage(error);
      if (error && typeof error === 'object') error.message = msg;
      throw error;
    }
  },

  rejectCorrectionRequest: async (id: string, rejectionReason: string): Promise<any> => {
    try {
      const url = `/attendance/corrections/${encodeURIComponent(id)}/reject`;
      const payload = { rejectionReason };
      console.log('[DEBUG] PATCH reject correction URL:', url, 'payload:', payload);
      const response = await ApiClient.patch<any>(url, payload);
      console.log('[DEBUG] PATCH reject correction success response:', JSON.stringify(response?.data, null, 2));
      return response?.data || response;
    } catch (error: any) {
      if (error?.status === 404 || error?.response?.status === 404) {
        try {
          console.log('[DEBUG] 404 on PATCH /attendance/corrections/:id/reject, trying POST /attendance/corrections/:id/reject');
          const postRes = await ApiClient.post<any>(`/attendance/corrections/${encodeURIComponent(id)}/reject`, { rejectionReason });
          return postRes?.data || postRes;
        } catch (postErr: any) {
          const msg = getApiErrorMessage(postErr);
          if (postErr && typeof postErr === 'object') postErr.message = msg;
          throw postErr;
        }
      }
      const msg = getApiErrorMessage(error);
      if (error && typeof error === 'object') error.message = msg;
      throw error;
    }
  },
};

export default attendanceApi;

