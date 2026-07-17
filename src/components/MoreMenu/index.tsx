// @ts-nocheck
// @ts-nocheck
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  MessageSquare,
  Megaphone,
  BookOpen,
  Settings,
  Box,
  Briefcase,
  User,
  Share2,
  Gamepad2,
} from 'lucide-react-native';
import colors from '../../theme/color';
import { Typography } from '../Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { normalize, moderateScale } from '../../utils/responsive';
import AppBottomSheet from '../BottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBottomTabBarHeight, getDesiredBottomGap } from '../../utils/layout';

// const { height: SCREEN_HEIGHT } = Dimensions.get('screen'); // Removed unused variable

interface MoreMenuModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (utility: string) => void;
  activeUtility: string;
}

export const UTILITIES = (themeColors: typeof colors) => {
  return [
    {
      id: 'Conversations',
      label: 'Conversations',
      icon: MessageSquare,
      color: themeColors.secondary,
    },
    { id: 'Campaign', label: 'Campaign', icon: Megaphone, color: themeColors.iconOrange },
    { id: 'KnowledgeBase', label: 'Knowledge Base', icon: BookOpen, color: themeColors.info },
    { id: 'Product', label: 'Product / Service', icon: Box, color: themeColors.primary },
    { id: 'Profile', label: 'Settings', icon: Settings, color: themeColors.error },
    { id: 'Templates', label: 'Templates', icon: BookOpen, color: themeColors.secondary },
    { id: 'Integration', label: 'Integration', icon: Briefcase, color: themeColors.info },
    { id: 'Agent', label: 'Agent', icon: User, color: themeColors.primary },
    { id: 'AssetsSharing', label: 'Assets & Sharing', icon: Share2, color: themeColors.info },
    { id: 'Playground', label: 'Playground', icon: Gamepad2, color: themeColors.primary },
  ];
};

const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isVisible,
  onClose,
  onSelect,
  activeUtility,
}) => {
  const insets = useSafeAreaInsets();
  const themeColors = colors;
  const utilities = UTILITIES(themeColors);
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  // Fixed pixel value — percentage snap points fail in v5 outside navigation screen context
  // snapPoints defined directly in the component prop to avoid unused variable warning

  return (
    <AppBottomSheet
      bottomSheetRef={bottomSheetRef}
      visible={isVisible}
      snapPoints={[normalize(540)]}
      onClose={onClose}
      title="Explore Services"
    >
      <View style={styles.grid}>
        {utilities
          .filter((item) => item.id !== activeUtility)
          .map((item, index) => {
            const isActive = activeUtility === item.id;

            return (
              <View key={item.id} style={styles.gridItem}>
                <Animated.View
                  entering={FadeInDown.delay(200 + index * 50).duration(500)}
                  style={styles.centered}
                >
                  <TouchableOpacity
                    onPress={() => {
                      // Trigger connection refresh or just perform navigation
                      // In a real production app, the socket is already managed globally
                      onSelect(item.id);
                      onClose();
                    }}
                    activeOpacity={0.7}
                    style={styles.centered}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: item.color + '12' }, // Soft theme-aware background
                        isActive && styles.activeIconBox,
                      ]}
                    >
                      <item.icon size={26} color={isActive ? themeColors.white : item.color} />
                    </View>
                    <Typography
                      variant="caption"
                      numberOfLines={1}
                      style={[
                        styles.label,
                        isActive ? styles.activeLabelText : styles.inactiveLabelText,
                      ]}
                    >
                      {item.label}
                    </Typography>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            );
          })}
      </View>

      {/* User Experience Tip */}
      <View style={styles.tipWrapper}>
        <LinearGradient
          colors={[themeColors.primary12, themeColors.primary05]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.tipGradient}
        >
          <View style={styles.tipBox}>
            <Typography
              style={styles.tipText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              Active service will be pinned to your main tab bar.
            </Typography>
          </View>
        </LinearGradient>
      </View>
      <View style={{ height: getBottomTabBarHeight(insets.bottom) + getDesiredBottomGap() }} />
    </AppBottomSheet>
  );
};

const styles = (() => {
  const themeColors = colors;
  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: normalize(8),
      justifyContent: 'flex-start',
      marginBottom: normalize(12),
    },
    gridItem: {
      width: '33.33%',
      alignItems: 'center',
      marginBottom: normalize(16),
      paddingHorizontal: normalize(4),
    },
    centered: {
      width: '100%',
      alignItems: 'center',
    },
    iconBox: {
      width: moderateScale(50),
      height: moderateScale(50),
      borderRadius: moderateScale(16),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: moderateScale(8),
    },
    activeIconBox: {
      backgroundColor: themeColors.primary,
      shadowColor: themeColors.primary,
      shadowOffset: { width: 0, height: moderateScale(4) },
      shadowOpacity: 0.3,
      shadowRadius: moderateScale(8),
      elevation: 5,
    },
    label: {
      textAlign: 'center',
      fontSize: normalize(12),
      fontWeight: '500',
      minHeight: normalize(34),
      width: '100%',
    },
    activeLabelText: {
      fontWeight: '800',
      color: themeColors.primary,
    },
    inactiveLabelText: {
      color: themeColors.gray,
    },
    tipWrapper: {
      marginHorizontal: normalize(20),
      borderRadius: normalize(12),
      marginTop: normalize(4),
      marginBottom: normalize(0),
      overflow: 'hidden',
    },
    tipGradient: {
      width: '100%',
    },
    tipBox: {
      padding: normalize(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    tipText: {
      fontSize: normalize(11),
      textAlign: 'center',
      fontWeight: '700',
      color: themeColors.info,
    },
  });
})();

export default MoreMenuModal;
