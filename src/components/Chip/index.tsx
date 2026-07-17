// @ts-nocheck
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { Typography } from '../Typography';
import colors from '../../theme/color';
import { normalize } from '../../utils/responsive';

export interface ChipProps {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  selected?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  variant?: 'outline' | 'filled';
}

const Chip: React.FC<ChipProps> = ({
  label,
  onPress,
  icon,
  selected = false,
  style,
  labelStyle,
  variant = 'outline',
}) => {
  const themeColors = colors;

  const isFilled = variant === 'filled' || selected;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        variant === 'outline' && { borderColor: themeColors.border },
        variant === 'outline' && styles.outline,
        isFilled && { backgroundColor: themeColors.dark },
        selected && { borderColor: themeColors.dark },
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Typography
          variant="caption"
          weight="600"
          style={[
            styles.label,
            { color: isFilled ? themeColors.white : themeColors.gray },
            selected && { color: themeColors.white },
            labelStyle,
          ]}
        >
          {label}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(20),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  outline: {
    borderWidth: 1.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: normalize(6),
  },
  label: {
    fontSize: normalize(12),
  },
});

export default Chip;
