// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { InputProps } from '../../types/components';
import colors from '../../theme/color';
import { Typography } from '../Typography';
import { moderateScale } from '../../utils/responsive';
import { Eye, EyeOff } from 'lucide-react-native';
import Tooltip from '../Tooltip';

function CustomInputInner(
  {
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    autoCorrect = false,
    multiline = false,
    numberOfLines = 1,
    error,
    disabled = false,
    leftIcon,
    rightIcon,
    onRightIconPress,
    tooltipContent,
    style,
    inputStyle,
    required = false,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    ...restProps
  }: InputProps & TextInputProps,
  ref: React.Ref<TextInput>,
) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const themeColors = colors;
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const combinedInputStyle = React.useMemo(() => {
    const base: (ViewStyle | TextStyle)[] = [styles.input];
    if (isFocused) base.push(styles.focused);
    if (error) base.push(styles.inputError);
    if (disabled) base.push(styles.disabled);
    if (leftIcon) base.push(styles.inputWithLeftIcon);
    if (rightIcon || secureTextEntry) base.push(styles.inputWithRightIcon);
    return [base, inputStyle];
  }, [isFocused, error, disabled, leftIcon, rightIcon, secureTextEntry, inputStyle]);

  const renderRightIcon = () => {
    const icons: React.ReactNode[] = [];

    // Password toggle icon
    if (secureTextEntry) {
      icons.push(
        <TouchableOpacity
          key="password-toggle"
          onPress={togglePasswordVisibility}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {showPassword ? (
            <Eye size={moderateScale(20)} color={themeColors.primary} />
          ) : (
            <EyeOff size={moderateScale(20)} color={themeColors.gray} />
          )}
        </TouchableOpacity>,
      );
    }

    // Custom right icon (often the Info icon for tooltips)
    if (rightIcon) {
      const iconContent =
        typeof rightIcon === 'string' ? (
          <Text style={styles.iconText}>{rightIcon}</Text>
        ) : (
          rightIcon
        );

      const trigger = (
        <TouchableOpacity
          key="custom-right-icon"
          onPress={onRightIconPress}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          disabled={!onRightIconPress && !!tooltipContent}
        >
          {iconContent}
        </TouchableOpacity>
      );

      icons.push(
        tooltipContent ? (
          <Tooltip key="tooltip-trigger" content={tooltipContent} placement="bottom">
            {trigger}
          </Tooltip>
        ) : (
          trigger
        ),
      );
    }

    if (icons.length === 0) return null;

    return (
      <View
        style={[styles.rightIconRow, multiline ? styles.multilineIcon : null]}
        onStartShouldSetResponder={() => true}
      >
        {icons.map((icon, index) => (
          <React.Fragment key={index}>
            {icon}
            {index < icons.length - 1 && <View style={{ width: moderateScale(10) }} />}
          </React.Fragment>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Typography variant="label" style={styles.label}>
          {label}
          {required && (
            <Typography variant="label" style={styles.required}>
              {' '}
              *
            </Typography>
          )}
        </Typography>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused ? styles.focusedContainer : null,
          error ? styles.errorContainer : null,
          disabled ? styles.disabledContainer : null,
          multiline ? styles.multilineInputContainer : null,
        ]}
      >
        {leftIcon && (
          <View style={[styles.leftIconContainer, multiline ? styles.multilineIcon : null]}>
            {typeof leftIcon === 'string' ? (
              <Text style={styles.iconText}>{leftIcon}</Text>
            ) : (
              leftIcon
            )}
          </View>
        )}

        <TextInput
          {...restProps}
          ref={ref}
          style={combinedInputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={themeColors.gray}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={(e) => {
            handleFocus();
            onFocusProp?.(e);
          }}
          onBlur={(e) => {
            handleBlur();
            onBlurProp?.(e);
          }}
        />

        {renderRightIcon()}
      </View>

      {error && (
        <Typography variant="caption" style={styles.errorText}>
          {error}
        </Typography>
      )}
    </View>
  );
}

const CustomInput = React.forwardRef(CustomInputInner) as React.ForwardRefExoticComponent<
  InputProps & TextInputProps & React.RefAttributes<TextInput>
>;

const styles = (() => {
  const themeColors = colors;
  return StyleSheet.create({
    container: {
      marginBottom: moderateScale(16),
    },
    label: {
      marginBottom: moderateScale(6),
      fontFamily: 'DMSans-Medium',
    },
    required: {
      color: themeColors.error,
    },

    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: themeColors.border,
      borderRadius: moderateScale(14),
      backgroundColor: themeColors.white,
    },
    focusedContainer: {
      borderColor: themeColors.primary,
    },
    errorContainer: {
      borderColor: themeColors.error,
    },
    disabledContainer: {
      backgroundColor: themeColors.lightGray,
      opacity: 0.6,
    },
    input: {
      flex: 1,
      paddingVertical: moderateScale(10),
      paddingHorizontal: moderateScale(14),
      fontSize: moderateScale(15),
      fontFamily: 'DMSans-Regular',
      color: themeColors.dark,
      minHeight: moderateScale(48),
    },
    focused: {
      borderColor: themeColors.primary,
    },
    iconContainer: {
      paddingHorizontal: moderateScale(12),
    },
    rightIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: moderateScale(12),
    },
    iconText: {
      fontSize: moderateScale(16),
      color: themeColors.gray,
    },

    inputWithLeftIcon: {
      paddingLeft: moderateScale(4),
    },
    inputWithRightIcon: {
      paddingRight: moderateScale(4),
    },

    inputError: {
      borderColor: themeColors.error,
    },
    disabled: {
      backgroundColor: themeColors.lightGray,
      opacity: 0.6,
    },
    leftIconContainer: {
      paddingLeft: moderateScale(14),
      paddingRight: moderateScale(4),
    },
    multilineAlign: {
      alignItems: 'flex-start',
    },
    multilineInputContainer: {
      alignItems: 'flex-start',
    },
    multilineIcon: {
      paddingTop: moderateScale(12),
      alignSelf: 'flex-start',
    },
    errorText: {
      color: themeColors.error,
      fontSize: moderateScale(12),
      marginTop: moderateScale(4),
    },
  });
})();

CustomInput.displayName = 'CustomInput';

export default CustomInput;
