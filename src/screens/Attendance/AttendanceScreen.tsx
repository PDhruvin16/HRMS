/**
 * AttendanceScreen.tsx
 *
 * Main screen for the Attendance tab.
 *
 * Architecture overview:
 *   ┌─────────────────────────────────────────────┐
 *   │  AttendanceScreen  (this file)              │
 *   │  ─ Permission-gated tab list                │
 *   │  ─ All query hooks (React Query)            │
 *   │  ─ Mutation handlers (punch / approve etc.) │
 *   │  ─ Live summary timer                       │
 *   │  ─ Renders per-tab content + modals         │
 *   ├─────────────────────────────────────────────┤
 *   │  AttendanceComponents.tsx                   │
 *   │  ─ All presentational components            │
 *   │    (cards, modals, badges, search bar …)    │
 *   ├─────────────────────────────────────────────┤
 *   │  AttendanceStyles.ts                        │
 *   │  ─ Single StyleSheet for the whole feature  │
 *   ├─────────────────────────────────────────────┤
 *   │  AttendanceTypes.ts                         │
 *   │  ─ Constants, color maps, shared types      │
 *   │    and time-utility functions               │
 *   └─────────────────────────────────────────────┘
 */

// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  TrendingUp, CalendarRange,
  Plus, X,
  Coffee, Zap, Hourglass, Sun,
  UserCheck, UserX, Home,
} from 'lucide-react-native';
import { normalize } from '../../utils/responsive';
import colors from '../../theme/color';
import { Typography } from '../../components/Typography';
import CustomHeader from '../../components/Header';
import { useQueryClient } from '@tanstack/react-query';
import {
  useTodayAttendanceStatusQuery,
  useAttendanceLogsInfiniteQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useWFHRequestsQuery,
  useCreateWFHMutation,
  useOvertimeRequestsQuery,
  useCreateOvertimeMutation,
  useTeamAttendanceInfiniteQuery,
  useWFHApprovalsQuery,
  useApproveWFHMutation,
  useRejectWFHMutation,
  useDeleteWFHMutation,
} from '../../hooks/useQueries';
import { useErrorHandle } from '../../hooks/useErrorHandle';
import { getApiErrorMessage } from '../../utils/errorHandler';
import {
  AttendanceLog,
  WFHRequest,
  OvertimeRequest,
  WFHApprovalRecord,
  AttendanceSummary,
  attendanceApi,
} from '../../api/attendanceApi';
import useRole from '../../hooks/useRole';
import { InfiniteList } from '../../components/InfiniteList';
import { getServerMoment } from '../../services/api';
import { DayCard } from './DayCard';

/* ── Supporting files ────────────────────────────────────────── */
import { Tab } from './AttendanceTypes';
import s from './AttendanceStyles';

import {
  TabBar,
  StatCard,
  TeamStatCard,
  TeamMemberRowCard,
  StatusCountStrip,
  WFHCard,
  OTCard,
  WFHApprovalCard,
  SearchBar,
  EmptyState,
  NewRequestModal,
  PunchSequenceModal,
  RejectionModal,
  DeleteConfirmationModal,
} from './AttendanceComponents';

/* ── Local time utilities (kept inline to match original behavior) ── */
const parseHmsToSeconds = (hmsStr: string): number => {
  if (!hmsStr) return 0;
  const parts = hmsStr.split(':').map(Number);
  if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  if (parts.length === 2) return (parts[0] * 3600) + (parts[1] * 60);
  return 0;
};

