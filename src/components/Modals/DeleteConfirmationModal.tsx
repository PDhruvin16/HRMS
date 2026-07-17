// @ts-nocheck
// @ts-nocheck
import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { X, AlertCircle } from 'lucide-react-native';
import { Typography } from '../Typography';
import Colors from '../../theme/color';
import Button from '../Button';

const { width } = Dimensions.get('window');

interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title = 'Delete Contact',
  message = 'On deleting this contact, all related conversations will be deleted. Are you sure you want to permanently delete this contact?',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isLoading = false,
  icon,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
    }
  }, [visible, opacity, scale]);

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                backgroundColor: Colors.modalOverlay,
              },
              backdropStyle,
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: Colors.white,
              borderColor: Colors.border,
            },
            modalStyle,
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: Colors.lightGrayBackground }]}
          >
            <X size={20} color={Colors.dark} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconWrapper, { backgroundColor: Colors.error15 }]}>
              {icon ? icon : <AlertCircle size={40} color={Colors.error} />}
            </View>
          </View>

          {/* Title */}
          <Typography variant="h5" weight="800" style={[styles.title, { color: Colors.dark }]}>
            {title}
          </Typography>

          {/* Message */}
          <Typography variant="body2" style={[styles.message, { color: Colors.text.gray }]}>
            {message}
          </Typography>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title={cancelLabel}
              variant="outline"
              onPress={onClose}
              disabled={isLoading}
              style={[
                styles.button,
                {
                  borderColor: Colors.border,
                },
              ]}
            />
            <Button
              title={confirmLabel}
              variant="primary"
              onPress={onConfirm}
              loading={isLoading}
              style={[styles.button, { backgroundColor: Colors.error }]}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: width - 40,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    zIndex: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  iconContainer: {
    marginTop: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default DeleteConfirmationModal;
