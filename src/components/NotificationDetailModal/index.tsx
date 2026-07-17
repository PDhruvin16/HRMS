// @ts-nocheck
// @ts-nocheck
import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { normalize } from '../../utils/responsive';
import { Typography } from '../Typography';
import Button from '../Button';
import Colors from '../../theme/color';

const { height } = Dimensions.get('window');

interface NotificationDetailModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  date: string;
  onMarkAsRead?: () => void;
  isRead?: boolean;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  visible,
  onClose,
  title,
  description,
  date,
  onMarkAsRead,
  // isRead is currently redundant due to fixed user requirements but kept for prop compatibility
}) => {
  const insets = useSafeAreaInsets();

  // Shared values for animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(height);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 250 });
      // Ultra-smooth responsive spring entry from bottom
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 120,
        mass: 0.8,
      });
    } else {
      // Smooth exit down before full unmount
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(height, { duration: 250 });
    }
  }, [visible, opacity, translateY]);

  // Internal handler to trigger exiting animation before invoking logical parent onClose
  const triggerClose = () => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(height, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  if (!visible && opacity.value === 0) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={triggerClose}>
      <View style={styles.overlay}>
        {/* Click Backdrop to Close */}
        <TouchableWithoutFeedback onPress={triggerClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>

        {/* SLIDE-UP BOTTOM CONTAINER */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              paddingBottom: Math.max(insets.bottom, normalize(20)),
            },
            modalStyle,
          ]}
        >
          {/* Figma style pull indicator handle */}
          <View style={styles.indicatorWrapper}>
            <View style={styles.handleIndicator} />
          </View>

          <View style={styles.contentPadding}>
            {/* Title */}
            <Typography variant="h5" weight="800" style={styles.title}>
              {title}
            </Typography>

            {/* Date */}
            <Typography variant="caption" style={styles.date}>
              {date}
            </Typography>

            {/* Description */}
            <Typography variant="body2" style={styles.description}>
              {description}
            </Typography>

            {/* Action Buttons Footer */}
            <View style={styles.buttonContainer}>
              {onMarkAsRead && (
                <Button
                  title="Mark as Unread"
                  variant="outline"
                  onPress={onMarkAsRead}
                  style={styles.customOutline}
                  textStyle={styles.outlineText}
                />
              )}
              <Button
                title="Close"
                variant="primary"
                onPress={triggerClose}
                style={styles.buttonFlex}
                textStyle={styles.buttonText}
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end', // Anchors to absolute bottom of device
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: Colors.darkMenuBg, // Premium layered dark-mode grey
    borderTopLeftRadius: normalize(24),
    borderTopRightRadius: normalize(24),
    borderTopWidth: 1,
    borderColor: Colors.whiteTransparent08, // Sophisticated thin dark boundary line
  },
  indicatorWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingTop: normalize(12),
    paddingBottom: normalize(8),
  },
  handleIndicator: {
    width: normalize(40),
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: Colors.whiteTransparent30, // Muted figma-styled drag handle
  },
  contentPadding: {
    paddingHorizontal: normalize(24),
    paddingBottom: normalize(8),
  },
  title: {
    color: Colors.white,
    marginTop: normalize(12),
    marginBottom: normalize(8),
    fontSize: normalize(18),
    fontWeight: '700',
  },
  date: {
    color: Colors.whiteTransparent50, // Highly muted tertiary gray
    marginBottom: normalize(16),
  },
  description: {
    color: Colors.whiteTransparent60, // Primary reading text grey
    lineHeight: normalize(22),
    marginBottom: normalize(24),
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: normalize(8),
    paddingTop: normalize(16),
    borderTopWidth: 1,
    borderTopColor: Colors.whiteTransparent10,
  },
  buttonFlex: {
    flex: 1,
  },
  customOutline: {
    flex: 1,
    backgroundColor: 'transparent',
    borderColor: Colors.whiteTransparent30,
    borderWidth: 1,
  },
  outlineText: {
    fontSize: normalize(13),
    color: Colors.white,
  },
  buttonText: {
    fontSize: normalize(13),
  },
});

export default NotificationDetailModal;
