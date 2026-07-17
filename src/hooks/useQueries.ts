import {
  QueryClient,
  useMutation,
  useQuery,
  useInfiniteQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import profileApi, { UserProfile } from '../api/profileApi';
import leaveApi, { LeaveBalance, LeaveRequest } from '../api/leaveApi';
import attendanceApi, {
  AttendanceStatus,
  AttendanceLog,
  AttendanceSummary,
  WFHRequest,
  OvertimeRequest,
  TeamAttendanceRecord,
  WFHApprovalRecord,
} from '../api/attendanceApi';
import employeeApi, { Employee, Department_API, Designation_API } from '../api/employeeApi';
import { useAppSelector } from './useRedux';

export { useErrorHandle } from './useErrorHandle';

// Small helper to safely read numeric `status` from unknown error objects
const getStatus = (error: unknown): number | undefined => {
  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    if ('response' in errObj && errObj.response && typeof errObj.response === 'object') {
      const resp = errObj.response as Record<string, unknown>;
      if ('status' in resp && typeof resp.status === 'number') {
        return resp.status;
      }
    }
    if ('status' in errObj && typeof errObj.status === 'number') {
      return errObj.status;
    }
  }
  return undefined;
};

// App-wide QueryClient with sensible defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: unknown) => {
        if (failureCount >= 3) return false;
        const status = getStatus(error);
        if (status === 401 || status === 403 || status === 404) return false;
        return true;
      },
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    },
  },
});

export const queryKeys = {
  profile: {
    base: ['profile'] as QueryKey,
  },
  leave: {
    balance: ['leave', 'balance'] as QueryKey,
    requests: (type: 'my' | 'team') => ['leave', 'requests', type] as QueryKey,
  },
  attendance: {
    today:   ['attendance', 'today'] as QueryKey,
    logs:    (month: string) => ['attendance', 'logs', month] as QueryKey,
    infiniteLogs: (from: string, to: string) => ['attendance', 'infiniteLogs', from, to] as QueryKey,
    summary: (from: string, to: string) => ['attendance', 'summary', from, to] as QueryKey,
    wfh:     ['attendance', 'wfh'] as QueryKey,
    overtime:['attendance', 'overtime'] as QueryKey,
    team:    (from: string, to: string) => ['attendance', 'team', from, to] as QueryKey,
  },
  employees: {
    all: ['employees'] as QueryKey,
    byDepartment: (dept: string) => ['employees', dept] as QueryKey,
    detail: (id: string) => ['employees', id] as QueryKey,
  },
  departments: {
    all: ['departments'] as QueryKey,
  },
  designations: {
    all: ['designations'] as QueryKey,
    byDepartment: (dept: string) => ['designations', dept] as QueryKey,
  },
};

// App wrappers for useQuery and useMutation to set unified handlers
export function useAppQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const enabled = options.enabled !== undefined 
    ? (options.enabled && isAuthenticated) 
    : isAuthenticated;

  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    ...options,
    enabled,
  });
}

export function useAppMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(options: UseMutationOptions<TData, TError, TVariables, TContext>) {
  return useMutation<TData, TError, TVariables, TContext>(options);
}

/* ============================================================================
   Profile hooks (TanStack Query)
   ============================================================================ */
export const useProfileQuery = () =>
  useAppQuery<UserProfile>({
    queryKey: queryKeys.profile.base,
    queryFn: () => profileApi.getProfile(),
  });

export const useUpdateProfileMutation = () =>
  useAppMutation<UserProfile, Error, Partial<UserProfile>>({
    mutationFn: (payload) => profileApi.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.base });
    },
  });

/* ============================================================================
   Leave hooks (TanStack Query)
   ============================================================================ */
export const useLeaveSummaryQuery = () =>
  useAppQuery<LeaveSummaryResponse>({
    queryKey: queryKeys.leave.balance,
    queryFn: () => leaveApi.getLeaveSummary(),
  });
