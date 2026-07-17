// @ts-nocheck
// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import moment from 'moment';
import { Typography } from '../Typography';
import { SelectOption } from '../Dropdown';
import { UICoreDropdown } from '../UICore/UICoreDropdown';
import Colors from '../../theme/color';
import { normalize } from '../../utils/responsive';
import { UICoreButton } from '../UICore/UICoreButton';
import { UICoreTextInput } from '../UICore/UICoreTextInput';
import DatePicker from '../Date';

export interface FilterValue {
  column: string | number | null;
  operator: string | number | null;
  value: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filter: FilterValue) => void;
  onClear?: () => void;
  initialValue?: FilterValue | null;
  columns: SelectOption[];
  allowFutureDates?: boolean;
}

const OPERATORS: SelectOption[] = [
  { id: 'equal', label: 'Equals', value: 'equal' },
  { id: 'not_equal', label: 'Not Equals', value: 'not_equal' },
  { id: 'contains', label: 'Contains', value: 'contains' },
  { id: 'begins_with', label: 'Begins With', value: 'begins_with' },
  { id: 'ends_with', label: 'Ends With', value: 'ends_with' },
];

const PIPELINE_STATUS_OPERATORS: SelectOption[] = [
  { id: 'equal', label: 'Equals', value: 'equal' },
  { id: 'not_equal', label: 'Not Equals', value: 'not_equal' },
];

const NUMERIC_OPERATORS: SelectOption[] = [
  { id: 'equal', label: 'Equals', value: 'equal' },
  { id: 'not_equal', label: 'Not Equals', value: 'not_equal' },
  { id: 'less_than', label: 'Less Than', value: 'less_than' },
  { id: 'less_or_equal', label: 'Less or Equal', value: 'less_or_equal' },
  { id: 'greater_than', label: 'Greater Than', value: 'greater_than' },
  { id: 'greater_or_equal', label: 'Greater or Equal', value: 'greater_or_equal' },
  { id: 'between', label: 'Between', value: 'between' },
  { id: 'not_between', label: 'Not Between', value: 'not_between' },
];

const DATE_OPERATORS: SelectOption[] = [
  { id: 'equal', label: 'Equals', value: 'equal' },
  { id: 'not_equal', label: 'Not Equals', value: 'not_equal' },
  { id: 'before', label: 'Before', value: 'before' },
  { id: 'before_or_equal', label: 'Before or On', value: 'before_or_equal' },
  { id: 'after', label: 'After', value: 'after' },
  { id: 'after_or_equal', label: 'After or On', value: 'after_or_equal' },
  { id: 'between', label: 'Between', value: 'between' },
  { id: 'not_between', label: 'Not Between', value: 'not_between' },
];

const STAGE_STATUS_OPTIONS: SelectOption[] = [
  { id: 'New', label: 'New', value: 'New' },
  { id: 'Contacted', label: 'Contacted', value: 'Contacted' },
  { id: 'Not Contacted', label: 'Not Contacted', value: 'Not Contacted' },
  {
    id: 'Converted to Opportunity',
    label: 'Converted to Opportunity',
    value: 'Converted to Opportunity',
  },
  { id: 'Disqualified', label: 'Disqualified', value: 'Disqualified' },
];

const WHATSAPP_SUBSCRIPTION_OPTIONS: SelectOption[] = [
  { id: 'subscribed', label: 'Subscribed', value: 'subscribed' },
  { id: 'unsubscribed', label: 'Unsubscribed', value: 'unsubscribed' },
];

const EMAIL_SUBSCRIPTION_OPTIONS: SelectOption[] = [
  { id: 'subscribed', label: 'Subscribed to emails', value: 'subscribed' },
  {
    id: 'unsubscribe_all_emails',
    label: 'Unsubscribe all emails',
    value: 'unsubscribe_all_emails',
  },
  {
    id: 'unsubscribe_marketing_emails',
    label: 'Unsubscribe marketing emails',
    value: 'unsubscribe_marketing_emails',
  },
  { id: 'bounce', label: 'Bounce', value: 'bounce' },
  { id: 'complaint', label: 'Complaint', value: 'complaint' },
];

