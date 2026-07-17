// @ts-nocheck
import { StyleSheet } from 'react-native';
import colors from '../../../theme/color';
import { normalize } from '../../../utils/responsive';

export const styles = (() => {
  const themeColors = colors;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.headerGradientStart,
    },
    gradientBackground: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: normalize(40),
    },
    contentWrapper: {
      paddingHorizontal: normalize(24),
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      paddingTop: normalize(60),
      paddingBottom: normalize(60),
    },
    card: {
      width: '100%',
      backgroundColor: themeColors.white,
      borderRadius: normalize(20),
      padding: normalize(20),
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: normalize(4) },
      shadowOpacity: 0.2,
      shadowRadius: normalize(8),
      elevation: 6,
      marginBottom: normalize(24),
    },
    logoCircle: {
      width: normalize(72),
      height: normalize(72),
      borderRadius: normalize(36),
      backgroundColor: themeColors.white25,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: normalize(16),
    },
    logoText: {
      color: themeColors.white,
    },
    cardIconWrapper: {
      alignItems: 'center',
      marginBottom: normalize(12),
    },
    cardIconCircle: {
      width: normalize(56),
      height: normalize(56),
      borderRadius: normalize(28),
      backgroundColor: themeColors.activityBackgroundBlue,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardIconCircleDark: {
      backgroundColor: themeColors.white05,
    },
    cardTitle: {
      fontSize: normalize(18),
      fontWeight: '700',
      color: themeColors.dark,
      textAlign: 'center',
      marginTop: normalize(8),
    },
    cardSubtitle: {
      fontSize: normalize(13),
      color: themeColors.gray,
      textAlign: 'center',
      marginTop: normalize(4),
      marginBottom: normalize(16),
    },
    footerText: {
      fontSize: normalize(11),
      color: themeColors.authWhiteDarkText,
      marginTop: normalize(20),
    },
    errorText: {
      marginTop: normalize(8),
      marginBottom: normalize(8),
      textAlign: 'center',
      color: themeColors.error,
    },
  });
})();

export default styles;
