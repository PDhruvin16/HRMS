import { StyleSheet } from 'react-native';
import colors from '../../../theme/color';
import { normalize } from '../../../utils/responsive';

export const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
  },
  width100: {
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: normalize(40),
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: normalize(24),
  },
  logoRow: {
    height: 80,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(40),
  },
  maskedView: {
    height: 80,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.transparent,
  },
  brandText: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.white, // White mask for full alpha & brightness on iOS
    letterSpacing: -1,
  },
  titleText: {
    color: colors.black,
    fontSize: normalize(22),
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: normalize(8),
  },
  subtitleText: {
    color: colors.text.secondary,
    fontSize: normalize(14),
    textAlign: 'center',
    marginBottom: normalize(32),
  },
  inputBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8), // Shorter vertical padding
    marginBottom: normalize(12), // Tighter vertical margins
  },
  inputErrorBorder: {
    borderColor: colors.error,
  },
  inputInner: {
    width: '100%',
  },
  inputLabel: {
    color: colors.text.secondary,
    fontSize: normalize(11), // Slightly smaller font
    fontWeight: '600',
    marginBottom: normalize(2),
  },
  redStar: {
    color: colors.error,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  textInput: {
    flex: 1,
    color: colors.black,
    fontSize: normalize(14), // Sleeker input font size
    padding: 0,
    height: normalize(20), // Reduced input field height
  },
  rightIcon: {
    marginLeft: normalize(8),
  },
  fieldErrorText: {
    color: colors.error,
    fontSize: normalize(11),
    alignSelf: 'flex-start',
    marginTop: normalize(-8),
    marginBottom: normalize(8),
    paddingLeft: normalize(4),
  },
  forgotPassContainer: {
    alignSelf: 'flex-end',
    marginBottom: normalize(24),
  },
  forgotPassText: {
    color: colors.text.secondary,
    fontSize: normalize(13),
    fontWeight: '500',
  },
  generalErrorText: {
    color: colors.error,
    fontSize: normalize(14),
    textAlign: 'center',
    marginBottom: normalize(16),
  },
  btnWrapper: {
    width: '100%',
    height: normalize(52),
    borderRadius: normalize(12),
    overflow: 'hidden',
    marginBottom: normalize(24),
  },
  gradientBorderContainer: {
    flex: 1,
    padding: 1, // Creates the perfect 1px border effect inside View
    borderRadius: normalize(12),
    overflow: 'hidden',
  },
  btnInner: {
    flex: 1,
    borderRadius: normalize(11),
    overflow: 'hidden',
  },
  btnContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: colors.white,
    fontSize: normalize(16),
    fontWeight: '700',
  },
  footerContainer: {
    marginTop: 'auto',
    marginBottom: normalize(20),
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: normalize(13),
    textAlign: 'center',
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default styles;
