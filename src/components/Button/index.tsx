// @ts-nocheck
import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { ButtonProps } from '../../types/components';
import { FONTS } from '../../constants';
import { colors } from '../../theme/color';
import { normalize, moderateScale } from '../../utils/responsive';

// Add customColors prop to ButtonProps
interface CustomButtonProps extends ButtonProps {
  customColors?: string | string[];
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  customColors,
  leftIcon,
  rightIcon,
}) => {
  const getButtonSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  const getTextStyle = (): TextStyle[] => {
    const baseTextStyle: TextStyle[] = [styles.text, styles[`${size}Text`] as TextStyle];

    switch (variant) {
      case 'secondary':
        baseTextStyle.push(styles.secondaryText as TextStyle);
        break;
      case 'outline':
        baseTextStyle.push(styles.outlineText as TextStyle);
        break;
      case 'gray':
        baseTextStyle.push(styles.grayText as TextStyle);
        break;
      case 'light':
        baseTextStyle.push(styles.lightText as TextStyle);
        break;
      default:
        baseTextStyle.push(styles.primaryText as TextStyle);
    }

    if (disabled) {
      baseTextStyle.push(styles.disabledText as TextStyle);
    }

    return [baseTextStyle, textStyle].filter(Boolean) as TextStyle[];
  };

  const getVariantStyle = (): ViewStyle => {
    const primaryColor = colors.primaryDark || '#9673e9';
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: primaryColor,
          shadowColor: primaryColor,
          shadowOffset: { width: 0, height: normalize(4) },
          shadowOpacity: 0.2,
          shadowRadius: normalize(8),
          elevation: 4,
        };
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'gray':
        return styles.gray;
      case 'light':
        return styles.light;
      case 'custom':
        return {
          backgroundColor: Array.isArray(customColors)
            ? customColors[0]
            : customColors || primaryColor,
        };
      default:
        return { backgroundColor: primaryColor };
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'gray' || variant === 'light'
              ? colors.convoDark || '#1C1C1E'
              : colors.white
          }
          size="small"
        />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <Text style={getTextStyle()} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          {title}
        </Text>
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        getButtonSizeStyle(),
        getVariantStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  gradientBorderRadius: {
    borderRadius: moderateScale(8),
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginHorizontal: moderateScale(8),
  },
  small: {
    paddingVertical: moderateScale(6),
    paddingHorizontal: moderateScale(12),
    minHeight: moderateScale(32),
  },
  medium: {
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(20),
    height: moderateScale(48),
  },
  large: {
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(24),
    height: moderateScale(56),
  },
  secondary: {
    backgroundColor: '#d369ab', // Matches exact legacy colors.secondary hex
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gray: {
    backgroundColor: colors.convoGray || '#3a3a3fff', // Matches exact legacy colors.gray hex
  },
  light: {
    backgroundColor: colors.lightGray,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: 'DMSans-SemiBold',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  iconText: {
    marginHorizontal: moderateScale(8),
    fontSize: moderateScale(15),
  },
  smallText: {
    fontSize: moderateScale(FONTS.sm),
  },
  mediumText: {
    fontSize: moderateScale(FONTS.base),
  },
  largeText: {
    fontSize: moderateScale(FONTS.lg),
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.convoDark || '#1C1C1E',
  },
  grayText: {
    color: colors.convoDark || '#1C1C1E',
  },
  lightText: {
    color: colors.darkGray || '#48484A',
  },
  disabledText: {
    color: colors.darkGray || '#48484A',
  },
});

export default CustomButton;
