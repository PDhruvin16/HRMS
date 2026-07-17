// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  Clock, LogIn, LogOut, ChevronDown, ChevronUp, Target,
} from 'lucide-react-native';
import { normalize } from '../../utils/responsive';
import colors from '../../theme/color';
import { Typography } from '../../components/Typography';
import { getServerMoment } from '../../services/api';

const STATUS_COLOR: Record<string, string> = {
  Present: colors.success,
  Late:    colors.warning,
  Absent:  colors.error,
  Leave:   colors.primary,
  WFH:     colors.emailBlue,
  Holiday: colors.text.muted,
};

const STATUS_BG: Record<string, string> = {
  Present: 'rgba(16, 185, 129, 0.1)',
  Late:    'rgba(245, 158, 11, 0.1)',
  Absent:  'rgba(239, 68, 68, 0.1)',
  Leave:   'rgba(139, 92, 246, 0.1)',
  WFH:     'rgba(59, 130, 246, 0.1)',
  Holiday: 'rgba(156, 163, 175, 0.1)',
};

const ISSUE_COLOR: Record<string, string> = {
  'Incomplete hours': colors.warning,
  'Sequence missing': colors.emailBlue,
  'Ongoing':          colors.primary,
  'Late coming':      colors.error,
  'Overtime':         colors.success,
};

const StatusBadge = ({ status }: { status: string }) => {
  const sc = STATUS_COLOR[status] ?? colors.text.muted;
  const sb = STATUS_BG[status]   ?? 'rgba(156, 163, 175, 0.1)';
  return (
    <View style={[s.statusBadge, { backgroundColor: sb }]}>
      <View style={[s.statusDot, { backgroundColor: sc }]} />
      <Typography style={[s.statusBadgeText, { color: sc }]}>{status}</Typography>
    </View>
  );
};

const IssueTag = ({ label }: { label: string }) => {
  const c = ISSUE_COLOR[label] ?? colors.text.muted;
  return (
    <View style={[s.issueTag, { borderColor: c + '50', backgroundColor: c + '12' }]}>
      <Typography style={[s.issueTagText, { color: c }]}>{label}</Typography>
    </View>
  );
};

