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
  Clock, AlertTriangle, Hourglass, Zap, Activity, ChevronRight,
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
  Present: 'rgba(16, 185, 129, 0.12)',
  Late:    'rgba(245, 158, 11, 0.12)',
  Absent:  'rgba(239, 68, 68, 0.12)',
  Leave:   'rgba(139, 92, 246, 0.12)',
  WFH:     'rgba(59, 130, 246, 0.12)',
  Holiday: 'rgba(156, 163, 175, 0.12)',
};

const ISSUE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  'Late coming':      { label: 'Late',       icon: Clock,         color: colors.error },
  'Sequence missing': { label: 'Missing',    icon: AlertTriangle, color: colors.emailBlue },
  'Incomplete hours': { label: 'Incomplete', icon: Hourglass,     color: colors.warning },
  'Overtime':         { label: 'Overtime',   icon: Zap,           color: colors.success },
  'Ongoing':          { label: 'Ongoing',    icon: Activity,      color: colors.primary },
};

const StatusBadge = ({ status }: { status: string }) => {
  const sc = STATUS_COLOR[status] ?? colors.text.muted;
  const sb = STATUS_BG[status]   ?? 'rgba(156, 163, 175, 0.12)';
  return (
    <View style={[s.statusBadge, { backgroundColor: sb }]}>
      <View style={[s.statusDot, { backgroundColor: sc }]} />
      <Typography style={[s.statusBadgeText, { color: sc }]}>{status}</Typography>
    </View>
  );
};

const MicroIssueTag = ({ label }: { label: string }) => {
  const conf = ISSUE_CONFIG[label] || { label, icon: AlertTriangle, color: colors.text.muted };
  const IconComp = conf.icon;
  return (
    <View style={[s.microIconBadge, { backgroundColor: conf.color + '15', borderColor: conf.color + '30' }]}>
      <IconComp size={normalize(12)} color={conf.color} />
    </View>
  );
};

export const DayCard = ({ log, onPress, index }: { log: any; onPress: () => void; index: number }) => {
  const hasContent = log.checkIn || log.checkOut || log.workingHours !== '0:00:00' || log.firstPunchIn;
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
    if (issues.includes('Late coming')) return colors.error + '40';
    if (log.status === 'Absent') return colors.error + '35';
    if (issues.includes('Incomplete hours')) return colors.warning + '40';
    if (issues.includes('Sequence missing')) return colors.emailBlue + '40';
    if (log.status === 'WFH') return colors.emailBlue + '35';
    if (issues.includes('Overtime')) return colors.success + '40';
    if (log.status === 'Leave') return colors.primary + '35';
    if (log.status === 'Present') return colors.success + '30';
    return 'rgba(255,255,255,0.9)';
  };

  const borderColor = getCardBorderColor();

  return (
    <Animated.View entering={FadeInUp.delay(index * 35).springify()}>
      <BlurView intensity={60} tint="light" style={[s.dayCard, { borderColor }]}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={{ padding: normalize(14) }}>
          {/* Header Row */}
          <View style={s.dayCardHeaderRow}>
            <View style={s.headerLeft}>
              <Typography style={s.dayCardDate}>{log.dayLabel}</Typography>
              <StatusBadge status={log.status} />
              {log.leaveType && (
                <View style={s.leavePill}>
                  <Typography style={s.leavePillText}>🌴 {log.leaveType}</Typography>
                </View>
              )}
            </View>
            <View style={s.headerRight}>
              {log.issues?.map((iss: string) => <MicroIssueTag key={iss} label={iss} />)}
              <ChevronRight size={normalize(16)} color={colors.text.muted} style={{ marginLeft: normalize(2) }} />
            </View>
          </View>

          {/* Unified Compact Metrics Strip */}
          {hasContent && (
            <View style={s.metricsStrip}>
              <View style={s.metricCol}>
                <Typography style={s.metricLbl}>IN</Typography>
                <Typography style={s.metricVal} numberOfLines={1}>{log.firstPunchIn || '--:--'}</Typography>
              </View>
              <View style={s.metricDivider} />
              <View style={s.metricCol}>
                <Typography style={s.metricLbl}>OUT</Typography>
                <Typography style={s.metricVal} numberOfLines={1}>{log.lastPunchOut || '--:--'}</Typography>
              </View>
              <View style={s.metricDivider} />
              <View style={s.metricCol}>
                <Typography style={s.metricLbl}>WORKED</Typography>
                <Typography style={[s.metricVal, { color: colors.primary }]} numberOfLines={1}>
                  {isOngoing ? liveWorked : (log.workingHours || '--:--:--')}
                </Typography>
              </View>
              <View style={s.metricDivider} />
              <View style={s.metricCol}>
                <Typography style={s.metricLbl}>OVERTIME</Typography>
                <Typography
                  style={[
                    s.metricVal,
                    (isOngoing ? liveOvertime : log.overtime) !== '0:00:00' && { color: colors.warning },
                  ]}
                  numberOfLines={1}
                >
                  {isOngoing ? liveOvertime : (log.overtime || '0:00:00')}
                </Typography>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  dayCard: {
    borderRadius: normalize(20),
    marginBottom: normalize(12),
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dayCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    flexWrap: 'wrap',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  dayCardDate: {
    fontSize: normalize(14),
    fontWeight: '800',
    color: colors.black,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(8),
    gap: normalize(4),
  },
  statusDot: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
  },
  statusBadgeText: {
    fontSize: normalize(10),
    fontWeight: '700',
  },
  leavePill: {
    backgroundColor: colors.primary + '12',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: normalize(6),
    borderWidth: 1,
    borderColor: colors.primary + '25',
  },
  leavePillText: {
    fontSize: normalize(10),
    color: colors.primary,
    fontWeight: '700',
  },
  microIconBadge: {
    width: normalize(26),
    height: normalize(26),
    borderRadius: normalize(8),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: normalize(12),
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(10),
    marginTop: normalize(10),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: normalize(18),
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  metricLbl: {
    fontSize: normalize(8),
    fontWeight: '800',
    color: colors.text.secondary,
    marginBottom: normalize(2),
    letterSpacing: 0.3,
  },
  metricVal: {
    fontSize: normalize(12),
    fontWeight: '800',
    color: colors.black,
  },
});