export const useLeaveRequestsQuery = (type: 'my' | 'team') =>
  useAppQuery<LeaveRequest[]>({
    queryKey: queryKeys.leave.requests(type),
    queryFn: () => leaveApi.getLeaveRequests(type),
  });

export const useApplyLeaveMutation = () =>
  useAppMutation<
    { status: boolean; message: string; data?: LeaveRequest },
    Error,
    Partial<LeaveRequest>
  >({
    mutationFn: (payload) => leaveApi.applyLeave(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.balance });
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.requests('my') });
    },
  });

export const useApproveRejectLeaveMutation = () =>
  useAppMutation<{ status: boolean; message: string }, Error, { requestId: string; action: 'Approve' | 'Reject' }>({
    mutationFn: ({ requestId, action }) => leaveApi.approveRejectLeave(requestId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave', 'requests'] }); // Invalidate all requests
    },
  });

/* ============================================================================
   Attendance hooks (TanStack Query)
   ============================================================================ */
export const useTodayAttendanceStatusQuery = (options?: { enabled?: boolean }) =>
  useAppQuery<AttendanceStatus>({
    queryKey: queryKeys.attendance.today,
    queryFn: () => attendanceApi.getTodayStatus(),
    enabled: options?.enabled,
  });

export const useAttendanceLogsQuery = (month: string) =>
  useAppQuery<AttendanceLog[]>({
    queryKey: queryKeys.attendance.logs(month),
    queryFn: () => attendanceApi.getAttendanceLogs(month),
  });

export const useAttendanceLogsInfiniteQuery = (params: { from: string; to: string; limit?: number }, options?: { enabled?: boolean }) => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { from, to, limit = 10 } = params;
  const enabled = options?.enabled !== undefined ? (options.enabled && isAuthenticated) : isAuthenticated;
  return useInfiniteQuery({
    queryKey: queryKeys.attendance.infiniteLogs(from, to),
    queryFn: ({ pageParam = 1 }) =>
      attendanceApi.getMyAttendance({
        page: pageParam,
        limit,
        dateFrom: from,
        dateTo: to,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: enabled && !!from && !!to,
  });
};

export const useTeamAttendanceInfiniteQuery = (params: { from: string; to: string; limit?: number }) => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { from, to, limit = 10 } = params;
  return useInfiniteQuery({
    queryKey: ['attendance', 'team', from, to],
    queryFn: ({ pageParam = 1 }) =>
      attendanceApi.getTeamAttendance({
        page: pageParam,
        limit,
        dateFrom: from,
        dateTo: to,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: isAuthenticated && !!from && !!to,
  });
};

export const useEmployeeAttendanceInfiniteQuery = (employeeId: string, from: string, to: string, limit = 20) => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useInfiniteQuery({
    queryKey: ['attendance', 'employee', employeeId, from, to],
    queryFn: ({ pageParam = 1 }) =>
      attendanceApi.getEmployeeAttendance(employeeId, {
        page: pageParam,
        limit,
        from,
        to,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: isAuthenticated && !!employeeId && !!from && !!to,
  });
};

export const useCheckInMutation = () =>
  useAppMutation<AttendanceStatus, Error, { latitude?: number; longitude?: number; note?: string }>({
    mutationFn: (payload) => attendanceApi.checkIn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.today });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'logs'] });
    },
  });

export const useCheckOutMutation = () =>
  useAppMutation<AttendanceStatus, Error, { note?: string }>({
    mutationFn: (payload) => attendanceApi.checkOut(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.today });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'logs'] });
    },
  });

export const useAttendanceSummaryQuery = (from: string, to: string) =>
  useAppQuery<AttendanceSummary>({
    queryKey: queryKeys.attendance.summary(from, to),
    queryFn: () => attendanceApi.getAttendanceSummary(from, to),
    enabled: !!from && !!to,
  });

export const useWFHRequestsQuery = (options?: { enabled?: boolean }) =>
  useAppQuery<WFHRequest[]>({
    queryKey: queryKeys.attendance.wfh,
    queryFn: () => attendanceApi.getWFHRequests(),
    enabled: options?.enabled,
  });

