// @ts-nocheck
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, ChevronLeft, Search } from 'lucide-react-native';
import colors from '../../theme/color';
import { normalize } from '../../utils/responsive';
import { Typography } from '../Typography';
import { BlurView } from 'expo-blur';

interface HeaderVariant {
  type: 'home' | 'basic';
  title?: string;
  subtitle?: string;
  location?: string;
  showProfile?: boolean;
  profileImage?: string;
  showSearch?: boolean;
  initials?: string;
  showOnlineStatus?: boolean;
}

export interface CustomHeaderProps {
  variant: HeaderVariant;
  onSearch?: () => void;
  onAdd?: () => void;
  onSettings?: () => void;
  onBack?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  notificationCount?: number;
  bottomContent?: React.ReactNode;
  onMenuPress?: () => void;
  rightElement?: React.ReactNode;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  variant: variantProp,
  onNotificationPress,
  onProfilePress,
  notificationCount,
  bottomContent,
  onBack,
  onSearch,
  rightElement,
}) => {
  const themeColors = colors;
  const variant = variantProp ?? { type: 'basic' as const, title: 'Title' };

  // 2026 Sleek Entrance Animation
  const scale = useSharedValue(0.98);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withSpring(1, { damping: 25, stiffness: 120 });
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const renderHomeHeader = () => (
    <View style={styles.homeContainer}>
      <View style={styles.leftGroup}>
        {variant.showProfile && (
          <TouchableOpacity
            onPress={onProfilePress}
            style={[styles.avatarWrapper, variant.initials && styles.miniAvatarWrapper]}
          >
            {variant.initials ? (
              <View style={styles.miniTextAvatar}>
                <Typography variant="body2" weight="800" style={styles.miniAvatarText}>
                  {variant.initials}
                </Typography>
                {variant.showOnlineStatus && <View style={styles.miniOnlineStatus} />}
              </View>
            ) : (
              <Image
                source={{
                  uri:
                    variant.profileImage ||
                    'https://ui-avatars.com/api/?name=User&background=4F46E5&color=fff',
                }}
                style={styles.miniAvatar}
              />
            )}
          </TouchableOpacity>
        )}
        <View style={styles.textStack}>
          <Text style={styles.greetingText}>{variant.subtitle || 'Welcome,'}</Text>
          <Text style={styles.nameText}>{variant.title || 'User'}</Text>
        </View>
      </View>
      <View style={styles.rightGroup}>
        {variant.location && (
          <View style={styles.roleBadge}>
            <Typography style={styles.roleBadgeText}>{variant.location}</Typography>
          </View>
        )}
        {onSearch && (
          <TouchableOpacity onPress={onSearch} style={styles.iconButton}>
            <Search size={normalize(20)} color={themeColors.black} />
          </TouchableOpacity>
        )}
        {onNotificationPress && (
          <TouchableOpacity onPress={onNotificationPress} style={styles.notificationIcon}>
            <Bell size={normalize(20)} color={themeColors.black} />
            {notificationCount && notificationCount > 0 && <View style={styles.spotIndicator} />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderBasicHeader = () => (
    <View style={styles.basicContainer}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={normalize(22)} color={themeColors.black} />
        </TouchableOpacity>
      ) : null}
      <View style={styles.basicTextStack}>
        <Text style={styles.basicTitleText}>{variant.title || 'Title'}</Text>
        {variant.subtitle && (
          <Text style={styles.basicSubtitleText}>{variant.subtitle}</Text>
        )}
      </View>
    </View>
  );

  const content = variant.type === 'home' ? renderHomeHeader() : renderBasicHeader();

  return (
    <BlurView intensity={80} tint="light" style={styles.safeHeader}>
      <SafeAreaView edges={['top']}>
        <Animated.View style={[styles.headerContainer, animatedStyle]}>
        <View style={styles.innerContent}>
          {content}
          {variant.type !== 'home' && (
            <View style={styles.actions}>
              {rightElement ? (
                rightElement
              ) : (
                <>
                  {onSearch && (
                    <TouchableOpacity onPress={onSearch} style={styles.iconButton}>
                      <Search size={normalize(20)} color={themeColors.black} />
                    </TouchableOpacity>
                  )}
                  {onNotificationPress && (
                    <TouchableOpacity onPress={onNotificationPress} style={styles.notificationIcon}>
                      <Bell size={normalize(20)} color={themeColors.black} />
                      {notificationCount && notificationCount > 0 && (
                        <View style={styles.spotIndicator} />
                      )}
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}
        </View>
        {bottomContent && <View style={styles.bottomArea}>{bottomContent}</View>}
      </Animated.View>
      </SafeAreaView>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  safeHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
  },
  headerContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(16),
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
  },
  textStack: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: normalize(12),
    color: colors.text.secondary,
    fontWeight: '500',
  },
  nameText: {
    fontSize: normalize(18),
    fontWeight: '800',
    color: colors.black,
    marginTop: normalize(1),
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(8),
  },
  roleBadgeText: {
    color: colors.primary,
    fontSize: normalize(9),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  avatarWrapper: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: normalize(16),
    padding: normalize(1),
    backgroundColor: colors.background,
  },
  miniAvatar: {
    width: normalize(30),
    height: normalize(30),
    borderRadius: normalize(15),
  },
  miniAvatarWrapper: {
    borderRadius: normalize(16),
    padding: 0,
  },
  miniTextAvatar: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  miniAvatarText: {
    color: colors.white,
    fontSize: normalize(13),
    fontWeight: '700',
  },
  miniOnlineStatus: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
    borderWidth: 1.5,
    borderColor: colors.surface,
    backgroundColor: colors.success,
  },
  iconButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  notificationIcon: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  spotIndicator: {
    position: 'absolute',
    top: normalize(8),
    right: normalize(8),
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  basicContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  basicTextStack: {
    justifyContent: 'center',
  },
  basicTitleText: {
    fontSize: normalize(18),
    fontWeight: '800',
    color: colors.black,
  },
  basicSubtitleText: {
    fontSize: normalize(12),
    color: colors.text.secondary,
    marginTop: normalize(2),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  bottomArea: {
    marginTop: normalize(12),
  },
});

export default CustomHeader;
