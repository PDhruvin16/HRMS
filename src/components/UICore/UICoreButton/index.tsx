// @ts-nocheck
import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Typography } from '../../Typography';
import { normalize } from '../../../utils/responsive';
import { triggerHaptic } from '../../../utils/haptic';
import colors from '../../../theme/color';

export interface UICoreButtonProps extends TouchableOpacityProps {
  title: string;
  primary?: boolean;
  loading?: boolean;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
}

export const UICoreButton: React.FC<UICoreButtonProps> = ({
  title,
  primary = false,
  loading = false,
  disabled,
  containerStyle,
  textStyle,
  leftIcon,
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const backgroundColor = primary ? colors.basecolor : colors.white;
  const borderColor = primary ? 'transparent' : colors.border;
  const borderWidth = primary ? 0 : 1;
  const textColor = primary ? colors.white : colors.basecolor;

  const handlePress = (e: import('react-native').GestureResponderEvent) => {
    triggerHaptic();
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth,
        },
        isDisabled && styles.disabled,
        containerStyle,
      ]}
      onPress={handlePress}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {leftIcon && <React.Fragment>{leftIcon}</React.Fragment>}
          <Typography
            variant="body1"
            weight="600"
            style={[
              { color: textColor },
              leftIcon ? { marginLeft: normalize(8) } : null,
              textStyle,
            ]}
          >
            {title}
          </Typography>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: normalize(56),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default UICoreButton;
