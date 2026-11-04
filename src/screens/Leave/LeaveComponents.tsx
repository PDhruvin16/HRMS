/**
 * LeaveComponents.tsx
 * Reusable sub-components and modals for the Leave Screen feature.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import colors from '../../theme/color';
import { Typography } from '../../components/Typography';
import { UICoreDropdown, DropdownOption } from '../../components/UICore/UICoreDropdown';
import DatePicker from '../../components/Date';
import { normalize } from '../../utils/responsive';
import { DetailedLeaveBalance, LeaveRequest, AdminLeaveBalance } from '../../api/leaveApi';
import { getStatusColor, getRequestCode } from './LeaveTypes';
import { s } from './LeaveStyles';
import {
  CheckCircle2,
  XCircle,
  Clock,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  FileText,
  CalendarDays,
  UploadCloud,
  SlidersHorizontal,
  Trash2,
  AlertCircle,
} from 'lucide-react-native';

/* ── Activity Accordion Card (Overview) ────────────────────────────────── */
export const ActivityAccordionCard: React.FC<{ req: any }> = ({ req }) => {
  const [expanded, setExpanded] = useState(false);
  const expandedShared = useSharedValue(0);

  const toggle = () => {
    setExpanded(!expanded);
    expandedShared.value = expanded ? 0 : 1;
    Haptics.selectionAsync();
  };

  const marginTopVal = normalize(16);
  const paddingTopVal = normalize(12);

  const activityStyle = useAnimatedStyle(() => {
    return {
      maxHeight: withTiming(expandedShared.value ? 200 : 0, { duration: 300 }),
      opacity: withTiming(expandedShared.value ? 1 : 0, { duration: 250 }),
      marginTop: withTiming(expandedShared.value ? marginTopVal : 0, { duration: 300 }),
      paddingTop: withTiming(expandedShared.value ? paddingTopVal : 0, { duration: 300 }),
    };
  });

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={toggle}>
      <BlurView intensity={50} tint="light" style={s.activityCard}>
        <View style={s.activityHeader}>
          <View style={s.activityIcon}>
            {req.status?.toLowerCase() === 'approved' ? (
              <CheckCircle2 size={16} color={colors.success} />
            ) : req.status?.toLowerCase() === 'rejected' ? (
              <XCircle size={16} color={colors.error} />
            ) : req.status?.toLowerCase() === 'cancelled' ? (
              <XCircle size={16} color={colors.text.muted} />
            ) : (
              <Clock size={16} color={colors.warning} />
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Typography style={s.activityTitle}>{req.leave_type || req.leaveTypeName}</Typography>
              <View style={[s.statusTag, { backgroundColor: getStatusColor(req.status) + '15' }]}>
                <Typography style={[s.statusTagText, { color: getStatusColor(req.status) }]}>{req.status}</Typography>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <CalendarRange size={12} color={colors.primary} />
                <Typography style={s.activityMeta}>
                  {moment(req.start_date || req.startDate).format('DD MMM')} — {moment(req.end_date || req.endDate).format('DD MMM, YYYY')}
                </Typography>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Clock size={12} color={colors.primary} />
                <Typography style={s.activityMeta}>{Number(req.total_days || req.days || 1).toFixed(2)} Day(s)</Typography>
              </View>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', paddingVertical: 2 }}>
            <Typography style={{ fontSize: normalize(9), color: colors.text.muted, fontStyle: 'italic', marginBottom: 6 }}>
              {moment(req.created_at || req.createdAt || req.appliedAt).fromNow(true)} ago
            </Typography>
            {expanded ? <ChevronDown size={18} color={colors.text.muted} style={{ transform: [{ rotate: '180deg' }] }} /> : <ChevronDown size={18} color={colors.text.muted} />}
          </View>
        </View>
        <Animated.View style={[s.activityReason, activityStyle, { borderTopWidth: expanded ? 1 : 0, borderTopColor: 'rgba(0,0,0,0.05)' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <FileText size={12} color={colors.text.muted} />
            <Typography style={s.activityReasonTitle}>LEAVE REASON</Typography>
          </View>
          <Typography style={s.activityReasonText}>
            {req.reason || 'No reason provided.'}
          </Typography>
        </Animated.View>
      </BlurView>
    </TouchableOpacity>
  );
};

/* ── Balance Card ──────────────────────────────────────────────────────── */
export const BalanceCard: React.FC<{ bal: DetailedLeaveBalance; index: number }> = ({ bal, index }) => (
  <Animated.View key={bal.code} entering={FadeInDown.delay((index % 10) * 30).duration(200)}>
    <BlurView intensity={50} tint="light" style={[s.balanceCard, { padding: normalize(20), borderRadius: normalize(24), backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', marginBottom: normalize(16), overflow: 'hidden' }]}>
      <View style={s.bcHeader}>
        <View>
          <Typography style={s.bcTitle}>{bal.name}</Typography>
          <View style={s.bcTags}>
            <View style={s.bcTag}><Typography style={s.bcTagText}>{bal.code}</Typography></View>
            <View style={[s.bcTag, { backgroundColor: bal.isPaid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
              <Typography style={[s.bcTagText, { color: bal.isPaid ? colors.success : colors.warning }]}>{bal.isPaid ? 'PAID' : 'UNPAID'}</Typography>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {bal.code === 'LWP' ? (
            <Typography variant="h1" style={[s.bcAvailable, { color: colors.primary }]}>∞</Typography>
          ) : (
            <Typography variant="h2" style={[s.bcAvailable, { color: colors.primary }]}>{bal.available.toFixed(2)}</Typography>
          )}
          <Typography style={s.bcAvailableSub}>AVAILABLE</Typography>
        </View>
      </View>
      <View style={s.bcMetricsContainer}>
        <View style={s.bcMetricsRowTop}>
          <View style={s.bcMetric}><Typography style={s.bcMetricTitle}>ACCRUED</Typography><Typography style={s.bcMetricVal}>{bal.accrued.toFixed(2)}</Typography></View>
          <View style={s.bcMetric}><Typography style={s.bcMetricTitle}>ENTITLED</Typography><Typography style={s.bcMetricVal}>{bal.entitled.toFixed(2)}</Typography></View>
          <View style={s.bcMetric}><Typography style={s.bcMetricTitle}>ADJUSTED</Typography><Typography style={s.bcMetricVal}>{bal.adjusted.toFixed(2)}</Typography></View>
        </View>
        <View style={s.bcMetricsRowBottom}>
          <View style={[s.bcMetric, s.bcMetricHighlight, { backgroundColor: 'rgba(245,158,11,0.08)', marginRight: normalize(6) }]}><Typography style={[s.bcMetricTitle, { color: colors.warning }]}>PENDING</Typography><Typography style={[s.bcMetricVal, { color: colors.warning }]}>{bal.pending.toFixed(2)}</Typography></View>
          <View style={[s.bcMetric, s.bcMetricHighlight, { backgroundColor: 'rgba(239,68,68,0.08)', marginLeft: normalize(6) }]}><Typography style={[s.bcMetricTitle, { color: colors.error }]}>USED</Typography><Typography style={[s.bcMetricVal, { color: colors.error }]}>{bal.used.toFixed(2)}</Typography></View>
        </View>
      </View>
    </BlurView>
  </Animated.View>
);

/* ── Leave Request Card (Compact Mobile Listing Item) ──────────────────── */
export const LeaveRequestCard: React.FC<{
  req: LeaveRequest;
  onPress: () => void;
  onCancel?: (id: string) => void;
}> = ({ req, onPress, onCancel }) => {
  const reqCode = getRequestCode(req);
  const statusStr = req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : 'Pending';
  const statusColor = getStatusColor(statusStr);
  const formattedFrom = moment(req.startDate || req.start_date).format('DD MMM YYYY');
  const formattedTo = moment(req.endDate || req.end_date).format('DD MMM YYYY');
  const formattedAppliedOn = moment(req.appliedAt || req.createdAt || req.created_at).format('DD MMM YYYY');
  const totalDaysVal = req.days ? parseFloat(String(req.days)).toFixed(2) : Number(req.total_days || 1).toFixed(2);
  const dateDisplay = formattedFrom === formattedTo ? formattedFrom : `${formattedFrom} — ${formattedTo}`;

  const isCancellable =
    (statusStr || '').toLowerCase() !== 'approved' &&
    (statusStr || '').toLowerCase() !== 'rejected' &&
    (statusStr || '').toLowerCase() !== 'cancelled';

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={s.mobileCardWrapper}>
      <BlurView intensity={60} tint="light" style={s.mobileCardBlur}>
        <View style={s.mobileCardTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <View style={s.mobileCodeBadge}>
              <Typography style={s.mobileCodeBadgeText}>{reqCode}</Typography>
            </View>
            <Typography style={s.mobileLeaveTypeName} numberOfLines={1}>
              {req.leaveTypeName || req.leave_type || 'Leave'}
            </Typography>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={[s.mobileStatusBadge, { backgroundColor: statusColor + '18' }]}>
              <Typography style={[s.mobileStatusText, { color: statusColor }]}>
                {statusStr}
              </Typography>
            </View>
            {isCancellable && onCancel && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation();
                  onCancel(req.id);
                }}
                style={{
                  padding: normalize(6),
                  borderRadius: normalize(8),
                  backgroundColor: '#FEF2F2',
                  borderWidth: 1,
                  borderColor: '#FCA5A5',
                  marginLeft: normalize(4),
                }}
              >
                <Trash2 size={15} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={s.mobileCardCompactRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <CalendarRange size={13} color={colors.primary} />
            <Typography style={s.mobileCardCompactText}>{dateDisplay}</Typography>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Clock size={13} color={colors.primary} />
            <Typography style={s.mobileCardCompactText}>{totalDaysVal} Day(s)</Typography>
          </View>
        </View>

        <View style={s.mobileCardFooterRow}>
          <Typography style={s.mobileCardSubText}>Applied: {formattedAppliedOn}</Typography>
          {!!req.reason && (
            <Typography style={s.mobileCardReasonText} numberOfLines={1}>
              • {req.reason}
            </Typography>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

/* ── Leave Approval Card (For Team Approvals Tab) ──────────────────────── */
export interface LeaveApprovalItem {
  id: string;
  requestCode: string;
  employeeName: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: string;
  status: string;
  reason: string;
  appliedAt: string;
  avatarUrl?: string;
}

export const LeaveApprovalCard: React.FC<{
  req: LeaveRequest;
  onPressDetails: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}> = ({ req, onPressDetails, onApprove, onReject }) => {
  const reqCode = getRequestCode(req);
  const statusStr = req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : 'Pending';
  const statusColor = getStatusColor(statusStr);
  const formattedFrom = moment(req.startDate || req.start_date).format('DD MMM YYYY');
  const formattedTo = moment(req.endDate || req.end_date).format('DD MMM YYYY');
  const formattedAppliedOn = moment(req.appliedAt || req.createdAt || req.created_at).format('DD MMM YYYY');
  const totalDaysVal = req.days ? parseFloat(String(req.days)).toFixed(2) : Number(req.total_days || 1).toFixed(2);
  const dateDisplay = formattedFrom === formattedTo ? formattedFrom : `${formattedFrom} — ${formattedTo}`;
  const empName = req.employeeName || req.employee_name || 'N/A';
  const empCodeStr = req.empCode || req.employee_role || '';
  const isPending = (statusStr || '').toLowerCase().includes('pending');

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPressDetails} style={s.mobileCardWrapper}>
      <BlurView intensity={60} tint="light" style={s.mobileCardBlur}>
        <View style={s.mobileCardTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <View
              style={{
                width: normalize(36),
                height: normalize(36),
                borderRadius: normalize(18),
                backgroundColor: colors.primary + '18',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography style={{ fontWeight: '800', color: colors.primary, fontSize: normalize(14) }}>
                {empName.charAt(0)}
              </Typography>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Typography style={{ fontWeight: '800', fontSize: normalize(14), color: colors.text.primary }}>
                  {empName}
                </Typography>
                {!!empCodeStr && (
                  <Typography style={{ fontSize: normalize(11), color: colors.text.muted, fontWeight: '600' }}>
                    ({empCodeStr})
                  </Typography>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: normalize(2) }}>
                <View style={s.mobileCodeBadge}>
                  <Typography style={s.mobileCodeBadgeText}>{reqCode}</Typography>
                </View>
                <Typography style={s.mobileLeaveTypeName} numberOfLines={1}>
                  {req.leaveTypeName || req.leave_type || 'Leave'}
                </Typography>
              </View>
            </View>
          </View>

          <View style={[s.mobileStatusBadge, { backgroundColor: statusColor + '18' }]}>
            <Typography style={[s.mobileStatusText, { color: statusColor }]}>
              {statusStr}
            </Typography>
          </View>
        </View>

        <View style={s.mobileCardCompactRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <CalendarRange size={13} color={colors.primary} />
            <Typography style={s.mobileCardCompactText}>{dateDisplay}</Typography>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Clock size={13} color={colors.primary} />
            <Typography style={s.mobileCardCompactText}>{totalDaysVal} Day(s)</Typography>
          </View>
        </View>

        <View style={s.mobileCardFooterRow}>
          <Typography style={s.mobileCardSubText}>Applied: {formattedAppliedOn}</Typography>
          {!!req.reason && (
            <Typography style={s.mobileCardReasonText} numberOfLines={1}>
              • {req.reason}
            </Typography>
          )}
        </View>

        {Boolean(req.canApprove ?? (req as any)?.can_approve) && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: normalize(10),
              marginTop: normalize(12),
              paddingTop: normalize(10),
              borderTopWidth: 1,
              borderTopColor: 'rgba(0,0,0,0.06)',
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                onReject(req.id);
              }}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                height: normalize(38),
                borderRadius: normalize(10),
                backgroundColor: '#FEF2F2',
                borderWidth: 1,
                borderColor: '#FCA5A5',
              }}
            >
              <XCircle size={15} color={colors.error} />
              <Typography style={{ color: colors.error, fontWeight: '700', fontSize: normalize(13) }}>
                Reject
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                onApprove(req.id);
              }}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                height: normalize(38),
                borderRadius: normalize(10),
                backgroundColor: '#ECFDF5',
                borderWidth: 1,
                borderColor: '#6EE7B7',
              }}
            >
              <CheckCircle2 size={15} color={colors.success} />
              <Typography style={{ color: colors.success, fontWeight: '700', fontSize: normalize(13) }}>
                Approve
              </Typography>
            </TouchableOpacity>
          </View>
        )}
      </BlurView>
    </TouchableOpacity>
  );
};

/* ── Leave Details Modal (Centered Read-Only View) ─────────────────────── */
export const LeaveDetailsModal: React.FC<{
  visible: boolean;
  req: LeaveRequest | null;
  onClose: () => void;
  onCancelLeave?: (id: string) => void;
  isCancelling?: boolean;
}> = ({ visible, req, onClose, onCancelLeave, isCancelling }) => {
  if (!req) return null;

  const reqCode = getRequestCode(req);
  const statusStr = req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : 'Pending';
  const statusColor = getStatusColor(statusStr);
  const formattedFrom = moment(req.startDate || req.start_date).format('DD MMM YYYY');
  const formattedTo = moment(req.endDate || req.end_date).format('DD MMM YYYY');
  const formattedAppliedOn = moment(req.appliedAt || req.createdAt || req.created_at).format('DD MMM YYYY');
  const totalDaysVal = req.days ? parseFloat(String(req.days)).toFixed(2) : Number(req.total_days || 1).toFixed(2);
  const dayTypeLabel = (req.dayType || 'full_day').replace('_', ' ');

  let approverName = req.adminApproverName || req.hrApproverName || req.tlApproverName;
  let approverRole = req.adminApproverName ? 'Admin' : req.hrApproverName ? 'HR' : req.tlApproverName ? 'TL' : 'Admin';
  let approverText = approverName ? `${approverName} (${approverRole})` : 'System Admin (Admin)';

  if (statusStr.toLowerCase() === 'rejected') {
    approverText = req.rejectedByName ? `${req.rejectedByName}` : 'System Admin (Admin)';
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <BlurView intensity={40} tint="dark" style={s.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <Animated.View entering={FadeInUp.springify()} style={[s.modalContent, { maxHeight: '85%' }]}>
          <View style={s.modalHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(12), flex: 1 }}>
              <View style={s.modalIconBg}>
                <CalendarDays size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography style={s.modalTitle}>Leave Request Details</Typography>
                <Typography style={s.modalSub}>Read-only view · {reqCode}</Typography>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={s.modalCloseBtn} activeOpacity={0.7}>
              <XCircle size={22} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: normalize(20), paddingBottom: normalize(40) }}
          >


            <View style={s.detailsTableBox}>
              <View style={s.detailsTableRow}>
                <Typography style={s.detailsRowLabel}>LEAVE TYPE</Typography>
                <Typography style={s.detailsRowVal}>{req.leaveTypeName || req.leave_type || 'Leave'}</Typography>
              </View>
              <View style={s.detailsTableRow}>
                <Typography style={s.detailsRowLabel}>FROM</Typography>
                <Typography style={s.detailsRowVal}>{formattedFrom}</Typography>
              </View>
              <View style={s.detailsTableRow}>
                <Typography style={s.detailsRowLabel}>TO</Typography>
                <Typography style={s.detailsRowVal}>{formattedTo}</Typography>
              </View>
              <View style={s.detailsTableRow}>
                <Typography style={s.detailsRowLabel}>NO. OF DAYS</Typography>
                <Typography style={s.detailsRowVal}>{totalDaysVal}</Typography>
              </View>
              <View style={s.detailsTableRow}>
                <Typography style={s.detailsRowLabel}>DAY TYPE</Typography>
                <Typography style={s.detailsRowVal}>{dayTypeLabel}</Typography>
              </View>
              <View style={s.detailsTableRow}>
                <Typography style={s.detailsRowLabel}>APPLIED ON</Typography>
                <Typography style={s.detailsRowVal}>{formattedAppliedOn}</Typography>
              </View>
              <View style={s.detailsTableRow}>
                <Typography style={s.detailsRowLabel}>STATUS</Typography>
                <View style={[s.detailsStatusBadge, { backgroundColor: statusColor + '18' }]}>
                  {statusStr.toLowerCase() === 'approved' ? (
                    <CheckCircle2 size={13} color={colors.success} />
                  ) : statusStr.toLowerCase() === 'rejected' ? (
                    <XCircle size={13} color={colors.error} />
                  ) : (
                    <Clock size={13} color={colors.warning} />
                  )}
                  <Typography style={[s.detailsStatusText, { color: statusColor }]}>{statusStr}</Typography>
                </View>
              </View>
              <View style={s.detailsTableRow}>
                <Typography style={s.detailsRowLabel}>REASON</Typography>
                <Typography style={s.detailsRowVal}>{req.reason || 'Personal'}</Typography>
              </View>
              <View style={s.detailsTableRow}>
                <Typography style={s.detailsRowLabel}>
                  {statusStr.toLowerCase() === 'rejected' ? 'REJECTED BY' : 'APPROVED BY'}
                </Typography>
                <Typography style={s.detailsRowVal}>{approverText}</Typography>
              </View>
              <View style={[s.detailsTableRow, { borderBottomWidth: 0 }]}>
                <Typography style={s.detailsRowLabel}>ATTACHMENT</Typography>
                <Typography style={[s.detailsRowVal, { color: req.documentKey ? colors.primary : colors.text.muted }]}>
                  {req.documentKey ? req.documentKey : '— No attachment'}
                </Typography>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

/* ── Apply Leave Modal ─────────────────────────────────────────────────── */
export const ApplyLeaveModal: React.FC<{
  visible: boolean;
  insets: any;
  leaveType: string;
  setLeaveType: (val: string) => void;
  dayType: string;
  setDayType: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  reason: string;
  setReason: (val: string) => void;
  activeDatePicker: 'start' | 'end' | null;
  setActiveDatePicker: (val: 'start' | 'end' | null) => void;
  tempDate: string;
  setTempDate: (val: string) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  leaveTypeOptions?: DropdownOption[];
  balances?: DetailedLeaveBalance[];
  leaveTypesList?: any[];
  disabledDates?: string[];
}> = ({
  visible,
  insets,
  leaveType,
  setLeaveType,
  dayType,
  setDayType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  reason,
  setReason,
  activeDatePicker,
  setActiveDatePicker,
  tempDate,
  setTempDate,
  isSubmitting,
  onClose,
  onSubmit,
  leaveTypeOptions = [],
  balances = [],
  leaveTypesList = [],
  disabledDates = [],
}) => {
  const isSameDate = startDate === endDate && startDate !== '';

  React.useEffect(() => {
    if (visible) {
      setStartDate('');
      setEndDate('');
      setReason('');
      setDayType('full_day');
    }
  }, [visible]);

  const selectedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const isHalf = startDate === endDate && (
      dayType.toLowerCase().includes('half') ||
      dayType === 'first_half' ||
      dayType === 'second_half'
    );
    if (isHalf) return 0.5;
    return Math.max(1, moment(endDate).diff(moment(startDate), 'days') + 1);
  }, [startDate, endDate, dayType]);

  const selectedTypeObj = useMemo(() => {
    if (leaveTypesList && leaveTypesList.length > 0) {
      const match = leaveTypesList.find((t) => t.value === leaveType);
      if (match) return match;
    }
    return null;
  }, [leaveType, leaveTypesList]);

  const leaveCode = selectedTypeObj?.leave_code || 'CL';
  const isUnlimited = Boolean(selectedTypeObj?.isUnlimited);

  const selectedBal = useMemo(() => {
    if (!balances || balances.length === 0) return { available: 2.5, used: 0.0 };
    const match = balances.find((b) => {
      if (selectedTypeObj) {
        return b.code?.toUpperCase() === selectedTypeObj.leave_code?.toUpperCase();
      }
      return false;
    });
    return match || balances[0] || { available: 0, used: 0 };
  }, [selectedTypeObj, balances]);

  const availableBalance = selectedBal.available ?? 0;
  const usedBalance = selectedBal.used ?? 0;

  const balanceAfterVal = availableBalance - selectedDays;
  const formattedBalanceAfter = Number.isInteger(balanceAfterVal)
    ? balanceAfterVal.toString()
    : balanceAfterVal.toFixed(1);
  const balanceAfterStr = isUnlimited ? 'Unlimited' : `${Math.max(0, Number(formattedBalanceAfter))} days`;
  const isBalanceNegative = !isUnlimited && balanceAfterVal <= 0;
  const isOverBalance = !isUnlimited && selectedDays > 0 && selectedDays > availableBalance;

  const handleCloseModal = () => {
    setStartDate('');
    setEndDate('');
    setReason('');
    setDayType('full_day');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleCloseModal}>
      <View style={s.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleCloseModal} />
        <Animated.View entering={FadeInUp.springify()} style={[s.modalContent, { maxHeight: '85%', paddingBottom: insets.bottom || 24, position: 'relative' }]}>
          <View style={s.modalHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={s.modalIconBg}><CalendarRange size={20} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Typography variant="h3" style={s.modalTitle}>Apply for Leave</Typography>
                <Typography style={[s.modalSub, { flexWrap: 'wrap' }]}>Your request will be sent to your reporting manager for approval.</Typography>
              </View>
            </View>
            <TouchableOpacity onPress={handleCloseModal} style={s.modalCloseBtn}>
              <XCircle size={24} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: normalize(20), paddingBottom: normalize(80) }}
          >


            <View style={s.inputGroup}>
              <Typography style={s.inputLabel}>
                LEAVE TYPE <Typography style={{ color: colors.error }}>*</Typography>
              </Typography>
              <UICoreDropdown
                placeholder="Select Leave Type..."
                value={leaveType}
                options={leaveTypeOptions}
                onSelect={(opt) => setLeaveType(opt.value)}
              />
            </View>

            <View style={s.balanceInfoBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FileText size={16} color={colors.text.primary} />
                <Typography style={s.balanceInfoLabel}>Available balance</Typography>
                <Typography style={s.balanceInfoSub}>(Used: {usedBalance.toFixed(2)})</Typography>
              </View>
              <View style={s.balanceInfoTag}>
                <Typography style={s.balanceInfoTagText}>{availableBalance} days</Typography>
              </View>
            </View>

            <View style={s.dividerContainer}><View style={s.dividerLine} /><Typography style={s.dividerText}>Duration</Typography><View style={s.dividerLine} /></View>

            <View style={s.rowInputs}>
              <View style={[s.inputGroup, { flex: 1 }]}>
                <DatePicker
                  label="FROM DATE"
                  required
                  disabledDates={disabledDates}
                  initialDate={startDate ? moment(startDate).format('DD/MM/YYYY') : ''}
                  onDateChange={(d) => {
                    const yyyymmdd = moment(d, ['DD/MM/YYYY', 'YYYY-MM-DD']).format('YYYY-MM-DD');
                    setStartDate(yyyymmdd);
                  }}
                />
              </View>
              <View style={[s.inputGroup, { flex: 1 }]}>
                <DatePicker
                  label="TO DATE"
                  required
                  disabledDates={disabledDates}
                  initialDate={endDate ? moment(endDate).format('DD/MM/YYYY') : ''}
                  onDateChange={(d) => {
                    const yyyymmdd = moment(d, ['DD/MM/YYYY', 'YYYY-MM-DD']).format('YYYY-MM-DD');
                    setEndDate(yyyymmdd);
                  }}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: normalize(16) }}>
              <Clock size={12} color={colors.text.muted} />
              <Typography style={s.inputHelpText}>Weekends & public holidays are automatically excluded from the day count</Typography>
            </View>

            <View style={s.rowInputs}>
              <View style={[s.inputGroup, { flex: 1 }]}>
                <Typography style={s.inputLabel}>No. of Days</Typography>
                <View style={s.inputWrapper}>
                  <CalendarRange size={16} color={colors.text.muted} style={s.inputIconLeft} />
                  <TextInput style={[s.modalInputDisabled, { paddingLeft: 36 }]} value={selectedDays > 0 ? `${selectedDays} days` : ''} editable={false} />
                </View>
              </View>
              <View style={[s.inputGroup, { flex: 1 }]}>
                {isSameDate ? (
                  <UICoreDropdown
                    label="Day Type"
                    placeholder="Select Day Type..."
                    options={[
                      { value: 'full_day', label: 'Full Day' },
                      { value: 'first_half', label: 'First Half' },
                      { value: 'second_half', label: 'Second Half' },
                    ]}
                    value={dayType}
                    onSelect={(opt) => setDayType(opt.value)}
                  />
                ) : (
                  <>
                    <Typography style={s.inputLabel}>Day Type</Typography>
                    <TextInput style={s.modalInputDisabled} value="Full Day" editable={false} />
                    <Typography style={[s.inputHelpText, { marginTop: 4 }]}>Half-day: select same From & To date</Typography>
                  </>
                )}
              </View>
            </View>

            {isOverBalance && (
              <Typography style={{ color: colors.error, fontSize: normalize(12), marginTop: normalize(-8), marginBottom: normalize(16) }}>
                Warning: You have requested {selectedDays} days but your balance is only {availableBalance} days.
              </Typography>
            )}

            {Boolean(startDate && endDate && selectedDays > 0) && (
              <View style={s.summaryCard}>
                <Typography style={s.summaryCardTitle}>APPLICATION SUMMARY</Typography>
                <View style={s.summaryGridRow}>
                  <View style={s.summaryGridCol}>
                    <Typography style={s.summaryGridHeader}>Leave Type</Typography>
                    <Typography style={s.summaryGridVal}>{leaveCode}</Typography>
                  </View>
                  <View style={s.summaryGridCol}>
                    <Typography style={s.summaryGridHeader}>Days Requested</Typography>
                    <Typography style={s.summaryGridVal}>{selectedDays}</Typography>
                  </View>
                  <View style={s.summaryGridCol}>
                    <Typography style={s.summaryGridHeader}>Balance After</Typography>
                    <Typography style={[s.summaryGridVal, isBalanceNegative && { color: colors.error }]}>
                      {balanceAfterStr}
                    </Typography>
                  </View>
                </View>
              </View>
            )}

            <View style={s.dividerContainer}><View style={s.dividerLine} /><Typography style={s.dividerText}>Details</Typography><View style={s.dividerLine} /></View>

            <View style={s.inputGroup}>
              <Typography style={s.inputLabel}>Reason <Typography style={{ color: colors.error }}>*</Typography></Typography>
              <TextInput
                style={[s.modalInput, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Describe the reason for leave..."
                multiline
                value={reason}
                onChangeText={setReason}
              />
              <Typography style={s.inputHelpText}>0/500 characters</Typography>
            </View>

            <View style={s.inputGroup}>
              <Typography style={s.inputLabel}>ATTACHMENT (optional · PDF / JPG / PNG · max 5 MB)</Typography>
              <TouchableOpacity style={s.uploadBox} activeOpacity={0.7}>
                <UploadCloud size={24} color={colors.text.muted} />
                <Typography style={s.uploadTitle}>Click to upload</Typography>
                <Typography style={s.uploadSub}>PDF, JPG or PNG up to 5 MB</Typography>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={s.modalFooter}>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
              <Typography style={s.cancelBtnText}>Cancel</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={s.submitBtn} onPress={onSubmit}>
              {isSubmitting ? <ActivityIndicator color={colors.white} /> : <Typography style={s.submitBtnText}>Submit Request</Typography>}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

/* ── Custom Date Range Picker Modal ────────────────────────────────────── */
export const CustomDateRangeModal: React.FC<{
  visible: boolean;
  fromDate: string;
  toDate: string;
  onClose: () => void;
  onApply: (from: string, to: string) => void;
}> = ({ visible, fromDate: initialFrom, toDate: initialTo, onClose, onApply }) => {
  const [activeMode, setActiveMode] = useState<'from' | 'to'>('from');
  const [localFrom, setLocalFrom] = useState(initialFrom || '');
  const [localTo, setLocalTo] = useState(initialTo || '');

  React.useEffect(() => {
    setLocalFrom(initialFrom || '');
    setLocalTo(initialTo || '');
  }, [initialFrom, initialTo, visible]);

  const handleDayPress = (day: any) => {
    if (activeMode === 'from') {
      setLocalFrom(day.dateString);
      if (!localTo || moment(day.dateString).isAfter(moment(localTo))) {
        setLocalTo(day.dateString);
      }
      setActiveMode('to');
    } else {
      if (localFrom && moment(day.dateString).isBefore(moment(localFrom))) {
        setLocalFrom(day.dateString);
      } else {
        setLocalTo(day.dateString);
      }
    }
  };

  const markedDates: any = {};
  if (localFrom) {
    markedDates[localFrom] = { selected: true, startingDay: true, color: colors.primary, textColor: colors.white };
  }
  if (localTo) {
    markedDates[localTo] = { selected: true, endingDay: true, color: colors.primary, textColor: colors.white };
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <Animated.View entering={FadeInUp.springify()} style={[s.modalContent, { position: 'relative' }]}>
          <View style={s.modalHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={s.modalIconBg}><CalendarDays size={20} color={colors.primary} /></View>
              <Typography variant="h3" style={s.modalTitle}>Select Custom Date Range</Typography>
            </View>
            <TouchableOpacity onPress={onClose} style={s.modalCloseBtn}>
              <XCircle size={22} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <View style={{ padding: normalize(20) }}>
            <View style={{ flexDirection: 'row', gap: normalize(12), marginBottom: normalize(16) }}>
              <TouchableOpacity
                onPress={() => setActiveMode('from')}
                style={{
                  flex: 1,
                  padding: normalize(10),
                  borderRadius: normalize(10),
                  borderWidth: 1.5,
                  borderColor: activeMode === 'from' ? colors.primary : '#E2E8F0',
                  backgroundColor: activeMode === 'from' ? 'rgba(59, 130, 246, 0.08)' : '#F8FAFC',
                }}
              >
                <Typography style={{ fontSize: normalize(10), fontWeight: '700', color: colors.text.muted }}>FROM DATE</Typography>
                <Typography style={{ fontSize: normalize(13), fontWeight: '700', color: colors.text.primary, marginTop: 2 }}>
                  {localFrom ? moment(localFrom).format('DD MMM YYYY') : 'Select From'}
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveMode('to')}
                style={{
                  flex: 1,
                  padding: normalize(10),
                  borderRadius: normalize(10),
                  borderWidth: 1.5,
                  borderColor: activeMode === 'to' ? colors.primary : '#E2E8F0',
                  backgroundColor: activeMode === 'to' ? 'rgba(59, 130, 246, 0.08)' : '#F8FAFC',
                }}
              >
                <Typography style={{ fontSize: normalize(10), fontWeight: '700', color: colors.text.muted }}>TO DATE</Typography>
                <Typography style={{ fontSize: normalize(13), fontWeight: '700', color: colors.text.primary, marginTop: 2 }}>
                  {localTo ? moment(localTo).format('DD MMM YYYY') : 'Select To'}
                </Typography>
              </TouchableOpacity>
            </View>

            <Calendar
              current={localFrom || moment().format('YYYY-MM-DD')}
              markedDates={markedDates}
              onDayPress={handleDayPress}
              theme={{
                calendarBackground: 'transparent',
                textSectionTitleColor: colors.text.muted,
                todayTextColor: colors.primary,
                dayTextColor: colors.text.primary,
                textDisabledColor: 'rgba(0,0,0,0.1)',
                monthTextColor: colors.text.primary,
                textDayFontFamily: 'DMSans-Medium',
                textMonthFontFamily: 'DMSans-Bold',
                textDayHeaderFontFamily: 'DMSans-Medium',
              }}
            />

            <View style={{ flexDirection: 'row', gap: normalize(12), marginTop: normalize(20) }}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => {
                  setLocalFrom('');
                  setLocalTo('');
                  onApply('', '');
                }}
              >
                <Typography style={s.cancelBtnText}>Clear Filter</Typography>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.submitBtn}
                onPress={() => {
                  onApply(localFrom, localTo);
                }}
              >
                <Typography style={s.submitBtnText}>Apply Range</Typography>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

/* ── Leave Filter Bottom Sheet Modal ────────────────────────────────────── */
export interface LeaveFilterState {
  quickDate: string;
  fromDate: string;
  toDate: string;
  statusFilter: string;
  leaveTypeIdFilter: string;
  departmentFilter?: string;
  employeeFilter?: string;
  yearFilter?: string;
}

export const LeaveFilterModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onApply: (filters: LeaveFilterState) => void;
  onClear: () => void;
  initialFilters: LeaveFilterState;
  typeOptions: DropdownOption[];
  statusOptions: DropdownOption[];
  quickDateOptions: DropdownOption[];
  departmentOptions?: DropdownOption[];
  employeeOptions?: DropdownOption[];
  isApprovals?: boolean;
  isBalances?: boolean;
}> = ({
  visible,
  onClose,
  onApply,
  onClear,
  initialFilters,
  typeOptions,
  statusOptions,
  quickDateOptions,
  departmentOptions = [],
  employeeOptions = [],
  isApprovals = false,
  isBalances = false,
}) => {
  const [quickDate, setQuickDate] = useState(initialFilters.quickDate || '');
  const [fromDate, setFromDate] = useState(initialFilters.fromDate || '');
  const [toDate, setToDate] = useState(initialFilters.toDate || '');
  const [statusFilter, setStatusFilter] = useState(initialFilters.statusFilter || '');
  const [leaveTypeIdFilter, setLeaveTypeIdFilter] = useState(initialFilters.leaveTypeIdFilter || '');
  const [departmentFilter, setDepartmentFilter] = useState(initialFilters.departmentFilter || '');
  const [employeeFilter, setEmployeeFilter] = useState(initialFilters.employeeFilter || '');
  const [yearFilter, setYearFilter] = useState(initialFilters.yearFilter || '');

  React.useEffect(() => {
    if (visible) {
      setQuickDate(initialFilters.quickDate || '');
      setFromDate(initialFilters.fromDate || '');
      setToDate(initialFilters.toDate || '');
      setStatusFilter(initialFilters.statusFilter || '');
      setLeaveTypeIdFilter(initialFilters.leaveTypeIdFilter || '');
      setDepartmentFilter(initialFilters.departmentFilter || '');
      setEmployeeFilter(initialFilters.employeeFilter || '');
      setYearFilter(initialFilters.yearFilter || '');
    }
  }, [visible, initialFilters]);

  // Dynamic year options logic: (currentYear - 5) to (currentYear + 1)
  const yearOptions: DropdownOption[] = useMemo(() => {
    const curYear = new Date().getFullYear();
    const opts: DropdownOption[] = [];
    for (let y = curYear - 5; y <= curYear + 1; y++) {
      opts.push({ label: String(y), value: String(y) });
    }
    return opts;
  }, []);

  const handleQuickDateSelect = (opt: DropdownOption) => {
    setQuickDate(opt.value);
    if (!opt.value) {
      setFromDate('');
      setToDate('');
      return;
    }
    const today = moment();
    let from = '';
    let to = '';
    switch (opt.value) {
      case 'today':
        from = today.format('YYYY-MM-DD');
        to = today.format('YYYY-MM-DD');
        break;
      case 'tomorrow':
        const tom = moment().add(1, 'day');
        from = tom.format('YYYY-MM-DD');
        to = tom.format('YYYY-MM-DD');
        break;
      case 'this_week':
        from = moment().startOf('isoWeek').format('YYYY-MM-DD');
        to = moment().endOf('isoWeek').format('YYYY-MM-DD');
        break;
      case 'this_month':
        from = moment().startOf('month').format('YYYY-MM-DD');
        to = moment().endOf('month').format('YYYY-MM-DD');
        break;
      case 'last_3_months':
        from = moment().subtract(3, 'months').format('YYYY-MM-DD');
        to = today.format('YYYY-MM-DD');
        break;
      case 'last_6_months':
        from = moment().subtract(6, 'months').format('YYYY-MM-DD');
        to = today.format('YYYY-MM-DD');
        break;
      case 'this_year':
        from = moment().startOf('year').format('YYYY-MM-DD');
        to = moment().endOf('year').format('YYYY-MM-DD');
        break;
      case 'previous_year':
        from = moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD');
        to = moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD');
        break;
      case 'next_year':
        from = moment().add(1, 'year').startOf('year').format('YYYY-MM-DD');
        to = moment().add(1, 'year').endOf('year').format('YYYY-MM-DD');
        break;
    }
    setFromDate(from);
    setToDate(to);
  };

  const handleFromDateChange = (dateStr: string) => {
    if (!dateStr) return;
    const yyyymmdd = moment(dateStr, ['DD/MM/YYYY', 'YYYY-MM-DD']).format('YYYY-MM-DD');
    setFromDate(yyyymmdd);
    setQuickDate('');
  };

  const handleToDateChange = (dateStr: string) => {
    if (!dateStr) return;
    const yyyymmdd = moment(dateStr, ['DD/MM/YYYY', 'YYYY-MM-DD']).format('YYYY-MM-DD');
    setToDate(yyyymmdd);
    setQuickDate('');
  };

  const handleApply = () => {
    onApply({
      quickDate,
      fromDate,
      toDate,
      statusFilter,
      leaveTypeIdFilter,
      departmentFilter,
      employeeFilter,
      yearFilter,
    });
    onClose();
  };

  const handleReset = () => {
    setQuickDate('');
    setFromDate('');
    setToDate('');
    setStatusFilter('');
    setLeaveTypeIdFilter('');
    setDepartmentFilter('');
    setEmployeeFilter('');
    setYearFilter('');
    onClear();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <Animated.View entering={FadeInUp.springify()} style={[s.modalContent, { maxHeight: '85%' }]}>
          <View style={s.modalHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={s.modalIconBg}>
                <SlidersHorizontal size={20} color={colors.primary} />
              </View>
              <View>
                <Typography variant="h3" style={s.modalTitle}>
                  {isBalances ? 'Filter Leave Balances' : 'Filter Leave Requests'}
                </Typography>
                <Typography style={s.modalSub}>
                  {isBalances
                    ? 'Refine listing by year, leave type, department, or employee'
                    : 'Refine listing by date, status, or leave type'}
                </Typography>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={s.modalCloseBtn}>
              <XCircle size={24} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: normalize(20), paddingBottom: normalize(40) }}
          >


            {isBalances ? (
              <>
                {/* Year Dropdown for Leave Balances */}
                <View style={s.inputGroup}>
                  <Typography style={s.inputLabel}>YEAR</Typography>
                  <UICoreDropdown
                    placeholder="All Years"
                    value={yearFilter}
                    options={yearOptions}
                    onSelect={(opt) => setYearFilter(opt.value)}
                  />
                </View>

                {/* Leave Type */}
                <View style={s.inputGroup}>
                  <Typography style={s.inputLabel}>LEAVE TYPE</Typography>
                  <UICoreDropdown
                    placeholder="Select Leave Type..."
                    value={leaveTypeIdFilter}
                    options={typeOptions}
                    onSelect={(opt) => setLeaveTypeIdFilter(opt.value)}
                  />
                </View>

                {/* Department */}
                <View style={s.inputGroup}>
                  <Typography style={s.inputLabel}>DEPARTMENT</Typography>
                  <UICoreDropdown
                    placeholder="All Departments"
                    value={departmentFilter}
                    options={departmentOptions}
                    onSelect={(opt) => setDepartmentFilter(opt.value)}
                  />
                </View>

                {/* Employee */}
                <View style={s.inputGroup}>
                  <Typography style={s.inputLabel}>EMPLOYEE</Typography>
                  <UICoreDropdown
                    placeholder="All Employees"
                    value={employeeFilter}
                    options={employeeOptions}
                    onSelect={(opt) => setEmployeeFilter(opt.value)}
                  />
                </View>
              </>
            ) : (
              <>
                {/* Quick Date */}
                <View style={s.inputGroup}>
                  <Typography style={s.inputLabel}>QUICK DATE RANGE</Typography>
                  <UICoreDropdown
                    placeholder="Select Quick Date..."
                    value={quickDate}
                    options={quickDateOptions}
                    onSelect={handleQuickDateSelect}
                  />
                </View>

                {/* DatePicker Custom Range */}
                <View style={s.rowInputs}>
                  <View style={[s.inputGroup, { flex: 1 }]}>
                    <DatePicker
                      label="From Date"
                      initialDate={fromDate ? moment(fromDate).format('DD/MM/YYYY') : ''}
                      onDateChange={handleFromDateChange}
                    />
                  </View>
                  <View style={[s.inputGroup, { flex: 1 }]}>
                    <DatePicker
                      label="To Date"
                      initialDate={toDate ? moment(toDate).format('DD/MM/YYYY') : ''}
                      onDateChange={handleToDateChange}
                    />
                  </View>
                </View>

                {/* Leave Status */}
                <View style={s.inputGroup}>
                  <Typography style={s.inputLabel}>LEAVE STATUS</Typography>
                  <UICoreDropdown
                    placeholder="Select Status..."
                    value={statusFilter}
                    options={statusOptions}
                    onSelect={(opt) => setStatusFilter(opt.value)}
                  />
                </View>

                {/* Leave Type */}
                <View style={s.inputGroup}>
                  <Typography style={s.inputLabel}>LEAVE TYPE</Typography>
                  <UICoreDropdown
                    placeholder="Select Leave Type..."
                    value={leaveTypeIdFilter}
                    options={typeOptions}
                    onSelect={(opt) => setLeaveTypeIdFilter(opt.value)}
                  />
                </View>

                {/* Additional Filters for Leave Approvals Tab */}
                {isApprovals && (
                  <>
                    <View style={s.inputGroup}>
                      <Typography style={s.inputLabel}>DEPARTMENT</Typography>
                      <UICoreDropdown
                        placeholder="All Departments"
                        value={departmentFilter}
                        options={departmentOptions}
                        onSelect={(opt) => setDepartmentFilter(opt.value)}
                      />
                    </View>

                    <View style={s.inputGroup}>
                      <Typography style={s.inputLabel}>EMPLOYEE</Typography>
                      <UICoreDropdown
                        placeholder="All Employees"
                        value={employeeFilter}
                        options={employeeOptions}
                        onSelect={(opt) => setEmployeeFilter(opt.value)}
                      />
                    </View>
                  </>
                )}
              </>
            )}
          </ScrollView>

          <View style={s.modalFooter}>
            <TouchableOpacity style={s.cancelBtn} onPress={handleReset}>
              <Typography style={s.cancelBtnText}>Reset All</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={s.submitBtn} onPress={handleApply}>
              <Typography style={s.submitBtnText}>Apply Filters</Typography>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

import { RejectionReasonModal } from '../../components/Modals/RejectionReasonModal';

/* ── Leave Rejection Reason Modal ─────────────────────────────────────── */
export const LeaveRejectionModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isLoading?: boolean;
}> = ({ visible, onClose, onSubmit, isLoading = false }) => (
  <RejectionReasonModal
    visible={visible}
    onClose={onClose}
    onSubmit={onSubmit}
    title="Reject Request"
    description="Please enter a reason for rejecting this leave request. The employee will see this feedback."
    placeholder="Write rejection reason here..."
    isLoading={isLoading}
  />
);

/* ── Admin Leave Balance Glass Card (Frosted Glass View) ─────────────────── */
export const LeaveBalanceAdminCard: React.FC<{
  balance: AdminLeaveBalance;
  onPress?: () => void;
}> = ({ balance, onPress }) => {
  const empName = balance.employeeName || 'N/A';
  const empCode = balance.empCode || '';
  const deptName = balance.departmentName || '';
  const leaveTypeName = balance.leaveTypeName || 'Leave';
  const leaveTypeCode = balance.leaveTypeCode || '';
  const category = balance.leaveTypeCategory || 'Paid';
  const availBal = balance.availableBalance ?? 0;
  const actualBal = (balance as any).actualBal ?? balance.earned ?? (parseFloat(balance.earned || '0') - parseFloat(balance.used || '0')).toFixed(2);
  const year = balance.year || new Date().getFullYear();

  const formattedAvail = typeof availBal === 'number' ? availBal.toFixed(2) : availBal;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={s.mobileCardWrapper}>
      <BlurView intensity={60} tint="light" style={s.mobileCardBlur}>
        {/* Top Row: Employee Avatar + Name + EmpCode & Year */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(10), flex: 1 }}>
            <View
              style={{
                width: normalize(34),
                height: normalize(34),
                borderRadius: normalize(17),
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(59, 130, 246, 0.25)',
              }}
            >
              <Typography style={{ fontSize: normalize(13), fontWeight: '700', color: colors.primary }}>
                {empName.charAt(0).toUpperCase()}
              </Typography>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
                <Typography numberOfLines={1} style={{ fontSize: normalize(14), fontWeight: '700', color: colors.text.primary }}>
                  {empName}
                </Typography>
                {!!empCode && (
                  <View style={s.mobileCodeBadge}>
                    <Typography style={s.mobileCodeBadgeText}>{empCode}</Typography>
                  </View>
                )}
              </View>
              {!!deptName && deptName !== '—' && (
                <Typography style={{ fontSize: normalize(11), color: colors.text.secondary, marginTop: normalize(1) }}>
                  {deptName}
                </Typography>
              )}
            </View>
          </View>

          <View style={[s.badgePill, { backgroundColor: 'rgba(243, 244, 246, 0.9)', borderColor: 'rgba(209, 213, 219, 0.6)', paddingHorizontal: normalize(8), paddingVertical: normalize(3) }]}>
            <Typography style={{ fontSize: normalize(11), fontWeight: '700', color: colors.text.secondary }}>{year}</Typography>
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: 'rgba(226, 232, 240, 0.6)', marginVertical: normalize(10) }} />

        {/* Bottom Row: Leave Type (Left) vs Available Balance Highlight (Right) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
            <Typography style={{ fontSize: normalize(13), fontWeight: '700', color: colors.text.primary }}>
              {leaveTypeName}
            </Typography>
            {!!leaveTypeCode && (
              <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: normalize(6), paddingVertical: normalize(2), borderRadius: normalize(6) }}>
                <Typography style={{ fontSize: normalize(10), fontWeight: '800', color: colors.primary }}>
                  {leaveTypeCode}
                </Typography>
              </View>
            )}
            <Typography
              style={{
                fontSize: normalize(10),
                fontWeight: '700',
                textTransform: 'uppercase',
                color: category.toLowerCase() === 'paid' ? colors.success : colors.text.muted,
                marginLeft: normalize(2),
              }}
            >
              • {category}
            </Typography>
          </View>

          {/* Right: Available Balance pill + Chevron */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(4) }}>
                <Typography style={{ fontSize: normalize(10), fontWeight: '700', color: colors.text.secondary }}>
                  AVAIL:
                </Typography>
                <Typography style={{ fontSize: normalize(14), fontWeight: '800', color: colors.success }}>
                  {formattedAvail}
                </Typography>
              </View>
              <Typography style={{ fontSize: normalize(10), color: colors.text.muted }}>
                Actual: {actualBal}
              </Typography>
            </View>
            <ChevronRight size={16} color={colors.text.muted} />
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

/* ── Leave Balance Details Bottom Sheet Modal ────────────────────────────── */
export const LeaveBalanceDetailsModal: React.FC<{
  visible: boolean;
  balance: AdminLeaveBalance | null;
  onClose: () => void;
}> = ({ visible, balance, onClose }) => {
  if (!balance) return null;

  const empName = balance.employeeName || 'N/A';
  const empCode = balance.empCode || '';
  const deptName = balance.departmentName || '—';
  const leaveTypeName = balance.leaveTypeName || 'Leave';
  const leaveTypeCode = balance.leaveTypeCode || '';
  const category = balance.leaveTypeCategory || 'Paid';
  const availBal = balance.availableBalance ?? 0;
  const actualBal = (balance as any).actualBal ?? balance.earned ?? (parseFloat(balance.earned || '0') - parseFloat(balance.used || '0')).toFixed(2);
  const year = balance.year || new Date().getFullYear();

  const entitledStr = balance.totalEntitled != null ? String(balance.totalEntitled) : (balance.yearlyQuota != null ? String(balance.yearlyQuota) : '—');
  const accruedStr = balance.accrued != null ? String(balance.accrued) : '—';
  const carryFwdStr = balance.carriedForward ?? '0.00';
  const earnedStr = balance.earned ?? '0.00';
  const adjustedStr = balance.adjusted != null ? String(balance.adjusted) : '0.00';
  const usedStr = balance.used ?? '0.00';
  const pendingStr = balance.pending != null ? String(balance.pending) : '0';
  const encashedStr = balance.encashed ?? '0.00';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <Animated.View entering={FadeInUp.springify()} style={[s.modalContent, { maxHeight: '85%' }]}>
          <View style={s.modalHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={s.modalIconBg}>
                <FileText size={20} color={colors.primary} />
              </View>
              <View>
                <Typography variant="h3" style={s.modalTitle}>Leave Balance Details</Typography>
                <Typography style={s.modalSub}>{empName} • {year}</Typography>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={s.modalCloseBtn}>
              <XCircle size={24} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: normalize(20), paddingBottom: normalize(40) }}
          >


            {/* Employee Info Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(12), marginBottom: normalize(16) }}>
              <View
                style={{
                  width: normalize(44),
                  height: normalize(44),
                  borderRadius: normalize(22),
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(59, 130, 246, 0.25)',
                }}
              >
                <Typography style={{ fontSize: normalize(16), fontWeight: '700', color: colors.primary }}>
                  {empName.charAt(0).toUpperCase()}
                </Typography>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
                  <Typography variant="h4" style={{ fontSize: normalize(16), fontWeight: '700', color: colors.text.primary }}>
                    {empName}
                  </Typography>
                  {!!empCode && (
                    <View style={s.codeBadge}>
                      <Typography style={s.codeBadgeText}>{empCode}</Typography>
                    </View>
                  )}
                </View>
                <Typography style={{ fontSize: normalize(13), color: colors.text.secondary, marginTop: normalize(2) }}>
                  {deptName}
                </Typography>
              </View>
              <View style={[s.badgePill, { backgroundColor: 'rgba(243, 244, 246, 0.9)', borderColor: 'rgba(209, 213, 219, 0.6)' }]}>
                <Typography style={[s.badgeText, { color: colors.text.secondary }]}>{year}</Typography>
              </View>
            </View>

            {/* Leave Type & Category */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: normalize(12), backgroundColor: 'rgba(248, 250, 252, 0.85)', borderRadius: normalize(10), borderWidth: 1, borderColor: 'rgba(226, 232, 240, 0.8)', marginBottom: normalize(16) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
                <Typography style={{ fontSize: normalize(15), fontWeight: '700', color: colors.text.primary }}>
                  {leaveTypeName}
                </Typography>
                {!!leaveTypeCode && (
                  <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: normalize(6), paddingVertical: normalize(2), borderRadius: normalize(4) }}>
                    <Typography style={{ fontSize: normalize(11), fontWeight: '700', color: colors.primary }}>
                      {leaveTypeCode}
                    </Typography>
                  </View>
                )}
              </View>
              <Typography style={{ fontSize: normalize(11), fontWeight: '700', textTransform: 'uppercase', color: category.toLowerCase() === 'paid' ? colors.success : colors.text.muted }}>
                {category}
              </Typography>
            </View>

            {/* Dual Balances Row */}
            <View style={{ flexDirection: 'row', gap: normalize(10), marginBottom: normalize(16) }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(241, 245, 249, 0.75)', borderColor: 'rgba(203, 213, 225, 0.8)', borderWidth: 1, borderRadius: normalize(12), padding: normalize(12) }}>
                <Typography style={{ fontSize: normalize(11), fontWeight: '600', color: colors.text.secondary, textTransform: 'uppercase' }}>ACTUAL BAL.</Typography>
                <Typography style={{ fontSize: normalize(20), fontWeight: '700', color: colors.text.primary, marginTop: normalize(2) }}>{actualBal}</Typography>
              </View>
              <View style={{ flex: 1, backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.25)', borderWidth: 1, borderRadius: normalize(12), padding: normalize(12) }}>
                <Typography style={{ fontSize: normalize(11), fontWeight: '600', color: colors.success, textTransform: 'uppercase' }}>AVAILABLE</Typography>
                <Typography style={{ fontSize: normalize(20), fontWeight: '800', color: colors.success, marginTop: normalize(2) }}>{typeof availBal === 'number' ? availBal.toFixed(2) : availBal}</Typography>
              </View>
            </View>

            {/* Breakdown Title */}
            <Typography style={{ fontSize: normalize(12), fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase', marginBottom: normalize(12), letterSpacing: 0.5 }}>
              BALANCE METRICS & BREAKDOWN
            </Typography>

            {/* 8 Metric Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: normalize(10) }}>
              {[
                { label: 'Entitled', val: entitledStr },
                { label: 'Accrued', val: accruedStr },
                { label: 'Carry Fwd', val: carryFwdStr },
                { label: 'Earned', val: earnedStr },
                { label: 'Adjusted', val: adjustedStr },
                { label: 'Used', val: usedStr },
                { label: 'Pending', val: pendingStr },
                { label: 'Encashed', val: encashedStr },
              ].map((item, idx) => (
                <View key={idx} style={{ width: '48%', backgroundColor: 'rgba(248, 250, 252, 0.85)', padding: normalize(10), borderRadius: normalize(10), borderWidth: 1, borderColor: 'rgba(226, 232, 240, 0.8)' }}>
                  <Typography style={{ fontSize: normalize(11), color: colors.text.secondary }}>{item.label}</Typography>
                  <Typography style={{ fontSize: normalize(15), fontWeight: '700', color: colors.text.primary, marginTop: normalize(2) }}>{item.val}</Typography>
                </View>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};
