// @ts-nocheck
import { BlurView } from 'expo-blur';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Typography } from '../../components/Typography';
import { getServerMoment } from '../../services/api';
import colors from '../../theme/color';
import { normalize } from '../../utils/responsive';

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

const TableStatusBadge = ({ status }: { status: string }) => {
  const sc = STATUS_COLOR[status] ?? colors.text.muted;
  const sb = STATUS_BG[status]   ?? 'rgba(156, 163, 175, 0.12)';
  return (
    <View style={[s.badge, { backgroundColor: sb }]}>
      <View style={[s.dot, { backgroundColor: sc }]} />
      <Typography style={[s.badgeText, { color: sc }]} numberOfLines={1}>{status}</Typography>
    </View>
  );
};

const formatShortTime = (timeStr?: string) => {
  if (!timeStr || timeStr === '--:--') return '--:--';
  const parts = timeStr.trim().split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return timeStr;
};

export const AttendanceTableRowCard = ({ log, onPress, index }: { log: any; onPress: () => void; index: number }) => {
  const isToday = log.date === getServerMoment().format('YYYY-MM-DD');
  const lastPunch = log.punches && log.punches.length > 0 ? log.punches[log.punches.length - 1] : null;
  const isLastPunchIn = lastPunch ? lastPunch.type === 'IN' : Boolean(log.rawPunchIn && !log.rawPunchOut);
  const isOngoing = Boolean(isToday && isLastPunchIn);

  const [liveWorked, setLiveWorked] = useState(log.workingHours);

  useEffect(() => {
    if (!isToday || (!log.rawPunchIn && !log.firstPunchIn)) {
      setLiveWorked(log.workingHours);
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
      if (isWorking) {
        effectiveMs = Math.max(0, grossElapsedMs - completedBreakMs);
      } else {
        effectiveMs = completedWorkedMs;
      }

      setLiveWorked(formatMsToHms(effectiveMs));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isToday, isLastPunchIn, log.rawPunchIn, log.rawPunchOut, log.firstPunchIn, log.punches, log.workingHours, log.breakTime]);

  const dateMoment = moment(log.date);
  const dateNumStr = dateMoment.isValid() ? dateMoment.format('DD MMM') : log.dayLabel;
  const dayNameStr = dateMoment.isValid() ? dateMoment.format('ddd') : '';

  return (
    <Animated.View entering={FadeInUp.delay((index % 10) * 20).duration(150)}>
      <BlurView intensity={60} tint="light" style={s.card}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.78} style={s.row}>
          {/* Column 1: Date */}
          <View style={[s.col, { flex: 1.8, alignItems: 'flex-start' }]}>
            <Typography style={s.dateText} numberOfLines={1}>
              {dateNumStr}
            </Typography>
            {dayNameStr ? (
              <Typography style={s.daySubText} numberOfLines={1}>
                {dayNameStr}
              </Typography>
            ) : null}
          </View>

          {/* Column 2: Status */}
          <View style={[s.col, { flex: 2.2, alignItems: 'center' }]}>
            <TableStatusBadge status={log.status} />
          </View>

          {/* Column 3: IN */}
          <View style={[s.col, { flex: 1.4, alignItems: 'center' }]}>
            <Typography style={s.timeText} numberOfLines={1}>
              {formatShortTime(log.firstPunchIn)}
            </Typography>
          </View>

          {/* Column 4: OUT */}
          <View style={[s.col, { flex: 1.4, alignItems: 'center' }]}>
            <Typography style={s.timeText} numberOfLines={1}>
              {formatShortTime(log.lastPunchOut)}
            </Typography>
          </View>

          {/* Column 5: WORKED */}
          <View style={[s.col, { flex: 2.0, alignItems: 'flex-end' }]}>
            <Typography
              style={[
                s.workedText,
                isOngoing && { color: colors.primary, fontWeight: '900' }
              ]}
              numberOfLines={1}
            >
              {isOngoing ? liveWorked : (log.workingHours || '--:--:--')}
            </Typography>
          </View>
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  card: {
    borderRadius: normalize(14),
    marginBottom: normalize(8),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
  },
  col: {
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(6),
    gap: normalize(4),
  },
  dot: {
    width: normalize(5),
    height: normalize(5),
    borderRadius: normalize(2.5),
  },
  badgeText: {
    fontSize: normalize(10),
    fontWeight: '700',
  },
  dateText: {
    fontSize: normalize(11),
    fontWeight: '800',
    color: colors.text.primary,
    lineHeight: normalize(14),
  },
  daySubText: {
    fontSize: normalize(9),
    fontWeight: '700',
    color: colors.text.muted,
    lineHeight: normalize(11),
  },
  timeText: {
    fontSize: normalize(11),
    fontWeight: '700',
    color: colors.text.secondary,
  },
  workedText: {
    fontSize: normalize(11),
    fontWeight: '800',
    color: colors.text.primary,
  },
});