const SHEET_HEIGHT = normalize(480);

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  onClear,
  initialValue,
  columns,
  allowFutureDates = false,
}) => {
  const [selectedColumn, setSelectedColumn] = useState<string | number | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string | number | null>(null);
  const [valueText, setValueText] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      if (initialValue) {
        setSelectedColumn(initialValue.column);
        setSelectedOperator(initialValue.operator);
        setValueText(initialValue.value || '');
        if (initialValue.operator === 'between' || initialValue.operator === 'not_between') {
          const parts = (initialValue.value || '').split(',');
          setRangeStart(parts[0] || '');
          setRangeEnd(parts[1] || '');
        } else {
          setRangeStart('');
          setRangeEnd('');
        }
      } else {
        setSelectedColumn(null);
        setSelectedOperator(null);
        setValueText('');
        setRangeStart('');
        setRangeEnd('');
      }
      setIsModalVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsModalVisible(false);
      });
    }
  }, [visible, initialValue, slideAnim, backdropAnim]);

  // Reset operator and value if column changes
  const handleColumnChange = (val: string | number | null) => {
    setSelectedColumn(val);
    setSelectedOperator(null);
    setValueText('');
    setRangeStart('');
    setRangeEnd('');
  };

  // Reset value if operator changes
  const handleOperatorChange = (val: string | number | null) => {
    setSelectedOperator(val);
    setValueText('');
    setRangeStart('');
    setRangeEnd('');
  };

  const isBetween = selectedOperator === 'between' || selectedOperator === 'not_between';
  const currentValStr = isBetween ? `${rangeStart},${rangeEnd}` : valueText;

  const handleApply = () => {
    onApply({
      column: selectedColumn,
      operator: selectedOperator,
      value: currentValStr,
    });
    onClose();
  };

  const hasChanges =
    selectedColumn !== (initialValue?.column ?? null) ||
    selectedOperator !== (initialValue?.operator ?? null) ||
    currentValStr !== (initialValue?.value ?? '');

  const showClearButton = !!initialValue && !hasChanges;

  const handleClear = () => {
    onClear?.();
    onClose();
  };

  const isDateColumn =
    selectedColumn === 'created_at' ||
    selectedColumn === 'date_of_birth' ||
    selectedColumn === 'preferred_date' ||
    selectedColumn === 'preferred_time';

  const currentOperators = useMemo(() => {
    if (
      selectedColumn === 'stage_status' ||
      selectedColumn === 'email_subscription_status' ||
      selectedColumn === 'whatsapp_subscription_status'
    ) {
      return PIPELINE_STATUS_OPERATORS;
    }
    if (selectedColumn === 'company_size') {
      return NUMERIC_OPERATORS;
    }
    if (isDateColumn) {
      return DATE_OPERATORS;
    }
    return OPERATORS;
  }, [selectedColumn, isDateColumn]);

  // Safe bottom padding: account for device safe area (notch/home indicator devices)
  const bottomPadding = Math.max(
    insets.bottom,
    Platform.OS === 'ios' ? normalize(16) : normalize(20),
  );

  return (
    <Modal
      visible={isModalVisible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        pointerEvents="box-none"
      >
        {/* Sheet panel */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideAnim }],
              paddingBottom: bottomPadding,
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Typography variant="h4" weight="700" style={styles.title}>
              Filter
            </Typography>
          </View>
          <View style={styles.divider} />

          {/* Body */}
          <View style={styles.body}>
            <UICoreDropdown
              label="Column"
              required
              placeholder="Select Column"
              options={columns.map((c) => ({ label: c.label, value: String(c.value ?? c.id) }))}
              value={selectedColumn ? String(selectedColumn) : undefined}
              onSelect={(opt) => handleColumnChange(opt.value)}
              containerStyle={styles.dropdown}
            />

            <UICoreDropdown
              label="Operator"
              required
              placeholder="Select Operator"
              options={currentOperators.map((o) => ({
                label: o.label,
                value: String(o.value ?? o.id),
              }))}
              value={selectedOperator ? String(selectedOperator) : undefined}
              onSelect={(opt) => handleOperatorChange(opt.value)}
              disabled={!selectedColumn}
              openUpward={true}
              containerStyle={styles.dropdown}
            />

            {selectedOperator ? (
              isBetween ? (
                isDateColumn ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: normalize(12),
                      marginBottom: normalize(20),
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <DatePicker
                        label="Start Date"
                        required
                        initialDate={rangeStart}
                        onDateChange={setRangeStart}
                        maxDate={allowFutureDates ? undefined : moment().format('YYYY-MM-DD')}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <DatePicker
                        label="End Date"
                        required
                        initialDate={rangeEnd}
                        onDateChange={setRangeEnd}
                        maxDate={allowFutureDates ? undefined : moment().format('YYYY-MM-DD')}
                      />
                    </View>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: normalize(12),
                      marginBottom: normalize(20),
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <UICoreTextInput
                        label="Min Value"
                        required
                        placeholder="Min"
                        value={rangeStart}
                        onChangeText={setRangeStart}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <UICoreTextInput
                        label="Max Value"
                        required
                        placeholder="Max"
                        value={rangeEnd}
                        onChangeText={setRangeEnd}
                      />
                    </View>
                  </View>
                )
              ) : selectedColumn === 'stage_status' ? (
                <UICoreDropdown
                  label="Value"
                  required
                  placeholder="Select Value"
                  options={STAGE_STATUS_OPTIONS.map((opt) => ({
                    label: opt.label,
                    value: String(opt.value ?? opt.id),
                  }))}
                  value={valueText || undefined}
                  onSelect={(opt) => setValueText(opt.value)}
                  openUpward={true}
                  containerStyle={styles.valueInput}
                />
              ) : selectedColumn === 'whatsapp_subscription_status' ? (
                <UICoreDropdown
                  label="Value"
                  required
                  placeholder="Select Value"
                  options={WHATSAPP_SUBSCRIPTION_OPTIONS.map((opt) => ({
                    label: opt.label,
                    value: String(opt.value ?? opt.id),
                  }))}
                  value={valueText || undefined}
                  onSelect={(opt) => setValueText(opt.value)}
                  openUpward={true}
                  containerStyle={styles.valueInput}
                />
              ) : selectedColumn === 'email_subscription_status' ? (
                <UICoreDropdown
                  label="Value"
                  required
                  placeholder="Select Value"
                  options={EMAIL_SUBSCRIPTION_OPTIONS.map((opt) => ({
                    label: opt.label,
                    value: String(opt.value ?? opt.id),
                  }))}
                  value={valueText || undefined}
                  onSelect={(opt) => setValueText(opt.value)}
                  openUpward={true}
                  containerStyle={styles.valueInput}
                />
              ) : isDateColumn ? (
                <DatePicker
                  label="Value"
                  required
                  initialDate={valueText}
                  onDateChange={setValueText}
                  maxDate={allowFutureDates ? undefined : moment().format('YYYY-MM-DD')}
                  style={styles.valueInput}
                />
              ) : (
                <UICoreTextInput
                  label="Value"
                  required
                  placeholder="Enter Filter Value"
                  value={valueText}
                  onChangeText={setValueText}
                  containerStyle={styles.valueInput}
                />
              )
            ) : null}

            <View style={styles.footer}>
              <UICoreButton title="Cancel" onPress={onClose} containerStyle={styles.cancelButton} />
              {showClearButton ? (
                <UICoreButton
                  title="Clear Filter"
                  primary
                  onPress={handleClear}
                  containerStyle={styles.applyButton}
                />
              ) : (
                <UICoreButton
                  title="Apply Filter"
                  primary
                  onPress={handleApply}
                  containerStyle={styles.applyButton}
                  disabled={
                    !selectedColumn ||
                    !selectedOperator ||
                    (isBetween ? !rangeStart || !rangeEnd : !valueText)
                  }
                />
              )}
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: normalize(28),
    borderTopRightRadius: normalize(28),
    minHeight: SHEET_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: normalize(12),
  },
  handle: {
    width: normalize(42),
    height: normalize(5),
    borderRadius: normalize(3),
    backgroundColor: Colors.divider,
  },
  header: {
    paddingHorizontal: normalize(24),
    paddingBottom: normalize(12),
    paddingTop: normalize(4),
  },
  title: {
    color: Colors.basecolor,
    fontSize: normalize(20),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    width: '100%',
    marginBottom: normalize(20),
  },
  body: {
    paddingHorizontal: normalize(24),
  },
  dropdown: {
    marginBottom: normalize(20),
  },
  valueInput: {
    marginBottom: normalize(20),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(10),
    gap: normalize(12),
  },
  cancelButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});

export default FilterModal;
