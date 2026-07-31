// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Clock, LogIn, LogOut, TrendingUp, CalendarRange,
  AlertCircle, ChevronDown, ChevronRight, ChevronUp,
  X, Coffee, Zap, Hourglass, Sun, Target, ChevronLeft,
} from 'lucide-react-native';
import { normalize } from '../../utils/responsive';
import colors from '../../theme/color';
import { Typography } from '../../components/Typography';
import CustomHeader from '../../components/Header';
import { InfiniteList } from '../../components/InfiniteList';
import { useEmployeeAttendanceInfiniteQuery } from '../../hooks/useQueries';
import { getServerMoment } from '../../services/api';
import { DayCard } from './DayCard';
import { PunchSequenceModal } from './AttendanceComponents';

const { width: SW } = Dimensions.get('window');

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) => (
  <BlurView intensity={90} tint="light" style={[s.statCard, { borderColor: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(255,255,255,0.75)', position: 'relative', overflow: 'hidden' }]}>
    <View style={{ position: 'absolute', right: -normalize(10), bottom: -normalize(10), opacity: 0.08, transform: [{ scale: 1.5 }] }}>
      {React.cloneElement(icon as React.ReactElement, { size: normalize(60), color: color })}
    </View>
    <View style={[s.statIconWrap, { backgroundColor: color + '18' }]}>{icon}</View>
    <Typography
      style={[s.statValue, { color }]}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.7}
    >
      {value}
    </Typography>
    <Typography style={s.statLabel} numberOfLines={1}>{label}</Typography>
  </BlurView>
);

const EmptyState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <BlurView intensity={40} tint="light" style={s.emptyWrap}>
    <View style={s.emptyCircle}><AlertCircle size={normalize(26)} color={colors.text.muted} /></View>
    <Typography style={s.emptyText}>{message}</Typography>
    {onRetry && (
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={onRetry} 
        style={{ 
          marginTop: normalize(14), 
          paddingHorizontal: normalize(20), 
          paddingVertical: normalize(10), 
          backgroundColor: colors.primary, 
          borderRadius: normalize(12) 
        }}
      >
        <Typography style={{ color: colors.white, fontWeight: '800', fontSize: normalize(13) }}>
          Retry Connection
        </Typography>
      </TouchableOpacity>
    )}
  </BlurView>
);

export const EmployeeAttendanceScreen: React.FC = () => {
  const router = useRouter();
  const { employeeId, employeeName, date } = useLocalSearchParams<{ employeeId: string; employeeName: string; date?: string }>();

  const [dateFrom, setDateFrom] = useState(() => date || moment().format('YYYY-MM-DD'));
  const [dateTo, setDateTo] = useState(() => date || moment().format('YYYY-MM-DD'));

  useEffect(() => {
    if (date) {
      setDateFrom(date);
      setDateTo(date);
    }
  }, [date]);
  
  const [selectedLogForModal, setSelectedLogForModal] = useState<any | null>(null);
  const [screenActiveDatePicker, setScreenActiveDatePicker] = useState<'start' | 'end' | null>(null);
  const [screenTempDate, setScreenTempDate] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const {
    data: infiniteData,
    isLoading: logsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
    isError,
  } = useEmployeeAttendanceInfiniteQuery(employeeId, dateFrom, dateTo);

  const logs = useMemo(() => {
    return infiniteData?.pages.flatMap((page) => page.logs) ?? [];
  }, [infiniteData]);

  const parseHmsToSeconds = (hmsStr: string): number => {
    if (!hmsStr) return 0;
    const parts = hmsStr.split(':').map(Number);
    if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    if (parts.length === 2) return (parts[0] * 3600) + (parts[1] * 60);
    return 0;
  };

  const secondsToHmsString = (totalSecs: number): string => {
    const total = Math.max(0, totalSecs);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const summary = useMemo(() => {
    const serverSummary = infiniteData?.pages[0]?.summary;
    if (!serverSummary) return null;
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

  const [liveSummary, setLiveSummary] = useState<any | null>(null);

  useEffect(() => {
    if (summary) {
      setLiveSummary(summary);
    }
  }, [summary]);

  useEffect(() => {
    const todayStr = getServerMoment().format('YYYY-MM-DD');
    const todayLog = logs.find((l) => l.date === todayStr);
    const hasPunchedToday = Boolean(todayLog && (todayLog.rawPunchIn || todayLog.firstPunchIn));

    if (!hasPunchedToday || !summary || !todayLog) {
      setLiveSummary(summary);
      return;
    }

    const updateSummaryTimer = () => {
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

      const baseIncompleteSecs  = parseHmsToSeconds(summary.totalIncomplete);
      const serverWorkedSecs    = parseHmsToSeconds(todayLog.workingHours);
      const liveWorkedDelta     = isWorking ? Math.max(0, todayWorkedSecs - serverWorkedSecs) : 0;
      const totalIncompleteSecs = Math.max(0, baseIncompleteSecs - liveWorkedDelta);

      setLiveSummary({
        totalWorking:    secondsToHmsString(parseHmsToSeconds(summary.totalWorking)  + todayWorkedSecs),
        totalOvertime:   secondsToHmsString(parseHmsToSeconds(summary.totalOvertime) + otToday),
        totalBreak:      secondsToHmsString(parseHmsToSeconds(summary.totalBreak)    + todayBreakSecs),
        totalIncomplete: secondsToHmsString(totalIncompleteSecs),
        todayLeavingTime: leavingTime,
      });
    };

    updateSummaryTimer();
    const interval = setInterval(updateSummaryTimer, 1000);
    return () => clearInterval(interval);
  }, [logs, summary]);

  const renderAttendanceHeader = () => (
    <View style={{ marginBottom: normalize(8) }}>
      {liveSummary && (
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statScroll}>
            <StatCard icon={<TrendingUp size={normalize(18)} color={colors.primary} />}  label="Working"    value={liveSummary.totalWorking}     color={colors.primary} />
            <StatCard icon={<Zap        size={normalize(18)} color={colors.warning} />}  label="Overtime"   value={liveSummary.totalOvertime}    color={colors.warning} />
            <StatCard icon={<Coffee     size={normalize(18)} color={colors.emailBlue} />}label="Break"      value={liveSummary.totalBreak}       color={colors.emailBlue} />
            <StatCard icon={<Hourglass  size={normalize(18)} color={colors.error} />}    label="Incomplete" value={liveSummary.totalIncomplete}  color={colors.error} />
            <StatCard icon={<Sun        size={normalize(18)} color={colors.success} />}  label="Leaving"    value={liveSummary.todayLeavingTime} color={colors.success} />
          </ScrollView>
        </Animated.View>
      )}

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
                  setScreenTempDate(dateTo);
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

  const renderLogSkeleton = () => (
    <View style={[s.dayCard, { opacity: 0.5, height: normalize(120), justifyContent: 'center' }]}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );

  return (
    <View style={s.container}>
      <LinearGradient
        colors={['#F0F8FF', '#E6F0FA', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <CustomHeader 
        variant={{ type: 'basic', title: employeeName || 'Employee logs' }}
        leftElement={
          <TouchableOpacity onPress={() => router.back()} style={{ padding: normalize(8), backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: normalize(8) }}>
            <ChevronLeft size={normalize(20)} color={colors.primary} />
          </TouchableOpacity>
        }
        rightElement={
          <TouchableOpacity onPress={async () => { await Haptics.selectionAsync(); setCalendarOpen(!calendarOpen); }} style={{ padding: normalize(8), backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: normalize(8) }}>
            <CalendarRange size={normalize(20)} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      {isError && logs.length === 0 ? (
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
            <DayCard
              log={item}
              index={index}
              onPress={() => setSelectedLogForModal(item)}
            />
          )}
          renderSkeleton={renderLogSkeleton}
          ListHeaderComponent={renderAttendanceHeader()}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.date}
          emptyMessage={isError ? "Failed to load attendance records. Please check server or network connection." : "No attendance records found."}
        />
      )}

      <PunchSequenceModal 
        visible={!!selectedLogForModal}
        log={selectedLogForModal}
        onClose={() => setSelectedLogForModal(null)}
      />

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
                  markedDates={{
                    [screenTempDate]: { selected: true, selectedColor: colors.primary, selectedTextColor: colors.white }
                  }}
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
                 <TouchableOpacity style={s.datePickerCancelBtn} onPress={() => { setScreenActiveDatePicker(null); setScreenTempDate(''); }}>
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content:   { paddingHorizontal: normalize(16), paddingTop: normalize(16), paddingBottom: normalize(120) },

  /* ── Stats scroll ────────────────────────────────────────── */
  statScroll:   { gap: normalize(12), paddingBottom: normalize(4), marginBottom: normalize(16) },
  statCard:     { borderRadius: normalize(24), paddingHorizontal: normalize(10), paddingVertical: normalize(16), alignItems: 'center', width: normalize(124), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  statIconWrap: { width: normalize(42), height: normalize(42), borderRadius: normalize(12), alignItems: 'center', justifyContent: 'center', marginBottom: normalize(10) },
  statValue:    { fontSize: normalize(17), fontWeight: '900', marginBottom: normalize(4), textAlign: 'center', width: '100%' },
  statLabel:    { fontSize: normalize(11), color: colors.text.secondary, fontWeight: '800', textAlign: 'center' },

  /* ── Day log card ────────────────────────────────────────── */
  dayCard:         { borderRadius: normalize(24), padding: normalize(18), marginBottom: normalize(16), borderWidth: 1.5, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.45)' },
  dayCardHeaderRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft:      { flexDirection: 'row', alignItems: 'center', gap: normalize(8) },
  headerRight:     { flexDirection: 'row', alignItems: 'center', gap: normalize(6) },
  dayCardDate:     { fontSize: normalize(15), fontWeight: '800', color: colors.black },
  statusBadge:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(8), paddingVertical: normalize(4), borderRadius: normalize(10), gap: normalize(4) },
  statusDot:       { width: normalize(6), height: normalize(6), borderRadius: normalize(3) },
  statusBadgeText: { fontSize: normalize(10), fontWeight: '700' },

  issueTag:      { paddingHorizontal: normalize(6), paddingVertical: normalize(2), borderRadius: normalize(6), borderWidth: 1 },
  issueTagText:  { fontSize: normalize(9), fontWeight: '700' },

  statsBlock: { flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', borderRadius: normalize(8), padding: normalize(10), marginBottom: normalize(8), marginTop: normalize(12) },
  statItem:   { alignItems: 'center', flex: 1 },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: normalize(3), marginBottom: normalize(4) },
  statLbl:    { fontSize: normalize(9), color: colors.text.secondary, fontWeight: '800' },
  statVal:    { fontSize: normalize(13), fontWeight: '800', color: colors.black },

  punchInOutRow: { flexDirection: 'row', gap: normalize(10) },
  punchBox:      { flex: 1, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: normalize(8), padding: normalize(8), borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  punchLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(4) },
  punchLbl:      { fontSize: normalize(9), fontWeight: '800', color: colors.text.secondary },
  punchVal:      { fontSize: normalize(13), fontWeight: '800', color: colors.black },

  accordionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: normalize(12), gap: normalize(4) },
  accordionBtnText: { fontSize: normalize(12), color: colors.primary, fontWeight: '700' },

  detailGridBox: { marginTop: normalize(12), borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: normalize(12), gap: normalize(10) },
  detailRowCol:  { flexDirection: 'row', gap: normalize(10) },
  detailCell:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: normalize(8), padding: normalize(8) },
  detailLbl:     { fontSize: normalize(9), color: colors.text.secondary, fontWeight: '700', marginBottom: normalize(2) },
  detailVal:     { fontSize: normalize(12), fontWeight: '800', color: colors.black },

  /* ── Calendar picker card ────────────────────────────────── */
  calendarCard:   { borderRadius: normalize(20), padding: normalize(14), marginBottom: normalize(16), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  datePickerGrid: { flexDirection: 'row', gap: normalize(10) },
  dateFilterBox:  { flex: 1, backgroundColor: colors.white, borderRadius: normalize(12), padding: normalize(10), borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  dateFilterLabel:{ fontSize: normalize(9), fontWeight: '800', color: colors.text.secondary, marginBottom: normalize(2) },
  dateFilterValue:{ fontSize: normalize(12), fontWeight: '700', color: colors.primary },

  /* ── Section header row ──────────────────────────────────── */
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: normalize(12) },
  sectionTitle:     { fontSize: normalize(17), fontWeight: '850', color: colors.black },
  sectionSub:       { fontSize: normalize(12), color: colors.text.secondary, fontWeight: '700' },

  /* ── Date picker sheets ─────────────────────────────────── */
  datePickerModalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  datePickerModalSheet:   { backgroundColor: colors.white, borderTopLeftRadius: normalize(24), borderTopRightRadius: normalize(24), padding: normalize(20) },
  datePickerModalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(10) },
  datePickerCancelBtn:    { flex: 1, paddingVertical: normalize(12), borderRadius: normalize(12), borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', alignItems: 'center' },
  datePickerSubmitBtn:    { flex: 1, paddingVertical: normalize(12), borderRadius: normalize(12), backgroundColor: colors.primary, alignItems: 'center' },

  /* ── Modal & Table styles ───────────────────────────────── */
  modalOverlay:        { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:          { backgroundColor: colors.white, borderTopLeftRadius: normalize(32), borderTopRightRadius: normalize(32), padding: normalize(24), maxHeight: '85%' },
  modalHandle:         { width: normalize(48), height: normalize(5), borderRadius: normalize(3), backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center', marginBottom: normalize(22) },
  modalTopRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: normalize(24) },
  modalTitle:          { fontSize: normalize(20), fontWeight: '800', color: colors.black },
  modalCloseBtn:       { width: normalize(36), height: normalize(36), borderRadius: normalize(18), backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  punchTableHeader:    { flexDirection: 'row', borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.05)', paddingBottom: normalize(8), marginBottom: normalize(8) },
  th:                  { fontSize: normalize(11), fontWeight: '800', color: colors.text.muted },
  punchTableRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: normalize(10), borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  td:                  { fontSize: normalize(13), color: colors.black, fontWeight: '600' },
  closeOutlineBtn:     { padding: normalize(12), borderRadius: normalize(10), borderWidth: 1, borderColor: colors.primary, alignItems: 'center' },
  closeOutlineBtnText: { color: colors.primary, fontWeight: '800', fontSize: normalize(14) },

  /* ── Empty state ─────────────────────────────────────────── */
  emptyWrap:           { alignItems: 'center', paddingVertical: normalize(50), borderRadius: normalize(24), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.3)', marginTop: normalize(10) },
  emptyCircle:         { width: normalize(64), height: normalize(64), borderRadius: normalize(32), backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', marginBottom: normalize(16) },
  emptyText:           { color: colors.text.secondary, fontSize: normalize(14), textAlign: 'center', fontWeight: '600' },
});
