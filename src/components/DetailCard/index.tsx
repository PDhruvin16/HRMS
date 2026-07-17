// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, ViewStyle, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { ChevronRight, MoreVertical } from 'lucide-react-native';
import { Typography } from '../Typography';
import colors from '../../theme/color';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { normalize } from '../../utils/responsive';

export interface DetailCardProps {
  title: string;
  subtitle?: string;
  value?: string;
  badge?: {
    text: string;
    color: string;
    backgroundColor: string;
  };
  icon?: React.ReactNode;
  gradient?: string[];
  onPress?: () => void;
  onEdit?: () => void;
  onMenuPress?: (event: import('react-native').GestureResponderEvent) => void;
  children?: React.ReactNode;
  style?: ViewStyle;
  disableSeparator?: boolean;
  animationDelay?: number;
}

const DetailCard: React.FC<DetailCardProps> = ({
  title,
  subtitle,
  value,
  badge,
  icon,
  gradient,
  onPress,
  onEdit,
  onMenuPress,
  children,
  style,
  disableSeparator = false,
  animationDelay = 0,
}) => {
  const theme = 'light';
  const themeColors = colors;

  // Animation values
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(normalize(30));

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
    };
  });

  // CRITICAL FIX: Only run the entry animation ONCE on first mount.
  // Previously this ran every time animationDelay changed (i.e., on every
  // list update during search), queuing 3 Reanimated worklets per card
  // simultaneously and exhausting Fabric's mach_vm_allocate_kernel pool.
  const hasMounted = useRef(false);
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;
    opacity.value = withDelay(animationDelay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(animationDelay, withSpring(0, { damping: 20, stiffness: 90 }));
    scale.value = withDelay(animationDelay, withSpring(1, { damping: 20, stiffness: 90 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePressIn = () => {
    if (!onPress) return;
    ReactNativeHapticFeedback.trigger('impactLight', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    if (!onPress) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  // Shadow style based on theme
  const shadowStyle = {
    shadowColor: themeColors.shadowStrong || '#000',
    shadowOffset: { width: 0, height: normalize(4) },
    shadowOpacity: theme === 'light' ? 0.08 : 0.3,
    shadowRadius: normalize(12),
    // elevation: 4,
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        disabled={!onPress}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: themeColors.white,
              borderColor: themeColors.border,
            },
            shadowStyle,
            style,
          ]}
        >
          <View style={styles.cardContent}>
            {/* Modern Icon Section */}
            {icon && (
              <View style={styles.iconSection}>
                <View
                  style={[
                    styles.iconWrapper,
                    {
                      backgroundColor: gradient
                        ? gradient[0] + '15'
                        : themeColors.lightGrayBackground,
                    },
                  ]}
                >
                  {icon}
                  {gradient && <View style={[styles.glowRing, { backgroundColor: gradient[0] }]} />}
                </View>
              </View>
            )}

            {/* Main Content */}
            <View style={styles.mainContent}>
              <View style={styles.topRow}>
                <Typography
                  variant="h6"
                  weight="800"
                  numberOfLines={1}
                  style={[styles.title, styles.textContainer, { color: themeColors.dark }]}
                >
                  {title}
                </Typography>
                <View style={styles.topRightActions}>
                  {value && (
                    <Typography
                      variant="subtitle1"
                      weight="900"
                      style={[styles.valueText, { color: themeColors.primary }]}
                    >
                      {value}
                    </Typography>
                  )}
                  {onMenuPress && (
                    <TouchableOpacity
                      onPress={onMenuPress}
                      style={styles.menuHandle}
                      activeOpacity={0.7}
                    >
                      <MoreVertical size={normalize(18)} color={themeColors.gray} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.bottomRow}>
                {subtitle && (
                  <Typography
                    variant="body2"
                    weight="500"
                    numberOfLines={1}
                    style={[styles.textContainer, styles.subtitle, { color: themeColors.gray }]}
                  >
                    {subtitle}
                  </Typography>
                )}
                {badge && (
                  <View
                    style={[styles.statusBadge, { backgroundColor: badge.backgroundColor + '15' }]}
                  >
                    <Typography
                      variant="caption"
                      weight="900"
                      style={[styles.badgeText, { color: badge.color }]}
                    >
                      {badge.text}
                    </Typography>
                  </View>
                )}
              </View>

              {children && (
                <View
                  style={[
                    styles.childrenContainer,
                    !disableSeparator && styles.separator,
                    !disableSeparator && { borderTopColor: themeColors.border },
                  ]}
                >
                  {children}
                </View>
              )}
            </View>

            {(onPress || onEdit) && (
              <View style={styles.chevron}>
                {onEdit ? (
                  <TouchableOpacity
                    onPress={onEdit}
                    style={[styles.chevronWrapper, { backgroundColor: themeColors.primary + '15' }]}
                  >
                    <ChevronRight
                      size={normalize(14)}
                      color={themeColors.primary}
                      strokeWidth={4}
                    />
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[
                      styles.chevronWrapper,
                      { backgroundColor: themeColors.lightGrayBackground },
                    ]}
                  >
                    <ChevronRight size={normalize(14)} color={themeColors.gray} strokeWidth={4} />
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: normalize(24),
    marginHorizontal: normalize(16),
    marginVertical: normalize(8),
    borderWidth: 1,
    // Remove static elevation/shadow props to let Animated handle it cleanly or use the dynamic style
  },
  cardContent: {
    flexDirection: 'row',
    padding: normalize(16),
    paddingLeft: normalize(20),
    alignItems: 'center',
  },
  iconSection: {
    marginRight: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: normalize(52),
    height: normalize(52),
    borderRadius: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  glowRing: {
    position: 'absolute',
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    transform: [{ scale: 1.6 }],
    zIndex: 1,
    opacity: 0.08,
  },
  mainContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(2),
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  menuHandle: {
    padding: normalize(8),
    marginRight: normalize(-8),
    marginTop: normalize(-4),
  },
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    letterSpacing: -0.6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(4),
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(10),
  },
  statusDot: {
    width: normalize(5),
    height: normalize(5),
    borderRadius: normalize(2.5),
    marginRight: normalize(6),
  },
  childrenContainer: {
    marginTop: normalize(12),
    paddingTop: normalize(10),
  },
  separator: {
    borderTopWidth: 1,
  },
  chevron: {
    marginLeft: normalize(8),
  },
  chevronWrapper: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: normalize(8),
  },
  valueText: {
    letterSpacing: -0.5,
  },
  badgeText: {
    fontSize: normalize(8),
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  subtitle: {
    opacity: 0.7,
  },
});

export default React.memo(DetailCard);
