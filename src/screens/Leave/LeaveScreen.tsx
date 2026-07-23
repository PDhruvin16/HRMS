import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../hooks/useRedux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Calendar } from 'react-native-calendars';
import {
  useLeaveSummaryQuery,
  useLeaveRequestsInfiniteQuery,
  useAdminLeaveRequestsInfiniteQuery,
  useAdminLeaveBalancesInfiniteQuery,
  useLeaveTypesDropdownQuery,
  useDepartmentDropdownQuery,
  useEmployeeDropdownQuery,
  useMyLeaveDatesQuery,
  useApplyLeaveMutation,
  useCancelLeaveMutation,
  useResolveLeaveMutation,
} from '../../hooks/useQueries';
import { InfiniteList } from '../../components/InfiniteList';
import DeleteConfirmationModal from '../../components/Modals/DeleteConfirmationModal';
import colors from '../../theme/color';
import { Typography } from '../../components/Typography';
import { DropdownOption } from '../../components/UICore/UICoreDropdown';
import { UICoreSearch } from '../../components/UICore/UICoreSearch';
import {
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarRange,
  TrendingUp,
  FileText,
  LayoutDashboard,
  CalendarDays,
  RotateCw,
  SlidersHorizontal,
  X,
} from 'lucide-react-native';
import moment from 'moment';
import { normalize } from '../../utils/responsive';
import CustomHeader from '../../components/Header';
import { DetailedLeaveBalance, LeaveRequest, AdminLeaveBalance, LeaveFilterParams } from '../../api/leaveApi';
import { getStatusColor, getRequestCode } from './LeaveTypes';
import { s } from './LeaveStyles';
import {
  ActivityAccordionCard,
  BalanceCard,
  LeaveRequestCard,
  LeaveApprovalCard,
  LeaveApprovalItem,
  LeaveDetailsModal,
  ApplyLeaveModal,
  LeaveFilterModal,
  LeaveRejectionModal,
  LeaveBalanceAdminCard,
  LeaveBalanceDetailsModal,
} from './LeaveComponents';
import { LeaveCalendarTab } from './LeaveCalendarTab';

const INITIAL_APPROVAL_REQUESTS: LeaveApprovalItem[] = [
  {
    id: 'lvr-c9df',
    requestCode: 'LVR-C9DF',
    employeeName: 'Ashish Rabari',
    employeeId: 'QB048',
    leaveType: 'Casual Leave',
    startDate: '27 Jul 2026',
    endDate: '27 Jul 2026',
    days: '0.50',
    status: 'Pending TL',
    reason: 'Family event and personal work',
    appliedAt: '21 Jul 2026',
  },
  {
    id: 'lvr-505d',
    requestCode: 'LVR-505D',
    employeeName: 'Ashish Rabari',
    employeeId: 'QB048',
    leaveType: 'Casual Leave',
    startDate: '24 Jul 2026',
    endDate: '24 Jul 2026',
    days: '0.50',
    status: 'Pending HR',
    reason: 'Doctor appointment',
    appliedAt: '21 Jul 2026',
  },
  {
    id: 'lvr-fc48',
    requestCode: 'LVR-FC48',
    employeeName: 'Priya Sharma',
    employeeId: 'QB012',
    leaveType: 'Sick Leave',
    startDate: '23 Jul 2026',
    endDate: '25 Jul 2026',
    days: '3.00',
    status: 'Approved',
    reason: 'Fever and medical rest',
    appliedAt: '20 Jul 2026',
  },
  {
    id: 'lvr-2cdf',
    requestCode: 'LVR-2CDF',
    employeeName: 'Rahul Verma',
    employeeId: 'QB033',
    leaveType: 'Early Leave',
    startDate: '28 Jul 2026',
    endDate: '28 Jul 2026',
    days: '0.50',
    status: 'Rejected',
    reason: 'Personal errand',
    appliedAt: '19 Jul 2026',
  },
];

const QUICK_DATE_OPTIONS: DropdownOption[] = [
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last 3 Months', value: 'last_3_months' },
  { label: 'Last 6 Months', value: 'last_6_months' },
  { label: 'This Year', value: 'this_year' },
  { label: 'Previous Year', value: 'previous_year' },
  { label: 'Next Year', value: 'next_year' },
];

