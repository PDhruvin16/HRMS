/**
 * AttendanceComponents.tsx
 *
 * All reusable UI components for the Attendance feature:
 *   - TabBar
 *   - StatCard, TeamStatCard
 *   - StatusBadge, IssueTag
 *   - StatusCountStrip
 *   - WFHCard, OTCard
 *   - WFHApprovalCard
 *   - TeamMemberRowCard
 *   - SearchBar
 *   - EmptyState
 *   - ModalField
 *   - NewRequestModal (WFH / Overtime)
 *   - PunchSequenceModal
 *   - RejectionModal
 *   - DeleteConfirmationModal
 */

// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  AlertCircle, CalendarRange, CheckCircle2,
  Search, X, Trash2, Clock, Plus, ChevronDown,
  Info, AlertTriangle, RotateCcw,
  XCircle,
} from 'lucide-react-native';
import { normalize } from '../../utils/responsive';
import colors from '../../theme/color';
import { Typography } from '../../components/Typography';
import { getServerMoment } from '../../services/api';
import attendanceApi, {
  AttendanceLog,
  WFHRequest,
  OvertimeRequest,
  WFHApprovalRecord,
} from '../../api/attendanceApi';
import DatePicker from '../../components/Date';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Tab, STATUS_COLOR, STATUS_BG, ISSUE_COLOR,
  AttendanceCorrectionRequest, AttendanceCorrectionPunch,
} from './AttendanceTypes';
import s from './AttendanceStyles';

/* ═══════════════════════════════════════════════════════════════
   TAB BAR
═══════════════════════════════════════════════════════════════ */

export const TabBar = ({
  active,
  onChange,
  tabs,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  tabs: Tab[];
}) => (
  <BlurView intensity={50} tint="light" style={s.tabWrap}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {tabs.map((t) => (
        <TouchableOpacity
          key={t}
          onPress={async () => { await Haptics.selectionAsync(); onChange(t); }}
          activeOpacity={0.8}
          style={[s.tabItem, active === t && s.tabItemActive]}
        >
          <Typography style={[s.tabLabel, active === t && s.tabLabelActive]} numberOfLines={1}>
            {t}
          </Typography>
          {active === t && (
            <Animated.View entering={FadeInDown.duration(200)} style={s.tabUnderline} />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  </BlurView>
);

/* ═══════════════════════════════════════════════════════════════
   STAT CARDS
═══════════════════════════════════════════════════════════════ */

/** Summary stat card — used in My Attendance header row. */
export const StatCard = ({
  icon, label, value, color,
}: {
  icon: React.ReactNode; label: string; value: string; color: string;
}) => (
  <BlurView
    intensity={90}
    tint="light"
    style={[s.statCard, { borderColor: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(255,255,255,0.75)', position: 'relative', overflow: 'hidden' }]}
  >
    {/* Watermark icon */}
    <View style={{ position: 'absolute', right: -normalize(10), bottom: -normalize(10), opacity: 0.08, transform: [{ scale: 1.5 }] }}>
      {React.cloneElement(icon as React.ReactElement, { size: normalize(60), color })}
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

/** Clickable stat card — used in Team tab summary row. */
export const TeamStatCard = ({
  label, value, subLabel, color, icon, active, onPress,
}: {
  label: string; value: string; subLabel: string; color: string;
  icon: React.ReactNode; active: boolean; onPress: () => void;
}) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
    <BlurView
      intensity={90}
      tint="light"
      style={[
        s.teamStatCard,
        { borderColor: active ? color : 'rgba(255,255,255,0.9)' },
        active && { backgroundColor: color + '08' },
      ]}
    >
      <View style={s.teamStatCardHeader}>
        <Typography style={s.teamStatLabel}>{label}</Typography>
        <View style={[s.teamStatIconWrap, { backgroundColor: color + '12' }]}>{icon}</View>
      </View>
      <Typography style={[s.teamStatValue, { color }]}>{value}</Typography>
      <Typography style={s.teamStatSub}>{subLabel}</Typography>
    </BlurView>
  </TouchableOpacity>
);

/* ═══════════════════════════════════════════════════════════════
   STATUS BADGE & ISSUE TAG
═══════════════════════════════════════════════════════════════ */

export const StatusBadge = ({ status }: { status: string }) => {
  const sc = STATUS_COLOR[status] ?? colors.text.muted;
  const sb = STATUS_BG[status]   ?? 'rgba(156, 163, 175, 0.1)';
  return (
    <View style={[s.statusBadge, { backgroundColor: sb }]}>
      <View style={[s.statusDot, { backgroundColor: sc }]} />
      <Typography style={[s.statusBadgeText, { color: sc }]}>{status}</Typography>
    </View>
  );
};

export const IssueTag = ({ label }: { label: string }) => {
  const c = ISSUE_COLOR[label] ?? colors.text.muted;
  return (
    <View style={[s.issueTag, { borderColor: c + '50', backgroundColor: c + '12' }]}>
      <Typography style={[s.issueTagText, { color: c }]}>{label}</Typography>
    </View>
  );
};

/* ═══════════════════════════════════════════════════════════════
   STATUS COUNT STRIP  (Pending / Approved / Rejected counts)
═══════════════════════════════════════════════════════════════ */

export const StatusCountStrip = ({
  data,
}: {
  data: (WFHRequest | OvertimeRequest)[];
}) => {
  const counts = { Pending: 0, Approved: 0, Rejected: 0 };
  data.forEach((d) => { if (d.status in counts) counts[d.status]++; });
  const items = [
    { label: 'Pending',  count: counts.Pending,  color: colors.warning },
    { label: 'Approved', count: counts.Approved, color: colors.success },
    { label: 'Rejected', count: counts.Rejected, color: colors.error   },
  ];
  return (
    <BlurView intensity={50} tint="light" style={s.countStrip}>
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          <View style={s.countStripItem}>
            <Typography style={[s.countNum, { color: item.color }]}>{item.count}</Typography>
            <Typography style={s.countLbl}>{item.label}</Typography>
          </View>
          {i < items.length - 1 && <View style={s.countStripSep} />}
        </React.Fragment>
      ))}
    </BlurView>
  );
};

/* ═══════════════════════════════════════════════════════════════
   WFH REQUEST CARD
═══════════════════════════════════════════════════════════════ */

export const WFHCard = ({
  item, index, onDelete,
}: {
  item: WFHRequest; index: number; onDelete?: (item: WFHRequest) => void;
}) => {
  const sc = STATUS_COLOR[item.status] ?? colors.text.muted;
  const sb = STATUS_BG[item.status]   ?? 'rgba(156, 163, 175, 0.1)';

  const fmt = (d: any, f: string) => {
    const m = moment(d);
    return m.isValid() ? m.format(f) : '--';
  };

  return (
    <Animated.View entering={FadeInUp.delay((index % 10) * 30).duration(200)}>
      <BlurView intensity={50} tint="light" style={s.reqCard}>
        <View style={s.reqCardTop}>
          <View style={{ flex: 1 }}>
            <Typography style={s.reqTitle}>
              {fmt(item.fromDate, 'DD MMM')} — {fmt(item.toDate, 'DD MMM YYYY')}
            </Typography>
            <Typography style={s.reqMeta}>
              {item.days} day{item.days !== 1 ? 's' : ''} · Submitted: {fmt(item.submittedOn, 'DD MMM YYYY')}
            </Typography>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(8) }}>
            {/* Delete button — only for pending requests */}
            {item.status === 'Pending' && onDelete && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onDelete(item)}
                style={{ padding: normalize(6), backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: normalize(8), borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.15)' }}
              >
                <Trash2 size={normalize(14)} color={colors.error} />
              </TouchableOpacity>
            )}
            <View style={[s.statusBadge, { backgroundColor: sb }]}>
              <View style={[s.statusDot, { backgroundColor: sc }]} />
              <Typography style={[s.statusBadgeText, { color: sc }]}>{item.status}</Typography>
            </View>
          </View>
        </View>
        {item.reason ? (
          <View style={s.reqReasonBox}>
            <Typography style={s.reqReasonText} numberOfLines={2}>{item.reason}</Typography>
          </View>
        ) : null}
      </BlurView>
    </Animated.View>
  );
};

/* ═══════════════════════════════════════════════════════════════
   OVERTIME REQUEST CARD
═══════════════════════════════════════════════════════════════ */

export const OTCard = ({
  item, index,
}: {
  item: OvertimeRequest; index: number;
}) => {
  const sc = STATUS_COLOR[item.status] ?? colors.text.muted;
  const sb = STATUS_BG[item.status]   ?? 'rgba(156, 163, 175, 0.1)';

  const fmt = (d: any, f: string) => {
    const m = moment(d);
    return m.isValid() ? m.format(f) : '--';
  };

  return (
    <Animated.View entering={FadeInUp.delay((index % 10) * 30).duration(200)}>
      <BlurView intensity={50} tint="light" style={s.reqCard}>
        <View style={s.reqCardTop}>
          <View style={{ flex: 1 }}>
            <Typography style={s.reqTitle}>{fmt(item.date, 'ddd, DD MMM YYYY')}</Typography>
            <Typography style={s.reqMeta}>
              {item.hours} hrs · Submitted: {fmt(item.submittedOn, 'DD MMM YYYY')}
            </Typography>
          </View>
          <View style={[s.statusBadge, { backgroundColor: sb }]}>
            <View style={[s.statusDot, { backgroundColor: sc }]} />
            <Typography style={[s.statusBadgeText, { color: sc }]}>{item.status}</Typography>
          </View>
        </View>
        {item.reason ? (
          <View style={s.reqReasonBox}>
            <Typography style={s.reqReasonText} numberOfLines={2}>{item.reason}</Typography>
          </View>
        ) : null}
      </BlurView>
    </Animated.View>
  );
};

/* ═══════════════════════════════════════════════════════════════
   WFH APPROVAL CARD  (HR / Admin view)
═══════════════════════════════════════════════════════════════ */

export const WFHApprovalCard = ({
  item, index, onApprove, onReject,
}: {
  item: WFHApprovalRecord; index: number;
  onApprove: () => void; onReject: () => void;
}) => {
  const statusLabel =
    item.status === 'pending_hr'
      ? 'Pending HR'
      : item.status.charAt(0).toUpperCase() + item.status.slice(1);

  const sc = item.status === 'approved'
    ? colors.success
    : item.status.includes('reject')
    ? colors.error
    : colors.warning;

  const sb = item.status === 'approved'
    ? 'rgba(16, 185, 129, 0.1)'
    : item.status.includes('reject')
    ? 'rgba(239, 68, 68, 0.1)'
    : 'rgba(245, 158, 11, 0.1)';

  const initials    = item.employeeName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const avatarPalette = [colors.primary, colors.emailBlue, colors.success, colors.warning];
  const avatarColor   = avatarPalette[item.employeeId.charCodeAt(item.employeeId.length - 1) % avatarPalette.length];

  return (
    <Animated.View entering={FadeInUp.delay((index % 10) * 30).duration(200)}>
      <BlurView intensity={50} tint="light" style={s.approvalCard}>
        {/* Header: avatar + name + status badge */}
        <View style={s.approvalCardHeader}>
          <View style={s.approvalCardAvatarWrap}>
            <View style={[s.teamAvatar, { backgroundColor: avatarColor + '20', width: normalize(36), height: normalize(36), borderRadius: normalize(10), alignItems: 'center', justifyContent: 'center' }]}>
              <Typography style={{ fontSize: normalize(12), fontWeight: '700', color: avatarColor }}>{initials || '??'}</Typography>
            </View>
            <View style={{ marginLeft: normalize(12) }}>
              <Typography style={s.approvalEmpName}>{item.employeeName}</Typography>
              <Typography style={s.approvalEmpCode}>{item.empCode}</Typography>
            </View>
          </View>
          <View style={[s.statusBadge, { backgroundColor: sb }]}>
            <View style={[s.statusDot, { backgroundColor: sc }]} />
            <Typography style={[s.statusBadgeText, { color: sc }]}>{statusLabel}</Typography>
          </View>
        </View>

        <View style={s.approvalCardDivider} />

        {/* Body: date range + optional reason */}
        <View style={s.approvalCardBody}>
          <View style={s.approvalDateRow}>
            <CalendarRange size={normalize(14)} color={colors.text.secondary} />
            <Typography style={s.approvalDateText}>
              {moment(item.startDate).format('DD/MM/YYYY')} to {moment(item.endDate).format('DD/MM/YYYY')}
            </Typography>
          </View>
          {item.reason ? (
            <View style={s.approvalReasonBox}>
              <Typography style={s.approvalReasonLabel}>Reason:</Typography>
              <Typography style={s.approvalReasonText}>{item.reason}</Typography>
            </View>
          ) : null}
        </View>

        {/* Actions — visible only when canApprove is true */}
        {Boolean(item.canApprove ?? (item as any)?.can_approve) && (
          <View style={s.approvalActionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onReject}
              style={[s.approvalActionBtn, { borderColor: colors.error }]}
            >
              <X size={normalize(16)} color={colors.error} />
              <Typography style={[s.approvalActionBtnText, { color: colors.error }]}>Reject</Typography>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onApprove}
              style={[s.approvalActionBtn, { backgroundColor: colors.success, borderColor: colors.success }]}
            >
              <CheckCircle2 size={normalize(16)} color={colors.white} />
              <Typography style={[s.approvalActionBtnText, { color: colors.white }]}>Approve</Typography>
            </TouchableOpacity>
          </View>
        )}
      </BlurView>
    </Animated.View>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TEAM MEMBER ROW CARD  (infinite-list row in Team tab)
═══════════════════════════════════════════════════════════════ */

export const TeamMemberRowCard = ({
  item, index, onPress, showDate, issues,
}: {
  item: any; index: number; onPress: () => void;
  showDate?: boolean; issues?: string[];
}) => {
  const employeeName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'No Name';
  const employeeId   = item.empId || 'N/A';
  const initials     = ((item.firstName?.[0] || '') + (item.lastName?.[0] || '')).toUpperCase();
  const palette      = [colors.primary, colors.emailBlue, colors.success, colors.warning];
  const avatarColor  = palette[employeeId.charCodeAt(employeeId.length - 1) % palette.length];
  const statusStr    = item.status
    ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
    : 'Absent';

  return (
    <Animated.View entering={FadeInUp.delay((index % 10) * 30).duration(200)}>
      <BlurView intensity={50} tint="light" style={s.teamRowCard}>
        <View style={s.teamRowInner}>
          {/* Left: avatar + name */}
          <View style={s.teamRowLeft}>
            <View style={[s.teamAvatar, { backgroundColor: avatarColor + '20', width: normalize(36), height: normalize(36), borderRadius: normalize(10), alignItems: 'center', justifyContent: 'center' }]}>
              <Typography style={{ fontSize: normalize(12), fontWeight: '700', color: avatarColor }}>{initials || '??'}</Typography>
            </View>
            <View style={{ marginLeft: normalize(12), justifyContent: 'center', flex: 1 }}>
              <Typography style={s.teamRowName}>{employeeName}</Typography>
              <Typography style={s.teamRowId}>
                {employeeId}{showDate && item.date ? ` • ${moment(item.date).format('DD MMM')}` : ''}
              </Typography>
              {issues && issues.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: normalize(4), marginTop: normalize(4) }}>
                  {issues.map((iss) => <IssueTag key={iss} label={iss} />)}
                </View>
              )}
            </View>
          </View>

          {/* Right: status badge + view button */}
          <View style={s.teamRowRight}>
            <StatusBadge status={statusStr} />
            <TouchableOpacity activeOpacity={0.8} style={s.teamRowViewBtn} onPress={onPress}>
              <Typography style={s.teamRowViewText}>View</Typography>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SEARCH BAR
═══════════════════════════════════════════════════════════════ */

export const SearchBar = ({
  value, onChange, placeholder,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) => (
  <BlurView intensity={60} tint="light" style={s.searchBar}>
    <Search size={normalize(16)} color={colors.text.muted} />
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.text.muted}
      style={s.searchInput}
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={async () => { await Haptics.selectionAsync(); onChange(''); }}>
        <X size={normalize(16)} color={colors.text.muted} />
      </TouchableOpacity>
    )}
  </BlurView>
);

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */

