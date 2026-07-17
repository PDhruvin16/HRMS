// @ts-nocheck
// @ts-nocheck
import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Eye, Edit2, Trash2, LucideIcon } from 'lucide-react-native';
import { Typography } from '../Typography';
import colors from '../../theme/color';
import { normalize } from '../../utils/responsive';

const { width } = Dimensions.get('window');

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  items?: Array<{
    id: string;
    label: string;
    icon: LucideIcon;
    onPress: () => void;
    color?: string;
    backgroundColor?: string;
  }>;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  visible,
  onClose,
  position = { x: width - normalize(100), y: normalize(100) },
  onView,
  onEdit,
  onDelete,
  viewLabel = 'View',
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  items,
}) => {
  const themeColors = colors;

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(normalize(-10));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const menuStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 250 });
      scale.value = withSpring(1, { damping: 12, stiffness: 120 });
      translateY.value = withSpring(0, { damping: 12, stiffness: 120 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.8, { duration: 150 });
      translateY.value = withTiming(normalize(-10), { duration: 150 });
    }
  }, [visible, opacity, scale, translateY]);

  const handleActionPress = (action: () => void) => {
    action();
    onClose();
  };

  const menuItems =
    items ||
    [
      {
        id: 'view',
        label: viewLabel,
        icon: Eye,
        onPress: onView,
        color: themeColors.info,
        backgroundColor: themeColors.homeMetricIconBg15,
      },
      {
        id: 'edit',
        label: editLabel,
        icon: Edit2,
        onPress: onEdit,
        color: themeColors.primary,
        backgroundColor: themeColors.profileSettingIconBg15,
      },
      {
        id: 'delete',
        label: deleteLabel,
        icon: Trash2,
        onPress: onDelete,
        color: themeColors.error,
        backgroundColor: themeColors.errorBackground,
      },
    ].filter((item) => item.onPress);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.menuContainer,
            {
              top: position.y,
              right: position.x,
            },
            menuStyle,
          ]}
        >
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            const isLast = index === menuItems.length - 1;

            return (
              <Pressable
                key={item.id}
                onPress={() => handleActionPress(item.onPress!)}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    backgroundColor: pressed ? item.backgroundColor : 'transparent',
                    borderBottomWidth: isLast ? 0 : 1,
                  },
                ]}
              >
                <IconComponent size={normalize(22)} color={item.color} />
                <Typography
                  variant="body2"
                  weight="600"
                  style={[styles.menuItemText, { color: item.color }]}
                >
                  {item.label}
                </Typography>
              </Pressable>
            );
          })}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = (() => {
  const themeColors = colors;
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: themeColors.black40,
    },
    menuContainer: {
      position: 'absolute',
      minWidth: normalize(180),
      borderRadius: normalize(20), // More rounded per image
      backgroundColor: themeColors.white,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: normalize(10) },
      shadowOpacity: 0.1,
      shadowRadius: normalize(20),
      elevation: 10,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: normalize(20),
      paddingVertical: normalize(16),
      borderBottomColor: 'rgba(0,0,0,0.03)',
    },
    menuItemText: {
      marginLeft: normalize(16),
      fontSize: normalize(15),
    },
  });
})();

export default ActionMenu;