const STATUS_OPTIONS: DropdownOption[] = [
  { label: 'Pending TL', value: 'pending_tl' },
  { label: 'Pending HR', value: 'pending_hr' },
  { label: 'Pending Admin', value: 'pending_admin' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
];

export const LeaveScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);
  const userRole = (user as any)?.role || 'developer';

  // Navigation State
  const [activeTab, setActiveTab] = useState<'individual' | 'my_leaves' | 'balances' | 'approvals' | 'calendar'>('individual');
  const [dashboardView, setDashboardView] = useState<'overview' | 'calendar'>('overview');

  /* ── Permissions ─────────────────────────────────────────── */
  const slicePerms = useAppSelector((state) => (state as any).permission?.permissions);
  const authUserPerms = useAppSelector((state) => (state as any).auth?.user?.permissions);

  const permissions = useMemo(
    () => ((slicePerms && slicePerms.length > 0) ? slicePerms : (authUserPerms || [])),
    [slicePerms, authUserPerms]
  );

  const hasPermission = (resource: string, action: string) => {
    if (!permissions || permissions.length === 0) return true;
    return permissions.some((p: any) => p.resource === resource && p.action === action);
  };

  const canApproveLeaves = hasPermission('leaves', 'approve');
  const canViewLeaveBalances = hasPermission('leave_balances', 'view');

  const availableTabs = useMemo(() => {
    const tabs: { key: 'individual' | 'my_leaves' | 'balances' | 'approvals' | 'calendar'; label: string }[] = [];
    tabs.push({ key: 'individual', label: 'Individual Dashboard' });
    tabs.push({ key: 'my_leaves', label: 'My Leaves' });
    if (canViewLeaveBalances) {
      tabs.push({ key: 'balances', label: 'Leave Balances' });
    }
    if (canApproveLeaves) {
      tabs.push({ key: 'approvals', label: 'Leave Approvals' });
    }
    tabs.push({ key: 'calendar', label: 'Calendar' });
    return tabs;
  }, [canApproveLeaves, canViewLeaveBalances]);

  useEffect(() => {
    const validKeys = availableTabs.map((t) => t.key);
    if (!validKeys.includes(activeTab)) {
      setActiveTab(validKeys[0] || 'individual');
    }
  }, [availableTabs, activeTab]);

  // Modal State
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState<'start' | 'end' | null>(null);
  const [tempDate, setTempDate] = useState('');

  // Form State
  const [leaveType, setLeaveType] = useState('Casual Leave (CL)');
  const [dayType, setDayType] = useState('Full Day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Management Tab Search & Filter State
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedBalanceForModal, setSelectedBalanceForModal] = useState<AdminLeaveBalance | null>(null);
  const [isBalanceDetailsModalVisible, setIsBalanceDetailsModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // Tab-isolated filter states
  const [myFilters, setMyFilters] = useState({
    searchQuery: '',
    quickDate: '',
    statusFilter: '',
    leaveTypeIdFilter: '',
    fromDate: '',
    toDate: '',
  });

  const [approvalFilters, setApprovalFilters] = useState({
    searchQuery: '',
    quickDate: '',
    statusFilter: '',
    leaveTypeIdFilter: '',
    fromDate: '',
    toDate: '',
    departmentFilter: '',
    employeeFilter: '',
  });

  const [balanceFilters, setBalanceFilters] = useState({
    searchQuery: '',
    yearFilter: '',
    leaveTypeIdFilter: '',
    departmentFilter: '',
    employeeFilter: '',
  });

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);

  const resolveLeaveMutation = useResolveLeaveMutation();

  const handleApproveRequest = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resolveLeaveMutation.mutate(
      { requestId: id, status: 'approved' },
      {
        onSuccess: () => {
          Alert.alert('Approved', 'Leave request has been approved successfully!');
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to approve request.');
        },
      }
    );
  };

  const handleOpenRejectModal = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRejectingRequestId(id);
    setRejectModalVisible(true);
  };

  const handleConfirmReject = (reason: string) => {
    if (!rejectingRequestId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    resolveLeaveMutation.mutate(
      { requestId: rejectingRequestId, status: 'rejected', rejectionReason: reason },
      {
        onSuccess: () => {
          setRejectModalVisible(false);
          setRejectingRequestId(null);
          Alert.alert('Rejected', 'Leave request has been rejected.');
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to reject request.');
        },
      }
    );
  };

  // TanStack Queries
  const { data: summaryResponse, isLoading: isSummaryLoading } = useLeaveSummaryQuery();
  const { data: leaveTypes } = useLeaveTypesDropdownQuery();
  const { data: departmentOptions = [] } = useDepartmentDropdownQuery();
  const { data: employeeOptions = [] } = useEmployeeDropdownQuery();
  const { data: appliedLeaveDates = [] } = useMyLeaveDatesQuery({ enabled: isApplyModalVisible });

  const typeOptions: DropdownOption[] = useMemo(() => {
    if (leaveTypes && Array.isArray(leaveTypes)) {
      return leaveTypes.map((t) => ({
        label: t.label,
        value: t.value,
      }));
    }
    return [];
  }, [leaveTypes]);

  const applyLeaveTypeOptions: DropdownOption[] = useMemo(() => {
    if (leaveTypes && Array.isArray(leaveTypes)) {
      return leaveTypes.map((t) => {
        const match = summaryResponse?.balances?.find(
          (b) => b.code?.toUpperCase() === t.leave_code?.toUpperCase(),
        );
        const availStr = t.isUnlimited
          ? 'Unlimited'
          : match
          ? `${match.available.toFixed(2)} days`
          : '0.00 days';
        return {
          label: `${t.label} (${t.leave_code}) — ${availStr}`,
          value: t.value,
        };
      });
    }
    return [
      { label: 'Casual Leave (CL) — 2.50 days', value: '2921e95f-146a-488f-bc6d-2f39750952f4' },
      { label: 'Sick Leave (SL) — 2.00 days', value: 'd122e4f8-d943-4223-8db8-a16b0900f026' },
      { label: 'Early Leave (EL) — 3.00 days', value: '18e8bc6c-030b-4494-8d75-476d967f39f2' },
      { label: 'Leave Without Pay (LWP) — Unlimited', value: '9f71ae4f-7239-41aa-ad8e-836623c8e35a' },
    ];
  }, [leaveTypes, summaryResponse]);

  const myFilterParams = useMemo<LeaveFilterParams>(
    () => ({
      search: myFilters.searchQuery.trim() || undefined,
      status: myFilters.statusFilter || undefined,
      leaveTypeId: myFilters.leaveTypeIdFilter || undefined,
      fromDate: myFilters.fromDate || undefined,
      toDate: myFilters.toDate || undefined,
    }),
    [myFilters]
  );

  const approvalFilterParams = useMemo<LeaveFilterParams>(
    () => ({
      search: approvalFilters.searchQuery.trim() || undefined,
      status: approvalFilters.statusFilter || undefined,
      leaveTypeId: approvalFilters.leaveTypeIdFilter || undefined,
      fromDate: approvalFilters.fromDate || undefined,
      toDate: approvalFilters.toDate || undefined,
      departmentFilter: approvalFilters.departmentFilter || undefined,
      employeeFilter: approvalFilters.employeeFilter || undefined,
    }),
    [approvalFilters]
  );

  const balanceFilterParams = useMemo<LeaveFilterParams>(
    () => ({
      search: balanceFilters.searchQuery.trim() || undefined,
      yearFilter: balanceFilters.yearFilter || undefined,
      leaveTypeId: balanceFilters.leaveTypeIdFilter || undefined,
      departmentFilter: balanceFilters.departmentFilter || undefined,
      employeeFilter: balanceFilters.employeeFilter || undefined,
    }),
    [balanceFilters]
  );

  const {
    data: requestsData,
    isLoading: isReqLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useLeaveRequestsInfiniteQuery('my', 10, myFilterParams);

  const requests = useMemo(() => {
    return requestsData?.pages.flatMap((page) => page.data) || [];
  }, [requestsData]);

  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => moment().format('YYYY-MM-DD'));

  const calendarMarkedDates = useMemo(() => {
    const marked: Record<string, any> = {};

    requests.forEach((req: any) => {
      const start = req.startDate || req.start_date;
      const end = req.endDate || req.end_date;
      if (!start) return;

      const startM = moment(start);
      const endM = moment(end || start);
      const status = (req.status || 'pending').toLowerCase();

      let color = colors.warning;
      if (status === 'approved') color = colors.success;
      else if (status === 'pending_hr') color = colors.emailBlue;
      else if (status === 'pending_tl') color = colors.warning;
      else if (status === 'pending_admin') color = colors.primary;
      else if (status === 'rejected') color = colors.error;
      else if (status === 'cancelled') color = colors.text.muted;

      const currM = startM.clone();
      while (currM.isSameOrBefore(endM, 'day')) {
        const dateKey = currM.format('YYYY-MM-DD');
        const isSelected = dateKey === selectedCalendarDate;

        marked[dateKey] = {
          customStyles: {
            container: {
              backgroundColor: color + '22',
              borderRadius: normalize(8),
              borderWidth: isSelected ? 2 : 0,
              borderColor: isSelected ? colors.primary : 'transparent',
            },
            text: {
              color: color,
              fontWeight: '800',
            },
          },
        };
        currM.add(1, 'day');
      }
    });

    if (!marked[selectedCalendarDate]) {
      marked[selectedCalendarDate] = {
        customStyles: {
          container: {
            borderWidth: 2,
            borderColor: colors.primary,
            borderRadius: normalize(8),
            backgroundColor: colors.primary + '10',
          },
          text: {
            color: colors.primary,
            fontWeight: '800',
          },
        },
      };
    }

    return marked;
  }, [requests, selectedCalendarDate]);

  const selectedDateRequests = useMemo(() => {
    if (!selectedCalendarDate) return [];
    const selectedM = moment(selectedCalendarDate);

    return requests.filter((req: any) => {
      const start = req.startDate || req.start_date;
      const end = req.endDate || req.end_date;
      if (!start) return false;

      const startM = moment(start);
      const endM = moment(end || start);
      return selectedM.isBetween(startM, endM, 'day', '[]');
    });
  }, [requests, selectedCalendarDate]);

  const {
    data: adminRequestsData,
    isLoading: isAdminLoading,
    fetchNextPage: adminFetchNextPage,
    hasNextPage: adminHasNextPage,
    isFetchingNextPage: isAdminFetchingNextPage,
    refetch: adminRefetch,
    isRefetching: isAdminRefetching,
  } = useAdminLeaveRequestsInfiniteQuery(10, approvalFilterParams, {
    enabled: hasPermission('leaves', 'approve'),
  });

  const adminRequests = useMemo(() => {
    return adminRequestsData?.pages.flatMap((page) => page.data) || [];
  }, [adminRequestsData]);

  const adminSummary = useMemo(() => {
    const firstPage = adminRequestsData?.pages[0];
    return (
      firstPage?.summary || {
        total: adminRequests.length,
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
      }
    );
  }, [adminRequestsData, adminRequests]);

  const {
    data: adminBalancesData,
    isLoading: isAdminBalancesLoading,
    fetchNextPage: balancesFetchNextPage,
    hasNextPage: balancesHasNextPage,
    isFetchingNextPage: balancesIsFetchingNextPage,
    refetch: balancesRefetch,
    isRefetching: balancesIsRefetching,
  } = useAdminLeaveBalancesInfiniteQuery(10, balanceFilterParams, {
    enabled: activeTab === 'balances' && canViewLeaveBalances,
  });

  const adminBalances = useMemo(() => {
    return adminBalancesData?.pages.flatMap((page) => page.data || []) || [];
  }, [adminBalancesData]);

  const balancesSummary = useMemo(() => {
    const totalRecords = adminBalances.length;
    const totalEntitled = adminBalances.reduce((acc, b) => acc + (b.totalEntitled || parseFloat(String(b.yearlyQuota || 0)) || 0), 0);
    const totalAccrued = adminBalances.reduce((acc, b) => acc + (b.accrued || parseFloat(b.earned || '0') || 0), 0);
    const totalAvailable = adminBalances.reduce((acc, b) => acc + (b.availableBalance || 0), 0);
    return { totalRecords, totalEntitled, totalAccrued, totalAvailable };
  }, [adminBalances]);

  const mgtMetrics = useMemo(() => {
    const total = requests.length;
    const approved = requests.filter((r) => (r.status || '').toLowerCase() === 'approved').length;
    const rejected = requests.filter((r) => (r.status || '').toLowerCase() === 'rejected').length;
    const pending = requests.filter((r) => (r.status || '').toLowerCase().includes('pending')).length;
    return { total, approved, rejected, pending };
  }, [requests]);

  const { mutateAsync: applyLeave, isPending: isSubmitting } = useApplyLeaveMutation();
  const { mutateAsync: cancelLeave, isPending: isCancellingLeave } = useCancelLeaveMutation();

  const handleApplyLeave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const chosenLeaveTypeId = leaveType || applyLeaveTypeOptions[0]?.value;

    if (!chosenLeaveTypeId || !startDate || !endDate || !reason.trim()) {
      Alert.alert('Required Fields Missing', 'Please fill all required fields before submitting.');
      return;
    }

    const isHalf = startDate === endDate && (
      dayType === 'first_half' ||
      dayType === 'second_half' ||
      dayType.toLowerCase().includes('half')
    );
    const calculatedDays = isHalf
      ? 0.5
      : Math.max(1, moment(endDate).diff(moment(startDate), 'days') + 1);
    
    let backendDayType = dayType;
    if (dayType === 'First Half' || dayType.toLowerCase().includes('first')) backendDayType = 'first_half';
    else if (dayType === 'Second Half' || dayType.toLowerCase().includes('second')) backendDayType = 'second_half';
    else if (dayType === 'Full Day' || dayType.toLowerCase().includes('full')) backendDayType = 'full_day';

    try {
      await applyLeave({
        leaveTypeId: chosenLeaveTypeId,
        startDate,
        endDate,
        days: String(calculatedDays),
        dayType: backendDayType,
        reason: reason.trim(),
      });
      setIsApplyModalVisible(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      setDayType('full_day');
      Alert.alert('Success', 'Leave request submitted successfully!');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refetch();
    } catch (e: any) {
      console.error('Apply Leave failed:', e);
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Failed to submit leave request.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePressDelete = (requestId: string) => {
    setRequestToDelete(requestId);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;
    try {
      await cancelLeave(requestToDelete);
      setIsDeleteModalVisible(false);
      setRequestToDelete(null);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refetch();
    } catch (e: any) {
      console.error('Cancel Leave failed:', e);
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Failed to cancel leave request.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // UI Render Helpers

  const renderTopTabs = () => (
    <View style={s.topTabsWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.topTabsScroll}>
        {availableTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[s.topTab, activeTab === tab.key && s.topTabActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab(tab.key);
            }}
          >
            <Typography style={[s.topTabText, activeTab === tab.key && s.topTabTextActive]}>
              {tab.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={s.topTabsDivider} />
    </View>
  );

  const renderSubTabs = () => (
    <View style={[s.subTabsWrapper, { justifyContent: 'flex-end', paddingTop: normalize(12), paddingBottom: normalize(4) }]}>
      <View style={[s.subTabsGroup, { padding: 4 }]}>
        <TouchableOpacity
          style={[s.subTab, dashboardView === 'overview' && s.subTabActive, { paddingVertical: 8, paddingHorizontal: 24 }]}
          onPress={() => {
            Haptics.selectionAsync();
            setDashboardView('overview');
          }}
        >
          <LayoutDashboard size={18} color={dashboardView === 'overview' ? colors.primary : colors.text.muted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.subTab, dashboardView === 'calendar' && s.subTabActive, { paddingVertical: 8, paddingHorizontal: 24 }]}
          onPress={() => {
            Haptics.selectionAsync();
            setDashboardView('calendar');
          }}
        >
          <CalendarDays size={18} color={dashboardView === 'calendar' ? colors.primary : colors.text.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOverviewHeroCards = () => {
    if (isSummaryLoading || !summaryResponse)
      return <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />;
    const { metrics } = summaryResponse;

    const approvedCountThisMonth = requests.filter(
      (req) => req.status?.toLowerCase() === 'approved' && moment(req.start_date || req.startDate).isSame(moment(), 'month'),
    ).length;

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statScroll}>
        <BlurView intensity={50} tint="light" style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: colors.text.muted + '18' }]}>
            <CalendarRange size={normalize(18)} color={colors.text.muted} />
          </View>
          <Typography style={[s.statValue, { color: colors.text.primary }]}>{metrics.totalAvailable.toFixed(1)}</Typography>
          <Typography style={s.statLabel} numberOfLines={2}>
            Available
          </Typography>
        </BlurView>
        <BlurView intensity={50} tint="light" style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: colors.success + '18' }]}>
            <TrendingUp size={normalize(18)} color={colors.success} />
          </View>
          <Typography style={[s.statValue, { color: colors.success }]}>{metrics.usedThisYear.toFixed(1)}</Typography>
          <Typography style={s.statLabel} numberOfLines={2}>
            Used (YTD)
          </Typography>
        </BlurView>
        <BlurView intensity={50} tint="light" style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: colors.warning + '18' }]}>
            <Clock size={normalize(18)} color={colors.warning} />
          </View>
          <Typography style={[s.statValue, { color: colors.warning }]}>{metrics.totalPending.toFixed(1)}</Typography>
          <Typography style={s.statLabel} numberOfLines={2}>
            Pending
          </Typography>
        </BlurView>
        <BlurView intensity={50} tint="light" style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: colors.primary + '18' }]}>
            <CheckCircle2 size={normalize(18)} color={colors.primary} />
          </View>
          <Typography style={[s.statValue, { color: colors.primary }]}>{approvedCountThisMonth}</Typography>
          <Typography style={s.statLabel} numberOfLines={2}>
            Approved
          </Typography>
        </BlurView>
      </ScrollView>
    );
  };

  const renderIndividualDashboard = () => (
    <Animated.View style={{ flex: 1 }} entering={FadeInDown.duration(300)}>
      {renderSubTabs()}
      {dashboardView === 'overview' ? (
        <InfiniteList
          data={requests}
          isLoading={isReqLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={!!hasNextPage}
          onLoadMore={() => fetchNextPage()}
          onRefresh={() => refetch()}
          isRefreshing={isRefetching}
          contentContainerStyle={s.content}
          ListHeaderComponent={
            <>
              {renderOverviewHeroCards()}
              <View style={s.sectionHeader}>
                <Typography style={s.sectionTitle}>Leave Balances — {moment().format('YYYY')}</Typography>
              </View>
              {isSummaryLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                summaryResponse?.balances.map((b: DetailedLeaveBalance, i: number) => (
                  <BalanceCard key={b.code} bal={b} index={i} />
                ))
              )}
              <View style={s.recentActivityRow}>
                <Typography style={s.sectionTitle}>Recent Activity</Typography>
              </View>
            </>
          }
          renderItem={({ item: req }) => <ActivityAccordionCard req={req} />}
          renderSkeleton={() => (
            <View style={[s.activityCard, { height: normalize(100), backgroundColor: colors.white }]} />
          )}
        />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <BlurView intensity={60} tint="light" style={s.calendarWrapper}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: normalize(16),
                paddingTop: normalize(16),
              }}
            >
              <Typography style={{ fontSize: normalize(13), fontWeight: '800', color: colors.black }}>
                Leave Calendar
              </Typography>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
                <Typography style={{ fontSize: normalize(12), color: colors.success, fontWeight: '700' }}>
                  {requests.filter((r) => (r.status || '').toLowerCase() === 'approved').length} approved
                </Typography>
                <Typography style={{ fontSize: normalize(12), color: colors.text.muted, fontWeight: '700' }}>·</Typography>
                <Typography style={{ fontSize: normalize(12), color: colors.warning, fontWeight: '700' }}>
                  {requests.filter((r) => (r.status || '').toLowerCase().includes('pending')).length} pending
                </Typography>
              </View>
            </View>

            <Calendar
              current={selectedCalendarDate || moment().format('YYYY-MM-DD')}
              onDayPress={(day: any) => {
                Haptics.selectionAsync();
                setSelectedCalendarDate(day.dateString);
              }}
              markedDates={calendarMarkedDates}
              markingType={'custom'}
              theme={{
                calendarBackground: 'transparent',
                textSectionTitleColor: colors.text.muted,
                todayTextColor: colors.primary,
                dayTextColor: colors.black,
                textDisabledColor: colors.text.muted,
                arrowColor: colors.primary,
                monthTextColor: colors.black,
                textMonthFontWeight: '800',
                textDayHeaderFontWeight: '700',
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                padding: normalize(14),
                gap: normalize(10),
                borderTopWidth: 1,
                borderTopColor: 'rgba(0,0,0,0.05)',
              }}
            >
              <Typography style={{ fontSize: normalize(10), color: colors.text.muted, fontWeight: '800', letterSpacing: 0.5 }}>
                STATUS:
              </Typography>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(4) }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
                <Typography style={{ fontSize: normalize(11), color: colors.text.secondary, fontWeight: '700' }}>Approved</Typography>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(4) }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.emailBlue }} />
                <Typography style={{ fontSize: normalize(11), color: colors.text.secondary, fontWeight: '700' }}>Pending HR</Typography>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(4) }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.warning }} />
                <Typography style={{ fontSize: normalize(11), color: colors.text.secondary, fontWeight: '700' }}>Pending TL</Typography>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(4) }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error }} />
                <Typography style={{ fontSize: normalize(11), color: colors.text.secondary, fontWeight: '700' }}>Rejected</Typography>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(4) }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.text.muted }} />
                <Typography style={{ fontSize: normalize(11), color: colors.text.secondary, fontWeight: '700' }}>Cancelled</Typography>
              </View>
            </View>
          </BlurView>

          {/* Agenda Event Cards for Selected Date */}
          <View style={{ marginTop: normalize(16) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(10) }}>
              <Typography style={{ fontSize: normalize(14), fontWeight: '800', color: colors.black }}>
                {moment(selectedCalendarDate).format('dddd, DD MMM YYYY')}
              </Typography>
              <Typography style={{ fontSize: normalize(11), fontWeight: '700', color: colors.text.muted }}>
                {selectedDateRequests.length} {selectedDateRequests.length === 1 ? 'request' : 'requests'}
              </Typography>
            </View>

            {selectedDateRequests.length === 0 ? (
              <View style={{ backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: normalize(14), padding: normalize(16), alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }}>
                <Typography style={{ fontSize: normalize(12), color: colors.text.muted, fontWeight: '600', marginBottom: normalize(8) }}>
                  No leave requests for this date.
                </Typography>
                <TouchableOpacity
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsApplyModalVisible(true);
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(4), backgroundColor: colors.primary + '12', paddingHorizontal: normalize(12), paddingVertical: normalize(6), borderRadius: normalize(8) }}
                >
                  <Plus size={14} color={colors.primary} />
                  <Typography style={{ fontSize: normalize(12), fontWeight: '700', color: colors.primary }}>
                    Apply Leave
                  </Typography>
                </TouchableOpacity>
              </View>
            ) : (
              selectedDateRequests.map((req: any) => {
                const statusStr = req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1).replace('_', ' ') : 'Pending';
                const statusColor = getStatusColor(statusStr);

                return (
                  <TouchableOpacity
                    key={req.id}
                    activeOpacity={0.82}
                    onPress={() => {
                      setSelectedRequest(req);
                      setIsDetailsModalVisible(true);
                    }}
                    style={{
                      backgroundColor: colors.white,
                      borderRadius: normalize(14),
                      padding: normalize(14),
                      marginBottom: normalize(10),
                      borderLeftWidth: 4,
                      borderLeftColor: statusColor,
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.06)',
                      shadowColor: colors.black,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(6) }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
                        <Typography style={{ fontSize: normalize(14), fontWeight: '800', color: colors.black }}>
                          {req.leaveTypeName || 'Leave'}
                        </Typography>
                        {req.leaveTypeCode && (
                          <View style={{ backgroundColor: colors.primary + '12', paddingHorizontal: normalize(6), paddingVertical: normalize(2), borderRadius: normalize(4) }}>
                            <Typography style={{ fontSize: normalize(10), fontWeight: '800', color: colors.primary }}>
                              {req.leaveTypeCode}
                            </Typography>
                          </View>
                        )}
                      </View>
                      <View style={{ backgroundColor: statusColor + '15', paddingHorizontal: normalize(8), paddingVertical: normalize(3), borderRadius: normalize(6) }}>
                        <Typography style={{ fontSize: normalize(10), fontWeight: '800', color: statusColor }}>
                          {statusStr}
                        </Typography>
                      </View>
                    </View>

                    <Typography style={{ fontSize: normalize(12), color: colors.text.secondary, fontWeight: '600', marginBottom: normalize(6) }}>
                      {moment(req.startDate).format('DD MMM')} — {moment(req.endDate).format('DD MMM YYYY')} · {req.days || 1} day(s) ({(req.dayType || 'full_day').replace('_', ' ')})
                    </Typography>

                    {req.reason && (
                      <Typography numberOfLines={2} style={{ fontSize: normalize(12), color: colors.text.primary, lineHeight: normalize(17) }}>
                        {req.reason}
                      </Typography>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
    </Animated.View>
  );

  const renderManagementTab = () => (
    <Animated.View style={{ flex: 1 }} entering={FadeInDown.duration(300)}>
      <InfiniteList
        data={requests}
        isLoading={isReqLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={!!hasNextPage}
        onLoadMore={() => fetchNextPage()}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
        contentContainerStyle={s.content}
        emptyMessage="No leave requests found"
        ListHeaderComponent={
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statScroll}>
              <BlurView intensity={50} tint="light" style={s.statCard}>
                <View style={[s.statIconWrap, { backgroundColor: colors.text.muted + '18' }]}>
                  <FileText size={normalize(16)} color={colors.text.muted} />
                </View>
                <Typography style={[s.statValue, { color: colors.text.primary }]}>{mgtMetrics.total}</Typography>
                <Typography style={s.statLabel} numberOfLines={2}>Requests</Typography>
              </BlurView>
              <BlurView intensity={50} tint="light" style={s.statCard}>
                <View style={[s.statIconWrap, { backgroundColor: colors.success + '18' }]}>
                  <CheckCircle2 size={normalize(16)} color={colors.success} />
                </View>
                <Typography style={[s.statValue, { color: colors.success }]}>{mgtMetrics.approved}</Typography>
                <Typography style={s.statLabel} numberOfLines={2}>Approved</Typography>
              </BlurView>
              <BlurView intensity={50} tint="light" style={s.statCard}>
                <View style={[s.statIconWrap, { backgroundColor: colors.error + '18' }]}>
                  <XCircle size={normalize(16)} color={colors.error} />
                </View>
                <Typography style={[s.statValue, { color: colors.error }]}>{mgtMetrics.rejected}</Typography>
                <Typography style={s.statLabel} numberOfLines={2}>Rejected</Typography>
              </BlurView>
              <BlurView intensity={50} tint="light" style={s.statCard}>
                <View style={[s.statIconWrap, { backgroundColor: colors.warning + '18' }]}>
                  <Clock size={normalize(16)} color={colors.warning} />
                </View>
                <Typography style={[s.statValue, { color: colors.warning }]}>{mgtMetrics.pending}</Typography>
                <Typography style={s.statLabel} numberOfLines={2}>Pending</Typography>
              </BlurView>
            </ScrollView>

            {/* UICoreSearch Bar with Filter Button */}
            {(() => {
              const myHasActiveFilters = !!(
                myFilters.statusFilter ||
                myFilters.leaveTypeIdFilter ||
                myFilters.fromDate ||
                myFilters.toDate ||
                myFilters.quickDate
              );
              return (
                <>
                  <View style={s.searchRow}>
                    <View style={{ flex: 1 }}>
                      <UICoreSearch
                        value={myFilters.searchQuery}
                        onChangeText={(val) => setMyFilters((prev) => ({ ...prev, searchQuery: val }))}
                        onClear={() => setMyFilters((prev) => ({ ...prev, searchQuery: '' }))}
                        placeholder="Search request ID, type, reason..."
                        containerStyle={{ marginBottom: 0 }}
                      />
                    </View>
                    <TouchableOpacity
                      style={[
                        s.filterBtn,
                        myHasActiveFilters && {
                          backgroundColor: 'rgba(59, 130, 246, 0.12)',
                          borderColor: colors.primary,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setIsFilterModalVisible(true);
                      }}
                    >
                      <SlidersHorizontal size={18} color={myHasActiveFilters ? colors.primary : colors.text.primary} />
                      {myHasActiveFilters && (
                        <View
                          style={{
                            position: 'absolute',
                            top: normalize(6),
                            right: normalize(6),
                            width: normalize(8),
                            height: normalize(8),
                            borderRadius: normalize(4),
                            backgroundColor: colors.primary,
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Active Filter Chips */}
                  {myHasActiveFilters && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: normalize(8), paddingBottom: normalize(8) }}
                    >
                      {!!myFilters.statusFilter && (
                        <TouchableOpacity
                          onPress={() => setMyFilters((prev) => ({ ...prev, statusFilter: '' }))}
                          style={s.activeChip}
                        >
                          <Typography style={s.activeChipText}>Status: {myFilters.statusFilter.replace('_', ' ')}</Typography>
                          <X size={12} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                      {!!myFilters.leaveTypeIdFilter && (
                        <TouchableOpacity
                          onPress={() => setMyFilters((prev) => ({ ...prev, leaveTypeIdFilter: '' }))}
                          style={s.activeChip}
                        >
                          <Typography style={s.activeChipText}>
                            Type: {typeOptions.find((t) => t.value === myFilters.leaveTypeIdFilter)?.label || 'Selected'}
                          </Typography>
                          <X size={12} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                      {(!!myFilters.fromDate || !!myFilters.toDate) && (
                        <TouchableOpacity
                          onPress={() =>
                            setMyFilters((prev) => ({ ...prev, fromDate: '', toDate: '', quickDate: '' }))
                          }
                          style={s.activeChip}
                        >
                          <Typography style={s.activeChipText}>
                            Date: {myFilters.fromDate ? moment(myFilters.fromDate).format('DD MMM YYYY') : ''}
                            {myFilters.fromDate && myFilters.toDate ? ' - ' : ''}
                            {myFilters.toDate ? moment(myFilters.toDate).format('DD MMM YYYY') : ''}
                          </Typography>
                          <X size={12} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  )}
                </>
              );
            })()}
          </>
        }
        renderItem={({ item: req }) => (
          <LeaveRequestCard
            req={req}
            onPress={async () => {
              await Haptics.selectionAsync();
              setSelectedRequest(req);
              setIsDetailsModalVisible(true);
            }}
            onCancel={handlePressDelete}
          />
        )}
        renderSkeleton={() => (
          <View style={[s.mobileCardWrapper, { height: normalize(80), backgroundColor: colors.white }]} />
        )}
      />
    </Animated.View>
  );

  const renderBalancesTab = () => (
    <Animated.View entering={FadeInDown.duration(300)} style={{ flex: 1 }}>
      <InfiniteList
        data={adminBalances}
        isLoading={isAdminBalancesLoading}
        isFetchingNextPage={balancesIsFetchingNextPage}
        hasNextPage={!!balancesHasNextPage}
        onLoadMore={() => balancesFetchNextPage()}
        onRefresh={() => balancesRefetch()}
        isRefreshing={balancesIsRefetching}
        contentContainerStyle={s.content}
        emptyMessage="No leave balances found"
        ListHeaderComponent={
          <>
            {/* Search Bar + Filter Button */}
            {(() => {
              const balanceHasActiveFilters = !!(
                balanceFilters.yearFilter ||
                balanceFilters.leaveTypeIdFilter ||
                balanceFilters.departmentFilter ||
                balanceFilters.employeeFilter
              );
              return (
                <>
                  <View style={s.searchRow}>
                    <View style={{ flex: 1 }}>
                      <UICoreSearch
                        value={balanceFilters.searchQuery}
                        onChangeText={(val) => setBalanceFilters((prev) => ({ ...prev, searchQuery: val }))}
                        onClear={() => setBalanceFilters((prev) => ({ ...prev, searchQuery: '' }))}
                        placeholder="Search employee, leave type..."
                        containerStyle={{ marginBottom: 0 }}
                      />
                    </View>
                    <TouchableOpacity
                      style={[
                        s.filterBtn,
                        balanceHasActiveFilters && {
                          backgroundColor: 'rgba(59, 130, 246, 0.12)',
                          borderColor: colors.primary,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setIsFilterModalVisible(true);
                      }}
                    >
                      <SlidersHorizontal size={18} color={balanceHasActiveFilters ? colors.primary : colors.text.primary} />
                      {balanceHasActiveFilters && (
                        <View
                          style={{
                            position: 'absolute',
                            top: normalize(6),
                            right: normalize(6),
                            width: normalize(8),
                            height: normalize(8),
                            borderRadius: normalize(4),
                            backgroundColor: colors.primary,
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Active Filter Chips */}
                  {balanceHasActiveFilters && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: normalize(8), paddingBottom: normalize(8) }}
                    >
                      {!!balanceFilters.yearFilter && (
                        <TouchableOpacity
                          onPress={() => setBalanceFilters((prev) => ({ ...prev, yearFilter: '' }))}
                          style={s.activeChip}
                        >
                          <Typography style={s.activeChipText}>Year: {balanceFilters.yearFilter}</Typography>
                          <X size={12} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                      {!!balanceFilters.leaveTypeIdFilter && (
                        <TouchableOpacity
                          onPress={() => setBalanceFilters((prev) => ({ ...prev, leaveTypeIdFilter: '' }))}
                          style={s.activeChip}
                        >
                          <Typography style={s.activeChipText}>
                            Type: {typeOptions.find((t) => t.value === balanceFilters.leaveTypeIdFilter)?.label || 'Selected'}
                          </Typography>
                          <X size={12} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                      {!!balanceFilters.departmentFilter && (
                        <TouchableOpacity
                          onPress={() => setBalanceFilters((prev) => ({ ...prev, departmentFilter: '' }))}
                          style={s.activeChip}
                        >
                          <Typography style={s.activeChipText}>
                            Department: {departmentOptions.find((d) => d.value === balanceFilters.departmentFilter)?.label || 'Selected'}
                          </Typography>
                          <X size={12} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                      {!!balanceFilters.employeeFilter && (
                        <TouchableOpacity
                          onPress={() => setBalanceFilters((prev) => ({ ...prev, employeeFilter: '' }))}
                          style={s.activeChip}
                        >
                          <Typography style={s.activeChipText}>
                            Employee: {employeeOptions.find((e) => e.value === balanceFilters.employeeFilter)?.label || 'Selected'}
                          </Typography>
                          <X size={12} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  )}
                </>
              );
            })()}
          </>
        }
        renderItem={({ item: bal }) => (
          <LeaveBalanceAdminCard
            balance={bal}
            onPress={async () => {
              await Haptics.selectionAsync();
              setSelectedBalanceForModal(bal);
              setIsBalanceDetailsModalVisible(true);
            }}
          />
        )}
        renderSkeleton={() => (
          <View style={[s.mobileCardWrapper, { height: normalize(80), backgroundColor: colors.white }]} />
        )}
      />
    </Animated.View>
  );

  const renderApprovalsTab = () => (
    <Animated.View entering={FadeInDown.duration(300)} style={{ flex: 1 }}>
      <InfiniteList
        data={adminRequests}
        isLoading={isAdminLoading}
        isFetchingNextPage={isAdminFetchingNextPage}
        hasNextPage={!!adminHasNextPage}
        onLoadMore={() => adminFetchNextPage()}
        onRefresh={() => adminRefetch()}
        isRefreshing={isAdminRefetching}
        contentContainerStyle={s.content}
        emptyMessage="No leave approval requests found"
        ListHeaderComponent={
          <>
            {/* 4 Analytics Cards (Matching Web Design Reference) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statScroll}>
              <View style={[s.approvalStatCard, { borderColor: 'rgba(59, 130, 246, 0.25)', backgroundColor: 'rgba(239, 246, 255, 0.75)' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Typography style={[s.approvalStatLabel, { color: colors.primary }]}>TOTAL REQUESTS</Typography>
                  <SlidersHorizontal size={14} color={colors.primary} />
                </View>
                <Typography style={[s.approvalStatVal, { color: colors.primary }]}>{adminSummary.total ?? 0}</Typography>
                <Typography style={s.approvalStatSub}>All time</Typography>
              </View>

              <View style={[s.approvalStatCard, { borderColor: 'rgba(245, 158, 11, 0.3)', backgroundColor: 'rgba(254, 243, 199, 0.75)' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Typography style={[s.approvalStatLabel, { color: colors.warning }]}>PENDING</Typography>
                  <Clock size={14} color={colors.warning} />
                </View>
                <Typography style={[s.approvalStatVal, { color: colors.warning }]}>{adminSummary.pending ?? 0}</Typography>
                <Typography style={s.approvalStatSub}>Awaiting action</Typography>
              </View>

              <View style={[s.approvalStatCard, { borderColor: 'rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(209, 250, 229, 0.75)' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Typography style={[s.approvalStatLabel, { color: colors.success }]}>APPROVED</Typography>
                  <CheckCircle2 size={14} color={colors.success} />
                </View>
                <Typography style={[s.approvalStatVal, { color: colors.success }]}>{adminSummary.approved ?? 0}</Typography>
                <Typography style={s.approvalStatSub}>Granted</Typography>
              </View>

              <View style={[s.approvalStatCard, { borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(254, 226, 226, 0.75)' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Typography style={[s.approvalStatLabel, { color: colors.error }]}>REJECTED</Typography>
                  <XCircle size={14} color={colors.error} />
                </View>
                <Typography style={[s.approvalStatVal, { color: colors.error }]}>{adminSummary.rejected ?? 0}</Typography>
                <Typography style={s.approvalStatSub}>Declined</Typography>
              </View>
            </ScrollView>

            {/* Search Bar + Filter Button */}
            {(() => {
              const approvalHasActiveFilters = !!(
                approvalFilters.statusFilter ||
                approvalFilters.leaveTypeIdFilter ||
                approvalFilters.fromDate ||
                approvalFilters.toDate ||
                approvalFilters.departmentFilter ||
                approvalFilters.employeeFilter ||
                approvalFilters.quickDate
              );
              return (
                <>
                  <View style={s.searchRow}>
                    <View style={{ flex: 1 }}>
                      <UICoreSearch
                        value={approvalFilters.searchQuery}
                        onChangeText={(val) => setApprovalFilters((prev) => ({ ...prev, searchQuery: val }))}
                        onClear={() => setApprovalFilters((prev) => ({ ...prev, searchQuery: '' }))}
                        placeholder="Search request ID, employee, type..."
                        containerStyle={{ marginBottom: 0 }}
                      />
                    </View>
                    <TouchableOpacity
                      style={[
                        s.filterBtn,
                        approvalHasActiveFilters && {
                          backgroundColor: 'rgba(59, 130, 246, 0.12)',
                          borderColor: colors.primary,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setIsFilterModalVisible(true);
                      }}
                    >
                      <SlidersHorizontal size={18} color={approvalHasActiveFilters ? colors.primary : colors.text.primary} />
                      {approvalHasActiveFilters && (
                        <View
                          style={{
                            position: 'absolute',
                            top: normalize(6),
                            right: normalize(6),
                            width: normalize(8),
                            height: normalize(8),
                            borderRadius: normalize(4),
                            backgroundColor: colors.primary,
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Active Filter Chips */}
                  {approvalHasActiveFilters && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: normalize(8), paddingBottom: normalize(8) }}
                    >
                      {!!approvalFilters.statusFilter && (
                        <TouchableOpacity
                          onPress={() => setApprovalFilters((prev) => ({ ...prev, statusFilter: '' }))}
                          style={s.activeChip}
                        >
                          <Typography style={s.activeChipText}>Status: {approvalFilters.statusFilter.replace('_', ' ')}</Typography>
                          <X size={12} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                      {!!approvalFilters.leaveTypeIdFilter && (
                        <TouchableOpacity
                          onPress={() => setApprovalFilters((prev) => ({ ...prev, leaveTypeIdFilter: '' }))}
                          style={s.activeChip}
                        >
                          <Typography style={s.activeChipText}>
                            Type: {typeOptions.find((t) => t.value === approvalFilters.leaveTypeIdFilter)?.label || 'Selected'}
                          </Typography>
                          <X size={12} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                      {!!approvalFilters.departmentFilter && (
                        <TouchableOpacity
                          onPress={() => setApprovalFilters((prev) => ({ ...prev, departmentFilter: '' }))}
                          style={s.activeChip}
                        >
                          <Typography style={s.activeChipText}>
                            Department: {departmentOptions.find((d) => d.value === approvalFilters.departmentFilter)?.label || 'Selected'}
                          </Typography>
                          <X size={12} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                      {!!approvalFilters.employeeFilter && (
                        <TouchableOpacity
                          onPress={() => setApprovalFilters((prev) => ({ ...prev, employeeFilter: '' }))}
                          style={s.activeChip}
                        >
                          <Typography style={s.activeChipText}>
                            Employee: {employeeOptions.find((e) => e.value === approvalFilters.employeeFilter)?.label || 'Selected'}
                          </Typography>
                          <X size={12} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                      {(!!approvalFilters.fromDate || !!approvalFilters.toDate) && (
                        <TouchableOpacity
                          onPress={() =>
                            setApprovalFilters((prev) => ({ ...prev, fromDate: '', toDate: '', quickDate: '' }))
                          }
                          style={s.activeChip}
                        >
                          <Typography style={s.activeChipText}>
                            Date: {approvalFilters.fromDate ? moment(approvalFilters.fromDate).format('DD MMM YYYY') : ''}
                            {approvalFilters.fromDate && approvalFilters.toDate ? ' - ' : ''}
                            {approvalFilters.toDate ? moment(approvalFilters.toDate).format('DD MMM YYYY') : ''}
                          </Typography>
                          <X size={12} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  )}
                </>
              );
            })()}
          </>
        }
        renderItem={({ item: req }) => (
          <LeaveApprovalCard
            req={req}
            onPressDetails={async () => {
              await Haptics.selectionAsync();
              setSelectedRequest(req);
              setIsDetailsModalVisible(true);
            }}
            onApprove={handleApproveRequest}
            onReject={handleOpenRejectModal}
          />
        )}
        renderSkeleton={() => (
          <View style={[s.mobileCardWrapper, { height: normalize(100), backgroundColor: colors.white }]} />
        )}
      />
    </Animated.View>
  );

  const currentTabTitle = useMemo(() => {
    switch (activeTab) {
      case 'individual':
        return 'Leave Overview';
      case 'my_leaves':
        return 'My Leaves';
      case 'balances':
        return 'Leave Balances';
      case 'approvals':
        return 'Leave Approvals';
      case 'calendar':
        return 'Leave Calendar';
      default:
        return 'Leave';
    }
  }, [activeTab]);

  return (
    <View style={s.container}>
      <LinearGradient colors={['#F0F8FF', '#E6F0FA', '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <CustomHeader
        variant={{ type: 'basic', title: currentTabTitle }}
        rightElement={
          (activeTab === 'my_leaves' || activeTab === 'individual' || activeTab === 'calendar') ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsApplyModalVisible(true);
              }}
              style={{
                borderRadius: normalize(12),
                overflow: 'hidden',
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <LinearGradient
                colors={colors.loginButtonBgGradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: normalize(12),
                  paddingVertical: normalize(7),
                  gap: normalize(5),
                }}
              >
                <Plus size={15} color={colors.white} />
                <Typography style={{ color: colors.white, fontSize: normalize(12), fontWeight: '800' }}>
                  Apply Leave
                </Typography>
              </LinearGradient>
            </TouchableOpacity>
          ) : undefined
        }
      />
      {renderTopTabs()}
      {activeTab === 'individual'
        ? renderIndividualDashboard()
        : activeTab === 'my_leaves'
        ? renderManagementTab()
        : activeTab === 'balances'
        ? renderBalancesTab()
        : activeTab === 'approvals'
        ? renderApprovalsTab()
        : (
          <LeaveCalendarTab
            myRequests={requests}
            adminRequests={adminRequests}
            typeOptions={typeOptions}
            employeeOptions={employeeOptions}
            onSelectRequest={(req) => {
              setSelectedRequest(req);
              setIsDetailsModalVisible(true);
            }}
            onApplyLeave={() => setIsApplyModalVisible(true)}
          />
        )}

      <ApplyLeaveModal
        visible={isApplyModalVisible}
        insets={insets}
        leaveType={leaveType}
        setLeaveType={setLeaveType}
        dayType={dayType}
        setDayType={setDayType}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        reason={reason}
        setReason={setReason}
        activeDatePicker={activeDatePicker}
        setActiveDatePicker={setActiveDatePicker}
        tempDate={tempDate}
        setTempDate={setTempDate}
        isSubmitting={isSubmitting}
        onClose={() => setIsApplyModalVisible(false)}
        onSubmit={handleApplyLeave}
        leaveTypeOptions={applyLeaveTypeOptions}
        balances={summaryResponse?.balances}
        disabledDates={appliedLeaveDates}
      />

      <LeaveDetailsModal
        visible={isDetailsModalVisible}
        req={selectedRequest}
        onClose={() => setIsDetailsModalVisible(false)}
      />

      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        onClose={() => {
          setIsDeleteModalVisible(false);
          setRequestToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Cancel Leave Request"
        message="Are you sure you want to cancel this leave request? This action cannot be undone."
        cancelLabel="Keep Request"
        confirmLabel="Okay"
        isLoading={isCancellingLeave}
      />

      {(() => {
        const activeFiltersState =
          activeTab === 'my_leaves' ? myFilters : activeTab === 'balances' ? balanceFilters : approvalFilters;
        return (
          <LeaveFilterModal
            visible={isFilterModalVisible}
            onClose={() => setIsFilterModalVisible(false)}
            isApprovals={activeTab === 'approvals'}
            isBalances={activeTab === 'balances'}
            initialFilters={{
              quickDate: (activeFiltersState as any).quickDate || '',
              fromDate: (activeFiltersState as any).fromDate || '',
              toDate: (activeFiltersState as any).toDate || '',
              statusFilter: (activeFiltersState as any).statusFilter || '',
              leaveTypeIdFilter: activeFiltersState.leaveTypeIdFilter,
              departmentFilter: (activeFiltersState as any).departmentFilter || '',
              employeeFilter: (activeFiltersState as any).employeeFilter || '',
              yearFilter: (activeFiltersState as any).yearFilter || '',
            }}
            typeOptions={typeOptions}
            statusOptions={STATUS_OPTIONS}
            quickDateOptions={QUICK_DATE_OPTIONS}
            departmentOptions={departmentOptions}
            employeeOptions={employeeOptions}
            onApply={(f) => {
              if (activeTab === 'my_leaves') {
                setMyFilters((prev) => ({
                  ...prev,
                  quickDate: f.quickDate,
                  fromDate: f.fromDate,
                  toDate: f.toDate,
                  statusFilter: f.statusFilter,
                  leaveTypeIdFilter: f.leaveTypeIdFilter,
                }));
              } else if (activeTab === 'balances') {
                setBalanceFilters((prev) => ({
                  ...prev,
                  yearFilter: f.yearFilter || '',
                  leaveTypeIdFilter: f.leaveTypeIdFilter,
                  departmentFilter: f.departmentFilter || '',
                  employeeFilter: f.employeeFilter || '',
                }));
              } else {
                setApprovalFilters((prev) => ({
                  ...prev,
                  quickDate: f.quickDate,
                  fromDate: f.fromDate,
                  toDate: f.toDate,
                  statusFilter: f.statusFilter,
                  leaveTypeIdFilter: f.leaveTypeIdFilter,
                  departmentFilter: f.departmentFilter || '',
                  employeeFilter: f.employeeFilter || '',
                }));
              }
            }}
            onClear={() => {
              if (activeTab === 'my_leaves') {
                setMyFilters((prev) => ({
                  ...prev,
                  quickDate: '',
                  fromDate: '',
                  toDate: '',
                  statusFilter: '',
                  leaveTypeIdFilter: '',
                }));
              } else if (activeTab === 'balances') {
                setBalanceFilters((prev) => ({
                  ...prev,
                  yearFilter: '',
                  leaveTypeIdFilter: '',
                  departmentFilter: '',
                  employeeFilter: '',
                }));
              } else {
                setApprovalFilters((prev) => ({
                  ...prev,
                  quickDate: '',
                  fromDate: '',
                  toDate: '',
                  statusFilter: '',
                  leaveTypeIdFilter: '',
                  departmentFilter: '',
                  employeeFilter: '',
                }));
              }
            }}
          />
        );
      })()}

      <LeaveRejectionModal
        visible={rejectModalVisible}
        onClose={() => {
          setRejectModalVisible(false);
          setRejectingRequestId(null);
        }}
        onSubmit={handleConfirmReject}
        isLoading={resolveLeaveMutation.isPending}
      />

      <LeaveBalanceDetailsModal
        visible={isBalanceDetailsModalVisible}
        balance={selectedBalanceForModal}
        onClose={() => setIsBalanceDetailsModalVisible(false)}
      />
    </View>
  );
};