export const EmptyState = ({
  message, onRetry,
}: {
  message: string; onRetry?: () => void;
}) => (
  <BlurView intensity={40} tint="light" style={s.emptyWrap}>
    <View style={s.emptyCircle}>
      <AlertCircle size={normalize(26)} color={colors.text.muted} />
    </View>
    <Typography style={s.emptyText}>{message}</Typography>
    {onRetry && (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onRetry}
        style={{ marginTop: normalize(14), paddingHorizontal: normalize(20), paddingVertical: normalize(10), backgroundColor: colors.primary, borderRadius: normalize(12) }}
      >
        <Typography style={{ color: colors.white, fontWeight: '800', fontSize: normalize(13) }}>
          Retry Connection
        </Typography>
      </TouchableOpacity>
    )}
  </BlurView>
);

/* ═══════════════════════════════════════════════════════════════
   MODAL FIELD  (text input row inside modals)
═══════════════════════════════════════════════════════════════ */

export const ModalField = ({
  label, value, onChange, placeholder, multiline = false, keyboardType = 'default',
}: any) => (
  <View style={{ marginBottom: normalize(14) }}>
    <Typography style={s.modalFieldLabel}>{label}</Typography>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.text.muted}
      multiline={multiline}
      keyboardType={keyboardType}
      style={[s.modalInput, multiline && { height: normalize(100), textAlignVertical: 'top' }]}
    />
  </View>
);

/* ═══════════════════════════════════════════════════════════════
   NEW REQUEST MODAL  (WFH / Overtime creation)
═══════════════════════════════════════════════════════════════ */

export const NewRequestModal = ({
  visible, type, onClose, onSubmit, initialValues,
}: {
  visible: boolean;
  type: 'WFH' | 'Overtime';
  onClose: () => void;
  onSubmit: (d: any) => void;
  initialValues?: { fromDate?: string; toDate?: string; hours?: string; reason?: string };
}) => {
  const insets = useSafeAreaInsets();
  const [from,   setFrom]   = useState(initialValues?.fromDate || '');
  const [to,     setTo]     = useState(initialValues?.toDate || '');
  const [hours,  setHours]  = useState(initialValues?.hours || '');
  const [reason, setReason] = useState(initialValues?.reason || '');
  const [activeDatePicker, setActiveDatePicker] = useState<'start' | 'end' | null>(null);
  const [tempDate, setTempDate] = useState('');

  useEffect(() => {
    if (visible) {
      setFrom(initialValues?.fromDate || '');
      setTo(initialValues?.toDate || '');
      setHours(initialValues?.hours || '');
      setReason(initialValues?.reason || '');
    }
  }, [visible, initialValues]);

  const DateField = ({
    label, value, onPress,
  }: {
    label: string; value: string; onPress: () => void;
  }) => (
    <View style={{ marginBottom: normalize(14) }}>
      <Typography style={s.modalFieldLabel}>{label}</Typography>
      <TouchableOpacity
        style={[s.modalInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
        onPress={onPress}
      >
        <Typography style={{ color: value ? colors.text.primary : colors.text.muted }}>
          {value ? moment(value).format('MMM DD, YYYY') : 'YYYY-MM-DD'}
        </Typography>
        <CalendarRange size={16} color={colors.text.muted} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <BlurView intensity={40} tint="dark" style={s.modalOverlay}>
        <View style={[s.modalSheet, { paddingBottom: Math.max(insets.bottom, normalize(16)) + (Platform.OS === 'android' ? normalize(16) : normalize(8)) }]}>
          <View style={s.modalHandle} />
          <View style={s.modalTopRow}>
            <Typography style={s.modalTitle}>New {type} Request</Typography>
            <TouchableOpacity onPress={onClose} style={s.modalCloseBtn}>
              <X size={normalize(18)} color={colors.black} />
            </TouchableOpacity>
          </View>

          {/* Inline date picker overlay */}
          {activeDatePicker && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.white, zIndex: 100, borderRadius: normalize(32), padding: normalize(24) }]}>
              <Typography variant="h3" style={{ marginBottom: normalize(16) }}>Select Date</Typography>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Calendar
                  current={tempDate || moment().format('YYYY-MM-DD')}
                  onDayPress={(day: any) => setTempDate(day.dateString)}
                  markedDates={{ [tempDate]: { selected: true, selectedColor: colors.primary, selectedTextColor: colors.white } }}
                  theme={{
                    todayTextColor: colors.primary,
                    dayTextColor: colors.text.primary,
                    textDisabledColor: 'rgba(0,0,0,0.1)',
                    monthTextColor: colors.text.primary,
                    textDayFontFamily: 'DMSans-Medium',
                    textMonthFontFamily: 'DMSans-Bold',
                    calendarBackground: 'transparent',
                  }}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: normalize(12), marginTop: normalize(16) }}>
                <TouchableOpacity
                  style={{ flex: 1, padding: normalize(14), borderRadius: normalize(16), backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center' }}
                  onPress={() => { setActiveDatePicker(null); setTempDate(''); }}
                >
                  <Typography style={{ fontWeight: '700' }}>Cancel</Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[{ flex: 1, padding: normalize(14), borderRadius: normalize(16), backgroundColor: colors.primary, alignItems: 'center' }, !tempDate && { opacity: 0.5 }]}
                  onPress={() => {
                    if (activeDatePicker === 'start') setFrom(tempDate);
                    else setTo(tempDate);
                    setActiveDatePicker(null);
                    setTempDate('');
                  }}
                  disabled={!tempDate}
                >
                  <Typography style={{ fontWeight: '700', color: colors.white }}>OK</Typography>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={true} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true} overScrollMode="always">
            {type === 'WFH' ? (
              <>
                <DateField label="From Date" value={from} onPress={() => { setTempDate(from); setActiveDatePicker('start'); }} />
                <DateField label="To Date"   value={to}   onPress={() => { setTempDate(to); setActiveDatePicker('end'); }} />
              </>
            ) : (
              <>
                <DateField label="Date"  value={from} onPress={() => { setTempDate(from); setActiveDatePicker('start'); }} />
                <ModalField label="Hours" value={hours} onChange={setHours} placeholder="e.g. 2" keyboardType="numeric" />
              </>
            )}
            <ModalField label="Reason" value={reason} onChange={setReason} placeholder="Reason for request…" multiline />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onSubmit({ fromDate: from, toDate: to, hours, reason });
                onClose();
              }}
            >
              <LinearGradient
                colors={colors.loginButtonBgGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.modalSubmit}
              >
                <Typography style={s.modalSubmitText}>Submit Request</Typography>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PUNCH SEQUENCE MODAL
