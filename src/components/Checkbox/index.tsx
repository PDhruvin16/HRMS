// @ts-nocheck
import React from 'react';
import { TouchableOpacity, View, StyleSheet, type TextStyle } from 'react-native';
import { Typography } from '../Typography';
import { colors } from '../../theme/color';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import { normalize } from '../../utils/responsive';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onPress: () => void;
  required?: boolean;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onPress,
  required = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
          disabled && styles.checkboxDisabled,
        ]}
      >
        {checked && (
          <Typography variant="caption" style={styles.checkmark}>
            ✓
          </Typography>
        )}
      </View>
      {label && (
        <Typography
          variant="body1"
          style={[styles.label, disabled && styles.labelDisabled].filter(Boolean) as TextStyle[]}
        >
          {label}
          {required && (
            <Typography variant="body1" style={styles.required}>
              {' '}
              *
            </Typography>
          )}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: normalize(spacing.xs),
  },
  checkbox: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(4),
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(spacing.sm),
  },
  checkboxChecked: {
    backgroundColor: colors.headerGradientStart || colors.primary,
    borderColor: colors.headerGradientStart || colors.primary,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkmark: {
    color: colors.white,
    fontSize: normalize(typography.caption),
    fontWeight: '700',
  },
  label: {
    fontSize: normalize(typography.body),
    color: colors.convoDark || '#1C1C1E',
    flex: 1,
  },
  labelDisabled: {
    color: colors.text.secondary || '#8E8E93',
  },
  required: {
    color: colors.errorRed || colors.error,
  },
});

export default Checkbox;
