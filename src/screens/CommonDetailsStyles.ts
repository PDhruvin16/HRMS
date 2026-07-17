// @ts-nocheck
import { StyleSheet } from 'react-native';
import colors from '../theme/color';
import { moderateScale, normalize } from '../utils/responsive';

export const styles = (() => {
  const themeColors = colors;
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: moderateScale(16),
      paddingTop: moderateScale(16),
      paddingBottom: moderateScale(120),
    },
    card: {
      backgroundColor: themeColors.white,
      borderRadius: moderateScale(20),
      borderWidth: 1,
      borderColor: themeColors.border,
      marginBottom: moderateScale(20),
      overflow: 'hidden',
      shadowColor: themeColors.shadowStrong,
      shadowOffset: { width: 0, height: moderateScale(6) },
      shadowOpacity: 0.1,
      shadowRadius: moderateScale(12),
      elevation: 5,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: normalize(12),
      paddingTop: normalize(12),
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
    cardFooterNoBorder: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: normalize(4),
      borderTopWidth: 0,
      paddingTop: 0,
    },
    footerItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    previewBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.primary12,
      padding: normalize(8),
      borderRadius: normalize(8),
    },
    cardHeader: {
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(12),
      backgroundColor: themeColors.white,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    headerAccent: {
      width: moderateScale(3),
      height: moderateScale(14),
      borderRadius: moderateScale(2),
      backgroundColor: themeColors.primary,
      marginRight: moderateScale(8),
    },
    cardHeaderText: {
      color: themeColors.primary,
      fontSize: moderateScale(11),
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    cardBody: {
      padding: moderateScale(20),
    },
    primaryInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateScale(20),
    },
    avatarContainer: {
      width: moderateScale(64),
      height: moderateScale(64),
      borderRadius: moderateScale(22),
      backgroundColor: themeColors.primary05,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: moderateScale(16),
      borderWidth: 1,
      borderColor: themeColors.primary20,
    },
    primaryTextContent: {
      flex: 1,
    },
    statusBadge: {
      backgroundColor: themeColors.successBackground,
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(2),
      borderRadius: moderateScale(12),
    },
    statusText: {
      color: themeColors.iconGreen,
      fontSize: moderateScale(9),
      fontWeight: '800',
    },
    divider: {
      height: 1,
      backgroundColor: themeColors.border,
      marginBottom: moderateScale(12),
    },
    infoItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateScale(16),
    },
    iconWrapper: {
      width: moderateScale(36),
      height: moderateScale(36),
      borderRadius: moderateScale(12),
      backgroundColor: themeColors.lightGrayBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: moderateScale(12),
    },
    infoTextContent: {
      flex: 1,
    },
    infoLabel: {
      color: themeColors.gray,
      marginBottom: moderateScale(2),
      fontSize: moderateScale(10),
    },
    infoValue: {
      color: themeColors.dark,
      fontSize: moderateScale(13),
    },
    footerActions: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      paddingHorizontal: moderateScale(16),
      paddingTop: moderateScale(12),
      paddingBottom: moderateScale(24),
      backgroundColor: themeColors.white,
    },
    editButton: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: themeColors.primary,
      height: moderateScale(48),
      borderRadius: moderateScale(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteButton: {
      width: moderateScale(48),
      height: moderateScale(48),
      backgroundColor: themeColors.error15,
      borderRadius: moderateScale(12),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: themeColors.errorBorder,
      marginLeft: moderateScale(10),
    },
    // Common helpers
    flex1: { flex: 1 },
    centerAll: { alignItems: 'center', justifyContent: 'center' },
    whiteText: { color: themeColors.white },
    darkText: { color: themeColors.dark },
    primaryText: { color: themeColors.primary },
    grayText: { color: themeColors.gray },
    mb2: { marginBottom: moderateScale(2) },
    mb16: { marginBottom: moderateScale(16) },
    mb20: { marginBottom: moderateScale(20) },
    mb24: { marginBottom: moderateScale(24) },
    mr16: { marginRight: moderateScale(16) },
    gap4: {
      /* removed */
    },
    rowAlignCenter: { flexDirection: 'row', alignItems: 'center' },
    flexWrap: { flexWrap: 'wrap' },
    gap12: {
      /* removed */
    },
    gap16: {
      /* removed */
    },
    smallAvatarContainer: {
      width: moderateScale(36),
      height: moderateScale(36),
      borderRadius: moderateScale(18),
      marginRight: 0,
      backgroundColor: themeColors.lightGrayBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    letterSpacingNegative05: {
      letterSpacing: -0.5,
    },
    mt8: {
      marginTop: moderateScale(8),
    },
    alignStart: {
      alignItems: 'flex-start',
    },
    footerLoader: {
      marginVertical: moderateScale(20),
    },
    mt0: {
      marginTop: 0,
    },
    mb8: {
      marginBottom: moderateScale(8),
    },
    fileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: moderateScale(12),
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    fileInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    fileTextContainer: {
      flex: 1,
    },
    downloadAction: {
      padding: moderateScale(8),
      backgroundColor: themeColors.primary05,
      borderRadius: moderateScale(8),
    },
  });
})();

export default styles;
