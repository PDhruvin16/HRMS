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
import {
  AttendanceLog,
  WFHRequest,
  OvertimeRequest,
  WFHApprovalRecord,
  AttendanceSummary,
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

  /* ── Permissions ─────────────────────────────────────────── */
  const slicePerms   = useSelector((state: RootState) => state.permission?.permissions);
  const authUserPerms = useSelector((state: RootState) => state.auth.user?.permissions);

  const permissions  = (slicePerms && slicePerms.length > 0) ? slicePerms : (authUserPerms || []);
  const hasPermission = (resource: string, action: string) =>
    permissions.some((p: any) => p.resource === resource && p.action === action);

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

  /* ── Queries (conditionally enabled by permission) ───────── */
  const { data: todayStatus, isLoading: todayLoading } =
    useTodayAttendanceStatusQuery({ enabled: hasPermission('attendance', 'view') });

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
    { enabled: hasPermission('attendance', 'view') },
  );

  const { data: wfhList      = [] } = useWFHRequestsQuery({ enabled: hasPermission('my_wfh', 'view') });
  const { data: otList       = [] } = useOvertimeRequestsQuery({ enabled: hasPermission('my_overtime', 'view') });
  const { data: wfhApprovals = [], refetch: refetchWFHApprovals } =
    useWFHApprovalsQuery({ enabled: hasPermission('attendance', 'approve') });

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
  } = useTeamAttendanceInfiniteQuery({ from: teamDateFrom, to: today });

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

    // Subtract today's stale server-partial if ongoing
    // (live timer will add accurate real-time values instead)
    const todayLog = logs.find((l) => l.date === todayStr);
    const isOngoingToday = todayLog && todayLog.rawPunchIn && !todayLog.rawPunchOut;
    if (isOngoingToday && todayLog) {
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

  /* ── Live summary (ticks every second while punched-in) ─── */
  const [liveSummary, setLiveSummary] = useState<AttendanceSummary | null>(null);

  useEffect(() => { if (summary) setLiveSummary(summary); }, [summary]);

  useEffect(() => {
    const todayLog  = logs.find((l) => l.date === today);
    const isOngoing = todayLog && todayLog.rawPunchIn && !todayLog.rawPunchOut;

    if (!isOngoing || !summary) {
      setLiveSummary(summary);
      return;
    }


    const tick = () => {
      const elapsedSecs    = getServerMoment().diff(moment(todayLog.rawPunchIn), 'seconds');
      const todayBreakSecs = parseHmsToSeconds(todayLog.breakTime);
      const targetSecs     = parseHmsToSeconds(todayLog.targetHours);
      const workedToday    = Math.max(0, elapsedSecs - todayBreakSecs);
      const otToday        = Math.max(0, workedToday - targetSecs);

      // Leaving time estimate: punchIn + target + break
      const targetForLeaving = targetSecs > 0 ? targetSecs : 8.5 * 3600;
      const leavingTime = moment(todayLog.rawPunchIn)
        .add(targetForLeaving + todayBreakSecs, 'seconds')
        .format('HH:mm:ss');

      // Incomplete hours count down as user works
      const baseIncompleteSecs = parseHmsToSeconds(summary.totalIncomplete);
      const maxDecrease        = Math.min(workedToday, targetSecs);
      const incompleteSecs     = Math.max(0, baseIncompleteSecs - maxDecrease);

      setLiveSummary({
        // summary base already excludes today's stale partial; add live real-time values
        totalWorking:    secondsToHmsString(parseHmsToSeconds(summary.totalWorking)  + workedToday),
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
      console.error(e);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
              onSuccess: async () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
              onError:   async (err) => { console.error(err); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); },
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
            <Typography style={{ fontSize: normalize(13), fontWeight: '800', color: colors.black, marginBottom: normalize(12), paddingHorizontal: normalize(4) }}>
              Filter Date Range
            </Typography>
            <View style={{ flexDirection: 'row', gap: normalize(12) }}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={s.dateFilterInput}
                onPress={async () => { await Haptics.selectionAsync(); setScreenTempDate(dateFrom); setScreenActiveDatePicker('start'); }}
              >
                <Typography style={s.dateFilterLabel}>FROM DATE</Typography>
                <Typography style={s.dateFilterValue}>{moment(dateFrom).format('MMM DD, YYYY')}</Typography>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={s.dateFilterInput}
                onPress={async () => { await Haptics.selectionAsync(); setScreenTempDate(dateTo || today); setScreenActiveDatePicker('end'); }}
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
    <Animated.View entering={FadeInDown.delay(50).springify()}>
      <StatusCountStrip data={wfhList} />
      <SearchBar value={wfhSearch} onChange={setWfhSearch} placeholder="Search by reason…" />
      {filteredWFH.length === 0
        ? <EmptyState message="No WFH requests found." />
        : filteredWFH.map((item, index) => (
            <WFHCard key={item.id} item={item} index={index} onDelete={setDeletingWFHRequest} />
          ))}
    </Animated.View>
  );

  /** My Overtime tab */
  const renderMyOT = () => (
    <Animated.View entering={FadeInDown.delay(50).springify()}>
      <StatusCountStrip data={otList} />
      <SearchBar value={otSearch} onChange={setOtSearch} placeholder="Search by reason…" />
      {filteredOT.length === 0
        ? <EmptyState message="No overtime requests found." />
        : filteredOT.map((item, index) => <OTCard key={item.id} item={item} index={index} />)}
    </Animated.View>
  );

  /** WFH Approvals tab */
  const renderWFHApprovals = () => (
    <Animated.View entering={FadeInDown.delay(50).springify()}>
      <SearchBar value={approvalsSearch} onChange={setApprovalsSearch} placeholder="Search by name, emp code, or reason…" />
      {filteredApprovals.length === 0
        ? <EmptyState message="No WFH approvals found." />
        : filteredApprovals.map((item, index) => (
            <WFHApprovalCard
              key={item.id}
              item={item}
              index={index}
              onApprove={() => handleApproveWFH(item)}
              onReject={() => handleRejectWFH(item)}
            />
          ))}
    </Animated.View>
  );

  /** Team tab header — view toggle + stat cards + search */
  const renderTeamHeader = () => (
    <View style={{ marginBottom: normalize(8) }}>
      {/* Title */}
      <View style={{ marginBottom: normalize(16) }}>
        <Typography style={{ fontSize: normalize(18), fontWeight: '900', color: colors.black }}>
          Team Attendance
        </Typography>
        <Typography style={{ fontSize: normalize(12), color: colors.text.secondary, fontWeight: '600', marginTop: normalize(2) }}>
          {teamViewType === 'today' ? "Today's attendance overview" : "Current month's log overview"}
        </Typography>
      </View>

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
  return (
    <View style={s.container}>
      <LinearGradient
        colors={['#F0F8FF', '#E6F0FA', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <CustomHeader
        variant={{ type: 'basic', title: 'Attendance' }}
        rightElement={
          activeTab === 'My Attendance' ? (
            <TouchableOpacity
              onPress={async () => { await Haptics.selectionAsync(); setCalendarOpen(!calendarOpen); }}
              style={{ padding: normalize(8), backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: normalize(8) }}
            >
              <CalendarRange size={normalize(20)} color={colors.primary} />
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
            keyExtractor={(item) => item.date}
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
                key={item.id || item.employeeId || `${item.empId}-${index}`}
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
          keyExtractor={(item, index) => item.id || item.employeeId || `${item.empId}-${index}`}
          emptyMessage="No records found matching filters."
        />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'My WFH'        && renderMyWFH()}
          {activeTab === 'My Overtime'   && renderMyOT()}
          {activeTab === 'WFH Approvals' && renderWFHApprovals()}
        </ScrollView>
      )}

      {/* ── Floating Action Button (WFH / OT creation) ───────── */}
      {((activeTab === 'My WFH' && hasPermission('my_wfh', 'add')) ||
        (activeTab === 'My Overtime' && hasPermission('my_overtime', 'add'))) && (
        <Animated.View entering={FadeInUp.springify()} style={s.fabWrap}>
          <TouchableOpacity
            style={s.fab}
            activeOpacity={0.85}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setModalType(activeTab === 'My WFH' ? 'WFH' : 'Overtime');
            }}
          >
            <LinearGradient
              colors={colors.loginButtonBgGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.fabGrad}
            >
              <Plus size={normalize(20)} color={colors.white} />
              <Typography style={s.fabText}>
                {activeTab === 'My WFH' ? 'New WFH' : 'New OT'}
              </Typography>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Modals ───────────────────────────────────────────── */}

      {modalType && (
        <NewRequestModal
          visible={!!modalType}
          type={modalType}
          onClose={() => setModalType(null)}
          onSubmit={async (data) => {
            if (modalType === 'WFH') {
              await createWFH({ fromDate: data.fromDate, toDate: data.toDate, days: 1, reason: data.reason });
            } else {
              await createOT({ date: data.fromDate, hours: data.hours, reason: data.reason });
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
            onError:   async (err) => { console.error(err); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); },
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
            onSuccess: async () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
            onError:   async (err) => { console.error(err); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); },
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
