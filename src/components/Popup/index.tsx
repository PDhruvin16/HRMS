// @ts-nocheck
// @ts-nocheck
import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Typography } from '../Typography';
import CustomButton from '../Button';
import { colors } from '../../theme/color';
import spacing from '../../theme/spacing';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ANIMATION = {
  fadeDuration: 200,
  scale: {
    tension: 50,
    friction: 7,
  },
  initialScale: 0.9,
};

const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION.fadeDuration,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: ANIMATION.scale.tension,
          friction: ANIMATION.scale.friction,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(ANIMATION.initialScale);
    }
  }, [isOpen, fadeAnim, scaleAnim]);

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity style={styles.backdropTouchable} activeOpacity={1} onPress={onClose} />
        </Animated.View>

        <View style={styles.popupContainer}>
          <Animated.View
            style={[
              styles.popup,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.content}>
              <Typography variant="h2" style={styles.title}>
                {title}
              </Typography>

              {message && (
                <Typography variant="body1" style={styles.message}>
                  {message}
                </Typography>
              )}

              <View style={styles.buttonContainer}>
                {cancelLabel && (
                  <View style={styles.buttonWrapper}>
                    <CustomButton
                      title={cancelLabel}
                      onPress={handleCancel}
                      variant="outline"
                      style={styles.cancelButton}
                      textStyle={styles.cancelButtonText}
                    />
                  </View>
                )}
                <View style={[styles.buttonWrapper, !cancelLabel && styles.buttonWrapperFull]}>
                  <CustomButton
                    title={confirmLabel}
                    onPress={handleConfirm}
                    variant="primary"
                    style={styles.confirmButton}
                  />
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.modalOverlay,
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  popupContainer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popup: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadowColor || colors.shadow || '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.basecolor,
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.text.secondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
  buttonWrapperFull: {
    flex: 1,
    width: '100%',
  },
  cancelButton: {
    minHeight: 44,
  },
  cancelButtonText: {
    color: colors.basecolor,
  },
  confirmButton: {
    minHeight: 44,
  },
});

export default Popup;