═══════════════════════════════════════════════════════════════ */

export const PunchSequenceModal = ({
  visible, log, onClose, onAddOvertime,
}: {
  visible: boolean;
  log: AttendanceLog | null;
  onClose: () => void;
  onAddOvertime?: (log: AttendanceLog) => void;
}) => {
  const insets = useSafeAreaInsets();
  const isToday       = log?.date === getServerMoment().format('YYYY-MM-DD');
  const punches       = log?.punches || [];
  const lastPunch     = punches.length > 0 ? punches[punches.length - 1] : null;
  const isLastPunchIn = lastPunch ? lastPunch.type === 'IN' : Boolean(log?.rawPunchIn && !log?.rawPunchOut);

  const [liveEffective, setLiveEffective] = useState(log?.effectiveHours || log?.workingHours || '0:00:00');
  const [liveTotal, setLiveTotal]         = useState(log?.totalTimeFirstToLast || log?.workingHours || '0:00:00');
  const [liveBreak, setLiveBreak]         = useState(log?.breakTime || '0:00:00');
  const [liveOvertime, setLiveOvertime]   = useState(log?.overtime || '0:00:00');

  useEffect(() => {
    if (!log || !isToday || (!log.rawPunchIn && !log.firstPunchIn)) {
      setLiveEffective(log?.effectiveHours || log?.workingHours || '0:00:00');
      setLiveTotal(log?.totalTimeFirstToLast || log?.workingHours || '0:00:00');
      setLiveBreak(log?.breakTime || '0:00:00');
      setLiveOvertime(log?.overtime || '0:00:00');
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

      setLiveTotal(formatMsToHms(grossElapsedMs));
      setLiveBreak(formatMsToHms(totalBreakMs));
      setLiveEffective(formatMsToHms(effectiveMs));
      setLiveOvertime(formatMsToHms(overtimeMs));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [
    visible,
    isToday,
    isLastPunchIn,
    log?.rawPunchIn,
    log?.rawPunchOut,
    log?.firstPunchIn,
    log?.punches,
    log?.breakTime,
    log?.targetHours,
    log?.effectiveHours,
    log?.workingHours,
    log?.overtime,
  ]);

  if (!log) return null;

  const statusColor = STATUS_COLOR[log.status] || colors.text.muted;
  const statusBg    = STATUS_BG[log.status]    || 'rgba(156,163,175,0.1)';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <BlurView intensity={40} tint="dark" style={s.modalOverlay}>
        <View
          style={[
            s.modalSheet,
            {
              maxHeight: '85%',
              paddingBottom: Math.max(insets.bottom, normalize(16)) + (Platform.OS === 'android' ? normalize(16) : normalize(8)),
            },
          ]}
        >
          <View style={s.modalHandle} />
          <View style={s.modalTopRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(8) }}>
              <Typography style={s.modalTitle}>{moment(log.date).format('dddd, DD MMM YYYY')}</Typography>
              <View style={[s.statusBadge, { backgroundColor: statusBg }]}>
                <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                <Typography style={[s.statusBadgeText, { color: statusColor }]}>{log.status}</Typography>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={s.modalCloseBtn}>
              <X size={normalize(18)} color={colors.black} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 1 }}>
            {/* Day Breakdown Summary Grid */}
            <Typography style={{ fontSize: normalize(10), fontWeight: '800', color: colors.text.muted, letterSpacing: 0.5, marginTop: normalize(8), marginBottom: normalize(8) }}>
              ATTENDANCE BREAKDOWN
            </Typography>
            <View style={{ gap: normalize(8), marginBottom: normalize(16) }}>
              <View style={{ flexDirection: 'row', gap: normalize(8) }}>
                <View style={s.detailCell}>
                  <Typography style={s.detailLbl}>First Punch</Typography>
                  <Typography style={s.detailVal}>{log.firstPunchIn || '--:--'}</Typography>
                </View>
                <View style={s.detailCell}>
                  <Typography style={s.detailLbl}>Last Punch</Typography>
                  <Typography style={s.detailVal}>{log.lastPunchOut || '--:--'}</Typography>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: normalize(8) }}>
                <View style={s.detailCell}>
                  <Typography style={s.detailLbl}>Target Hours</Typography>
                  <Typography style={s.detailVal}>{log.targetHours || '8:30:00'}</Typography>
                </View>
                <View style={s.detailCell}>
                  <Typography style={s.detailLbl}>Break Time</Typography>
                  <Typography style={s.detailVal}>{liveBreak}</Typography>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: normalize(8) }}>
                <View style={s.detailCell}>
                  <Typography style={s.detailLbl}>Effective Hours</Typography>
                  <Typography style={[s.detailVal, { color: colors.error }]}>
                    {liveEffective}
                  </Typography>
                </View>
                <View style={s.detailCell}>
                  <Typography style={s.detailLbl}>Overtime</Typography>
                  <Typography
                    style={[
                      s.detailVal,
                      (liveOvertime !== '0:00:00' && liveOvertime !== '00:00:00') && { color: colors.warning },
                    ]}
                  >
                    {liveOvertime}
                  </Typography>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: normalize(8) }}>
                <View style={s.detailCell}>
                  <Typography style={s.detailLbl}>Total Hours</Typography>
                  <Typography style={[s.detailVal, { color: colors.black }]}>
                    {liveTotal}
                  </Typography>
                </View>
                <View style={s.detailCell}>
                  <Typography style={s.detailLbl}>Status</Typography>
                  <Typography style={s.detailVal}>{log.status || 'Normal'}</Typography>
                </View>
              </View>
              {Boolean(log.canAddOvertime) && (
                <View style={{ flexDirection: 'row', gap: normalize(8) }}>
                  <View style={s.detailCell}>
                    <Typography style={s.detailLbl}>Approved Overtime</Typography>
                    <Typography
                      style={[
                        s.detailVal,
                        log.approvedOvertime && log.approvedOvertime !== '0:00:00' && { color: colors.success },
                      ]}
                    >
                      {log.approvedOvertime || '0:00:00'}
                    </Typography>
                  </View>
                  <View style={s.detailCell}>
                    <Typography style={s.detailLbl}>Remaining Overtime</Typography>
                    <Typography
                      style={[
                        s.detailVal,
                        log.remainingOvertime && log.remainingOvertime !== '0:00:00' && { color: colors.warning },
                      ]}
                    >
                      {log.remainingOvertime || '0:00:00'}
                    </Typography>
                  </View>
                </View>
              )}
              {Boolean(log.overtimeStatuses || log.overtimeStatus) && (
                <View style={{ flexDirection: 'row', gap: normalize(8) }}>
                  <View style={[s.detailCell, { flex: 1 }]}>
                    <Typography style={s.detailLbl}>Overtime Status</Typography>
                    <Typography
                      style={[
                        s.detailVal,
                        {
                          color:
                            String(log.overtimeStatus || (Array.isArray(log.overtimeStatuses) ? log.overtimeStatuses[0] : log.overtimeStatuses)).toLowerCase().includes('approved')
                              ? colors.success
                              : String(log.overtimeStatus || (Array.isArray(log.overtimeStatuses) ? log.overtimeStatuses[0] : log.overtimeStatuses)).toLowerCase().includes('reject')
                              ? colors.error
                              : colors.warning,
                        },
                      ]}
                    >
                      {Array.isArray(log.overtimeStatuses)
                        ? log.overtimeStatuses.map((st: string) => st.charAt(0).toUpperCase() + st.slice(1)).join(', ')
                        : String(log.overtimeStatuses || log.overtimeStatus).charAt(0).toUpperCase() + String(log.overtimeStatuses || log.overtimeStatus).slice(1)}
                    </Typography>
                  </View>
                </View>
              )}
            </View>

            {/* Punches Timeline Section */}
            <Typography style={{ fontSize: normalize(10), fontWeight: '800', color: colors.text.muted, letterSpacing: 0.5, marginBottom: normalize(8) }}>
              PUNCH TIMELINE ({log.punches?.length || 0})
            </Typography>

            <View style={s.punchTableHeader}>
              <Typography style={[s.th, { flex: 0.5 }]}>#</Typography>
              <Typography style={[s.th, { flex: 1 }]}>TYPE</Typography>
              <Typography style={[s.th, { flex: 1.5 }]}>SOURCE</Typography>
              <Typography style={[s.th, { flex: 2, textAlign: 'right' }]}>TIME</Typography>
            </View>

            {(!log.punches || log.punches.length === 0) ? (
              <EmptyState message="No punch records for this day." />
            ) : (
              log.punches.map((p, i) => (
                <View key={p.id || `${p.time}-${i}`} style={s.punchTableRow}>
                  <Typography style={[s.td, { flex: 0.5, color: colors.text.muted }]}>#{i + 1}</Typography>
                  <View style={[s.td, { flex: 1 }]}>
                    <View style={[s.statusBadge, { backgroundColor: p.type === 'IN' ? colors.successLight : colors.text.light, paddingVertical: 2, paddingHorizontal: 6 }]}>
                      <Typography style={[s.statusBadgeText, { fontSize: normalize(10), color: p.type === 'IN' ? colors.success : colors.text.secondary }]}>
                        {p.type}
                      </Typography>
                    </View>
                  </View>
                  <Typography style={[s.td, { flex: 1.5 }]}>{p.source}</Typography>
                  <Typography style={[s.td, { flex: 2, textAlign: 'right', fontWeight: '600' }]}>{p.time}</Typography>
                </View>
              ))
            )}
          </ScrollView>

          {/* Conditional Add Overtime Request Button */}
          {Boolean(log.canAddOvertime) && onAddOvertime && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                onAddOvertime(log);
              }}
              style={{ marginTop: normalize(12) }}
            >
              <LinearGradient
                colors={colors.loginButtonBgGradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: normalize(11),
                  paddingHorizontal: normalize(16),
                  borderRadius: normalize(14),
                  gap: normalize(6),
                }}
              >
                <Plus size={normalize(15)} color={colors.white} />
                <Typography style={{ color: colors.white, fontSize: normalize(13), fontWeight: '800' }}>
                  Add Overtime Request
                </Typography>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity activeOpacity={0.85} onPress={onClose} style={{ marginTop: Boolean(log.canAddOvertime) && onAddOvertime ? normalize(8) : normalize(16) }}>
            <View style={s.closeOutlineBtn}>
              <Typography style={s.closeOutlineBtnText}>Close</Typography>
            </View>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════════
   REJECTION MODAL
