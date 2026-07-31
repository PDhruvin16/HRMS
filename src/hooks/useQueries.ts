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
import leaveApi, { LeaveRequest, LeaveSummaryResponse, LeaveFilterParams, LeaveTypeOption } from '../api/leaveApi';
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
export const useLeaveSummaryQuery = () => {
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id || user?.employeeId || '';
  return useAppQuery<LeaveSummaryResponse>({
    queryKey: ['leave', 'summary', userId],
    queryFn: () => leaveApi.getLeaveSummary(),
    enabled: !!userId,
  });
};

export const useLeaveTypesDropdownQuery = () =>
  useAppQuery<LeaveTypeOption[]>({
    queryKey: ['leave', 'types', 'dropdown'],
    queryFn: () => leaveApi.getLeaveTypesDropdown(),
  });

export const useDepartmentDropdownQuery = () =>
  useAppQuery<Array<{ label: string; value: string }>>({
    queryKey: ['master', 'departments', 'dropdown'],
    queryFn: () => leaveApi.getDepartmentDropdownOptions(),
  });

export const useEmployeeDropdownQuery = () =>
  useAppQuery<Array<{ label: string; value: string }>>({
    queryKey: ['master', 'employees', 'dropdown'],
    queryFn: () => leaveApi.getEmployeeDropdownOptions(),
  });

