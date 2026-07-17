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
const PunchSequenceModal = ({
  visible, log, onClose,
}: { visible: boolean; log: any | null; onClose: () => void }) => {
  if (!log) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <BlurView intensity={40} tint="dark" style={s.datePickerModalOverlay}>
        <View style={[s.modalSheet, { maxHeight: '80%' }]}>
          <View style={s.modalHandle} />
          <View style={s.modalTopRow}>
            <Typography style={s.modalTitle}>{moment(log.date).format('dddd, DD MMM YYYY')}</Typography>
            <TouchableOpacity onPress={onClose} style={s.modalCloseBtn}>
              <X size={normalize(18)} color={colors.black} />
            </TouchableOpacity>
          </View>
          
          <View style={s.punchTableHeader}>
            <Typography style={[s.th, { flex: 0.5 }]}>#</Typography>
            <Typography style={[s.th, { flex: 1 }]}>TYPE</Typography>
            <Typography style={[s.th, { flex: 1.5 }]}>SOURCE</Typography>
            <Typography style={[s.th, { flex: 2, textAlign: 'right' }]}>TIME</Typography>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }}>
            {(!log.punches || log.punches.length === 0) ? (
              <View style={{ paddingVertical: normalize(20), alignItems: 'center' }}>
                <Typography style={{ color: colors.text.secondary }}>No punch records for this day.</Typography>
              </View>
            ) : (
              log.punches.map((p, i) => (
                <View key={p.id} style={s.punchTableRow}>
                  <Typography style={[s.td, { flex: 0.5, color: colors.text.muted }]}>#{i + 1}</Typography>
                  <View style={[s.td, { flex: 1 }]}>
                    <View style={[s.statusBadge, { backgroundColor: p.type === 'IN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)', paddingVertical: 2, paddingHorizontal: 6 }]}>
                      <Typography style={[s.statusBadgeText, { fontSize: normalize(10), color: p.type === 'IN' ? colors.success : colors.text.secondary }]}>{p.type}</Typography>
                    </View>
                  </View>
                  <Typography style={[s.td, { flex: 1.5 }]}>{p.source}</Typography>
                  <Typography style={[s.td, { flex: 2, textAlign: 'right', fontWeight: '600' }]}>{p.time}</Typography>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity activeOpacity={0.85} onPress={onClose} style={{ marginTop: normalize(16) }}>
            <View style={s.closeOutlineBtn}>
              <Typography style={s.closeOutlineBtnText}>Close</Typography>
            </View>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

const { width: SW } = Dimensions.get('window');

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) => (
  <BlurView intensity={90} tint="light" style={[s.statCard, { borderColor: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(255,255,255,0.75)', position: 'relative', overflow: 'hidden' }]}>
    <View style={{ position: 'absolute', right: -normalize(10), bottom: -normalize(10), opacity: 0.08, transform: [{ scale: 1.5 }] }}>
      {React.cloneElement(icon as React.ReactElement, { size: normalize(60), color: color })}
    </View>
    <View style={[s.statIconWrap, { backgroundColor: color + '18' }]}>{icon}</View>
    <Typography style={[s.statValue, { color }]}>{value}</Typography>
    <Typography style={s.statLabel} numberOfLines={2}>{label}</Typography>
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

  const summary = useMemo(() => {
    return infiniteData?.pages[0]?.summary ?? null;
  }, [infiniteData]);

  const [liveSummary, setLiveSummary] = useState<any | null>(null);

  useEffect(() => {
    if (summary) {
      setLiveSummary(summary);
    }
  }, [summary]);

  useEffect(() => {
    const todayStr = getServerMoment().format('YYYY-MM-DD');
    const todayLog = logs.find((l) => l.date === todayStr);
    const isOngoing = todayLog && todayLog.rawPunchIn && !todayLog.rawPunchOut;

    if (!isOngoing || !summary) {
      setLiveSummary(summary);
      return;
    }

    const parseHmsToSeconds = (hmsStr: string): number => {
      if (!hmsStr) return 0;
      const parts = hmsStr.split(':').map(Number);
      if (parts.length === 3) {
        return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
      }
      return 0;
    };

    const secondsToHmsString = (totalSecs: number): string => {
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const updateSummaryTimer = () => {
      const punchInMoment = moment(todayLog.rawPunchIn);
      const elapsedSecs = getServerMoment().diff(punchInMoment, 'seconds');
      const breakSecs = parseHmsToSeconds(todayLog.breakTime);
      const targetSecs = parseHmsToSeconds(todayLog.targetHours);

      const workedSecsToday = Math.max(0, elapsedSecs - breakSecs);
      const overtimeSecsToday = Math.max(0, workedSecsToday - targetSecs);

      const totalWorkingSecs = parseHmsToSeconds(summary.totalWorking) + workedSecsToday;
      const totalOvertimeSecs = parseHmsToSeconds(summary.totalOvertime) + overtimeSecsToday;

      const baseIncompleteSecs = parseHmsToSeconds(summary.totalIncomplete);
      const maxDecrease = Math.min(workedSecsToday, targetSecs);
      const totalIncompleteSecs = Math.max(0, baseIncompleteSecs - maxDecrease);

      setLiveSummary({
        totalWorking: secondsToHmsString(totalWorkingSecs),
        totalOvertime: secondsToHmsString(totalOvertimeSecs),
        totalBreak: summary.totalBreak,
        totalIncomplete: secondsToHmsString(totalIncompleteSecs),
        todayLeavingTime: '',
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
            <StatCard icon={<TrendingUp size={normalize(18)} color={colors.primary} />}  label="Working"    value={liveSummary.totalWorking}    color={colors.primary} />
            <StatCard icon={<Zap        size={normalize(18)} color={colors.warning} />}  label="Overtime"   value={liveSummary.totalOvertime}   color={colors.warning} />
            <StatCard icon={<Coffee     size={normalize(18)} color={colors.emailBlue} />}label="Break"      value={liveSummary.totalBreak}      color={colors.emailBlue} />
            <StatCard icon={<Hourglass  size={normalize(18)} color={colors.error} />}    label="Incomplete" value={liveSummary.totalIncomplete}  color={colors.error} />
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
          emptyMessage="No attendance records found."
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
  statCard:     { borderRadius: normalize(24), padding: normalize(20), alignItems: 'center', width: normalize(120), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  statIconWrap: { width: normalize(42), height: normalize(42), borderRadius: normalize(12), alignItems: 'center', justifyContent: 'center', marginBottom: normalize(10) },
  statValue:    { fontSize: normalize(18), fontWeight: '900', marginBottom: normalize(4) },
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
