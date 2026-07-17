// @ts-nocheck
// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { Typography } from '../../Typography';
import { colors } from '../../../theme/color';
import { normalize } from '../../../utils/responsive';
import { AlertTriangle } from 'lucide-react-native';

export interface UICoreTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  onRightIconPress?: () => void;
  forceFocus?: boolean;
  required?: boolean;
}

export const UICoreTextInput: React.FC<UICoreTextInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputContainerStyle,
  labelStyle,
  onRightIconPress,
  onFocus,
  onBlur,
  style,
  forceFocus,
  required,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (
    e: import('react-native').NativeSyntheticEvent<import('react-native').TextInputFocusEventData>,
  ) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (
    e: import('react-native').NativeSyntheticEvent<import('react-native').TextInputFocusEventData>,
  ) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const isActuallyFocused = isFocused || forceFocus;
  const isDisabled = props.editable === false;

  const borderColor = error
    ? colors.error
    : isActuallyFocused
    ? colors.inputActive || colors.primary
    : colors.border;
  const backgroundColor = isDisabled ? colors.lightGray : colors.white;
  const opacity = isDisabled ? 0.6 : 1;
  const borderWidth = isActuallyFocused ? 1.5 : 1;

  return (
    <View style={[styles.container, { opacity }, containerStyle]}>
      <View
        style={[
          styles.inputWrapper,
          { borderColor, backgroundColor, borderWidth },
          props.multiline && styles.inputWrapperMultiline,
          inputContainerStyle,
        ]}
      >
        <View style={[styles.innerWrapper, props.multiline && styles.innerWrapperMultiline]}>
          {label && (
            <Typography
              variant="caption"
              weight="500"
              style={[
                styles.label,
                { color: error ? colors.error : colors.inputTextColor },
                labelStyle,
              ]}
            >
              {label.endsWith('*') || required ? (
                <>
                  {label.endsWith('*') ? label.slice(0, -1) : label}
                  <Typography variant="caption" weight="500" style={{ color: colors.error }}>
                    *
                  </Typography>
                </>
              ) : (
                label
              )}
            </Typography>
          )}
          <View
            style={[styles.contentContainer, props.multiline && styles.contentContainerMultiline]}
          >
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <TextInput
              style={[
                styles.input,
                { color: colors.inputTextColor || colors.text.primary },
                !label && styles.inputNoLabel,
                props.multiline && styles.inputMultiline,
                style,
              ]}
              placeholderTextColor={colors.text.placeholder}
              onFocus={handleFocus}
              onBlur={handleBlur}
              textAlignVertical={props.multiline ? 'top' : 'center'}
              {...props}
            />
          </View>
        </View>
        {rightIcon && (
          <TouchableOpacity
            activeOpacity={onRightIconPress ? 0.7 : 1}
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <AlertTriangle size={normalize(12)} color={colors.error || '#FF0000'} />
          <Typography variant="caption" color={colors.error || '#FF0000'} style={styles.errorText}>
            {error}
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: normalize(16),
  },
  inputWrapper: {
    borderRadius: normalize(12),
    minHeight: normalize(56),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(12),
    justifyContent: 'space-between',
  },
  inputWrapperMultiline: {
    alignItems: 'flex-start',
    paddingVertical: normalize(12),
  },
  innerWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: normalize(6),
  },
  innerWrapperMultiline: {
    justifyContent: 'flex-start',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contentContainerMultiline: {
    alignItems: 'flex-start',
    flex: 1,
  },
  leftIcon: {
    marginRight: normalize(8),
  },
  rightIcon: {
    marginLeft: normalize(10),
    padding: normalize(4),
  },
  label: {
    marginBottom: normalize(2),
    fontSize: normalize(12),
    fontWeight: Platform.OS === 'ios' ? '500' : '700',
  },
  input: {
    flex: 1,
    padding: 0,
    margin: 0,
    fontSize: normalize(16),
  },
  inputMultiline: {
    minHeight: normalize(80),
  },
  inputNoLabel: {
    paddingVertical: normalize(4),
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(4),
    marginLeft: normalize(4),
  },
  errorText: {
    marginLeft: normalize(4),
    fontSize: normalize(12),
  },
});

export default UICoreTextInput;
