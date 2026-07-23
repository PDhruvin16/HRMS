import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, X } from 'lucide-react-native';
import colors from '../../theme/color';
import { Typography } from '../Typography';
import { normalize } from '../../utils/responsive';

const { width: SW } = Dimensions.get('window');

export interface RejectionReasonModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  title?: string;
  description?: string;
  placeholder?: string;
  cancelLabel?: string;
  submitLabel?: string;
  isLoading?: boolean;
}

export const RejectionReasonModal: React.FC<RejectionReasonModalProps> = ({
  visible,
  onClose,
  onSubmit,
  title = 'Reject Request',
  description = 'Please enter a reason for rejecting this request. The employee will see this feedback.',
  placeholder = 'Write rejection reason here...',
  cancelLabel = 'Cancel',
  submitLabel = 'Reject Request',
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (visible) {
      setReason('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!reason.trim()) {
      Alert.alert('Required', 'Please enter a rejection reason.');
      return;
    }
    onSubmit(reason.trim());
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <BlurView intensity={30} tint="dark" style={styles.rejectionOverlay}>
        <Animated.View entering={FadeInUp.springify()} style={styles.rejectionBox}>
          {/* Header */}
          <View style={styles.rejectionHeader}>
            <View style={styles.rejectionTitleIcon}>
              <AlertCircle size={normalize(18)} color={colors.error} />
              <Typography style={styles.rejectionTitle}>{title}</Typography>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.rejectionCloseBtn}>
              <X size={normalize(16)} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Typography style={styles.rejectionDesc}>{description}</Typography>

          <TextInput
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
            placeholder={placeholder}
            placeholderTextColor="rgba(0, 0, 0, 0.35)"
            style={styles.rejectionInput}
          />

          <View style={styles.rejectionFooter}>
            <TouchableOpacity onPress={onClose} style={styles.rejectionCancelBtn} disabled={isLoading}>
              <Typography style={styles.rejectionCancelText}>{cancelLabel}</Typography>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.rejectionSubmitBtn}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.rejectionSubmitGrad}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Typography style={styles.rejectionSubmitText}>{submitLabel}</Typography>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rejectionOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)' },
  rejectionBox: { width: SW - normalize(36), backgroundColor: colors.white, borderRadius: normalize(24), padding: normalize(20), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, overflow: 'hidden' },
  rejectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(12) },
  rejectionTitleIcon: { flexDirection: 'row', alignItems: 'center', gap: normalize(8) },
  rejectionTitle: { fontSize: normalize(16), fontWeight: '800', color: colors.black },
  rejectionCloseBtn: { width: normalize(30), height: normalize(30), borderRadius: normalize(15), backgroundColor: 'rgba(0,0,0,0.04)', alignItems: 'center', justifyContent: 'center' },
  rejectionDesc: { fontSize: normalize(12), color: colors.text.secondary, fontWeight: '500', lineHeight: normalize(18), marginBottom: normalize(14) },
  rejectionInput: { backgroundColor: '#F9FAFB', borderRadius: normalize(14), padding: normalize(14), fontSize: normalize(14), color: colors.black, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.05)', fontWeight: '500', height: normalize(100), textAlignVertical: 'top', marginBottom: normalize(16) },
  rejectionFooter: { flexDirection: 'row', gap: normalize(10) },
  rejectionCancelBtn: { flex: 1, paddingVertical: normalize(12), borderRadius: normalize(14), borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  rejectionCancelText: { fontSize: normalize(13), fontWeight: '700', color: colors.text.secondary },
  rejectionSubmitBtn: { flex: 1, borderRadius: normalize(14), overflow: 'hidden' },
  rejectionSubmitGrad: { paddingVertical: normalize(12), alignItems: 'center', justifyContent: 'center' },
  rejectionSubmitText: { fontSize: normalize(13), fontWeight: '800', color: colors.white },
});

export default RejectionReasonModal;
