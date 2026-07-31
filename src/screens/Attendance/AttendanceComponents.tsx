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
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  AlertCircle, CalendarRange, CheckCircle2,
  Search, X, Trash2,
} from 'lucide-react-native';
import { normalize } from '../../utils/responsive';
import colors from '../../theme/color';
import { Typography } from '../../components/Typography';
import { getServerMoment } from '../../services/api';
import {
  AttendanceLog,
  WFHRequest,
  OvertimeRequest,
  WFHApprovalRecord,
} from '../../api/attendanceApi';
import { Tab, STATUS_COLOR, STATUS_BG, ISSUE_COLOR } from './AttendanceTypes';
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

        {/* Actions — only for pending_hr status */}
        {item.status === 'pending_hr' && (
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
  visible, type, onClose, onSubmit,
}: {
  visible: boolean;
  type: 'WFH' | 'Overtime';
  onClose: () => void;
  onSubmit: (d: any) => void;
}) => {
  const [from,   setFrom]   = useState('');
  const [to,     setTo]     = useState('');
  const [hours,  setHours]  = useState('');
  const [reason, setReason] = useState('');
  const [activeDatePicker, setActiveDatePicker] = useState<'start' | 'end' | null>(null);
  const [tempDate, setTempDate] = useState('');

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
        <View style={s.modalSheet}>
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
  visible, log, onClose,
}: {
  visible: boolean; log: AttendanceLog | null; onClose: () => void;
}) => {
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
        <View style={[s.modalSheet, { maxHeight: '85%' }]}>
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