═══════════════════════════════════════════════════════════════ */

import { RejectionReasonModal } from '../../components/Modals/RejectionReasonModal';

export const RejectionModal = ({
  visible, onClose, onSubmit,
}: {
  visible: boolean; onClose: () => void; onSubmit: (reason: string) => void;
}) => (
  <RejectionReasonModal
    visible={visible}
    onClose={onClose}
    onSubmit={onSubmit}
    title="Reject Request"
    description="Please enter a reason for rejecting this WFH request. The employee will see this feedback."
    placeholder="Write rejection reason here..."
  />
);

/* ═══════════════════════════════════════════════════════════════
   DELETE CONFIRMATION MODAL
═══════════════════════════════════════════════════════════════ */

export const DeleteConfirmationModal = ({
  visible, onClose, onConfirm,
  title   = 'Delete Request',
  message = 'Are you sure you want to delete this request? This action cannot be undone.',
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}) => (
  <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
    <BlurView intensity={30} tint="dark" style={s.rejectionOverlay}>
      <Animated.View entering={FadeInUp.springify()} style={s.rejectionBox}>
        {/* Header */}
        <View style={s.rejectionHeader}>
          <View style={s.rejectionTitleIcon}>
            <AlertCircle size={normalize(18)} color={colors.error} />
            <Typography style={s.rejectionTitle}>{title}</Typography>
          </View>
          <TouchableOpacity onPress={onClose} style={s.rejectionCloseBtn}>
            <X size={normalize(16)} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <Typography style={s.rejectionDesc}>{message}</Typography>

        <View style={s.rejectionFooter}>
          <TouchableOpacity onPress={onClose} style={s.rejectionCancelBtn}>
            <Typography style={s.rejectionCancelText}>Cancel</Typography>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} onPress={onConfirm} style={s.rejectionSubmitBtn}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.rejectionSubmitGrad}
            >
              <Typography style={s.rejectionSubmitText}>Delete</Typography>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </BlurView>
  </Modal>
);

/* ═══════════════════════════════════════════════════════════════
   CORRECTION CARD  (My Corrections tab row)
═══════════════════════════════════════════════════════════════ */

export const CorrectionCard = ({
  item, index, onDelete, onPress,
}: {
  item: AttendanceCorrectionRequest;
  index: number;
  onDelete?: (item: AttendanceCorrectionRequest) => void;
  onPress?: (item: AttendanceCorrectionRequest) => void;
}) => {
  const sc = STATUS_COLOR[item.status] ?? colors.text.muted;
  const sb = STATUS_BG[item.status]   ?? 'rgba(156, 163, 175, 0.1)';

  const fmt = (d: any, f: string) => {
    const m = moment(d);
    return m.isValid() ? m.format(f) : '--';
  };

  return (
    <Animated.View entering={FadeInUp.delay((index % 10) * 30).duration(200)}>
      <TouchableOpacity activeOpacity={0.85} onPress={() => onPress && onPress(item)}>
        <BlurView intensity={50} tint="light" style={s.reqCard}>
          <View style={s.reqCardTop}>
            <View style={{ flex: 1 }}>
              <Typography style={s.reqTitle}>{fmt(item.date, 'ddd, DD MMM YYYY')}</Typography>
              <Typography style={s.reqMeta}>
                {item.punches?.length || 0} punch entries · Submitted: {fmt(item.submittedOn, 'DD MMM YYYY')}
              </Typography>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(8) }}>
              {item.status === 'Pending' && onDelete && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete(item);
                  }}
                  style={{
                    padding: normalize(6),
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    borderRadius: normalize(8),
                    borderWidth: 1,
                    borderColor: 'rgba(239, 68, 68, 0.15)',
                  }}
                >
                  <Trash2 size={normalize(14)} color={colors.error} />
                </TouchableOpacity>
              )}
              <View style={[s.statusBadge, { backgroundColor: sb }]}>
                <View style={[s.statusDot, { backgroundColor: sc }]} />
                <Typography style={[s.statusBadgeText, { color: sc }]}>{item.status}</Typography>
              </View>
            </View>
          </View>
          {item.reason ? (
            <View style={s.reqReasonBox}>
              <Typography style={s.reqReasonText} numberOfLines={2}>
                {item.reason}
              </Typography>
            </View>
          ) : null}
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CORRECTION DETAILS BOTTOM MODAL
═══════════════════════════════════════════════════════════════ */

