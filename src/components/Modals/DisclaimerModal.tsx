// @ts-nocheck
// @ts-nocheck
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { X, AlertCircle } from 'lucide-react-native';
import { Typography } from '../Typography';
import { colors } from '../../theme/color';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');

interface DisclaimerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  _title = 'Disclaimer',
  message,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  isLoading = false,
}) => {
  // Note: Standardizing to use color.ts as per user request
  const themeColors = colors;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.rootContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View
            style={[
              styles.backdrop,
              {
                backgroundColor: 'rgba(0,0,0,0.5)',
              },
            ]}
          />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: themeColors.white,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Typography variant="h4" weight="900" style={styles.headerTitle}>
              Disclaimer
            </Typography>
            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
              <X size={20} color={themeColors.slate400} />
            </TouchableOpacity>
          </View>

          {/* Content Body with Left Icon */}
          <View style={styles.contentRow}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <AlertCircle size={24} color={themeColors.errorRed} />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Typography
                variant="body1"
                weight="800"
                style={[styles.issueText, { color: themeColors.darkText }]}
              >
                {message?.includes(':')
                  ? `IDENTIFIED ISSUE: ${message.split(':').slice(1).join(':').trim()}`
                  : `IDENTIFIED ISSUE: ${message || 'suspicious placeholder content'}`}
              </Typography>
            </View>
          </View>

          {/* Action Buttons (Bottom Right) */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isLoading}
              style={[styles.btn, styles.yesBtn, { borderColor: themeColors.darkText }]}
            >
              <Typography weight="700" style={{ color: themeColors.darkText }}>
                {confirmLabel}
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={[styles.btn, styles.noBtn]}>
              <Typography weight="700" style={styles.noBtnText}>
                {cancelLabel}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { backgroundColor: 'rgba(0,0,0,0.5)' },
  rootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: SCREEN_WIDTH - 32,
    maxWidth: 500,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.errorLight,
    ...Platform.select({
      ios: {
        shadowColor: colors.errorRed,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: colors.errorRed,
  },
  closeIcon: {
    padding: 4,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  iconContainer: {
    width: 44,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.errorVeryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.errorLight,
  },
  textContainer: {
    flex: 1,
  },
  issueText: {
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
  },
  mainMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  footerMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btn: {
    paddingHorizontal: 28,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  yesBtn: {
    borderWidth: 1,
  },
  noBtn: {
    backgroundColor: colors.slate800,
  },
  noBtnText: {
    color: colors.white,
  },
});

export default DisclaimerModal;
