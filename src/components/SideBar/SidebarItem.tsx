// @ts-nocheck
// @ts-nocheck
import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Typography } from '../Typography';
import { normalize, moderateScale } from '../../utils/responsive';
import { colors } from '../../theme/color';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface SidebarItemProps {
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  isExpanded: boolean;
  onPress: () => void;
  themeColors?: typeof colors;
  iconColor?: string;
  badge?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon: Icon,
  isActive,
  isExpanded,
  onPress,
  iconColor,
  badge,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const paddingMax = normalize(16);
  // Dock width is 68. IconBox is 36. Math: (68 - 36) / 2 = 16 for perfect centering.
  const paddingMin = normalize(16);

  const containerAnim = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      paddingHorizontal: withTiming(isExpanded ? paddingMax : paddingMin, { duration: 250 }),
    };
  });

  const activeIndicatorAnim = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isActive ? 1 : 0, { duration: 250 }),
      transform: [{ scaleY: withTiming(isActive ? 1 : 0.4, { duration: 250 }) }],
    };
  });

  const labelAnim = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isExpanded ? 1 : 0, { duration: 200 }),
    };
  });

  const iconBgAnim = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(isActive ? 'transparent' : 'transparent', { duration: 250 }),
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.container, containerAnim]}>
        {/* Vertical Active Line Indicator from Screenshot */}
        <Animated.View style={[styles.activeIndicator, activeIndicatorAnim]} />

        <Animated.View style={[styles.iconBox, iconBgAnim]}>
          <Icon
            size={normalize(20)}
            color={isActive ? colors.primary : iconColor || colors.text.secondary}
            strokeWidth={isActive ? 2.5 : 2}
          />
        </Animated.View>

        <Animated.View style={[styles.labelContainer, labelAnim]}>
          <Typography
            variant="body2"
            style={[
              styles.label,
              isActive ? styles.labelActiveProps : styles.labelInactiveProps,
              isActive ? styles.labelActive : styles.labelInactive,
            ]}
            numberOfLines={1}
          >
            {label}
          </Typography>
        </Animated.View>

        {/* Fabric-safe: keep badge view mounted, only change height/opacity. */}
        <View
          style={[
            styles.badgeWrapper,
            isExpanded && badge ? styles.badgeWrapperVisible : styles.badgeWrapperHidden,
          ]}
        >
          <View style={styles.badge}>
            <Typography style={styles.badgeText}>{badge ?? ''}</Typography>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = (() => {
  const themeColors = colors;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: normalize(12),
      marginVertical: normalize(4),
      backgroundColor: 'transparent',
      width: '100%',
    },
    activeIndicator: {
      position: 'absolute',
      left: 0,
      top: '20%',
      bottom: '20%',
      width: normalize(5),
      borderTopRightRadius: normalize(5),
      borderBottomRightRadius: normalize(5),
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 6,
      elevation: 6,
      zIndex: 10,
      backgroundColor: themeColors.primary,
      shadowColor: themeColors.primary,
    },
    iconBox: {
      width: moderateScale(32),
      height: moderateScale(32),
      alignItems: 'center',
      justifyContent: 'center',
    },
    labelContainer: {
      flex: 1,
      overflow: 'hidden',
    },

    label: {
      fontSize: normalize(13.5),
      fontWeight: '500',
    },
    labelActiveProps: {
      color: themeColors.primary,
    },
    labelInactiveProps: {
      color: themeColors.text.primary,
    },
    labelActive: {
      fontWeight: '700',
    },
    labelInactive: {
      opacity: 0.7,
    },
    badge: {
      paddingHorizontal: normalize(6),
      paddingVertical: normalize(2),
      borderRadius: normalize(6),
      borderWidth: 1,
      borderColor: themeColors.white15,
      backgroundColor: themeColors.white05,
    },
    badgeWrapper: {
      overflow: 'hidden',
      justifyContent: 'center',
    },
    badgeWrapperVisible: {
      height: normalize(22),
      opacity: 1,
    },
    badgeWrapperHidden: {
      height: 0,
      opacity: 0,
    },
    badgeText: {
      fontSize: normalize(9),
      color: themeColors.white60,
      fontWeight: '700',
    },
  });
})();

export default SidebarItem;