export const CorrectionDetailsModal = ({
  visible,
  item,
  onClose,
}: {
  visible: boolean;
  item: AttendanceCorrectionRequest | null;
  onClose: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const formattedDateHeader = useMemo(() => {
    if (!item?.date) return '';
    const m = moment(item.date);
    return m.isValid() ? m.format('DD MMM YYYY') : item.date;
  }, [item?.date]);

  const preview = useMemo(() => {
    const punches = item?.punches || [];
    if (!punches || punches.length === 0) {
      return {
        totalHours: '0h 0m',
        totalBreaks: '0h 0m',
        sequenceText: '✓ Valid',
        sequenceError: null,
      };
    }

    const parsePunchSecs = (tStr: string) => {
      const m = moment(tStr, ['HH:mm:ss', 'hh:mm A', 'HH:mm']);
      if (!m.isValid()) return 0;
      return m.hours() * 3600 + m.minutes() * 60 + m.seconds();
    };

    const sorted = [...punches].sort((a, b) => parsePunchSecs(a.time) - parsePunchSecs(b.time));

    let workSecs = 0;
    let breakSecs = 0;
    let seqErr: string | null = null;

    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i];
      if (i === 0) {
        if (cur.type === 'OUT') {
          seqErr = `Sequence error: First punch cannot be Punch Out at ${cur.time}`;
        }
      } else {
        const prev = sorted[i - 1];
        const dur = Math.max(0, parsePunchSecs(cur.time) - parsePunchSecs(prev.time));

        if (prev.type === 'IN' && cur.type === 'OUT') {
          workSecs += dur;
        } else if (prev.type === 'OUT' && cur.type === 'IN') {
          breakSecs += dur;
        } else if (prev.type === 'IN' && cur.type === 'IN') {
          if (!seqErr) seqErr = `Sequence error: Expected Punch Out but got Punch In at ${cur.time}`;
        } else if (prev.type === 'OUT' && cur.type === 'OUT') {
          if (!seqErr) seqErr = `Sequence error: Expected Punch In but got Punch Out at ${cur.time}`;
        }
      }
    }

    if (!seqErr && sorted.length > 0 && sorted[sorted.length - 1].type === 'IN') {
      seqErr = `Sequence missing: Last punch is Punch In with no matching Punch Out`;
    }

    const hW = Math.floor(workSecs / 3600);
    const mW = Math.floor((workSecs % 3600) / 60);
    const hB = Math.floor(breakSecs / 3600);
    const mB = Math.floor((breakSecs % 3600) / 60);

    return {
      totalHours: `${hW}h ${mW}m`,
      totalBreaks: `${hB}h ${mB}m`,
      sequenceText: !seqErr ? '✓ Valid' : '1 Missing / Issue',
      sequenceError: seqErr,
    };
  }, [item?.punches]);

  if (!item) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <Animated.View
          entering={FadeInUp.springify()}
          style={{
            backgroundColor: colors.white,
            borderTopLeftRadius: normalize(24),
            borderTopRightRadius: normalize(24),
            padding: normalize(20),
            paddingBottom: Math.max(insets.bottom, normalize(16)) + (Platform.OS === 'android' ? normalize(16) : normalize(8)),
            height: '82%',
            maxHeight: '88%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* Drag Handle Bar */}
          <View style={{ width: normalize(40), height: normalize(4), backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: normalize(16) }} />

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: normalize(6) }}>
            <Typography style={{ fontSize: normalize(17), fontWeight: '800', color: colors.text.primary, flex: 1 }}>
              Correction Details — {formattedDateHeader}
            </Typography>
            <TouchableOpacity onPress={onClose} style={{ padding: normalize(4), backgroundColor: '#F1F5F9', borderRadius: normalize(16), marginLeft: normalize(10) }}>
              <X size={18} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Typography style={{ fontSize: normalize(13), color: colors.text.muted, fontWeight: '500', marginBottom: normalize(16) }}>
            All punch entries for this date with requested modifications.
          </Typography>

          <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: normalize(16) }} />

          {/* Main Content ScrollView */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: normalize(380) }}>
            {/* Punch Items List */}
            <View style={{ gap: normalize(10), marginBottom: normalize(16) }}>
              {(item.punches || []).map((p, idx) => (
                <View
                  key={p.id || idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justify: 'space-between',
                    padding: normalize(12),
                    backgroundColor: p.type === 'IN' ? '#F0FDF4' : '#F8FAFC',
                    borderRadius: normalize(12),
                    borderLeftWidth: 4,
                    borderLeftColor: p.type === 'IN' ? '#10B981' : '#64748B',
                    borderWidth: 1,
                    borderColor: p.type === 'IN' ? 'rgba(16, 185, 129, 0.2)' : '#E2E8F0',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(10) }}>
                    <View style={{ paddingHorizontal: normalize(8), paddingVertical: normalize(4), borderRadius: normalize(6), backgroundColor: p.type === 'IN' ? '#DCFCE7' : '#E2E8F0' }}>
                      <Typography style={{ fontSize: normalize(10), fontWeight: '900', color: p.type === 'IN' ? '#15803D' : '#475569' }}>
                        PUNCH {p.type}
                      </Typography>
                    </View>
                    <Typography style={{ fontSize: normalize(14), fontWeight: '800', fontFamily: 'monospace', color: colors.text.primary }}>
                      {p.time}
                    </Typography>
                    <Typography style={{ fontSize: normalize(12), color: colors.text.muted, fontWeight: '600' }}>
                      Correction
                    </Typography>
                  </View>

                  <View style={{ paddingHorizontal: normalize(8), paddingVertical: normalize(3), borderRadius: normalize(6), backgroundColor: '#DCFCE7' }}>
                    <Typography style={{ fontSize: normalize(11), fontWeight: '800', color: '#15803D' }}>
                      Added
                    </Typography>
                  </View>
                </View>
              ))}
            </View>

            {/* CORRECTION SUMMARY Box */}
            <View style={{ backgroundColor: colors.white, borderRadius: normalize(14), borderWidth: 1, borderColor: '#E2E8F0', padding: normalize(14), marginBottom: normalize(16) }}>
              <Typography style={{ fontSize: normalize(11), fontWeight: '900', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: normalize(12) }}>
                CORRECTION SUMMARY
              </Typography>

              <View style={{ flexDirection: 'row', gap: normalize(8), marginBottom: preview.sequenceError ? normalize(12) : 0 }}>
                {/* Total Hours */}
                <View style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: normalize(10), padding: normalize(10), alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
                  <Typography style={{ fontSize: normalize(10), fontWeight: '800', color: colors.text.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                    TOTAL HOURS
                  </Typography>
                  <Typography style={{ fontSize: normalize(16), fontWeight: '900', color: colors.black }}>
                    {preview.totalHours}
                  </Typography>
                </View>

                {/* Total Breaks */}
                <View style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: normalize(10), padding: normalize(10), alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
                  <Typography style={{ fontSize: normalize(10), fontWeight: '800', color: colors.text.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                    TOTAL BREAKS
                  </Typography>
                  <Typography style={{ fontSize: normalize(16), fontWeight: '900', color: colors.black }}>
                    {preview.totalBreaks}
                  </Typography>
                </View>

                {/* Sequence */}
                <View style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: normalize(10), padding: normalize(10), alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
                  <Typography style={{ fontSize: normalize(10), fontWeight: '800', color: colors.text.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                    SEQUENCE
                  </Typography>
                  <Typography style={{ fontSize: normalize(13), fontWeight: '900', color: preview.sequenceError ? '#D97706' : '#10B981' }}>
                    {preview.sequenceText}
                  </Typography>
                </View>
              </View>

              {/* Sequence Error Warning */}
              {preview.sequenceError && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6), paddingTop: normalize(10), borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                  <AlertTriangle size={14} color="#D97706" />
                  <Typography style={{ flex: 1, fontSize: normalize(12), fontWeight: '700', color: '#D97706' }}>
                    {preview.sequenceError}
                  </Typography>
                </View>
              )}
            </View>

            {/* Reason Box */}
            {item.reason && (
              <View style={{ backgroundColor: '#F8FAFC', borderRadius: normalize(12), padding: normalize(12), borderWidth: 1, borderColor: '#E2E8F0', marginBottom: normalize(16) }}>
                <Typography style={{ fontSize: normalize(11), fontWeight: '800', color: colors.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>
                  REASON
                </Typography>
                <Typography style={{ fontSize: normalize(13), color: colors.text.primary, fontWeight: '500', lineHeight: normalize(18) }}>
                  {item.reason}
                </Typography>
              </View>
            )}
          </ScrollView>

          {/* Footer Action */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingTop: normalize(12), borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={{
                paddingHorizontal: normalize(24),
                paddingVertical: normalize(10),
                borderRadius: normalize(12),
                borderWidth: 1.5,
                borderColor: colors.primary,
                backgroundColor: colors.white,
              }}
            >
              <Typography style={{ fontSize: normalize(14), fontWeight: '800', color: colors.primary }}>
                Close
              </Typography>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CORRECTION APPROVAL CARD (Correction Approvals tab row)
═══════════════════════════════════════════════════════════════ */

export const CorrectionApprovalCard = ({
  item,
  index,
  onReview,
}: {
  item: AttendanceCorrectionRequest;
  index: number;
  onReview: (item: AttendanceCorrectionRequest) => void;
}) => {
  const isPending = item.status === 'Pending';
  const sc = STATUS_COLOR[item.status] ?? colors.text.muted;
  const sb = STATUS_BG[item.status]   ?? 'rgba(156, 163, 175, 0.1)';

  const fmt = (d: any, f: string) => {
    const m = moment(d);
    return m.isValid() ? m.format(f) : '--';
  };

  return (
    <Animated.View entering={FadeInUp.delay((index % 10) * 30).duration(200)}>
      <BlurView intensity={50} tint="light" style={s.reqCard}>
        <View style={s.reqCardTop}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(8), marginBottom: 2 }}>
              <Typography style={{ fontSize: normalize(15), fontWeight: '800', color: colors.text.primary }}>
                {item.employeeName || 'Employee'}
              </Typography>
              {item.empCode ? (
                <View style={{ paddingHorizontal: normalize(6), paddingVertical: normalize(2), backgroundColor: '#F1F5F9', borderRadius: normalize(6) }}>
                  <Typography style={{ fontSize: normalize(10), fontWeight: '800', color: colors.text.secondary }}>
                    {item.empCode}
                  </Typography>
                </View>
              ) : null}
            </View>

            <Typography style={s.reqMeta}>
              Date: <Typography style={{ fontWeight: '800', color: colors.black }}>{fmt(item.date, 'DD MMM YYYY')}</Typography>
              {'  ·  '}
              Submitted: {fmt(item.submittedOn, 'DD MMM YYYY')}
            </Typography>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(8) }}>
            <View style={[s.statusBadge, { backgroundColor: sb }]}>
              <View style={[s.statusDot, { backgroundColor: sc }]} />
              <Typography style={[s.statusBadgeText, { color: sc }]}>{item.status}</Typography>
            </View>
          </View>
        </View>

        {/* Changes pill & Reason */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: normalize(8) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(8), flex: 1 }}>
            <View style={{ paddingHorizontal: normalize(8), paddingVertical: normalize(3), backgroundColor: '#EEF2FF', borderRadius: normalize(6) }}>
              <Typography style={{ fontSize: normalize(11), fontWeight: '800', color: '#4F46E5' }}>
                +{item.punches?.length || 1} add
              </Typography>
            </View>
            {item.reason ? (
              <Typography style={{ fontSize: normalize(12), color: colors.text.secondary, fontWeight: '500', flex: 1 }} numberOfLines={1}>
                {item.reason}
              </Typography>
            ) : null}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onReview(item)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: normalize(4),
              paddingHorizontal: normalize(12),
              paddingVertical: normalize(6),
              backgroundColor: isPending ? '#3B82F6' : 'transparent',
              borderRadius: normalize(8),
              borderWidth: isPending ? 0 : 1,
              borderColor: '#3B82F6',
            }}
          >
            <Clock size={12} color={isPending ? colors.white : '#3B82F6'} />
            <Typography style={{ fontSize: normalize(12), fontWeight: '800', color: isPending ? colors.white : '#3B82F6' }}>
              {isPending ? 'Review' : 'View'}
            </Typography>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CORRECTION REVIEW MODAL (Admin/HR Review & Approval Popup)
═══════════════════════════════════════════════════════════════ */

export const CorrectionReviewModal = ({
  visible,
  item,
  onClose,
  onApprove,
  onReject,
}: {
  visible: boolean;
  item: AttendanceCorrectionRequest | null;
  onClose: () => void;
  onApprove?: (item: AttendanceCorrectionRequest) => void;
  onReject?: (item: AttendanceCorrectionRequest) => void;
}) => {
  const insets = useSafeAreaInsets();
  const [existingPunches, setExistingPunches] = useState<AttendanceCorrectionPunch[]>([]);
  const [isLoadingPunches, setIsLoadingPunches] = useState<boolean>(false);

  useEffect(() => {
    if (!visible || !item || !item.employeeId) {
      setExistingPunches([]);
      return;
    }

    let isMounted = true;
    setIsLoadingPunches(true);

    attendanceApi.getEmployeePunchesByDate(item.employeeId, item.date)
      .then((punches) => {
        if (isMounted) {
          setExistingPunches(punches || []);
        }
      })
      .catch(() => {
        if (isMounted) setExistingPunches([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPunches(false);
      });

    return () => {
      isMounted = false;
    };
  }, [visible, item]);

  // Merge existing machine punches + correction requested punches without duplication
  const allPunches = useMemo(() => {
    if (!item) return [];

    const existingMapped = (existingPunches || []).map((p) => ({
      ...p,
      source: p.source || 'machine',
      isAdded: p.source?.toLowerCase() === 'correction',
      isDeleted: Boolean(p.isDeleted),
    }));

    const requestedMapped = (item.punches || []).map((p) => ({
      ...p,
      source: 'correction',
      isAdded: true,
      isDeleted: Boolean((p as any).isDeleted),
    }));

    const result = [...existingMapped];

    requestedMapped.forEach((req) => {
      const normTime = (t: string) => {
        const m = moment(t, ['HH:mm:ss', 'hh:mm A', 'HH:mm']);
        return m.isValid() ? m.format('HH:mm') : t;
      };

      const existingIndex = result.findIndex((ex) => {
        return normTime(ex.time) === normTime(req.time) && ex.type?.toUpperCase() === req.type?.toUpperCase();
      });

      if (existingIndex !== -1) {
        result[existingIndex] = {
          ...result[existingIndex],
          isAdded: true,
          source: 'correction',
          isDeleted: req.isDeleted ?? result[existingIndex].isDeleted,
        };
      } else {
        result.push(req);
      }
    });

    const parsePunchSecs = (tStr: string) => {
      const m = moment(tStr, ['HH:mm:ss', 'hh:mm A', 'HH:mm']);
      if (!m.isValid()) return 0;
      return m.hours() * 3600 + m.minutes() * 60 + m.seconds();
    };

    return result.sort((a, b) => parsePunchSecs(a.time) - parsePunchSecs(b.time));
  }, [existingPunches, item]);

  // Compute metrics from allPunches
  const preview = useMemo(() => {
    if (!allPunches || allPunches.length === 0) {
      return {
        totalHours: '0h 0m',
        totalBreaks: '0h 0m',
        sequenceText: '✓ Valid',
        sequenceError: null,
      };
    }

    const parsePunchSecs = (tStr: string) => {
      const m = moment(tStr, ['HH:mm:ss', 'hh:mm A', 'HH:mm']);
      if (!m.isValid()) return 0;
      return m.hours() * 3600 + m.minutes() * 60 + m.seconds();
    };

    const sorted = [...allPunches].sort((a, b) => parsePunchSecs(a.time) - parsePunchSecs(b.time));

    let workSecs = 0;
    let breakSecs = 0;
    let seqErr: string | null = null;

    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i];
      if (i === 0) {
        if (cur.type === 'OUT') {
          seqErr = `Sequence error: First punch cannot be Punch Out at ${cur.time}`;
        }
      } else {
        const prev = sorted[i - 1];
        const dur = Math.max(0, parsePunchSecs(cur.time) - parsePunchSecs(prev.time));

        if (prev.type === 'IN' && cur.type === 'OUT') {
          workSecs += dur;
        } else if (prev.type === 'OUT' && cur.type === 'IN') {
          breakSecs += dur;
        } else if (prev.type === 'IN' && cur.type === 'IN') {
          if (!seqErr) seqErr = `Sequence error: Expected Punch Out but got Punch In at ${cur.time}`;
        } else if (prev.type === 'OUT' && cur.type === 'OUT') {
          if (!seqErr) seqErr = `Sequence error: Expected Punch In but got Punch Out at ${cur.time}`;
        }
      }
    }

    if (!seqErr && sorted.length > 0 && sorted[sorted.length - 1].type === 'IN') {
      seqErr = 'Sequence missing: Last punch is Punch In with no matching Punch Out';
    }

    const hW = Math.floor(workSecs / 3600);
    const mW = Math.floor((workSecs % 3600) / 60);
    const hB = Math.floor(breakSecs / 3600);
    const mB = Math.floor((breakSecs % 3600) / 60);

    return {
      totalHours: `${hW}h ${mW}m`,
      totalBreaks: `${hB}h ${mB}m`,
      sequenceText: !seqErr ? '✓ Valid' : '1 Missing / Issue',
      sequenceError: seqErr,
    };
  }, [allPunches]);

  const formattedDateHeader = useMemo(() => {
    if (!item?.date) return '';
    const m = moment(item.date);
    return m.isValid() ? m.format('DD MMM YYYY') : item.date;
  }, [item?.date]);

  if (!item) return null;

  const sc = STATUS_COLOR[item.status] ?? colors.text.muted;
  const sb = STATUS_BG[item.status]   ?? 'rgba(156, 163, 175, 0.1)';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <Animated.View
          entering={FadeInUp.springify()}
          style={{
            backgroundColor: colors.white,
            borderTopLeftRadius: normalize(24),
            borderTopRightRadius: normalize(24),
            padding: normalize(20),
            paddingBottom: Math.max(insets.bottom, normalize(16)) + (Platform.OS === 'android' ? normalize(16) : normalize(8)),
            height: '82%',
            maxHeight: '88%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* Drag Handle Bar */}
          <View style={{ width: normalize(40), height: normalize(4), backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: normalize(14) }} />

          {/* Modal Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(12) }}>
            <Typography style={{ fontSize: normalize(15), fontWeight: '800', color: colors.text.primary, flex: 1 }}>
              Correction Request — {item.employeeName || 'Employee'} ({formattedDateHeader})
            </Typography>
            <TouchableOpacity onPress={onClose} style={s.centerModalCloseBtn}>
              <X size={normalize(16)} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Form Scroll Content */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: normalize(12) }}>
            {/* Employee Info & Status */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(8) }}>
              <Typography style={{ fontSize: normalize(13), color: colors.text.primary, fontWeight: '700' }}>
                Employee: {item.employeeName || 'Employee'} {item.empCode ? `(${item.empCode})` : ''}
              </Typography>
              <View style={[s.statusBadge, { backgroundColor: sb }]}>
                <View style={[s.statusDot, { backgroundColor: sc }]} />
                <Typography style={[s.statusBadgeText, { color: sc }]}>{item.status}</Typography>
              </View>
            </View>

            {item.reason ? (
              <Typography style={{ fontSize: normalize(13), color: colors.text.secondary, fontWeight: '600', marginBottom: normalize(14) }}>
                Reason: <Typography style={{ color: colors.black, fontWeight: '700' }}>{item.reason}</Typography>
              </Typography>
            ) : null}

            {/* Punch Entries Section */}
            <Typography style={{ fontSize: normalize(11), fontWeight: '900', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: normalize(10) }}>
              PUNCH ENTRIES ({formattedDateHeader.toUpperCase()})
            </Typography>

            {isLoadingPunches ? (
              <View style={[s.punchEmptyBox, { justifyContent: 'center', paddingVertical: normalize(16), gap: normalize(8), marginBottom: normalize(14) }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Typography style={{ fontSize: normalize(12), color: colors.text.secondary, fontWeight: '600' }}>
                  Loading employee punch records...
                </Typography>
              </View>
            ) : (
              <View style={{ gap: normalize(8), marginBottom: normalize(16) }}>
                {allPunches.map((p, idx) => (
                  <View
                    key={p.id || idx}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: normalize(10),
                      backgroundColor: p.isAdded ? '#F0FDF4' : '#F8FAFC',
                      borderRadius: normalize(10),
                      borderLeftWidth: 4,
                      borderLeftColor: p.isAdded ? '#10B981' : (p.type === 'IN' ? '#10B981' : '#64748B'),
                      borderWidth: 1,
                      borderColor: p.isAdded ? 'rgba(16, 185, 129, 0.25)' : '#E2E8F0',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(10) }}>
                      <View style={{ paddingHorizontal: normalize(8), paddingVertical: normalize(3), borderRadius: normalize(6), backgroundColor: p.type === 'IN' ? '#DCFCE7' : '#E2E8F0' }}>
                        <Typography style={{ fontSize: normalize(10), fontWeight: '900', color: p.type === 'IN' ? '#15803D' : '#475569' }}>
                          PUNCH {p.type}
                        </Typography>
                      </View>
                      <Typography style={{ fontSize: normalize(14), fontWeight: '800', fontFamily: 'monospace', color: colors.text.primary }}>
                        {p.time}
                      </Typography>
                      {p.isAdded ? (
                        <Typography style={{ fontSize: normalize(12), color: colors.text.muted, fontWeight: '600' }}>
                          Correction
                        </Typography>
                      ) : null}
                    </View>

                    {p.isAdded ? (
                      <View style={{ paddingHorizontal: normalize(8), paddingVertical: normalize(3), borderRadius: normalize(6), backgroundColor: '#DCFCE7' }}>
                        <Typography style={{ fontSize: normalize(11), fontWeight: '800', color: '#15803D' }}>
                          Added
                        </Typography>
                      </View>
                    ) : (
                      <Typography style={{ fontSize: normalize(11), color: colors.text.muted, fontWeight: '600' }}>
                        {p.source || 'Machine'}
                      </Typography>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* CORRECTION PREVIEW Box */}
            <View style={{ backgroundColor: colors.white, borderRadius: normalize(14), borderWidth: 1, borderColor: '#E2E8F0', padding: normalize(14), marginBottom: normalize(16) }}>
              <Typography style={{ fontSize: normalize(11), fontWeight: '900', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: normalize(12) }}>
                CORRECTION PREVIEW
              </Typography>

              <View style={{ flexDirection: 'row', gap: normalize(8), marginBottom: preview.sequenceError ? normalize(12) : 0 }}>
                <View style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: normalize(10), padding: normalize(10), alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
                  <Typography style={{ fontSize: normalize(10), fontWeight: '800', color: colors.text.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                    TOTAL HOURS
                  </Typography>
                  <Typography style={{ fontSize: normalize(15), fontWeight: '900', color: colors.black }}>
                    {preview.totalHours}
                  </Typography>
                </View>

                <View style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: normalize(10), padding: normalize(10), alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
                  <Typography style={{ fontSize: normalize(10), fontWeight: '800', color: colors.text.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                    TOTAL BREAKS
                  </Typography>
                  <Typography style={{ fontSize: normalize(15), fontWeight: '900', color: colors.black }}>
                    {preview.totalBreaks}
                  </Typography>
                </View>

                <View style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: normalize(10), padding: normalize(10), alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
                  <Typography style={{ fontSize: normalize(10), fontWeight: '800', color: colors.text.muted, textTransform: 'uppercase', marginBottom: 4 }}>
                    SEQUENCE
                  </Typography>
                  <Typography style={{ fontSize: normalize(12), fontWeight: '900', color: preview.sequenceError ? '#D97706' : '#10B981' }}>
                    {preview.sequenceText}
                  </Typography>
                </View>
              </View>

              {preview.sequenceError && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6), paddingTop: normalize(10), borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                  <AlertTriangle size={14} color="#D97706" />
                  <Typography style={{ flex: 1, fontSize: normalize(12), fontWeight: '700', color: '#D97706' }}>
                    {preview.sequenceError}
                  </Typography>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Action Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: normalize(8), paddingTop: normalize(12), borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={{
                paddingHorizontal: normalize(18),
                paddingVertical: normalize(9),
                borderRadius: normalize(10),
                borderWidth: 1.5,
                borderColor: '#CBD5E1',
                backgroundColor: colors.white,
              }}
            >
              <Typography style={{ fontSize: normalize(13), fontWeight: '800', color: colors.text.primary }}>
                Close
              </Typography>
            </TouchableOpacity>

            {item.status === 'Pending' && onReject && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onReject(item)}
                style={{
                  paddingHorizontal: normalize(18),
                  paddingVertical: normalize(9),
                  borderRadius: normalize(10),
                  borderWidth: 1.5,
                  borderColor: '#EF4444',
                  backgroundColor: colors.white,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: normalize(6),
                }}
              >
                <XCircle size={14} color="#EF4444" />
                <Typography style={{ fontSize: normalize(13), fontWeight: '800', color: '#EF4444' }}>
                  Reject
                </Typography>
              </TouchableOpacity>
            )}

            {item.status === 'Pending' && onApprove && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onApprove(item)}
                style={{ borderRadius: normalize(10), overflow: 'hidden' }}
              >
                <LinearGradient
                  colors={colors.loginButtonBgGradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: normalize(20),
                    paddingVertical: normalize(10),
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: normalize(6),
                  }}
                >
                  <CheckCircle2 size={14} color={colors.white} />
                  <Typography style={{ fontSize: normalize(13), fontWeight: '800', color: colors.white }}>
                    Approve
                  </Typography>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════════
   NEW ATTENDANCE CORRECTION MODAL (Center modal with scrolling)
═══════════════════════════════════════════════════════════════ */

export const NewCorrectionModal = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting = false,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { date: string; punches: AttendanceCorrectionPunch[]; reason: string }) => void;
  isSubmitting?: boolean;
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => moment().format('DD/MM/YYYY'));
  const [reason, setReason] = useState<string>('');
  const [isLoadingPunches, setIsLoadingPunches] = useState<boolean>(false);

  // Punch addition states
  const [punchType, setPunchType] = useState<'IN' | 'OUT'>('IN');
  const [punchTime, setPunchTime] = useState<string>('09:00 AM');
  const [punches, setPunches] = useState<AttendanceCorrectionPunch[]>([]);

  // Time picker modal states
  const [showTimePickerModal, setShowTimePickerModal] = useState<boolean>(false);
  const [selectedHour, setSelectedHour] = useState<string>('09');
  const [selectedMin, setSelectedMin] = useState<string>('00');
  const [selectedMeridiem, setSelectedMeridiem] = useState<'AM' | 'PM'>('AM');

  // Reset fields when modal is opened fresh
  useEffect(() => {
    if (visible) {
      setSelectedDate(moment().format('DD/MM/YYYY'));
      setReason('');
      setPunchType('IN');
      setPunchTime('09:00 AM');
    }
  }, [visible]);

  // Fetch punches via GET API when selectedDate changes or modal opens
  useEffect(() => {
    if (!visible) return;
    const dateVal = selectedDate || moment().format('DD/MM/YYYY');
    const apiDateStr = moment(dateVal, ['DD/MM/YYYY', 'YYYY-MM-DD']).isValid()
      ? moment(dateVal, ['DD/MM/YYYY', 'YYYY-MM-DD']).format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD');

    let isMounted = true;
    setIsLoadingPunches(true);

    attendanceApi.getPunchesByDate(apiDateStr)
      .then((data) => {
        if (isMounted) {
          setPunches(data || []);
        }
      })
      .catch(() => {
        if (isMounted) setPunches([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPunches(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, visible]);

  // Compute correction preview metrics
  const preview = useMemo(() => {
    if (!punches || punches.length === 0) {
      return {
        totalHours: '0h 0m',
        totalBreaks: '0h 0m',
        sequenceText: '✓ Valid',
        sequenceError: null,
      };
    }

    const parsePunchSecs = (tStr: string) => {
      const m = moment(tStr, ['HH:mm:ss', 'hh:mm A', 'HH:mm']);
      if (!m.isValid()) return 0;
      return m.hours() * 3600 + m.minutes() * 60 + m.seconds();
    };

    const sorted = [...punches].sort((a, b) => parsePunchSecs(a.time) - parsePunchSecs(b.time));

    let workSecs = 0;
    let breakSecs = 0;
    let seqErr: string | null = null;

    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i];
      if (i === 0) {
        if (cur.type === 'OUT') {
          seqErr = `Sequence error: First punch cannot be Punch Out at ${cur.time}`;
        }
      } else {
        const prev = sorted[i - 1];
        const dur = Math.max(0, parsePunchSecs(cur.time) - parsePunchSecs(prev.time));

        if (prev.type === 'IN' && cur.type === 'OUT') {
          workSecs += dur;
        } else if (prev.type === 'OUT' && cur.type === 'IN') {
          breakSecs += dur;
        } else if (prev.type === 'IN' && cur.type === 'IN') {
          if (!seqErr) seqErr = `Sequence error: Expected Punch Out but got Punch In at ${cur.time}`;
        } else if (prev.type === 'OUT' && cur.type === 'OUT') {
          if (!seqErr) seqErr = `Sequence error: Expected Punch In but got Punch Out at ${cur.time}`;
        }
      }
    }

    if (!seqErr && sorted.length > 0 && sorted[sorted.length - 1].type === 'IN') {
      seqErr = 'Sequence missing: Last punch is Punch In with no matching Punch Out';
    }

    const hW = Math.floor(workSecs / 3600);
    const mW = Math.floor((workSecs % 3600) / 60);
    const hB = Math.floor(breakSecs / 3600);
    const mB = Math.floor((breakSecs % 3600) / 60);

    return {
      totalHours: `${hW}h ${mW}m`,
      totalBreaks: `${hB}h ${mB}m`,
      sequenceText: !seqErr ? '✓ Valid' : '1 Missing / Issue',
      sequenceError: seqErr,
    };
  }, [punches]);

  const handleAddPunch = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newEntry: AttendanceCorrectionPunch = {
      id: `punch_${Date.now()}`,
      type: punchType,
      time: punchTime,
      source: 'Added',
      isAdded: true,
    };
    setPunches((prev) => [newEntry, ...prev]);
  };

  const handleDeletePunch = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPunches((prev) => prev.filter((p) => p.id !== id));
  };

  const formattedDateHeader = useMemo(() => {
    if (!selectedDate) return '';
    const m = moment(selectedDate, ['DD/MM/YYYY', 'YYYY-MM-DD']);
    return m.isValid() ? m.format('DD MMM YYYY') : selectedDate;
  }, [selectedDate]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <BlurView intensity={40} tint="dark" style={s.centerModalOverlay}>
        <Animated.View entering={FadeInUp.springify()} style={s.centerModalCard}>
          {/* Header */}
          <View style={s.centerModalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(10) }}>
              <View style={{ width: normalize(32), height: normalize(32), borderRadius: normalize(10), backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={normalize(18)} color={colors.primary} />
              </View>
              <Typography style={s.centerModalTitle}>New Attendance Correction</Typography>
            </View>
            <TouchableOpacity onPress={onClose} style={s.centerModalCloseBtn}>
              <X size={normalize(16)} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Main Form Scroll View */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: normalize(12) }}
          >
            {/* Common DatePicker Component */}
            <View style={{ marginBottom: normalize(14) }}>
              <DatePicker
                label="Date"
                required
                initialDate={selectedDate}
                onDateChange={(dateStr: string) => setSelectedDate(dateStr)}
              />
            </View>

            {/* Punch Entries Section (if Date selected) */}
            {selectedDate ? (
              <View style={{ marginBottom: normalize(14) }}>
                <Typography style={[s.modalFieldLabel, { color: colors.black, fontWeight: '800' }]}>
                  Punch Entries for {formattedDateHeader}
                </Typography>

                {/* Add Punch Box */}
                <View style={s.addPunchCard}>
                  <Typography style={s.addPunchTitle}>Add Punch</Typography>
                  <View style={s.addPunchControls}>
                    {/* Dynamic Punch Type Toggle Selector */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        s.punchTypeSelector,
                        punchType === 'IN' ? s.punchTypeSelectorIn : s.punchTypeSelectorOut,
                      ]}
                      onPress={async () => {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setPunchType(punchType === 'IN' ? 'OUT' : 'IN');
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
                        <View
                          style={{
                            width: normalize(7),
                            height: normalize(7),
                            borderRadius: normalize(3.5),
                            backgroundColor: punchType === 'IN' ? '#10B981' : '#475569',
                          }}
                        />
                        <Typography
                          style={[
                            s.punchTypeSelectText,
                            punchType === 'IN' ? s.punchTypeSelectTextIn : s.punchTypeSelectTextOut,
                          ]}
                        >
                          Punch {punchType === 'IN' ? 'In' : 'Out'}
                        </Typography>
                      </View>
                    </TouchableOpacity>

                    {/* Time Input / Picker Selector Box */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={s.timeInputBox}
                      onPress={async () => {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowTimePickerModal(true);
                      }}
                    >
                      <Typography style={s.timeInputText}>{punchTime}</Typography>
                      <View style={s.timeIconBadge}>
                        <Clock size={13} color={colors.primary} />
                      </View>
                    </TouchableOpacity>

                    {/* Add Button with Gradient */}
                    <TouchableOpacity activeOpacity={0.85} style={s.addPunchBtnGrad} onPress={handleAddPunch}>
                      <LinearGradient
                        colors={colors.loginButtonBgGradient as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={s.addPunchBtn}
                      >
                        <Plus size={15} color={colors.white} />
                        <Typography style={s.addPunchBtnText}>Add</Typography>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Punch List / Empty Banner / Loader */}
                {isLoadingPunches ? (
                  <View style={[s.punchEmptyBox, { justifyContent: 'center', paddingVertical: normalize(16), gap: normalize(8) }]}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Typography style={{ fontSize: normalize(12), color: colors.text.secondary, fontWeight: '600' }}>
                      Fetching punches for {formattedDateHeader}...
                    </Typography>
                  </View>
                ) : punches.length === 0 ? (
                  <View style={s.punchEmptyBox}>
                    <Info size={18} color={colors.primary} />
                    <Typography style={s.punchEmptyText}>
                      No punches recorded for this date. Use the bar above to add a punch.
                    </Typography>
                  </View>
                ) : (
                  <View style={s.punchListContainer}>
                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={{ maxHeight: normalize(190) }}>
                      {punches.map((p) => (
                        <View
                          key={p.id}
                          style={[
                            s.punchEntryRow,
                            p.type === 'IN' ? s.punchEntryRowIn : s.punchEntryRowOut,
                          ]}
                        >
                          <View style={s.punchRowLeft}>
                            <View style={p.type === 'IN' ? s.punchInBadge : s.punchOutBadge}>
                              <Typography style={p.type === 'IN' ? s.punchInBadgeText : s.punchOutBadgeText}>
                                PUNCH {p.type}
                              </Typography>
                            </View>
                            <Typography style={s.punchTimeText}>{p.time}</Typography>
                            {p.isAdded ? (
                              <View style={s.addedBadge}>
                                <Typography style={s.addedBadgeText}>Added</Typography>
                              </View>
                            ) : (
                              <Typography style={s.punchSourceTag}>{p.source}</Typography>
                            )}
                          </View>

                          <TouchableOpacity
                            onPress={() => handleDeletePunch(p.id)}
                            style={{ padding: normalize(4), flexDirection: 'row', alignItems: 'center', gap: normalize(4) }}
                          >
                            {p.isAdded ? (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(4), borderWidth: 1, borderColor: colors.primary, borderRadius: normalize(6), paddingHorizontal: normalize(8), paddingVertical: normalize(3), backgroundColor: colors.primary + '08' }}>
                                <RotateCcw size={12} color={colors.primary} />
                                <Typography style={{ color: colors.primary, fontSize: normalize(11), fontWeight: '800' }}>
                                  Undo
                                </Typography>
                              </View>
                            ) : (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(4) }}>
                                <Trash2 size={13} color={colors.primary} />
                                <Typography style={s.deletePunchBtnText}>Delete</Typography>
                              </View>
                            )}
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Correction Preview Card */}
                {punches.length > 0 && (
                  <View style={s.previewContainer}>
                    <Typography style={s.previewTitle}>CORRECTION PREVIEW</Typography>
                    <View style={s.previewGrid}>
                      <View style={s.previewCell}>
                        <Typography style={s.previewCellLabel}>TOTAL HOURS</Typography>
                        <Typography style={[s.previewCellVal, { color: colors.primary }]}>{preview.totalHours}</Typography>
                      </View>
                      <View style={s.previewCell}>
                        <Typography style={s.previewCellLabel}>TOTAL BREAKS</Typography>
                        <Typography style={[s.previewCellVal, { color: colors.emailBlue }]}>{preview.totalBreaks}</Typography>
                      </View>
                      <View style={s.previewCell}>
                        <Typography style={s.previewCellLabel}>SEQUENCE</Typography>
                        <Typography style={[s.previewCellVal, { color: preview.sequenceError ? colors.warning : colors.success, fontSize: normalize(12) }]}>
                          {preview.sequenceText}
                        </Typography>
                      </View>
                    </View>

                    {preview.sequenceError && (
                      <View style={s.sequenceErrorBox}>
                        <AlertTriangle size={16} color="#D97706" />
                        <Typography style={s.sequenceErrorText}>
                          {preview.sequenceError}
                        </Typography>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ) : null}

            {/* Reason Field */}
            <View style={{ marginBottom: normalize(14) }}>
              <Typography style={s.modalFieldLabel}>
                Reason <Typography style={{ color: colors.error }}>*</Typography>
              </Typography>
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Explain why this correction is needed..."
                placeholderTextColor={colors.text.muted}
                multiline
                style={[s.modalInput, { height: normalize(90), textAlignVertical: 'top' }]}
              />
              <Typography
                style={{
                  fontSize: normalize(11),
                  fontWeight: '700',
                  color: reason.trim().length < 5 ? '#D97706' : colors.success,
                  marginTop: normalize(4),
                }}
              >
                Min 5 characters required ({reason.trim().length}/5)
              </Typography>
            </View>

            {/* Validation alert if no punches */}
            {punches.length === 0 && !isLoadingPunches && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: normalize(8),
                  backgroundColor: '#FEF3C7',
                  borderWidth: 1,
                  borderColor: '#FDE68A',
                  padding: normalize(10),
                  borderRadius: normalize(10),
                  marginBottom: normalize(10),
                }}
              >
                <AlertTriangle size={normalize(16)} color="#D97706" />
                <Typography style={{ fontSize: normalize(12), color: '#92400E', fontWeight: '600', flex: 1 }}>
                  At least 1 punch entry is required before submitting a correction.
                </Typography>
              </View>
            )}
          </ScrollView>

          {/* FIXED Footer Action Buttons at Bottom */}
          <View style={s.formFooterRow}>
            <TouchableOpacity activeOpacity={0.8} style={s.formCancelBtn} onPress={onClose} disabled={isSubmitting}>
              <Typography style={s.formCancelBtnText}>Cancel</Typography>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={reason.trim().length < 5 || !selectedDate || punches.length === 0 || isSubmitting}
              style={[
                s.formSubmitBtnGrad,
                (reason.trim().length < 5 || !selectedDate || punches.length === 0 || isSubmitting) && s.formSubmitBtnDisabled,
              ]}
              onPress={async () => {
                if (reason.trim().length < 5 || !selectedDate || punches.length === 0 || isSubmitting) return;
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onSubmit({ date: selectedDate, punches, reason: reason.trim() });
              }}
            >
              <LinearGradient
                colors={(reason.trim().length < 5 || !selectedDate || punches.length === 0 || isSubmitting) ? ['#94A3B8', '#CBD5E1'] : colors.loginButtonBgGradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.formSubmitBtn}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Typography style={s.formSubmitBtnText}>Submit Correction</Typography>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>

      {/* Luxury Time Selector Modal Overlay */}
      {showTimePickerModal && (
        <Modal visible={showTimePickerModal} animationType="fade" transparent onRequestClose={() => setShowTimePickerModal(false)}>
          <BlurView intensity={50} tint="dark" style={s.centerModalOverlay}>
            <Animated.View entering={FadeInUp.springify()} style={[s.centerModalCard, { maxWidth: normalize(380), height: 'auto' }]}>
              {/* Modal Header */}
              <View style={s.centerModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(8) }}>
                  <View style={{ width: normalize(32), height: normalize(32), borderRadius: normalize(10), backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={normalize(18)} color={colors.primary} />
                  </View>
                  <Typography style={s.centerModalTitle}>Select Punch Time</Typography>
                </View>
                <TouchableOpacity onPress={() => setShowTimePickerModal(false)} style={s.centerModalCloseBtn}>
                  <X size={normalize(16)} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Digital Time Preview Banner */}
              <View style={s.digitalTimeBanner}>
                <Typography style={s.digitalTimeText}>
                  {`${selectedHour}:${selectedMin} ${selectedMeridiem}`}
                </Typography>
                <Typography style={s.digitalTimeSub}>SELECTED TIME</Typography>
              </View>

              {/* Quick Presets */}
              <Typography style={{ fontSize: normalize(11), color: colors.text.secondary, fontWeight: '800', marginBottom: normalize(8), textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Quick Presets
              </Typography>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: normalize(8), marginBottom: normalize(16) }}>
                {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '06:00 PM', '07:00 PM'].map((preset) => {
                  const isCurrent = `${selectedHour}:${selectedMin} ${selectedMeridiem}` === preset;
                  return (
                    <TouchableOpacity
                      key={preset}
                      activeOpacity={0.8}
                      onPress={async () => {
                        await Haptics.selectionAsync();
                        const parts = preset.split(/[: ]/);
                        if (parts.length >= 3) {
                          setSelectedHour(parts[0]);
                          setSelectedMin(parts[1]);
                          setSelectedMeridiem(parts[2] as 'AM' | 'PM');
                        }
                        setPunchTime(preset);
                      }}
                      style={{ borderRadius: normalize(10), overflow: 'hidden' }}
                    >
                      {isCurrent ? (
                        <LinearGradient
                          colors={colors.loginButtonBgGradient as any}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{ paddingHorizontal: normalize(12), paddingVertical: normalize(7), alignItems: 'center' }}
                        >
                          <Typography style={{ fontSize: normalize(12), fontWeight: '800', color: colors.white }}>
                            {preset}
                          </Typography>
                        </LinearGradient>
                      ) : (
                        <View style={{ paddingHorizontal: normalize(12), paddingVertical: normalize(7), backgroundColor: '#F1F5F9', alignItems: 'center', borderRadius: normalize(10) }}>
                          <Typography style={{ fontSize: normalize(12), fontWeight: '700', color: colors.black }}>
                            {preset}
                          </Typography>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Time Selector (Hours, Minutes, AM/PM) */}
              <View style={{ marginBottom: normalize(18) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(10) }}>
                  <Typography style={{ fontSize: normalize(11), color: colors.text.secondary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Custom Time
                  </Typography>

                  {/* AM / PM Segmented Switch */}
                  <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: normalize(10), padding: 3, borderWidth: 1.5, borderColor: '#E2E8F0' }}>
                    {(['AM', 'PM'] as const).map((mer) => (
                      <TouchableOpacity
                        key={mer}
                        onPress={async () => {
                          await Haptics.selectionAsync();
                          setSelectedMeridiem(mer);
                        }}
                        style={{ borderRadius: normalize(8), overflow: 'hidden' }}
                      >
                        {selectedMeridiem === mer ? (
                          <LinearGradient
                            colors={colors.loginButtonBgGradient as any}
                            style={{ paddingHorizontal: normalize(14), paddingVertical: normalize(6) }}
                          >
                            <Typography style={{ fontSize: normalize(12), fontWeight: '900', color: colors.white }}>
                              {mer}
                            </Typography>
                          </LinearGradient>
                        ) : (
                          <View style={{ paddingHorizontal: normalize(14), paddingVertical: normalize(6) }}>
                            <Typography style={{ fontSize: normalize(12), fontWeight: '800', color: colors.text.secondary }}>
                              {mer}
                            </Typography>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Hour Selection (01 - 12) */}
                <Typography style={{ fontSize: normalize(11), fontWeight: '800', color: colors.text.muted, marginBottom: normalize(6), textTransform: 'uppercase' }}>
                  Hours (01 - 12)
                </Typography>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: normalize(12) }}>
                  {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map((h) => (
                    <TouchableOpacity
                      key={h}
                      activeOpacity={0.8}
                      onPress={async () => {
                        await Haptics.selectionAsync();
                        setSelectedHour(h);
                      }}
                      style={{ marginRight: normalize(8), borderRadius: normalize(12), overflow: 'hidden' }}
                    >
                      {selectedHour === h ? (
                        <LinearGradient
                          colors={colors.loginButtonBgGradient as any}
                          style={{
                            width: normalize(48),
                            height: normalize(48),
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography style={{ fontSize: normalize(16), fontWeight: '900', color: colors.white }}>
                            {h}
                          </Typography>
                        </LinearGradient>
                      ) : (
                        <View
                          style={{
                            width: normalize(48),
                            height: normalize(48),
                            backgroundColor: '#F8FAFC',
                            borderWidth: 1.5,
                            borderColor: '#E2E8F0',
                            borderRadius: normalize(12),
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography style={{ fontSize: normalize(15), fontWeight: '800', color: colors.black }}>
                            {h}
                          </Typography>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Minute Selection (00 - 59) */}
                <Typography style={{ fontSize: normalize(11), fontWeight: '800', color: colors.text.muted, marginBottom: normalize(6), textTransform: 'uppercase' }}>
                  Minutes (00 - 59)
                </Typography>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map((m) => (
                    <TouchableOpacity
                      key={m}
                      activeOpacity={0.8}
                      onPress={async () => {
                        await Haptics.selectionAsync();
                        setSelectedMin(m);
                      }}
                      style={{ marginRight: normalize(8), borderRadius: normalize(12), overflow: 'hidden' }}
                    >
                      {selectedMin === m ? (
                        <LinearGradient
                          colors={colors.loginButtonBgGradient as any}
                          style={{
                            width: normalize(48),
                            height: normalize(48),
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography style={{ fontSize: normalize(16), fontWeight: '900', color: colors.white }}>
                            {m}
                          </Typography>
                        </LinearGradient>
                      ) : (
                        <View
                          style={{
                            width: normalize(48),
                            height: normalize(48),
                            backgroundColor: '#F8FAFC',
                            borderWidth: 1.5,
                            borderColor: '#E2E8F0',
                            borderRadius: normalize(12),
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography style={{ fontSize: normalize(15), fontWeight: '800', color: colors.black }}>
                            {m}
                          </Typography>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Set Time Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={{ borderRadius: normalize(14), overflow: 'hidden', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 }}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPunchTime(`${selectedHour}:${selectedMin} ${selectedMeridiem}`);
                  setShowTimePickerModal(false);
                }}
              >
                <LinearGradient
                  colors={colors.loginButtonBgGradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingVertical: normalize(13), alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: normalize(6) }}
                >
                  <CheckCircle2 size={16} color={colors.white} />
                  <Typography style={s.formSubmitBtnText}>Set Punch Time</Typography>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </BlurView>
        </Modal>
      )}
    </Modal>
  );
};

