import { StyleSheet, Platform } from 'react-native';
import colors from '../../../theme/color';
import { normalize } from '../../../utils/responsive';

export const getStyles = (themeColors: typeof colors = colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    flex1: {
      flex: 1,
    },
    mb0: {
      marginBottom: 0,
    },
    appBrandRow: {
      height: normalize(40),
      width: '100%',
    },
    maskedView: {
      flex: 1,
      flexDirection: 'row',
      height: '100%',
    },
    maskContainerCentered: {
      backgroundColor: 'transparent',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    welcomeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: normalize(20),
    },
    welcomeVerticalCenter: {
      marginBottom: 0,
      textAlignVertical: 'center',
    },
    welcomeTextWrapper: {
      height: normalize(26),
      justifyContent: 'center',
      marginTop: Platform.OS === 'ios' ? normalize(2) : 0,
    },
    welcomeMaskedViewSize: {
      height: normalize(21),
      width: normalize(115),
    },
    transparentVerticalCenter: {
      backgroundColor: 'transparent',
      textAlignVertical: 'center',
    },
    gradientBackground: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    statusBarMask: {
      zIndex: 10,
      width: '100%',
    },
    scrollContent: {
      flexGrow: 1,
    },
    contentWrapper: {
      flex: 1,
      alignItems: 'center',
      minHeight: '100%',
    },

    // ─── Hero Section (above card) ───
    heroSection: {
      width: '100%',
      alignItems: 'center',
      paddingTop: normalize(48),
      paddingBottom: normalize(32),
      paddingHorizontal: normalize(24),
      position: 'relative',
      overflow: 'hidden',
    },
    // Decorative blob circles in background
    heroBlob1: {
      position: 'absolute',
      width: normalize(200),
      height: normalize(200),
      borderRadius: normalize(100),
      backgroundColor: themeColors.primary20,
      top: -normalize(60),
      left: -normalize(60),
    },
    heroBlob2: {
      position: 'absolute',
      width: normalize(140),
      height: normalize(140),
      borderRadius: normalize(70),
      backgroundColor: themeColors.primary18, // Changed to primary to keep consistent
      top: normalize(20),
      right: -normalize(40),
    },
    heroBlob3: {
      position: 'absolute',
      width: normalize(80),
      height: normalize(80),
      borderRadius: normalize(40),
      backgroundColor: themeColors.primary12,
      bottom: normalize(10),
      left: normalize(30),
    },

    // Logo container
    logoContainer: {
      width: normalize(80),
      height: normalize(80),
      borderRadius: normalize(24),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: normalize(16),
      shadowColor: themeColors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
      overflow: 'hidden',
      backgroundColor: themeColors.primary,
    },
    logoText: {
      fontSize: normalize(36),
      fontWeight: '900',
      color: themeColors.white,
      letterSpacing: -1,
    },

    // App name & tagline
    appName: {
      fontSize: normalize(26),
      fontWeight: '900',
      color: themeColors.dark,
      letterSpacing: -0.8,
      marginBottom: normalize(6),
      textAlign: 'center',
    },
    appNameHighlight: {
      color: themeColors.primary,
    },
    tagline: {
      fontSize: normalize(13),
      color: themeColors.gray,
      textAlign: 'center',
      fontWeight: '500',
      letterSpacing: 0.2,
    },

    // Trust badges row
    badgesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalize(12),
      marginTop: normalize(16),
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalize(4),
      backgroundColor: themeColors.primary12,
      paddingHorizontal: normalize(10),
      paddingVertical: normalize(4),
      borderRadius: normalize(20),
    },
    badgeText: {
      fontSize: normalize(10),
      fontWeight: '700',
      color: themeColors.primary,
      letterSpacing: 0.3,
    },

    // ─── Card ───
    cardWrapper: {
      width: '100%',
      paddingHorizontal: normalize(20),
    },
    card: {
      width: '100%',
      borderRadius: normalize(24),
      backgroundColor: themeColors.white,
      padding: normalize(24),
      shadowColor: themeColors.black,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 8,
      borderWidth: 1,
      borderColor: themeColors.black04,
    },

    // "Welcome back to Sales bot 👋"
    welcomeText: {
      fontSize: normalize(17),
      fontWeight: '800',
      color: themeColors.dark,
      marginBottom: normalize(20),
      textAlign: 'center',
      lineHeight: normalize(26),
    },
    welcomeHighlight: {
      color: themeColors.primary,
      fontSize: normalize(17),
      fontWeight: '800',
    },

    // Forgot password
    forgotPasswordRow: {
      alignItems: 'flex-end',
      marginTop: normalize(-8),
      marginBottom: normalize(16),
    },
    forgotPasswordText: {
      fontSize: normalize(13),
      fontWeight: '600',
      color: themeColors.dark,
    },

    // Login button
    loginButton: {
      borderRadius: normalize(14),
      marginTop: normalize(4),
    },

    // "Don't have an account? Sign Up"
    signUpRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: normalize(20),
      marginBottom: normalize(32),
      gap: normalize(4),
    },
    signUpText: {
      fontSize: normalize(13),
      color: themeColors.gray,
    },
    signUpLink: {
      fontSize: normalize(13),
      fontWeight: '700',
      color: themeColors.primary,
    },

    // Error text below fields
    errorText: {
      marginTop: normalize(4),
      marginBottom: normalize(8),
      textAlign: 'center',
      color: themeColors.error,
      fontSize: normalize(12),
    },
    opacity0: {
      opacity: 0,
    },
  });

export default getStyles;
