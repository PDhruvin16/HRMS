// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  Clock, AlertTriangle, Hourglass, Zap, Activity, ChevronRight, Plus,
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

const OT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  approved: { label: 'OT Approved', color: colors.success, bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)' },
  pending:  { label: 'OT Pending',  color: colors.warning, bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)' },
  rejected: { label: 'OT Rejected', color: colors.error,   bg: 'rgba(239, 68, 68, 0.12)',  border: 'rgba(239, 68, 68, 0.25)' },
};

const OvertimeStatusPill = ({ status }: { status: string }) => {
  if (!status) return null;
  const key = String(status).trim().toLowerCase();
  const conf = OT_STATUS_CONFIG[key] || {
    label: `OT: ${String(status).charAt(0).toUpperCase() + String(status).slice(1)}`,
    color: colors.primary,
    bg: colors.primary + '15',
    border: colors.primary + '30',
  };
  return (
    <View style={[s.otStatusPill, { backgroundColor: conf.bg, borderColor: conf.border }]}>
      <Zap size={normalize(10)} color={conf.color} />
      <Typography style={[s.otStatusPillText, { color: conf.color }]}>
        {conf.label}
      </Typography>
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

export const DayCard = ({
  log, onPress, index, onAddOvertime,
}: {
  log: any; onPress: () => void; index: number; onAddOvertime?: (log: any) => void;
}) => {
  const hasContent = Boolean(log.checkIn || log.checkOut || log.workingHours !== '0:00:00' || log.firstPunchIn || log.rawPunchIn);
  const isToday = log.date === getServerMoment().format('YYYY-MM-DD');
  const lastPunch = log.punches && log.punches.length > 0 ? log.punches[log.punches.length - 1] : null;
  const isLastPunchIn = lastPunch ? lastPunch.type === 'IN' : Boolean(log.rawPunchIn && !log.rawPunchOut);
  const isOngoing = Boolean(isToday && isLastPunchIn);

  const displayDate = useMemo(() => {
    if (log?.date) {
      const m = moment(log.date);
      if (m.isValid()) return m.format('ddd DD MMM');
    }
    return log?.dayLabel || '';
  }, [log?.date, log?.dayLabel]);

  const [liveWorked, setLiveWorked] = useState(log.workingHours);
  const [liveOvertime, setLiveOvertime] = useState(log.overtime);

  useEffect(() => {
    if (!isToday || (!log.rawPunchIn && !log.firstPunchIn)) {
      setLiveWorked(log.workingHours);
      setLiveOvertime(log.overtime);
      return;
    }

    const parseTimeToMs = (timeStr: string): number => {
      if (!timeStr) return 0;
      const parts = timeStr.split(':').map(Number);
      if (parts.length === 3) return ((parts[0] * 3600) + (parts[1] * 60) + parts[2]) * 1000;
      if (parts.length === 2) return ((parts[0] * 3600) + (parts[1] * 60)) * 1000;
      return 0;
    };

    const formatMsToHms = (ms: number): string => {
      const totalSecs = Math.floor(Math.max(0, ms) / 1000);
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const updateTimer = () => {
      const now = getServerMoment();

      let firstPunchMoment = log.rawPunchIn ? moment(log.rawPunchIn) : null;
      if (!firstPunchMoment || !firstPunchMoment.isValid()) {
        if (log.punches && log.punches.length > 0) {
          firstPunchMoment = moment(log.punches[0].time, ['DD/MM/YYYY, HH:mm:ss', moment.ISO_8601]);
        } else if (log.firstPunchIn) {
          firstPunchMoment = moment(`${log.date} ${log.firstPunchIn}`);
        }
      }

      if (!firstPunchMoment || !firstPunchMoment.isValid()) return;

      const grossElapsedMs = Math.max(0, now.diff(firstPunchMoment));

      const punchesList = log.punches || [];
      const lastP = punchesList.length > 0 ? punchesList[punchesList.length - 1] : null;
      const isWorking = lastP ? lastP.type === 'IN' : Boolean(log.rawPunchIn && !log.rawPunchOut);

      let completedWorkedMs = 0;
      let completedBreakMs = 0;

      if (punchesList.length >= 2) {
        for (let i = 0; i < punchesList.length - 1; i++) {
          const pCur = punchesList[i];
          const pNxt = punchesList[i + 1];
          const mCur = moment(pCur.time, ['DD/MM/YYYY, HH:mm:ss', moment.ISO_8601]);
          const mNxt = moment(pNxt.time, ['DD/MM/YYYY, HH:mm:ss', moment.ISO_8601]);
          if (mCur.isValid() && mNxt.isValid()) {
            const dur = Math.max(0, mNxt.diff(mCur));
            if (pCur.type === 'IN' && pNxt.type === 'OUT') {
              completedWorkedMs += dur;
            } else if (pCur.type === 'OUT' && pNxt.type === 'IN') {
              completedBreakMs += dur;
            }
          }
        }
      }

      if (completedWorkedMs === 0 && log.workingHours) {
        completedWorkedMs = parseTimeToMs(log.workingHours);
      }
      if (completedBreakMs === 0 && log.breakTime) {
        completedBreakMs = parseTimeToMs(log.breakTime);
      }

      let effectiveMs = 0;
      let totalBreakMs = 0;

      if (isWorking) {
        totalBreakMs = completedBreakMs;
        effectiveMs = Math.max(0, grossElapsedMs - totalBreakMs);
      } else {
        // Currently ON BREAK (punched OUT):
        // Effective hours PAUSES at completedWorkedMs!
        // Break time TICKS LIVE = grossElapsedMs - completedWorkedMs!
        effectiveMs = completedWorkedMs;
        totalBreakMs = Math.max(0, grossElapsedMs - effectiveMs);
      }

      const targetMs = parseTimeToMs(log.targetHours) || (8.5 * 3600 * 1000);
      const overtimeMs = effectiveMs > targetMs ? effectiveMs - targetMs : 0;

      setLiveWorked(formatMsToHms(effectiveMs));
      setLiveOvertime(formatMsToHms(overtimeMs));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isToday, isLastPunchIn, log.rawPunchIn, log.rawPunchOut, log.firstPunchIn, log.punches, log.workingHours, log.overtime, log.breakTime, log.targetHours]);

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
    <Animated.View entering={FadeInUp.delay((index % 10) * 30).duration(200)}>
      <BlurView intensity={60} tint="light" style={[s.dayCard, { borderColor }]}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={{ padding: normalize(14) }}>
          {/* Header Row */}
          <View style={s.dayCardHeaderRow}>
            <View style={s.headerLeft}>
              <Typography style={s.dayCardDate} numberOfLines={1}>{displayDate}</Typography>
              <StatusBadge status={log.status} />
              {log.leaveType && (
                <View style={s.leavePill}>
                  <Typography style={s.leavePillText}>🌴 {log.leaveType}</Typography>
                </View>
              )}
              {/* Overtime Status Badges */}
              {log.overtimeStatuses ? (
                Array.isArray(log.overtimeStatuses) ? (
                  log.overtimeStatuses.map((st: string, i: number) => (
                    <OvertimeStatusPill key={`ot-status-${st}-${i}`} status={st} />
                  ))
                ) : (
                  <OvertimeStatusPill status={log.overtimeStatuses} />
                )
              ) : log.overtimeStatus ? (
                <OvertimeStatusPill status={log.overtimeStatus} />
              ) : null}
            </View>
            <View style={s.headerRight}>
              {log.issues?.map((iss: string) => <MicroIssueTag key={iss} label={iss} />)}
              <ChevronRight size={normalize(16)} color={colors.text.muted} style={{ marginLeft: normalize(2) }} />
            </View>
          </View>

          {/* Unified Compact Metrics Strip */}
          {hasContent && (
            <View style={s.metricsContainer}>
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

              {/* Overtime Details: Approved OT & Remaining OT (Only visible when canAddOvertime is true) */}
              {Boolean(log.canAddOvertime) && (
                <View style={s.otMetricsStrip}>
                  <View style={s.metricCol}>
                    <Typography style={s.metricLbl}>APPROVED OT</Typography>
                    <Typography
                      style={[
                        s.metricVal,
                        log.approvedOvertime && log.approvedOvertime !== '0:00:00' && { color: colors.success },
                      ]}
                      numberOfLines={1}
                    >
                      {log.approvedOvertime || '0:00:00'}
                    </Typography>
                  </View>
                  <View style={s.metricDivider} />
                  <View style={s.metricCol}>
                    <Typography style={s.metricLbl}>REMAINING OT</Typography>
                    <Typography
                      style={[
                        s.metricVal,
                        log.remainingOvertime && log.remainingOvertime !== '0:00:00' && { color: colors.warning },
                      ]}
                      numberOfLines={1}
                    >
                      {log.remainingOvertime || '0:00:00'}
                    </Typography>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Conditional Add Overtime Button */}
          {Boolean(log.canAddOvertime) && onAddOvertime && (
            <View style={s.overtimeActionRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onAddOvertime(log)}
                style={s.addOtButton}
              >
                <LinearGradient
                  colors={colors.loginButtonBgGradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.addOtGradient}
                >
                  <Plus size={normalize(13)} color={colors.white} />
                  <Typography style={s.addOtText}>Add Overtime</Typography>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  overtimeActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: normalize(10),
  },
  addOtButton: {
    borderRadius: normalize(10),
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addOtGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5),
    gap: normalize(4),
  },
  addOtText: {
    color: colors.white,
    fontSize: normalize(11),
    fontWeight: '800',
  },
  dayCard: {
    borderRadius: normalize(20),
    marginBottom: normalize(12),
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderColor: colors.border,
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
    flexShrink: 0,
  },
  dayCardDate: {
    fontSize: normalize(14),
    fontWeight: '800',
    color: colors.text.primary,
    flexShrink: 0,
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
  otStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: normalize(6),
    borderWidth: 1,
    gap: normalize(3),
  },
  otStatusPillText: {
    fontSize: normalize(10),
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
  metricsContainer: {
    marginTop: normalize(10),
    gap: normalize(6),
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: normalize(12),
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(10),
    borderWidth: 1,
    borderColor: colors.border,
  },
  otMetricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: normalize(12),
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(10),
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: normalize(18),
    backgroundColor: colors.border,
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
    color: colors.text.primary,
  },
});