export const useLeaveRequestsInfiniteQuery = (
  type: 'my' | 'team',
  limit = 10,
  filters?: LeaveFilterParams
) => {
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id || user?.employeeId || '';
  return useInfiniteQuery({
    queryKey: ['leave', 'requests', type, userId, filters, limit],
    queryFn: async ({ pageParam = 1 }) => {
      return leaveApi.getLeaveRequests(type, pageParam as number, limit, filters);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta || {};
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!userId,
  });
};

export const useAdminLeaveRequestsInfiniteQuery = (
  limit = 10,
  filters?: LeaveFilterParams,
  options?: { enabled?: boolean }
) => {
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id || user?.employeeId || '';
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const isEnabled = (options?.enabled !== undefined ? options.enabled : true) && isAuthenticated && !!userId;

  return useInfiniteQuery({
    queryKey: ['leave', 'admin-requests', userId, filters, limit],
    queryFn: async ({ pageParam = 1 }) => {
      return leaveApi.getAdminLeaveRequests(pageParam as number, limit, filters);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    enabled: isEnabled,
  });
};

export const usePendingLeaveRequestsQuery = (limit = 200, options?: { enabled?: boolean }) => {
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id || user?.employeeId || '';
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isEnabled = (options?.enabled !== undefined ? options.enabled : true) && isAuthenticated && !!userId;

  return useAppQuery<LeaveRequest[]>({
    queryKey: ['leave', 'pending-requests', userId, limit],
    queryFn: () => leaveApi.getPendingLeaveRequests(1, limit),
    enabled: isEnabled,
  });
};

export const useAdminLeaveBalancesInfiniteQuery = (
  limit = 10,
  filters?: LeaveFilterParams,
  options?: { enabled?: boolean }
) => {
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id || user?.employeeId || '';
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const isEnabled = (options?.enabled !== undefined ? options.enabled : true) && isAuthenticated && !!userId;

  return useInfiniteQuery({
    queryKey: ['leave', 'admin-balances', userId, filters],
    queryFn: async ({ pageParam = 1 }) => {
      return leaveApi.getAdminLeaveBalances(pageParam as number, limit, filters);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    enabled: isEnabled,
  });
};

export const useApplyLeaveMutation = () =>
  useAppMutation<
    any,
    Error,
    {
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      days: string | number;
      dayType: string;
      reason: string;
    }
  >({
    mutationFn: (payload) => leaveApi.applyLeave(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    },
  });

export const useCancelLeaveMutation = () =>
  useAppMutation<any, Error, string>({
    mutationFn: (requestId: string) => leaveApi.cancelLeave(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    },
  });

export const useResolveLeaveMutation = () =>
  useAppMutation<
    any,
    Error,
    { requestId: string; status: 'approved' | 'rejected'; rejectionReason?: string }
  >({
    mutationFn: ({ requestId, status, rejectionReason }) =>
      leaveApi.resolveLeaveRequest(requestId, status, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    },
  });

export const useApproveRejectLeaveMutation = () =>
  useAppMutation<{ status: boolean; message: string }, Error, { requestId: string; action: 'Approve' | 'Reject' }>({
    mutationFn: ({ requestId, action }) => leaveApi.approveRejectLeave(requestId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave', 'requests'] }); // Invalidate all requests
    },
  });

export const useMyLeaveDatesQuery = (options?: { enabled?: boolean }) => {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.id || user?.employeeId || '';
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isEnabled = (options?.enabled !== undefined ? options.enabled : true) && isAuthenticated && !!userId;

  return useAppQuery<string[]>({
    queryKey: ['leave', 'my-leave-dates', userId],
    queryFn: () => leaveApi.getMyLeaveDates(),
    enabled: isEnabled,
  });
};

/* ============================================================================
   Attendance hooks (TanStack Query)
   ============================================================================ */
export const useTodayAttendanceStatusQuery = (options?: { enabled?: boolean }) => {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.id || user?.employeeId || '';
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isEnabled = (options?.enabled !== undefined ? options.enabled : false) && isAuthenticated && !!userId;

  return useAppQuery<AttendanceStatus>({
    queryKey: ['attendance', 'today', userId],
    queryFn: () => attendanceApi.getTodayStatus(),
    enabled: isEnabled,
  });
};

export const useAttendanceLogsQuery = (month: string) => {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.id || user?.employeeId || '';
  return useAppQuery<AttendanceLog[]>({
    queryKey: ['attendance', 'logs', userId, month],
    queryFn: () => attendanceApi.getAttendanceLogs(month),
    enabled: !!userId,
  });
};

export const useAttendanceLogsInfiniteQuery = (params: { from: string; to: string; limit?: number }, options?: { enabled?: boolean }) => {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.id || user?.employeeId || '';
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { from, to, limit = 10 } = params;
  const isEnabled = (options?.enabled !== undefined ? options.enabled : true) && isAuthenticated && !!userId;

  return useInfiniteQuery({
    queryKey: ['attendance', 'infiniteLogs', userId, from, to],
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
    enabled: isEnabled && !!from && !!to,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

export const useTeamAttendanceInfiniteQuery = (
  params: { from: string; to: string; limit?: number },
  options?: { enabled?: boolean }
) => {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.id || user?.employeeId || '';
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { from, to, limit = 10 } = params;
  const isEnabled = (options?.enabled !== undefined ? options.enabled : true) && isAuthenticated && !!userId;

  return useInfiniteQuery({
    queryKey: ['attendance', 'team', userId, from, to],
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
    enabled: isEnabled && !!from && !!to,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
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
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

export const useCheckOutMutation = () =>
  useAppMutation<AttendanceStatus, Error, { note?: string }>({
    mutationFn: (payload) => attendanceApi.checkOut(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

export const useAttendanceSummaryQuery = (from: string, to: string) => {
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id || user?.employeeId || '';
  return useAppQuery<AttendanceSummary>({
    queryKey: ['attendance', 'summary', userId, from, to],
    queryFn: () => attendanceApi.getAttendanceSummary(from, to),
    enabled: !!userId && !!from && !!to,
  });
};

export const useWFHRequestsQuery = (options?: { enabled?: boolean }) => {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.id || user?.employeeId || '';
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isEnabled = (options?.enabled !== undefined ? options.enabled : true) && isAuthenticated && !!userId;

  return useAppQuery<WFHRequest[]>({
    queryKey: ['attendance', 'wfh', userId],
    queryFn: () => attendanceApi.getWFHRequests(),
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateWFHMutation = () =>
  useAppMutation({
    mutationFn: (payload: Parameters<typeof attendanceApi.createWFHRequest>[0]) => {
      return attendanceApi.createWFHRequest(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

export const useWFHApprovalsQuery = (options?: { enabled?: boolean }) => {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.id || user?.employeeId || '';
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isEnabled = (options?.enabled !== undefined ? options.enabled : true) && isAuthenticated && !!userId;

  return useAppQuery<WFHApprovalRecord[]>({
    queryKey: ['attendance', 'wfh-approvals', userId],
    queryFn: () => attendanceApi.getWFHApprovals(),
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useApproveWFHMutation = () =>
  useAppMutation({
    mutationFn: (requestId: string) => attendanceApi.approveWFHRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

export const useRejectWFHMutation = () =>
  useAppMutation({
    mutationFn: ({ requestId, rejectionReason }: { requestId: string; rejectionReason: string }) => 
      attendanceApi.rejectWFHRequest(requestId, { rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

export const useDeleteWFHMutation = () =>
  useAppMutation({
    mutationFn: (requestId: string) => attendanceApi.deleteWFHRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

export const useOvertimeRequestsQuery = (options?: { enabled?: boolean }) => {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.id || user?.employeeId || '';
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isEnabled = (options?.enabled !== undefined ? options.enabled : true) && isAuthenticated && !!userId;

  return useAppQuery<OvertimeRequest[]>({
    queryKey: ['attendance', 'overtime', userId],
    queryFn: () => attendanceApi.getOvertimeRequests(),
    enabled: isEnabled,
  });
};

export const useCreateOvertimeMutation = () =>
  useAppMutation({
    mutationFn: (payload: Parameters<typeof attendanceApi.createOvertimeRequest>[0]) => {
      return attendanceApi.createOvertimeRequest(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

export const useTeamAttendanceQuery = (from: string, to: string) => {
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id || user?.employeeId || '';
  return useAppQuery<TeamAttendanceRecord[]>({
    queryKey: ['attendance', 'team-summary', userId, from, to],
    queryFn: () => attendanceApi.getTeamAttendance(from, to),
    enabled: !!userId && !!from && !!to,
  });
};

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
