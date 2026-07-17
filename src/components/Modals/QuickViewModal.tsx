// @ts-nocheck
// @ts-nocheck
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Edit2, Trash2, ExternalLink } from 'lucide-react-native';
import { Typography } from '../Typography';
import colors from '../../theme/color';

import AppBottomSheet from '../BottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { normalize } from '../../utils/responsive';
import { getBottomTabBarHeight, getDesiredBottomGap } from '../../utils/layout';

interface QuickViewData {
  icon?: React.ReactNode;
  title?: string | number;
  subtitle?: string | number;
  value?: string | number;
  [key: string]: unknown;
}

interface QuickViewModalProps {
  visible: boolean;
  onClose: () => void;
  data: QuickViewData | null;
  onEdit?: () => void;
  editLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
  onView?: () => void;
  viewLabel?: string;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  visible,
  onClose,
  data,
  onEdit,
  editLabel = 'Edit',
  onDelete,
  deleteLabel = 'Delete',
  onView,
  viewLabel = 'View Details',
}) => {
  const themeColors = colors;
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  return (
    <AppBottomSheet
      bottomSheetRef={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={['50%']}
      onClose={onClose}
      title="Quick Actions"
    >
      <View style={styles.modalInner}>
        {/* Content Preview */}
        <View style={styles.contentPreview}>
          <View style={styles.previewHeader}>
            {data?.icon && <View style={styles.iconWrapper}>{data.icon}</View>}
            <View style={styles.flexOne}>
              <Typography variant="subtitle1" weight="800" style={styles.titleText}>
                {data?.title}
              </Typography>
              <Typography variant="caption" style={{ color: themeColors.gray }}>
                {data?.subtitle}
              </Typography>
            </View>
          </View>

          {data?.value && (
            <View style={styles.metricRow}>
              <Typography variant="body2" style={styles.grayText}>
                Value / Status
              </Typography>
              <Typography variant="h5" weight="900" style={styles.primaryText}>
                {data?.value}
              </Typography>
            </View>
          )}
        </View>

        {/* Actions Grid */}
        <View style={styles.actionsGrid}>
          {onView && (
            <TouchableOpacity
              onPress={onView}
              style={[
                styles.actionButton,
                styles.primaryAction,
                { backgroundColor: themeColors.primary, shadowColor: themeColors.primary },
              ]}
            >
              <ExternalLink size={20} color={themeColors.white} />
              <Typography variant="button" weight="700" style={{ color: themeColors.white }}>
                {viewLabel}
              </Typography>
            </TouchableOpacity>
          )}

          <View style={styles.rowActions}>
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                style={[
                  styles.actionButton,
                  styles.secondaryAction,
                  { backgroundColor: themeColors.lightGrayBackground },
                ]}
              >
                <Edit2 size={18} color={themeColors.dark} />
                <Typography variant="button" weight="600" style={{ color: themeColors.dark }}>
                  {editLabel}
                </Typography>
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                style={[
                  styles.actionButton,
                  styles.dangerAction,
                  { backgroundColor: themeColors.error15 },
                ]}
              >
                <Trash2 size={18} color={themeColors.error} />
                <Typography variant="button" weight="600" style={{ color: themeColors.error }}>
                  {deleteLabel}
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <View style={{ height: getBottomTabBarHeight(insets.bottom) + getDesiredBottomGap() }} />
    </AppBottomSheet>
  );
};

const styles = (() => {
  const themeColors = colors;
  return StyleSheet.create({
    modalInner: {
      padding: normalize(16),
      paddingBottom: normalize(20),
    },
    contentPreview: {
      padding: 16,
      borderRadius: 16,
      marginBottom: 20,
      backgroundColor: themeColors.lightGrayBackground,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    iconWrapper: {
      padding: 10,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: themeColors.white,
    },
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: themeColors.dividerGray,
    },
    actionsGrid: {
      gap: 12,
    },
    rowActions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 16,
      gap: 8,
    },
    primaryAction: {
      width: '100%',
      marginBottom: 4,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    secondaryAction: {
      flex: 1,
    },
    dangerAction: {
      flex: 1,
    },
    footer: {
      marginTop: 20,
    },
    flexOne: {
      flex: 1,
    },
    footerText: {
      textAlign: 'center',
      color: themeColors.gray,
      opacity: 0.6,
    },
    titleText: {
      color: themeColors.dark,
    },
    grayText: {
      color: themeColors.gray,
    },
    primaryText: {
      color: themeColors.primary,
    },
  });
})();

export default QuickViewModal;
