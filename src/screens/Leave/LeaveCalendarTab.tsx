// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import moment from 'moment';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Calendar } from 'react-native-calendars';
import * as Haptics from 'expo-haptics';
import {
  Calendar as CalendarIcon,
  List,
  Filter,
  Users,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react-native';
import colors from '../../theme/color';
import { Typography } from '../../components/Typography';
import { UICoreDropdown, DropdownOption } from '../../components/UICore/UICoreDropdown';
import { normalize } from '../../utils/responsive';
import { getStatusColor } from './LeaveTypes';

const { width: SW } = Dimensions.get('window');



interface LeaveCalendarTabProps {
  myRequests?: any[];
  adminRequests?: any[];
  pendingRequests?: any[];
  typeOptions?: DropdownOption[];
  employeeOptions?: DropdownOption[];
  onSelectRequest: (req: any) => void;
  onApplyLeave: () => void;
}

export const LeaveCalendarTab: React.FC<LeaveCalendarTabProps> = ({
  myRequests = [],
  adminRequests = [],
  pendingRequests = [],
  typeOptions = [],
  employeeOptions = [],
  onSelectRequest,
  onApplyLeave,
}) => {
  // Mode: '' | 'my' | 'team' ('' = All View Modes)
  const [viewMode, setViewMode] = useState<string>('');
  // View Type: 'month' | 'week' | 'day' | 'list'
  const [viewType, setViewType] = useState<'month' | 'week' | 'day' | 'list'>('month');
  
  // Selected Date
  const [selectedDate, setSelectedDate] = useState(() => moment().format('YYYY-MM-DD'));
  
  // Filters: '' = All
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // View Mode options for Dropdown
  const viewModeOptions: DropdownOption[] = [
    { label: 'My Leaves Only', value: 'my' },
    { label: 'Team Leaves Only', value: 'team' },
  ];

  // Status options for Dropdown
  const statusOptions: DropdownOption[] = [
    { label: 'Approved', value: 'approved' },
    { label: 'Pending HR', value: 'pending_hr' },
    { label: 'Pending TL', value: 'pending_tl' },
    { label: 'Pending Admin', value: 'pending_admin' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  // Active filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (viewMode !== '') count++;
    if (selectedStatus !== '') count++;
    if (selectedType !== '') count++;
    if (selectedEmployee !== '') count++;
    return count;
  }, [viewMode, selectedStatus, selectedType, selectedEmployee]);

  // Combined Leaves Data (100% Dynamic API Data from myRequests + adminRequests + pendingRequests)
  const allLeaves = useMemo(() => {
    const combined = [...myRequests, ...adminRequests, ...pendingRequests];
    const uniqueMap = new Map();
    combined.forEach((item) => {
      if (item && item.id && !uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });
    return Array.from(uniqueMap.values());
  }, [myRequests, adminRequests, pendingRequests]);

  // Filtered Leaves Data
  const filteredLeaves = useMemo(() => {
    return allLeaves.filter((item) => {
      // 1. View Mode Filter
      if (viewMode === 'my') {
        const isMy = myRequests.some((r) => r.id === item.id);
        if (!isMy && item.empCode !== 'QB082' && item.employeeId !== myRequests[0]?.employeeId) {
          return false;
        }
      } else if (viewMode === 'team') {
        const isMy = myRequests.some((r) => r.id === item.id);
        if (isMy) return false;
      }

      // 2. Status Filter
      if (selectedStatus !== '') {
        const st = (item.status || '').toLowerCase();
        if (selectedStatus === 'approved' && st !== 'approved') return false;
        if (selectedStatus === 'pending_hr' && st !== 'pending_hr') return false;
        if (selectedStatus === 'pending_tl' && st !== 'pending_tl') return false;
        if (selectedStatus === 'pending_admin' && st !== 'pending_admin') return false;
        if (selectedStatus === 'pending' && !st.includes('pending')) return false;
        if (selectedStatus === 'rejected' && st !== 'rejected') return false;
        if (selectedStatus === 'cancelled' && st !== 'cancelled') return false;
      }

      // 3. Leave Type Filter
      if (selectedType !== '') {
        const typeId = item.leaveTypeId || item.leave_type_id || '';
        const typeName = (item.leaveTypeName || item.leave_type || '').toLowerCase();
        if (typeId) {
          if (typeId !== selectedType && !typeName.includes(selectedType.toLowerCase())) return false;
        } else if (!typeName.includes(selectedType.toLowerCase())) {
          return false;
        }
      }

      // 4. Employee Filter
      if (selectedEmployee !== '') {
        const empId = item.employeeId || item.employee_id || '';
        const empName = (item.employeeName || '').toLowerCase();
        if (empId) {
          if (empId !== selectedEmployee && !empName.includes(selectedEmployee.toLowerCase())) return false;
        } else if (!empName.includes(selectedEmployee.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [allLeaves, viewMode, selectedStatus, selectedType, selectedEmployee, myRequests]);

  // Calendar Marked Dates for Month View
  const calendarMarkedDates = useMemo(() => {
    const marked: Record<string, any> = {};

    filteredLeaves.forEach((req: any) => {
      const start = req.startDate || req.start_date;
      const end = req.endDate || req.end_date;
      if (!start) return;

      const startM = moment(start);
      const endM = moment(end || start);
      const status = (req.status || 'pending').toLowerCase();

      let color = colors.warning;
      if (status === 'approved') color = colors.success;
      else if (status === 'pending_hr') color = colors.emailBlue;
      else if (status === 'pending_tl') color = colors.warning;
      else if (status === 'pending_admin') color = colors.primary;
      else if (status === 'rejected') color = colors.error;
      else if (status === 'cancelled') color = colors.text.muted;

      const currM = startM.clone();
      while (currM.isSameOrBefore(endM, 'day')) {
        const dateKey = currM.format('YYYY-MM-DD');
        const isSelected = dateKey === selectedDate;

        marked[dateKey] = {
          customStyles: {
            container: {
              backgroundColor: color + '22',
              borderRadius: normalize(8),
              borderWidth: isSelected ? 2 : 0,
              borderColor: isSelected ? colors.primary : 'transparent',
            },
            text: {
              color: color,
              fontWeight: '800',
            },
          },
        };
        currM.add(1, 'day');
      }
    });

    if (!marked[selectedDate]) {
      marked[selectedDate] = {
        customStyles: {
          container: {
            borderWidth: 2,
            borderColor: colors.primary,
            borderRadius: normalize(8),
            backgroundColor: colors.primary + '10',
          },
          text: {
            color: colors.primary,
            fontWeight: '800',
          },
        },
      };
    }

    return marked;
  }, [filteredLeaves, selectedDate]);

  // Leaves for Currently Selected Date
  const selectedDateLeaves = useMemo(() => {
    if (!selectedDate) return [];
    const targetM = moment(selectedDate);
    return filteredLeaves.filter((req: any) => {
      const start = req.startDate || req.start_date;
      const end = req.endDate || req.end_date;
      if (!start) return false;

      const startM = moment(start);
      const endM = moment(end || start);
      return targetM.isBetween(startM, endM, 'day', '[]');
    });
  }, [filteredLeaves, selectedDate]);

  // Week Days (for Week View)
  const weekDays = useMemo(() => {
    const startOfWeek = moment(selectedDate).startOf('week');
    return Array.from({ length: 7 }, (_, i) => {
      const d = startOfWeek.clone().add(i, 'days');
      return {
        dateString: d.format('YYYY-MM-DD'),
        dayName: d.format('ddd'),
        dayNum: d.format('DD'),
        isToday: d.isSame(moment(), 'day'),
        isSelected: d.format('YYYY-MM-DD') === selectedDate,
      };
    });
  }, [selectedDate]);

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: normalize(16), paddingBottom: normalize(40) }} showsVerticalScrollIndicator={false}>
        {/* ── Top View Type Switcher & Filter Button Bar ───────────── */}
        <BlurView intensity={60} tint="light" style={s.topControlBox}>
          {/* View Type Switcher (Month / Week / Day / List) */}
          <View style={s.viewTypeGroup}>
            {[
              { id: 'month', label: 'Month' },
              { id: 'week', label: 'Week' },
              { id: 'day', label: 'Day' },
              { id: 'list', label: 'List' },
            ].map((vt) => (
              <TouchableOpacity
                key={vt.id}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setViewType(vt.id as any);
                }}
                style={[s.vtBtn, viewType === vt.id && s.vtBtnActive]}
              >
                <Typography style={[s.vtText, viewType === vt.id && s.vtTextActive]}>
                  {vt.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          {/* Filter Button with Active Counter Badge */}
          <TouchableOpacity
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsFilterModalOpen(true);
            }}
            style={[s.filterTriggerBtn, activeFilterCount > 0 && s.filterTriggerBtnActive]}
            activeOpacity={0.8}
          >
            <SlidersHorizontal size={15} color={activeFilterCount > 0 ? colors.white : colors.primary} />
            <Typography style={[s.filterTriggerText, activeFilterCount > 0 && s.filterTriggerTextActive]}>
              Filters
            </Typography>
            {activeFilterCount > 0 && (
              <View style={s.filterBadge}>
                <Typography style={s.filterBadgeText}>{activeFilterCount}</Typography>
              </View>
            )}
          </TouchableOpacity>
        </BlurView>

        {/* ── Active Filter Summary Pills ───────────────────────────── */}
        {activeFilterCount > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: normalize(10) }}>
            <View style={{ flexDirection: 'row', gap: normalize(6), alignItems: 'center' }}>
              <Typography style={{ fontSize: normalize(10), fontWeight: '800', color: colors.text.muted }}>
                ACTIVE:
              </Typography>
              {viewMode !== '' && (
                <View style={s.activeChip}>
                  <Typography style={s.activeChipText}>Mode: {viewMode.toUpperCase()}</Typography>
                </View>
              )}
              {selectedStatus !== '' && (
                <View style={s.activeChip}>
                  <Typography style={s.activeChipText}>Status: {statusOptions.find(s => s.value === selectedStatus)?.label || selectedStatus}</Typography>
                </View>
              )}
              {selectedType !== '' && (
                <View style={s.activeChip}>
                  <Typography style={s.activeChipText}>Type: {typeOptions.find(t => t.value === selectedType)?.label || selectedType}</Typography>
                </View>
              )}
              {selectedEmployee !== '' && (
                <View style={s.activeChip}>
                  <Typography style={s.activeChipText}>Emp: {employeeOptions.find(e => e.value === selectedEmployee)?.label || selectedEmployee}</Typography>
                </View>
              )}
              <TouchableOpacity
                onPress={() => {
                  setViewMode('');
                  setSelectedStatus('');
                  setSelectedType('');
                  setSelectedEmployee('');
                }}
                style={s.clearChipBtn}
              >
                <Typography style={s.clearChipText}>Clear All</Typography>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* ── Calendar Views Render ─────────────────────────────────── */}

        {/* 1. MONTH VIEW */}
        {viewType === 'month' && (
          <BlurView intensity={60} tint="light" style={s.calendarCard}>
            <Calendar
              current={selectedDate || moment().format('YYYY-MM-DD')}
              onDayPress={(day: any) => {
                Haptics.selectionAsync();
                setSelectedDate(day.dateString);
              }}
              markedDates={calendarMarkedDates}
              markingType={'custom'}
              theme={{
                calendarBackground: 'transparent',
                textSectionTitleColor: colors.text.muted,
                todayTextColor: colors.primary,
                dayTextColor: colors.black,
                textDisabledColor: colors.text.muted,
                arrowColor: colors.primary,
                monthTextColor: colors.black,
                textMonthFontWeight: '800',
                textDayHeaderFontWeight: '700',
              }}
            />

            {/* Status Legend Strip */}
            <View style={s.legendStrip}>
              <Typography style={s.legendTitle}>STATUS:</Typography>
              <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: colors.success }]} /><Typography style={s.legendText}>Approved</Typography></View>
              <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: colors.emailBlue }]} /><Typography style={s.legendText}>Pending HR</Typography></View>
              <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: colors.warning }]} /><Typography style={s.legendText}>Pending TL</Typography></View>
              <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: colors.error }]} /><Typography style={s.legendText}>Rejected</Typography></View>
              <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: colors.text.muted }]} /><Typography style={s.legendText}>Cancelled</Typography></View>
            </View>
          </BlurView>
        )}

        {/* 2. WEEK VIEW */}
        {viewType === 'week' && (
          <BlurView intensity={60} tint="light" style={s.weekWrapper}>
            <Typography style={{ fontSize: normalize(13), fontWeight: '800', color: colors.black, marginBottom: normalize(12) }}>
              Week of {moment(selectedDate).startOf('week').format('DD MMM')} – {moment(selectedDate).endOf('week').format('DD MMM YYYY')}
            </Typography>

            {/* 7-Day Horizontal Strip */}
            <View style={s.weekStripRow}>
              {weekDays.map((w) => (
                <TouchableOpacity
                  key={w.dateString}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedDate(w.dateString);
                  }}
                  style={[s.weekDayCell, w.isSelected && s.weekDayCellSelected]}
                >
                  <Typography style={[s.weekDayName, w.isSelected && s.weekDayTextSelected]}>
                    {w.dayName}
                  </Typography>
                  <Typography style={[s.weekDayNum, w.isSelected && s.weekDayTextSelected]}>
                    {w.dayNum}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        )}

        {/* 3. DAY VIEW */}
        {viewType === 'day' && (
          <BlurView intensity={60} tint="light" style={s.dayViewCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setSelectedDate(moment(selectedDate).subtract(1, 'day').format('YYYY-MM-DD'))}
                style={s.dayNavBtn}
              >
                <ChevronLeft size={18} color={colors.primary} />
              </TouchableOpacity>
              <Typography style={{ fontSize: normalize(15), fontWeight: '800', color: colors.black }}>
                {moment(selectedDate).format('dddd, DD MMMM YYYY')}
              </Typography>
              <TouchableOpacity
                onPress={() => setSelectedDate(moment(selectedDate).add(1, 'day').format('YYYY-MM-DD'))}
                style={s.dayNavBtn}
              >
                <ChevronRight size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </BlurView>
        )}

        {/* ── Selected Date / Agenda Events List ────────────────────── */}
        <View style={{ marginTop: normalize(16) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(10) }}>
            <Typography style={{ fontSize: normalize(14), fontWeight: '800', color: colors.black }}>
              {viewType === 'list' ? 'All Leave Requests (Agenda)' : `Requests for ${moment(selectedDate).format('DD MMM YYYY')}`}
            </Typography>
            <Typography style={{ fontSize: normalize(11), fontWeight: '700', color: colors.text.muted }}>
              {viewType === 'list' ? filteredLeaves.length : selectedDateLeaves.length} {viewType === 'list' ? 'total' : 'events'}
            </Typography>
          </View>

          {(viewType === 'list' ? filteredLeaves : selectedDateLeaves).length === 0 ? (
            <View style={s.emptyAgendaCard}>
              <Typography style={{ fontSize: normalize(12), color: colors.text.muted, fontWeight: '600', marginBottom: normalize(8) }}>
                No leave requests found for this selection.
              </Typography>
              <TouchableOpacity onPress={onApplyLeave} style={s.applyBtnMini}>
                <Plus size={14} color={colors.primary} />
                <Typography style={{ fontSize: normalize(12), fontWeight: '700', color: colors.primary }}>
                  Apply Leave
                </Typography>
              </TouchableOpacity>
            </View>
          ) : (
            (viewType === 'list' ? filteredLeaves : selectedDateLeaves).map((req: any) => {
              const statusStr = req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1).replace('_', ' ') : 'Pending';
              const statusColor = getStatusColor(statusStr);

              return (
                <TouchableOpacity
                  key={req.id}
                  activeOpacity={0.82}
                  onPress={() => onSelectRequest(req)}
                  style={[s.eventCard, { borderLeftColor: statusColor }]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(4) }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
                      <Typography style={{ fontSize: normalize(14), fontWeight: '800', color: colors.black }}>
                        {req.employeeName || 'Employee'}
                      </Typography>
                      {req.empCode && (
                        <View style={s.codeBadge}>
                          <Typography style={s.codeBadgeText}>{req.empCode}</Typography>
                        </View>
                      )}
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: statusColor + '15' }]}>
                      <Typography style={[s.statusBadgeText, { color: statusColor }]}>
                        {statusStr}
                      </Typography>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6), marginBottom: normalize(6) }}>
                    <Typography style={{ fontSize: normalize(12), fontWeight: '700', color: colors.primary }}>
                      {req.leaveTypeName || 'Leave'}
                    </Typography>
                    {req.leaveTypeCode && (
                      <View style={{ backgroundColor: colors.primary + '12', paddingHorizontal: normalize(6), paddingVertical: normalize(2), borderRadius: normalize(4) }}>
                        <Typography style={{ fontSize: normalize(10), fontWeight: '800', color: colors.primary }}>
                          {req.leaveTypeCode}
                        </Typography>
                      </View>
                    )}
                  </View>

                  <Typography style={{ fontSize: normalize(11), color: colors.text.secondary, fontWeight: '600', marginBottom: normalize(4) }}>
                    📅 {moment(req.startDate).format('DD MMM')} — {moment(req.endDate).format('DD MMM YYYY')} · {req.days || 1} day(s) ({(req.dayType || 'full_day').replace('_', ' ')})
                  </Typography>

                  {req.reason && (
                    <Typography numberOfLines={2} style={{ fontSize: normalize(12), color: colors.text.primary, lineHeight: normalize(17), marginTop: normalize(2) }}>
                      {req.reason}
                    </Typography>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ── Filter Modal ─────────────────────────────────────────────── */}
      <Modal visible={isFilterModalOpen} animationType="slide" transparent onRequestClose={() => setIsFilterModalOpen(false)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsFilterModalOpen(false)} />
          <Animated.View entering={FadeInUp.springify()} style={[s.modalContent, { maxHeight: '85%' }]}>
            <View style={s.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(10), flex: 1 }}>
                <View style={s.modalIconBg}>
                  <SlidersHorizontal size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography style={s.modalTitle}>Filter Leave Calendar</Typography>
                  <Typography style={s.modalSub}>Refine by view mode, status, leave type, or employee</Typography>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsFilterModalOpen(false)} style={s.modalCloseBtn}>
                <XCircle size={24} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: normalize(20), paddingBottom: normalize(40) }}
            >


              {/* 1. View Mode (My / Team / All) */}
              <View style={s.inputGroup}>
                <Typography style={s.inputLabel}>VIEW MODE</Typography>
                <UICoreDropdown
                  placeholder="All View Modes"
                  value={viewMode}
                  options={viewModeOptions}
                  onSelect={(opt) => setViewMode(opt.value)}
                />
              </View>

              {/* 2. Leave Status */}
              <View style={s.inputGroup}>
                <Typography style={s.inputLabel}>LEAVE STATUS</Typography>
                <UICoreDropdown
                  placeholder="All Statuses"
                  value={selectedStatus}
                  options={statusOptions}
                  onSelect={(opt) => setSelectedStatus(opt.value)}
                />
              </View>

              {/* 3. Leave Type (API Data) */}
              <View style={s.inputGroup}>
                <Typography style={s.inputLabel}>LEAVE TYPE</Typography>
                <UICoreDropdown
                  placeholder="All Leave Types"
                  value={selectedType}
                  options={typeOptions}
                  onSelect={(opt) => setSelectedType(opt.value)}
                />
              </View>

              {/* 4. Employee (API Data) */}
              <View style={s.inputGroup}>
                <Typography style={s.inputLabel}>EMPLOYEE</Typography>
                <UICoreDropdown
                  placeholder="All Employees"
                  value={selectedEmployee}
                  options={employeeOptions}
                  onSelect={(opt) => setSelectedEmployee(opt.value)}
                />
              </View>
            </ScrollView>

            <View style={s.modalFooter}>
              <TouchableOpacity
                onPress={() => {
                  setViewMode('');
                  setSelectedStatus('');
                  setSelectedType('');
                  setSelectedEmployee('');
                }}
                style={s.resetBtn}
              >
                <RotateCcw size={14} color={colors.text.secondary} />
                <Typography style={s.resetBtnText}>Reset All</Typography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsFilterModalOpen(false)}
                style={s.applyFilterBtn}
              >
                <Typography style={s.applyFilterBtnText}>Apply Filters</Typography>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  topControlBox: {
    borderRadius: normalize(16),
    padding: normalize(10),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: normalize(10),
  },
  viewTypeGroup: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: normalize(10),
    padding: normalize(3),
  },
  vtBtn: {
    flex: 1,
    paddingVertical: normalize(7),
    alignItems: 'center',
    borderRadius: normalize(8),
  },
  vtBtnActive: {
    backgroundColor: colors.primary,
  },
  vtText: {
    fontSize: normalize(11),
    fontWeight: '700',
    color: colors.text.secondary,
  },
  vtTextActive: {
    color: colors.white,
    fontWeight: '800',
  },
  filterTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  filterTriggerBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTriggerText: {
    fontSize: normalize(12),
    fontWeight: '800',
    color: colors.primary,
  },
  filterTriggerTextActive: {
    color: colors.white,
  },
  filterBadge: {
    backgroundColor: colors.white,
    width: normalize(18),
    height: normalize(18),
    borderRadius: normalize(9),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: normalize(2),
  },
  filterBadgeText: {
    fontSize: normalize(10),
    fontWeight: '900',
    color: colors.primary,
  },
  activeChip: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  activeChipText: {
    fontSize: normalize(10),
    fontWeight: '700',
    color: colors.primary,
  },
  clearChipBtn: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
  },
  clearChipText: {
    fontSize: normalize(10),
    fontWeight: '800',
    color: colors.error,
  },
  calendarCard: {
    borderRadius: normalize(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  legendStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: normalize(12),
    gap: normalize(8),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  legendTitle: {
    fontSize: normalize(9),
    color: colors.text.muted,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: normalize(10),
    color: colors.text.secondary,
    fontWeight: '700',
  },
  weekWrapper: {
    borderRadius: normalize(18),
    padding: normalize(14),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  weekStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: normalize(4),
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: normalize(10),
    borderRadius: normalize(12),
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  weekDayCellSelected: {
    backgroundColor: colors.primary,
  },
  weekDayName: {
    fontSize: normalize(10),
    fontWeight: '700',
    color: colors.text.secondary,
    marginBottom: normalize(2),
  },
  weekDayNum: {
    fontSize: normalize(14),
    fontWeight: '800',
    color: colors.black,
  },
  weekDayTextSelected: {
    color: colors.white,
  },
  dayViewCard: {
    borderRadius: normalize(18),
    padding: normalize(14),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dayNavBtn: {
    padding: normalize(6),
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: normalize(8),
  },
  emptyAgendaCard: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: normalize(14),
    padding: normalize(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  applyBtnMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    backgroundColor: colors.primary + '12',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(8),
  },
  eventCard: {
    backgroundColor: colors.white,
    borderRadius: normalize(14),
    padding: normalize(14),
    marginBottom: normalize(10),
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  codeBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: normalize(5),
    paddingVertical: normalize(2),
    borderRadius: normalize(4),
  },
  codeBadgeText: {
    fontSize: normalize(9),
    fontWeight: '700',
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(6),
  },
  statusBadgeText: {
    fontSize: normalize(10),
    fontWeight: '800',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: normalize(24),
    borderTopRightRadius: normalize(24),
    paddingTop: normalize(16),
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modalIconBg: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(12),
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: normalize(16),
    fontWeight: '800',
    color: colors.black,
  },
  modalSub: {
    fontSize: normalize(11),
    color: colors.text.muted,
    marginTop: normalize(2),
  },
  modalCloseBtn: {
    padding: normalize(4),
  },
  modalScroll: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(16),
  },
  inputGroup: {
    marginBottom: normalize(16),
  },
  inputLabel: {
    fontSize: normalize(11),
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: normalize(6),
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(16),
    paddingBottom: normalize(32),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    backgroundColor: colors.white,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(10),
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  resetBtnText: {
    fontSize: normalize(12),
    fontWeight: '700',
    color: colors.text.secondary,
  },
  applyFilterBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(10),
    borderRadius: normalize(10),
  },
  applyFilterBtnText: {
    fontSize: normalize(12),
    fontWeight: '800',
    color: colors.white,
  },
});
