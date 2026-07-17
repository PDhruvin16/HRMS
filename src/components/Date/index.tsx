// @ts-nocheck
// @ts-nocheck
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
  Modal,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import moment from 'moment';
import { Calendar, type DateData } from 'react-native-calendars';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react-native';

// Fallback for missing type export in library
type MarkedDates = Record<
  string,
  {
    selected?: boolean;
    selectedColor?: string;
    selectedTextColor?: string;
    disabled?: boolean;
    disableTouchEvent?: boolean;
    textColor?: string;
  }
>;
import spacing from '../../theme/spacing';
import { Typography } from '../Typography';
import { normalize } from '../../utils/responsive';
import Colors from '../../theme/color';

interface IDatePickerProps {
  label?: string;
  onDateChange?: (date: string) => void;
  initialDate?: string;
  required?: boolean;
  error?: string;
  style?: ViewStyle;
  disabled?: boolean;
  disabledDates?: string[]; // Array of dates in YYYY-MM-DD format
  disabledDaysOfWeek?: string[]; // Array of day names like ['SATURDAY', 'SUNDAY']
  disablePastDates?: boolean;
  minDate?: string;
  maxDate?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CALENDAR_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);

type ViewMode = 'calendar' | 'month' | 'year';

const DatePicker: React.FC<IDatePickerProps> = ({
  label = 'Date',
  onDateChange,
  initialDate = '',
  required = false,
  error,
  style,
  disabled = false,
  disabledDates = [],
  disabledDaysOfWeek = [],
  disablePastDates = false,
  minDate,
  maxDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const today = useMemo(() => moment().format('YYYY-MM-DD'), []);

  const [currentMonth, setCurrentMonth] = useState<string>(
    initialDate && moment(initialDate, 'DD/MM/YYYY').isValid()
      ? moment(initialDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
      : maxDate && moment(maxDate, 'YYYY-MM-DD').isValid()
      ? moment(maxDate, 'YYYY-MM-DD').format('YYYY-MM-DD')
      : today,
  );

  useEffect(() => {
    if (showCalendar) {
      console.log('[DatePicker] Calendar Opened:', {
        currentMonth,
        minDate,
        disablePastDates,
        computedMinDate: disablePastDates ? moment().format('YYYY-MM-DD') : minDate,
      });
    }
  }, [showCalendar, currentMonth, minDate, disablePastDates]);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const yearListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
      if (moment(initialDate, 'DD/MM/YYYY').isValid()) {
        setCurrentMonth(moment(initialDate, 'DD/MM/YYYY').format('YYYY-MM-DD'));
      }
    }
  }, [initialDate]);

  const markedDates: MarkedDates = useMemo(() => {
    const dates: MarkedDates = {};

    // Map day names to moment day numbers (0=Sunday, 6=Saturday)
    const dayMap: Record<string, number> = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    const disabledDayNums = disabledDaysOfWeek
      .map((d) => dayMap[d.toUpperCase()])
      .filter((n) => n !== undefined);

    // If we have disabled days of week, we need to mark them for the visible range.
    // For simplicity, we'll mark dates in the current month +/- 1 month.
    if (disabledDayNums.length > 0) {
      const start = moment(currentMonth).subtract(1, 'month').startOf('month');
      const end = moment(currentMonth).add(1, 'month').endOf('month');
      let curr = start.clone();
      while (curr.isSameOrBefore(end)) {
        if (disabledDayNums.includes(curr.day())) {
          const key = curr.format('YYYY-MM-DD');
          dates[key] = {
            disabled: true,
            disableTouchEvent: true,
            textColor: Colors.border,
          };
        }
        curr.add(1, 'day');
      }
    }

    // Add specific disabled dates (holidays)
    if (disabledDates && Array.isArray(disabledDates)) {
      disabledDates.forEach((date) => {
        dates[date] = {
          disabled: true,
          disableTouchEvent: true,
          textColor: Colors.border,
        };
      });
    }

    if (!selectedDate || !moment(selectedDate, 'DD/MM/YYYY').isValid()) {
      return dates;
    }

    const key = moment(selectedDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    dates[key] = {
      ...dates[key],
      selected: true,
      selectedColor: Colors.bottomTabBackground,
      selectedTextColor: Colors.white,
    };

    return dates;
  }, [selectedDate, disabledDates, disabledDaysOfWeek, currentMonth]);

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: 'transparent',
      calendarBackground: 'transparent',
      textSectionTitleColor: Colors.sectionHeader || '#8A8A8A',
      selectedDayBackgroundColor: Colors.bottomTabBackground,
      selectedDayTextColor: Colors.white,
      todayTextColor: Colors.primary,
      dayTextColor: Colors.text.primary,
      textDisabledColor: Colors.border,
      dotColor: Colors.primary,
      selectedDotColor: Colors.white,
      arrowColor: Colors.primary,
      monthTextColor: Colors.text.primary,
      indicatorColor: Colors.primary,
      textDayFontWeight: '500' as const,
      textMonthFontWeight: '700' as const,
      textDayHeaderFontWeight: '600' as const,
      textDayFontSize: normalize(14),
      textMonthFontSize: normalize(16),
      textDayHeaderFontSize: normalize(12),
    }),
    [],
  );

  const handleDayPress = (day: DateData) => {
    if (markedDates[day.dateString]?.disabled) {
      return;
    }
    const formattedDate = moment(day.dateString).format('DD/MM/YYYY');
    setSelectedDate(formattedDate);
    // Don't close or callback yet - wait for Apply
  };

  const handleApply = () => {
    if (selectedDate) {
      onDateChange?.(selectedDate);
      setShowCalendar(false);
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const date = moment(currentMonth);
    const newDate = direction === 'next' ? date.add(1, 'month') : date.subtract(1, 'month');
    setCurrentMonth(newDate.format('YYYY-MM-DD'));
  };

  const handleClose = () => {
    setShowCalendar(false);
    setViewMode('calendar');
  };

  const currentMonthName = useMemo(() => moment(currentMonth).format('MMMM'), [currentMonth]);
  const currentYear = useMemo(() => moment(currentMonth).format('YYYY'), [currentMonth]);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const years = useMemo(() => {
    const currentY = parseInt(moment().format('YYYY'), 10);
    const yearArr = [];
    for (let i = currentY; i >= currentY - 100; i--) {
      yearArr.push(i);
    }
    return yearArr;
  }, []);

  const selectMonth = (monthIndex: number) => {
    const newDate = moment(currentMonth).month(monthIndex);
    setCurrentMonth(newDate.format('YYYY-MM-DD'));
    setViewMode('calendar');
  };

  const selectYear = (year: number) => {
    const newDate = moment(currentMonth).year(year);
    setCurrentMonth(newDate.format('YYYY-MM-DD'));
    setViewMode('calendar');
  };

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <View style={styles.labelRow}>
          <Typography variant="caption" style={styles.label}>
            {label}
          </Typography>
          {required && (
            <Typography variant="caption" style={styles.required}>
              {' '}
              *
            </Typography>
          )}
        </View>
      ) : null}

      <TouchableOpacity
        style={[
          styles.inputContainer,
          showCalendar && styles.inputContainerFocused,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
        onPress={() => setShowCalendar(true)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <TextInput
          style={styles.input}
          value={selectedDate}
          placeholder="DD/MM/YYYY"
          placeholderTextColor={Colors.muted}
          editable={false}
          pointerEvents="none"
        />
        <View style={styles.iconContainer}>
          <CalendarIcon size={normalize(20)} color={Colors.sectionHeader} />
        </View>
      </TouchableOpacity>

      {error ? (
        <Typography variant="caption" style={styles.errorText}>
          {error}
        </Typography>
      ) : null}

      <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.backdropPressable}
            activeOpacity={1}
            onPress={handleClose}
          />
          <View style={styles.calendarBox}>
            <View style={styles.header}>
              {viewMode === 'calendar' ? (
                <>
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => handleMonthChange('prev')}
                  >
                    <ChevronLeft size={normalize(22)} color={Colors.primary} />
                  </TouchableOpacity>

                  <View style={styles.monthYearContainer}>
                    <TouchableOpacity
                      onPress={() => setViewMode('month')}
                      style={styles.headerSelectionButton}
                    >
                      <Typography variant="body1" weight="700" style={styles.monthNameText}>
                        {currentMonthName}
                      </Typography>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setViewMode('year')}
                      style={styles.headerSelectionButton}
                    >
                      <Typography variant="body1" weight="700" style={styles.yearText}>
                        {currentYear}
                      </Typography>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => handleMonthChange('next')}
                  >
                    <ChevronRight size={normalize(22)} color={Colors.primary} />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.viewModeHeader}>
                  <Typography variant="body1" weight="800" style={styles.viewModeTitle}>
                    {viewMode === 'month' ? 'Select Month' : 'Select Year'}
                  </Typography>
                  <TouchableOpacity onPress={() => setViewMode('calendar')}>
                    <X size={normalize(20)} color={Colors.muted} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.calendarContent}>
              {viewMode === 'calendar' && (
                <Calendar
                  key={`${currentMonth}_${Object.keys(markedDates).length}`}
                  current={currentMonth}
                  hideExtraDays={false}
                  hideArrows
                  renderHeader={() => null}
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                  theme={calendarTheme}
                  enableSwipeMonths
                  onMonthChange={(month) => {
                    setCurrentMonth(month.dateString);
                  }}
                  minDate={disablePastDates ? today : minDate}
                  maxDate={maxDate}
                />
              )}

              {viewMode === 'month' && (
                <View style={styles.monthGrid}>
                  {months.map((m, idx) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.monthGridItem,
                        moment(currentMonth).month() === idx && styles.activeMonthItem,
                      ]}
                      onPress={() => selectMonth(idx)}
                    >
                      <Typography
                        variant="body2"
                        weight="700"
                        style={{
                          color:
                            moment(currentMonth).month() === idx
                              ? Colors.white
                              : Colors.text.primary,
                        }}
                      >
                        {m}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {viewMode === 'year' && (
                <FlatList
                  ref={yearListRef}
                  data={years}
                  keyExtractor={(item) => item.toString()}
                  showsVerticalScrollIndicator={false}
                  numColumns={3}
                  style={styles.flex1}
                  contentContainerStyle={styles.yearGrid}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.yearGridItem,
                        parseInt(currentYear, 10) === item && styles.activeYearItem,
                      ]}
                      onPress={() => selectYear(item)}
                    >
                      <Typography
                        variant="body2"
                        weight="700"
                        style={{
                          color:
                            parseInt(currentYear, 10) === item
                              ? Colors.white
                              : Colors.text.primary,
                        }}
                      >
                        {item}
                      </Typography>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity onPress={handleClose} style={styles.footerButton}>
                <Typography style={styles.footerButtonText}>Cancel</Typography>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const todayKey = moment().format('YYYY-MM-DD');
                  if (markedDates[todayKey]?.disabled) {
                    return;
                  }
                  const todayFormatted = moment().format('DD/MM/YYYY');
                  setSelectedDate(todayFormatted);
                  setCurrentMonth(todayKey);
                  // We'll let user click Apply even for 'Today' to be consistent,
                  // or just apply it immediately. The user asked for "Apply button pain click karega"
                }}
                disabled={!!markedDates[moment().format('YYYY-MM-DD')]?.disabled}
                style={[
                  styles.footerButton,
                  styles.todayButton,
                  !!markedDates[moment().format('YYYY-MM-DD')]?.disabled && styles.disabledButton,
                ]}
              >
                <Typography variant="body2" weight="700" style={styles.todayButtonText}>
                  Today
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApply}
                disabled={!selectedDate}
                style={[
                  styles.footerButton,
                  styles.applyButton,
                  !selectedDate && styles.disabledButton,
                ]}
              >
                <Typography variant="body2" weight="700" style={styles.applyButtonText}>
                  Apply
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: normalize(6),
  },
  label: {
    fontSize: normalize(12),
    color: Colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  required: {
    fontSize: normalize(12),
    color: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: normalize(12),
    marginTop: normalize(4),
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: normalize(12),
    backgroundColor: Colors.white,
    height: normalize(52),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputContainerFocused: {
    borderColor: Colors.inputActive,
  },
  inputContainerError: {
    borderColor: Colors.error,
  },
  inputContainerDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  input: {
    flex: 1,
    paddingHorizontal: normalize(16),
    fontSize: normalize(15),
    color: Colors.text.primary,
    fontWeight: '600',
  },
  iconContainer: {
    paddingRight: normalize(16),
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  calendarBox: {
    width: CALENDAR_WIDTH,
    borderRadius: normalize(20),
    backgroundColor: Colors.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  monthYearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },
  headerSelectionButton: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
    backgroundColor: '#F7F7F7',
  },
  monthNameText: {
    fontSize: normalize(16),
    color: Colors.text.primary,
  },
  yearText: {
    fontSize: normalize(16),
    color: Colors.text.primary,
  },
  viewModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  viewModeTitle: {
    fontSize: normalize(16),
    color: Colors.text.primary,
  },
  navButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarContent: {
    height: normalize(320),
    padding: normalize(10),
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: normalize(10),
  },
  monthGridItem: {
    width: '30%',
    height: normalize(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(12),
    borderRadius: normalize(8),
    backgroundColor: '#F9F9F9',
  },
  activeMonthItem: {
    backgroundColor: Colors.bottomTabBackground,
  },
  monthItemText: {
    color: Colors.text.primary,
  },
  activeMonthText: {
    color: Colors.white,
  },
  yearGrid: {
    padding: normalize(10),
  },
  yearGridItem: {
    flex: 1,
    height: normalize(40),
    alignItems: 'center',
    justifyContent: 'center',
    margin: normalize(4),
    borderRadius: normalize(8),
    backgroundColor: '#F9F9F9',
  },
  activeYearItem: {
    backgroundColor: Colors.bottomTabBackground,
  },
  yearItemText: {
    color: Colors.text.primary,
  },
  activeYearText: {
    color: Colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: normalize(16),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: normalize(12),
  },
  footerButton: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(8),
  },
  footerButtonText: {
    color: Colors.muted,
    fontWeight: '700',
    fontSize: normalize(14),
  },
  todayButton: {
    backgroundColor: '#F0F7FF',
  },
  todayButtonText: {
    color: Colors.inputActive,
    fontWeight: '700',
    fontSize: normalize(14),
  },
  flex1: {
    flex: 1,
  },
  applyButton: {
    backgroundColor: Colors.bottomTabBackground,
    paddingHorizontal: normalize(20),
    minWidth: normalize(80),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: normalize(14),
    zIndex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default DatePicker;