const secondsToHmsString = (totalSecs: number): string => {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/* ═══════════════════════════════════════════════════════════════
   MAIN SCREEN
═══════════════════════════════════════════════════════════════ */
export const AttendanceScreen: React.FC = () => {
  const { isAdminOrHR } = useRole();
  const router = useRouter();
  const { handleError } = useErrorHandle();

  /* ── Permissions ─────────────────────────────────────────── */
  const slicePerms   = useSelector((state: RootState) => state.permission?.permissions);
  const authUserPerms = useSelector((state: RootState) => state.auth.user?.permissions);

  const permissions  = (slicePerms && slicePerms.length > 0) ? slicePerms : (authUserPerms || []);
  const hasPermission = (resource: string, action: string) => {
    if (!permissions || permissions.length === 0) return true;
    return permissions.some((p: any) => p.resource === resource && p.action === action);
  };

  /* ── Available tabs (permission-gated) ───────────────────── */
  const availableTabs = useMemo<Tab[]>(() => {
    const tabs: Tab[] = [];
    if (hasPermission('attendance', 'view'))  tabs.push('My Attendance');
    if (hasPermission('my_wfh', 'view'))      tabs.push('My WFH');
    if (hasPermission('my_overtime', 'view')) tabs.push('My Overtime');
    tabs.push('Team'); // always visible
    if (hasPermission('attendance', 'approve')) tabs.push('WFH Approvals');
    return tabs;
  }, [permissions]);

  /* ── Active tab ──────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState<Tab>('My Attendance');

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }, [availableTabs, activeTab]);

  /* ── Local state ──────────────────────────────────────────── */
  const today = getServerMoment().format('YYYY-MM-DD');

  const [dateFrom, setDateFrom] = useState(() => moment().startOf('month').format('YYYY-MM-DD'));
  const [dateTo,   setDateTo]   = useState(() => moment().format('YYYY-MM-DD'));

  const [wfhSearch,       setWfhSearch]       = useState('');
  const [otSearch,        setOtSearch]        = useState('');
  const [teamSearchText,  setTeamSearchText]  = useState('');
  const [teamFilterStatus, setTeamFilterStatus] = useState<'All' | 'Present' | 'Absent' | 'WFH'>('All');
  const [teamViewType,    setTeamViewType]    = useState<'today' | 'monthly'>('today');

  const [modalType,              setModalType]              = useState<'WFH' | 'Overtime' | null>(null);
  const [selectedLogForModal,    setSelectedLogForModal]    = useState<AttendanceLog | null>(null);
  const [isProcessing,           setIsProcessing]           = useState(false);
  const [screenActiveDatePicker, setScreenActiveDatePicker] = useState<'start' | 'end' | null>(null);
  const [screenTempDate,         setScreenTempDate]         = useState('');
  const [calendarOpen,           setCalendarOpen]           = useState(false);
  const [rejectingItem,          setRejectingItem]          = useState<WFHApprovalRecord | null>(null);
  const [deletingWFHRequest,     setDeletingWFHRequest]     = useState<WFHRequest | null>(null);
  const [approvalsSearch,        setApprovalsSearch]        = useState('');

  /* ── Queries (conditionally enabled by active tab & permission) ───────── */
  const { data: todayStatus, isLoading: todayLoading } =
    useTodayAttendanceStatusQuery({ enabled: false });

  const {
    data: infiniteData,
    isLoading: logsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
    isError,
  } = useAttendanceLogsInfiniteQuery(
    { from: dateFrom, to: dateTo },
    { enabled: activeTab === 'My Attendance' && hasPermission('attendance', 'view') },
  );

  const { data: wfhList      = [], refetch: refetchWFHList, isRefetching: isRefetchingWFHList } =
    useWFHRequestsQuery({ enabled: activeTab === 'My WFH' && hasPermission('my_wfh', 'view') });
  const { data: otList       = [], refetch: refetchOTList, isRefetching: isRefetchingOTList } =
    useOvertimeRequestsQuery({ enabled: activeTab === 'My Overtime' && hasPermission('my_overtime', 'view') });
  const { data: wfhApprovals = [], refetch: refetchWFHApprovals, isRefetching: isRefetchingWFH } =
    useWFHApprovalsQuery({ enabled: activeTab === 'WFH Approvals' && hasPermission('attendance', 'approve') });

  const teamDateFrom = useMemo(
    () => teamViewType === 'today' ? today : moment().startOf('month').format('YYYY-MM-DD'),
    [teamViewType, today],
  );

  const {
    data: teamInfiniteData,
    isLoading: teamLoading,
    isFetchingNextPage: teamFetchingNextPage,
    hasNextPage: teamHasNextPage,
    fetchNextPage: teamFetchNextPage,
    refetch: teamRefetch,
    isRefetching: teamRefetching,
  } = useTeamAttendanceInfiniteQuery(
    { from: teamDateFrom, to: today },
    { enabled: activeTab === 'Team' }
  );

  const queryClient = useQueryClient();
  const userId = useSelector((state: RootState) => state.auth.user?.id || state.auth.user?.employeeId || '');

  /* ── Background Prefetching (Production Best Practice) ─────────────────── */
  useEffect(() => {
    if (!userId) return;
    const prefetchTimer = setTimeout(() => {
      const monthlyDateFrom = moment().startOf('month').format('YYYY-MM-DD');

      // 1a. Background prefetch Team Attendance - Today's Log
      queryClient.prefetchInfiniteQuery({
        queryKey: ['attendance', 'team', userId, today, today],
        queryFn: ({ pageParam = 1 }) =>
          attendanceApi.getTeamAttendance({
            page: pageParam,
            limit: 10,
            dateFrom: today,
            dateTo: today,
          }),
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000,
      });

      // 1b. Background prefetch Team Attendance - Monthly Log
      queryClient.prefetchInfiniteQuery({
        queryKey: ['attendance', 'team', userId, monthlyDateFrom, today],
        queryFn: ({ pageParam = 1 }) =>
          attendanceApi.getTeamAttendance({
            page: pageParam,
            limit: 10,
            dateFrom: monthlyDateFrom,
            dateTo: today,
          }),
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000,
      });

      // 2. Background prefetch My WFH
      if (hasPermission('my_wfh', 'view')) {
        queryClient.prefetchQuery({
          queryKey: ['attendance', 'wfh', userId],
          queryFn: () => attendanceApi.getWFHRequests(),
          staleTime: 5 * 60 * 1000,
        });
      }

      // 3. Background prefetch WFH Approvals
      if (hasPermission('attendance', 'approve')) {
        queryClient.prefetchQuery({
          queryKey: ['attendance', 'wfh-approvals', userId],
          queryFn: () => attendanceApi.getWFHApprovals(),
          staleTime: 5 * 60 * 1000,
        });
      }
    }, 600);

    return () => clearTimeout(prefetchTimer);
  }, [userId, today]);

  /* ── Mutations ───────────────────────────────────────────── */
  const { mutateAsync: checkIn }   = useCheckInMutation();
  const { mutateAsync: checkOut }  = useCheckOutMutation();
  const { mutateAsync: createWFH } = useCreateWFHMutation();
  const { mutateAsync: createOT }  = useCreateOvertimeMutation();
  const { mutate: approveWFH }     = useApproveWFHMutation();
  const { mutate: rejectWFH }      = useRejectWFHMutation();
  const { mutate: deleteWFH }      = useDeleteWFHMutation();

  /* ── Derived data ────────────────────────────────────────── */
  const logs = useMemo(
    () => infiniteData?.pages.flatMap((page) => page.logs) ?? [],
    [infiniteData],
  );

  const teamLogs = useMemo(
    () => teamInfiniteData?.pages.flatMap((page) => page.data) ?? [],
    [teamInfiniteData],
  );

  const teamSummary = useMemo(
    () => teamInfiniteData?.pages[0]?.summary ?? { present: 0, absent: 0, onLeave: 0, wfh: 0 },
    [teamInfiniteData],
  );

  /** Monthly attendance summary — reads from server's authoritative totals.
   *  Individual log fields (log.workingHours etc.) do NOT sum to the same
   *  as the server's totalXxxSeconds, so we always use pages[0].summary.
   *  When today is ongoing, we subtract today's stale partial contribution
   *  so the live timer can replace it with accurate real-time values. */
  const summary = useMemo<AttendanceSummary>(() => {
    const serverSummary = infiniteData?.pages[0]?.summary;
    const todayStr = getServerMoment().format('YYYY-MM-DD');

    let totalWorkingSecs  = parseHmsToSeconds(serverSummary?.totalWorking  ?? '00:00:00');
    let totalOvertimeSecs = parseHmsToSeconds(serverSummary?.totalOvertime ?? '00:00:00');
    let totalBreakSecs    = parseHmsToSeconds(serverSummary?.totalBreak    ?? '00:00:00');

    // Subtract today's stale server-partial if today user has punched in
    // (live timer will add accurate real-time values instead)
    const todayLog = logs.find((l) => l.date === todayStr);
    const hasPunchedToday = Boolean(todayLog && (todayLog.rawPunchIn || todayLog.firstPunchIn));

    if (hasPunchedToday && todayLog) {
      totalWorkingSecs  = Math.max(0, totalWorkingSecs  - parseHmsToSeconds(todayLog.workingHours));
      totalOvertimeSecs = Math.max(0, totalOvertimeSecs - parseHmsToSeconds(todayLog.overtime));
      totalBreakSecs    = Math.max(0, totalBreakSecs    - parseHmsToSeconds(todayLog.breakTime));
    }

    const totalIncompleteSecs = parseHmsToSeconds(serverSummary?.totalIncomplete ?? '00:00:00');

    return {
      totalWorking:    secondsToHmsString(totalWorkingSecs),
      totalOvertime:   secondsToHmsString(totalOvertimeSecs),
      totalBreak:      secondsToHmsString(totalBreakSecs),
      totalIncomplete: secondsToHmsString(totalIncompleteSecs),
      todayLeavingTime: '',
    };
  }, [logs, infiniteData]);

  /* ── Live summary (ticks every second when user punched in today) ─── */
  const [liveSummary, setLiveSummary] = useState<AttendanceSummary | null>(null);

  useEffect(() => { if (summary) setLiveSummary(summary); }, [summary]);

  useEffect(() => {
    const todayLog  = logs.find((l) => l.date === today);
    const hasPunchedToday = Boolean(todayLog && (todayLog.rawPunchIn || todayLog.firstPunchIn));

    if (!hasPunchedToday || !summary || !todayLog) {
      setLiveSummary(summary);
      return;
    }

    const tick = () => {
      const firstPunchMoment = todayLog.rawPunchIn
        ? moment(todayLog.rawPunchIn)
        : moment(`${todayLog.date} ${todayLog.firstPunchIn}`);

      if (!firstPunchMoment.isValid()) {
        setLiveSummary(summary);
        return;
      }

      const grossElapsedSecs = Math.max(0, getServerMoment().diff(firstPunchMoment, 'seconds'));

      const punchesList = todayLog.punches || [];
      const lastP = punchesList.length > 0 ? punchesList[punchesList.length - 1] : null;
      const isWorking = lastP ? lastP.type === 'IN' : Boolean(todayLog.rawPunchIn && !todayLog.rawPunchOut);

      let completedWorkedSecs = 0;
      let completedBreakSecs = 0;

      if (punchesList.length >= 2) {
        for (let i = 0; i < punchesList.length - 1; i++) {
          const pCur = punchesList[i];
          const pNxt = punchesList[i + 1];
          const mCur = moment(pCur.time, ['DD/MM/YYYY, HH:mm:ss', moment.ISO_8601]);
          const mNxt = moment(pNxt.time, ['DD/MM/YYYY, HH:mm:ss', moment.ISO_8601]);
          if (mCur.isValid() && mNxt.isValid()) {
            const dur = Math.max(0, mNxt.diff(mCur, 'seconds'));
            if (pCur.type === 'IN' && pNxt.type === 'OUT') {
              completedWorkedSecs += dur;
            } else if (pCur.type === 'OUT' && pNxt.type === 'IN') {
              completedBreakSecs += dur;
            }
          }
        }
      }

      if (completedWorkedSecs === 0 && todayLog.workingHours) {
        completedWorkedSecs = parseHmsToSeconds(todayLog.workingHours);
      }
      if (completedBreakSecs === 0 && todayLog.breakTime) {
        completedBreakSecs = parseHmsToSeconds(todayLog.breakTime);
      }

      let todayWorkedSecs = 0;
      let todayBreakSecs = 0;

      if (isWorking) {
        todayBreakSecs = completedBreakSecs;
        todayWorkedSecs = Math.max(0, grossElapsedSecs - todayBreakSecs);
      } else {
        // Currently ON BREAK:
        todayWorkedSecs = completedWorkedSecs;
        todayBreakSecs = Math.max(0, grossElapsedSecs - todayWorkedSecs);
      }

      const targetSecs = parseHmsToSeconds(todayLog.targetHours) || (8.5 * 3600);
      const otToday = Math.max(0, todayWorkedSecs - targetSecs);

      // Leaving time estimate: punchIn + target + break
      const targetForLeaving = targetSecs > 0 ? targetSecs : 8.5 * 3600;
      const leavingTime = moment(firstPunchMoment)
        .add(targetForLeaving + todayBreakSecs, 'seconds')
        .format('HH:mm:ss');

      // Incomplete hours: Base server incomplete minus live worked delta today
      const baseIncompleteSecs = parseHmsToSeconds(summary.totalIncomplete);
      const serverWorkedSecs   = parseHmsToSeconds(todayLog.workingHours);
      const liveWorkedDelta    = isWorking ? Math.max(0, todayWorkedSecs - serverWorkedSecs) : 0;
      const incompleteSecs     = Math.max(0, baseIncompleteSecs - liveWorkedDelta);

      setLiveSummary({
        totalWorking:    secondsToHmsString(parseHmsToSeconds(summary.totalWorking)  + todayWorkedSecs),
        totalOvertime:   secondsToHmsString(parseHmsToSeconds(summary.totalOvertime) + otToday),
        totalBreak:      secondsToHmsString(parseHmsToSeconds(summary.totalBreak)    + todayBreakSecs),
        totalIncomplete: secondsToHmsString(incompleteSecs),
        todayLeavingTime: leavingTime,
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [logs, summary, today]);


  /* ── Filtered lists ──────────────────────────────────────── */
  const filteredWFH = useMemo(
    () => wfhList.filter((r) => r.reason.toLowerCase().includes(wfhSearch.toLowerCase())),
    [wfhList, wfhSearch],
  );

  const filteredOT = useMemo(
    () => otList.filter((r) => r.reason.toLowerCase().includes(otSearch.toLowerCase())),
    [otList, otSearch],
  );

  const filteredApprovals = useMemo(() => wfhApprovals.filter(
    (item) =>
      item.employeeName?.toLowerCase().includes(approvalsSearch.toLowerCase()) ||
      item.empCode?.toLowerCase().includes(approvalsSearch.toLowerCase()) ||
      (item.reason && item.reason.toLowerCase().includes(approvalsSearch.toLowerCase())),
  ), [wfhApprovals, approvalsSearch]);

  const filteredTeamToday = useMemo(() => {
    let list = teamLogs;
    if (teamFilterStatus !== 'All') {
      list = list.filter((item) => item.status?.toLowerCase() === teamFilterStatus.toLowerCase());
    }
    if (teamSearchText) {
      list = list.filter((item) => {
        const name = `${item.firstName || ''} ${item.lastName || ''}`.trim();
        return (
          name.toLowerCase().includes(teamSearchText.toLowerCase()) ||
          (item.empId || '').toLowerCase().includes(teamSearchText.toLowerCase())
        );
      });
    }
    return list;
  }, [teamLogs, teamFilterStatus, teamSearchText]);

  /* ── Action handlers ─────────────────────────────────────── */
  const handlePunch = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsProcessing(true);
    try {
      if (todayStatus?.isCheckedIn) await checkOut({ note: 'Punched out' });
      else                          await checkIn({ note: 'Punched in' });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      handleError(e, 'Failed to update punch status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveWFH = (item: WFHApprovalRecord) => {
    Alert.alert(
      'Approve WFH',
      `Are you sure you want to approve this request for ${item.employeeName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            approveWFH(item.id, {
              onSuccess: async () => {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                refetchWFHApprovals();
              },
              onError: async (err) => {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                handleError(err, 'Failed to approve WFH request.');
              },
            });
          },
        },
      ],
    );
  };


  const handleRejectWFH  = (item: WFHApprovalRecord) => setRejectingItem(item);

  const handleViewEmployee = (employeeId: string, employeeName: string, date: string) => {
    router.push({ pathname: '/employee-attendance', params: { employeeId, employeeName, date } });
  };

  /* ── Section renders ─────────────────────────────────────── */

  /** Header section for My Attendance tab — summary cards + date filter */
  const renderAttendanceHeader = () => (
    <View style={{ marginBottom: normalize(8) }}>
      {liveSummary && (
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statScroll}>
            <StatCard icon={<TrendingUp size={normalize(18)} color={colors.primary}    />} label="Working"    value={liveSummary.totalWorking}     color={colors.primary}    />
            <StatCard icon={<Zap        size={normalize(18)} color={colors.warning}    />} label="Overtime"   value={liveSummary.totalOvertime}    color={colors.warning}    />
            <StatCard icon={<Coffee     size={normalize(18)} color={colors.emailBlue}  />} label="Break"      value={liveSummary.totalBreak}       color={colors.emailBlue}  />
            <StatCard icon={<Hourglass  size={normalize(18)} color={colors.error}      />} label="Incomplete" value={liveSummary.totalIncomplete}  color={colors.error}      />
            <StatCard icon={<Sun        size={normalize(18)} color={colors.success}    />} label="Leaving"    value={liveSummary.todayLeavingTime} color={colors.success}    />
          </ScrollView>
        </Animated.View>
      )}

      {/* Collapsible date filter */}
      {calendarOpen && (
        <Animated.View entering={FadeInUp.duration(300)}>
          <BlurView intensity={50} tint="light" style={s.calendarCard}>
            <View style={s.datePickerGrid}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={s.dateFilterBox}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setScreenTempDate(dateFrom);
                  setScreenActiveDatePicker('start');
                }}
              >
                <Typography style={s.dateFilterLabel}>FROM DATE</Typography>
                <Typography style={s.dateFilterValue}>{dateFrom ? moment(dateFrom).format('MMM DD, YYYY') : 'Select Date'}</Typography>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={s.dateFilterBox}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setScreenTempDate(dateTo || today);
                  setScreenActiveDatePicker('end');
                }}
              >
                <Typography style={s.dateFilterLabel}>TO DATE</Typography>
                <Typography style={s.dateFilterValue}>{dateTo ? moment(dateTo).format('MMM DD, YYYY') : 'Select Date'}</Typography>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(100).springify()} style={s.sectionHeaderRow}>
        <Typography style={s.sectionTitle}>History</Typography>
        <Typography style={s.sectionSub}>{logs.length} records</Typography>
      </Animated.View>
    </View>
  );

  /** My WFH tab */
  const renderMyWFH = () => (
    <InfiniteList
      data={filteredWFH}
      isLoading={isRefetchingWFHList && filteredWFH.length === 0}
      isFetchingNextPage={false}
      hasNextPage={false}
      onLoadMore={() => {}}
      onRefresh={refetchWFHList}
      isRefreshing={isRefetchingWFHList}
      onEndReachedThreshold={0.8}
      ListHeaderComponent={
        <View style={{ marginBottom: normalize(8) }}>
          <StatusCountStrip data={wfhList} />
          <SearchBar value={wfhSearch} onChange={setWfhSearch} placeholder="Search by reason…" />
        </View>
      }
      renderItem={({ item, index }) => (
        <WFHCard item={item} index={index} onDelete={setDeletingWFHRequest} />
      )}
      renderSkeleton={() => (
        <View style={[s.dayCard, { opacity: 0.5, height: normalize(80), justifyContent: 'center' }]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item, index) => (item.id ? `${item.id}_${index}` : `wfh_${index}`)}
      emptyMessage="No WFH requests found."
    />
  );

  /** My Overtime tab */
  const renderMyOT = () => (
    <InfiniteList
      data={filteredOT}
      isLoading={isRefetchingOTList && filteredOT.length === 0}
      isFetchingNextPage={false}
      hasNextPage={false}
      onLoadMore={() => {}}
      onRefresh={refetchOTList}
      isRefreshing={isRefetchingOTList}
      onEndReachedThreshold={0.8}
      ListHeaderComponent={
        <View style={{ marginBottom: normalize(8) }}>
          <StatusCountStrip data={otList} />
          <SearchBar value={otSearch} onChange={setOtSearch} placeholder="Search by reason…" />
        </View>
      }
      renderItem={({ item, index }) => <OTCard item={item} index={index} />}
      renderSkeleton={() => (
        <View style={[s.dayCard, { opacity: 0.5, height: normalize(80), justifyContent: 'center' }]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item, index) => (item.id ? `${item.id}_${index}` : `ot_${index}`)}
      emptyMessage="No overtime requests found."
    />
  );

  /** WFH Approvals tab */
  const renderWFHApprovals = () => (
    <InfiniteList
      data={filteredApprovals}
      isLoading={isRefetchingWFH && filteredApprovals.length === 0}
      isFetchingNextPage={false}
      hasNextPage={false}
      onLoadMore={() => {}}
      onRefresh={refetchWFHApprovals}
      isRefreshing={isRefetchingWFH}
      onEndReachedThreshold={0.8}
      ListHeaderComponent={
        <View style={{ marginBottom: normalize(8) }}>
          <SearchBar value={approvalsSearch} onChange={setApprovalsSearch} placeholder="Search by name, emp code, or reason…" />
        </View>
      }
      renderItem={({ item, index }) => (
        <WFHApprovalCard
          item={item}
          index={index}
          onApprove={() => handleApproveWFH(item)}
          onReject={() => handleRejectWFH(item)}
        />
      )}
      renderSkeleton={() => (
        <View style={[s.approvalCard, { opacity: 0.5, height: normalize(100), justifyContent: 'center' }]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item, index) => (item.id ? `${item.id}_${index}` : `appr_${index}`)}
      emptyMessage="No WFH approvals found."
    />
  );

  /** Team tab header — view toggle + stat cards + search */
  const renderTeamHeader = () => (
    <View style={{ marginBottom: normalize(8) }}>


      {/* Today vs Monthly toggle */}
      <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: normalize(12), padding: normalize(4), marginBottom: normalize(16) }}>
        {(['today', 'monthly'] as const).map((v) => (
          <TouchableOpacity
            key={v}
            style={{ flex: 1, paddingVertical: normalize(8), alignItems: 'center', backgroundColor: teamViewType === v ? colors.white : 'transparent', borderRadius: normalize(10) }}
            onPress={async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTeamViewType(v); }}
          >
            <Typography style={{ fontWeight: '800', fontSize: normalize(13), color: teamViewType === v ? colors.primary : colors.text.secondary }}>
              {v === 'today' ? "Today's Log" : 'Monthly Log'}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary stat cards — today only */}
      {teamViewType === 'today' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.statScroll, { marginBottom: normalize(16) }]}>
          <TeamStatCard
            label="Present" value={String(teamSummary.present ?? 0)} subLabel="Employees present today"
            color={colors.success} icon={<UserCheck size={normalize(16)} color={colors.success} />}
            active={teamFilterStatus === 'Present'}
            onPress={async () => { await Haptics.selectionAsync(); setTeamFilterStatus(teamFilterStatus === 'Present' ? 'All' : 'Present'); }}
          />
          <TeamStatCard
            label="Absent" value={String(teamSummary.absent ?? 0)} subLabel="Employees absent today"
            color={colors.error} icon={<UserX size={normalize(16)} color={colors.error} />}
            active={teamFilterStatus === 'Absent'}
            onPress={async () => { await Haptics.selectionAsync(); setTeamFilterStatus(teamFilterStatus === 'Absent' ? 'All' : 'Absent'); }}
          />
          <TeamStatCard
            label="Work From Home" value={String(teamSummary.wfh ?? 0)} subLabel="Employees working from home"
            color={colors.primary} icon={<Home size={normalize(16)} color={colors.primary} />}
            active={teamFilterStatus === 'WFH'}
            onPress={async () => { await Haptics.selectionAsync(); setTeamFilterStatus(teamFilterStatus === 'WFH' ? 'All' : 'WFH'); }}
          />
        </ScrollView>
      )}

      <SearchBar value={teamSearchText} onChange={setTeamSearchText} placeholder="Search by name, emp Code" />

      <View style={s.sectionHeaderRow}>
        <Typography style={s.sectionTitle}>Employees</Typography>
        <Typography style={s.sectionSub}>{filteredTeamToday.length} records</Typography>
      </View>
    </View>
  );

  /* ── Render ──────────────────────────────────────────────── */
  const currentTabTitle = useMemo(() => {
    switch (activeTab) {
      case 'My Attendance': return 'My Attendance';
      case 'My WFH':        return 'My WFH';
      case 'My Overtime':   return 'My Overtime';
      case 'Team':          return 'Team Attendance';
      case 'WFH Approvals': return 'WFH Approvals';
      default:              return 'Attendance';
    }
  }, [activeTab]);

  return (
    <View style={s.container}>
      <LinearGradient
        colors={['#F0F8FF', '#E6F0FA', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <CustomHeader
        variant={{ type: 'basic', title: currentTabTitle }}
        rightElement={
          activeTab === 'My Attendance' ? (
            <TouchableOpacity
              onPress={async () => { await Haptics.selectionAsync(); setCalendarOpen(!calendarOpen); }}
              style={{ padding: normalize(8), backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: normalize(8) }}
            >
              <CalendarRange size={normalize(20)} color={colors.primary} />
            </TouchableOpacity>
          ) : ((activeTab === 'My WFH' && hasPermission('my_wfh', 'add')) ||
               (activeTab === 'My Overtime' && hasPermission('my_overtime', 'add'))) ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setModalType(activeTab === 'My WFH' ? 'WFH' : 'Overtime');
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
                  {activeTab === 'My WFH' ? 'New WFH' : 'New OT'}
                </Typography>
              </LinearGradient>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <TabBar active={activeTab} onChange={setActiveTab} tabs={availableTabs} />

      {/* ── Tab content ──────────────────────────────────────── */}
      {activeTab === 'My Attendance' ? (
        isError && logs.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: normalize(16) }}>
            <EmptyState
              message="Failed to connect to the server. Please ensure the backend is running and you are connected to the correct network."
              onRetry={refetch}
            />
          </View>
        ) : (
          <InfiniteList
            data={logs}
            isLoading={logsLoading && !isFetchingNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onLoadMore={fetchNextPage}
            onRefresh={refetch}
            isRefreshing={isRefetching}
            renderItem={({ item, index }) => (
              <DayCard log={item} index={index} onPress={() => setSelectedLogForModal(item)} />
            )}
            renderSkeleton={() => (
              <View style={[s.dayCard, { opacity: 0.5, height: normalize(120), justifyContent: 'center' }]}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
            ListHeaderComponent={renderAttendanceHeader()}
            contentContainerStyle={s.content}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => (item.id ? `${item.id}_${index}` : item.date ? `${item.date}_${index}` : `log_${index}`)}
            emptyMessage="No attendance records found."
          />
        )
      ) : activeTab === 'Team' ? (
        <InfiniteList
          data={filteredTeamToday}
          isLoading={teamLoading && !teamFetchingNextPage}
          isFetchingNextPage={teamFetchingNextPage}
          hasNextPage={teamHasNextPage}
          onLoadMore={teamFetchNextPage}
          onRefresh={teamRefetch}
          isRefreshing={teamRefetching}
          onEndReachedThreshold={0.8}
          renderItem={({ item, index }) => {
            const employeeName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Employee';

            const rowIssues: string[] = [];
            if (item.isLate || item.dayMetrics?.isLateAfterTenAm)          rowIssues.push('Late coming');
            if (item.sequenceMissing || item.dayMetrics?.hasSequenceIssue)  rowIssues.push('Sequence missing');
            if (item.date !== today && (item.dayMetrics?.isIncompleteHours || item.isEarlyExit)) {
              rowIssues.push('Incomplete hours');
            }
            if ((item.overtimeMinutes && item.overtimeMinutes > 0) ||
                (item.dayMetrics?.totalOvertime && item.dayMetrics.totalOvertime !== '0:00:00')) {
              rowIssues.push('Overtime');
            }

            return (
              <TeamMemberRowCard
                item={item}
                index={index}
                onPress={() => handleViewEmployee(item.employeeId, employeeName, item.date)}
                showDate={teamViewType === 'monthly'}
                issues={rowIssues}
              />
            );
          }}
          renderSkeleton={() => (
            <View style={[s.teamRowCard, { opacity: 0.5, height: normalize(68), justifyContent: 'center' }]}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
          ListHeaderComponent={renderTeamHeader()}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) =>
            item.id
              ? `${item.id}_${index}`
              : `${item.employeeId || item.empId || 'emp'}_${item.date || index}_${index}`
          }
          emptyMessage="No records found matching filters."
        />
      ) : activeTab === 'My WFH' ? (
        renderMyWFH()
      ) : activeTab === 'My Overtime' ? (
        renderMyOT()
      ) : (
        renderWFHApprovals()
      )}



      {/* ── Modals ───────────────────────────────────────────── */}

      {modalType && (
        <NewRequestModal
          visible={!!modalType}
          type={modalType}
          onClose={() => setModalType(null)}
          onSubmit={async (data) => {
            try {
              if (modalType === 'WFH') {
                await createWFH({ fromDate: data.fromDate, toDate: data.toDate, days: 1, reason: data.reason });
              } else {
                await createOT({ date: data.fromDate, hours: data.hours, reason: data.reason });
              }
              setModalType(null);
            } catch (err) {
              handleError(err, `Failed to submit ${modalType} request.`);
            }
          }}
        />
      )}

      <PunchSequenceModal
        visible={!!selectedLogForModal}
        log={selectedLogForModal}
        onClose={() => setSelectedLogForModal(null)}
      />

      <DeleteConfirmationModal
        visible={deletingWFHRequest !== null}
        onClose={() => setDeletingWFHRequest(null)}
        title="Delete WFH Request"
        message="Are you sure you want to delete this WFH request? This action will remove it permanently."
        onConfirm={async () => {
          if (!deletingWFHRequest) return;
          const targetId = deletingWFHRequest.id;
          setDeletingWFHRequest(null);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          deleteWFH(targetId, {
            onSuccess: async () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
            onError: async (err) => {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              handleError(err, 'Failed to delete WFH request.');
            },
          });
        }}
      />

      <RejectionModal
        visible={rejectingItem !== null}
        onClose={() => setRejectingItem(null)}
        onSubmit={(reason) => {
          if (!rejectingItem) return;
          const targetItem = rejectingItem;
          setRejectingItem(null);
          rejectWFH({ requestId: targetItem.id, rejectionReason: reason }, {
            onSuccess: async () => {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              refetchWFHApprovals();
            },
            onError: async (err) => {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              handleError(err, 'Failed to reject WFH request.');
            },
          });
        }}
      />


      {/* Date picker modal — triggered from My Attendance date filter */}
      {screenActiveDatePicker && (
        <Modal
          visible={!!screenActiveDatePicker}
          animationType="slide"
          transparent
          onRequestClose={() => setScreenActiveDatePicker(null)}
        >
          <BlurView intensity={60} tint="dark" style={s.datePickerModalOverlay}>
            <View style={s.datePickerModalSheet}>
              <View style={s.datePickerModalHeader}>
                <Typography variant="h3" style={{ fontWeight: '800' }}>
                  Select {screenActiveDatePicker === 'start' ? 'From Date' : 'To Date'}
                </Typography>
                <TouchableOpacity onPress={() => { setScreenActiveDatePicker(null); setScreenTempDate(''); }}>
                  <X size={24} color={colors.text.muted} />
                </TouchableOpacity>
              </View>
              <View style={{ marginVertical: normalize(16) }}>
                <Calendar
                  current={screenTempDate || moment().format('YYYY-MM-DD')}
                  onDayPress={(day: any) => setScreenTempDate(day.dateString)}
                  markedDates={{ [screenTempDate]: { selected: true, selectedColor: colors.primary, selectedTextColor: colors.white } }}
                  theme={{
                    todayTextColor: colors.primary,
                    dayTextColor: colors.text.primary,
                    textDisabledColor: 'rgba(0,0,0,0.1)',
                    monthTextColor: colors.text.primary,
                    calendarBackground: 'transparent',
                    textDayFontFamily: 'DMSans-Medium',
                    textMonthFontFamily: 'DMSans-Bold',
                    textDayHeaderFontFamily: 'DMSans-Medium',
                  }}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: normalize(12), marginTop: normalize(16) }}>
                <TouchableOpacity
                  style={s.datePickerCancelBtn}
                  onPress={() => { setScreenActiveDatePicker(null); setScreenTempDate(''); }}
                >
                  <Typography style={{ fontWeight: '700', color: colors.text.secondary }}>Cancel</Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.datePickerSubmitBtn, !screenTempDate && { opacity: 0.5 }]}
                  onPress={() => {
                    if (screenActiveDatePicker === 'start') setDateFrom(screenTempDate);
                    else setDateTo(screenTempDate);
                    setScreenActiveDatePicker(null);
                    setScreenTempDate('');
                  }}
                  disabled={!screenTempDate}
                >
                  <Typography style={{ fontWeight: '700', color: colors.white }}>OK</Typography>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Modal>
      )}
    </View>
  );
};
