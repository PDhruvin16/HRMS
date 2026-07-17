// @ts-nocheck
import { StyleSheet } from 'react-native';
import colors from '../../../theme/color';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.headerGradientStart,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    paddingTop: 100,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.white25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 14,
    color: colors.white90,
    textAlign: 'center',
    lineHeight: 20,
  },
  mobileNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  otpInput: {
    flex: 1,
    maxWidth: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark,
    backgroundColor: colors.background,
  },
  otpInputFilled: {
    borderColor: colors.headerGradientStart,
    backgroundColor: colors.headerOrange + '0D',
  },
  otpInputError: {
    borderColor: colors.error,
    backgroundColor: colors.error + '0D',
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  hintText: {
    fontSize: 13,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  hintOtp: {
    fontWeight: '700',
    color: colors.headerGradientStart,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 13,
    color: colors.gray,
  },
  resendLink: {
    fontSize: 13,
    color: colors.headerGradientStart,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 11,
    color: colors.white90,
    marginTop: 'auto',
  },
});

export default styles;