export const useCreateWFHMutation = () =>
  useAppMutation({
    mutationFn: (payload: Parameters<typeof attendanceApi.createWFHRequest>[0]) => {
      return attendanceApi.createWFHRequest(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.wfh });
    },
  });

export const useWFHApprovalsQuery = (options?: { enabled?: boolean }) =>
  useAppQuery<WFHApprovalRecord[]>({
    queryKey: ['attendance', 'wfh-approvals'],
    queryFn: () => attendanceApi.getWFHApprovals(),
    enabled: options?.enabled,
  });

export const useApproveWFHMutation = () =>
  useAppMutation({
    mutationFn: (requestId: string) => attendanceApi.approveWFHRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'wfh-approvals'] });
    },
  });

export const useRejectWFHMutation = () =>
  useAppMutation({
    mutationFn: ({ requestId, rejectionReason }: { requestId: string; rejectionReason: string }) => 
      attendanceApi.rejectWFHRequest(requestId, { rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'wfh-approvals'] });
    },
  });

export const useDeleteWFHMutation = () =>
  useAppMutation({
    mutationFn: (requestId: string) => attendanceApi.deleteWFHRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.wfh });
    },
  });

export const useOvertimeRequestsQuery = (options?: { enabled?: boolean }) =>
  useAppQuery<OvertimeRequest[]>({
    queryKey: queryKeys.attendance.overtime,
    queryFn: () => attendanceApi.getOvertimeRequests(),
    enabled: options?.enabled,
  });

export const useCreateOvertimeMutation = () =>
  useAppMutation({
    mutationFn: (payload: Parameters<typeof attendanceApi.createOvertimeRequest>[0]) => {
      return attendanceApi.createOvertimeRequest(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.overtime });
    },
  });

export const useTeamAttendanceQuery = (from: string, to: string) =>
  useAppQuery<TeamAttendanceRecord[]>({
    queryKey: queryKeys.attendance.team(from, to),
    queryFn: () => attendanceApi.getTeamAttendance(from, to),
    enabled: !!from && !!to,
  });

/* ============================================================================
   Employee hooks (TanStack Query) — Admin & HR only
   ============================================================================ */
export const useAllEmployeesQuery = () =>
  useAppQuery<Employee[]>({
    queryKey: queryKeys.employees.all,
    queryFn: () => employeeApi.getAllEmployees(),
  });

export const useEmployeesByDepartmentQuery = (department: string) =>
  useAppQuery<Employee[]>({
    queryKey: queryKeys.employees.byDepartment(department),
    queryFn: () => employeeApi.getEmployeesByDepartment(department),
    enabled: !!department,
  });

export const useEmployeeDetailQuery = (id: string) =>
  useAppQuery<Employee>({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => employeeApi.getEmployee(id),
    enabled: !!id,
  });

export const useCreateEmployeeMutation = () =>
  useAppMutation({
    mutationFn: (payload: Parameters<typeof employeeApi.createEmployee>[0]) =>
      employeeApi.createEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
    },
  });

export const useUpdateEmployeeMutation = () =>
  useAppMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Parameters<typeof employeeApi.createEmployee>[0]> }) =>
      employeeApi.updateEmployee(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(id) });
    },
  });

/* ============================================================================
   Department hooks (TanStack Query)
   ============================================================================ */
export const useDepartmentsQuery = () =>
  useAppQuery<Department_API[]>({
    queryKey: queryKeys.departments.all,
    queryFn: () => employeeApi.getDepartments(),
  });

/* ============================================================================
   Designation hooks (TanStack Query)
   ============================================================================ */
export const useDesignationsQuery = (department?: string) =>
  useAppQuery<Designation_API[]>({
    queryKey: department
      ? queryKeys.designations.byDepartment(department)
      : queryKeys.designations.all,
    queryFn: () => employeeApi.getDesignations(department),
  });