export const DayCard = ({ log, onPress, index }: { log: any; onPress: () => void; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const hasIssues = log.issues && log.issues.length > 0;
  const hasContent = log.checkIn || log.checkOut || log.workingHours !== '0:00:00';

  const isToday = log.date === getServerMoment().format('YYYY-MM-DD');
  const isOngoing = isToday && log.rawPunchIn && !log.rawPunchOut;

  const [liveWorked, setLiveWorked] = useState(log.workingHours);
  const [liveOvertime, setLiveOvertime] = useState(log.overtime);

  useEffect(() => {
    if (!isOngoing) {
      setLiveWorked(log.workingHours);
      setLiveOvertime(log.overtime);
      return;
    }

    const parseTimeToMs = (timeStr: string): number => {
      if (!timeStr) return 0;
      const parts = timeStr.split(':').map(Number);
      if (parts.length === 3) {
        return ((parts[0] * 3600) + (parts[1] * 60) + parts[2]) * 1000;
      }
      return 0;
    };

    const formatMsToHms = (ms: number): string => {
      const totalSecs = Math.floor(ms / 1000);
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const updateTimer = () => {
      const punchInMoment = moment(log.rawPunchIn);
      const now = getServerMoment();
      const diffMs = now.diff(punchInMoment);
      const breakMs = parseTimeToMs(log.breakTime);
      const targetMs = parseTimeToMs(log.targetHours);

      const workedMs = Math.max(0, diffMs - breakMs);
      setLiveWorked(formatMsToHms(workedMs));

      if (workedMs > targetMs) {
        setLiveOvertime(formatMsToHms(workedMs - targetMs));
      } else {
        setLiveOvertime('00:00:00');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOngoing, log.rawPunchIn, log.workingHours, log.overtime, log.breakTime, log.targetHours]);

  const getCardBorderColor = () => {
    const issues = log.issues || [];
    if (issues.includes('Late coming')) return colors.error + '45';
    if (log.status === 'Absent') return colors.error + '40';
    if (issues.includes('Incomplete hours')) return colors.warning + '45';
    if (issues.includes('Sequence missing')) return colors.emailBlue + '45';
    if (log.status === 'WFH') return colors.emailBlue + '40';
    if (issues.includes('Overtime')) return colors.success + '45';
    if (log.status === 'Leave') return colors.primary + '40';
    if (log.status === 'Present') return colors.success + '35';
    return 'rgba(255,255,255,0.9)';
  };

  const borderColor = getCardBorderColor();

  return (
    <Animated.View entering={FadeInUp.delay(index * 50).springify()}>
      <BlurView intensity={50} tint="light" style={[s.dayCard, { borderColor }]}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
          <View style={s.dayCardHeaderRow}>
            <View style={s.headerLeft}>
              <Typography style={s.dayCardDate}>{log.dayLabel}</Typography>
              <StatusBadge status={log.status} />
            </View>
            <View style={s.headerRight}>
              {log.issues?.map((iss) => <IssueTag key={iss} label={iss} />)}
            </View>
          </View>

          {log.leaveType && (
            <View style={{ marginTop: normalize(8), marginBottom: normalize(10), flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: colors.primary + '12', paddingHorizontal: normalize(8), paddingVertical: normalize(4), borderRadius: normalize(6), borderWidth: 1, borderColor: colors.primary + '30' }}>
                <Typography style={{ fontSize: normalize(11), color: colors.primary, fontWeight: '700' }}>
                  🌴 {log.leaveType}
                </Typography>
              </View>
            </View>
          )}

          {hasContent && (
            <>
              <View style={s.statsBlock}>
                <View style={s.statItem}>
                  <View style={s.statLabelRow}>
                    <Clock size={normalize(10)} color={colors.text.secondary} />
                    <Typography style={s.statLbl}>WORKED</Typography>
                  </View>
                  <Typography style={[s.statVal, { color: colors.primary }]}>{isOngoing ? liveWorked : (log.workingHours || '--:--:--')}</Typography>
                </View>
                <View style={s.statItem}>
                  <View style={s.statLabelRow}>
                    <Target size={normalize(10)} color={colors.text.secondary} />
                    <Typography style={s.statLbl}>TARGET</Typography>
                  </View>
                  <Typography style={s.statVal}>{log.targetHours}</Typography>
                </View>
                <View style={s.statItem}>
                  <View style={s.statLabelRow}>
                    <Typography style={s.statLbl}>OVERTIME</Typography>
                    <Clock size={normalize(10)} color={colors.text.secondary} />
                  </View>
                  <Typography style={[s.statVal, (isOngoing ? liveOvertime : log.overtime) !== '0:00:00' && { color: colors.warning }]}>
                    {isOngoing ? liveOvertime : (log.overtime || '--:--:--')}
                  </Typography>
                </View>
              </View>

              <View style={s.punchInOutRow}>
                <View style={s.punchBox}>
                  <View style={s.punchLabelRow}>
                    <Typography style={s.punchLbl}>IN</Typography>
                    <LogIn size={normalize(10)} color={colors.text.secondary} />
                  </View>
                  <Typography style={s.punchVal}>{log.firstPunchIn || '--:--'}</Typography>
                </View>
                <View style={s.punchBox}>
                  <View style={s.punchLabelRow}>
                    <Typography style={s.punchLbl}>OUT</Typography>
                    <LogOut size={normalize(10)} color={colors.text.secondary} />
                  </View>
                  <Typography style={s.punchVal}>{log.lastPunchOut || '--:--'}</Typography>
                </View>
              </View>
            </>
          )}

          {hasContent && (
            <>
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => setExpanded(!expanded)} 
                style={s.accordionBtn}
              >
                <Typography style={s.accordionBtnText}>{expanded ? 'Hide Details' : 'Show Details'}</Typography>
                {expanded ? <ChevronUp size={normalize(14)} color={colors.primary} /> : <ChevronDown size={normalize(14)} color={colors.primary} />}
              </TouchableOpacity>

              {expanded && (
                <Animated.View entering={FadeInUp.duration(200)} style={s.detailGridBox}>
                  <View style={s.detailRowCol}>
                    <View style={s.detailCell}>
                      <Typography style={s.detailLbl}>First punch</Typography>
                      <Typography style={s.detailVal}>{log.firstPunchIn || '--:--'}</Typography>
                    </View>
                    <View style={s.detailCell}>
                      <Typography style={s.detailLbl}>Last punch</Typography>
                      <Typography style={s.detailVal}>{log.lastPunchOut || '--:--'}</Typography>
                    </View>
                  </View>
                  <View style={s.detailRowCol}>
                    <View style={s.detailCell}>
                      <Typography style={s.detailLbl}>Target hours</Typography>
                      <Typography style={s.detailVal}>{log.targetHours}</Typography>
                    </View>
                    <View style={s.detailCell}>
                      <Typography style={s.detailLbl}>Break time</Typography>
                      <Typography style={s.detailVal}>{log.breakTime}</Typography>
                    </View>
                  </View>
                  <View style={s.detailRowCol}>
                    <View style={s.detailCell}>
                      <Typography style={s.detailLbl}>Effective hours</Typography>
                      <Typography style={s.detailVal}>{isOngoing ? liveWorked : log.effectiveHours}</Typography>
                    </View>
                    <View style={s.detailCell}>
                      <Typography style={s.detailLbl}>Overtime</Typography>
                      <Typography style={[s.detailVal, (isOngoing ? liveOvertime : log.overtime) !== '0:00:00' && { color: colors.success }]}>
                        {isOngoing ? liveOvertime : log.overtime}
                      </Typography>
                    </View>
                  </View>
                  <View style={s.detailRowCol}>
                    <View style={s.detailCell}>
                      <Typography style={s.detailLbl}>Total hours</Typography>
                      <Typography style={[s.detailVal, { color: colors.primary }]}>
                        {isOngoing ? liveWorked : log.workingHours}
                      </Typography>
                    </View>
                    <View style={s.detailCell} />
                  </View>
                </Animated.View>
              )}
            </>
          )}
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );
};

const s = StyleSheet.create({
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
});
