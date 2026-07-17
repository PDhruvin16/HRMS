import { StyleSheet } from 'react-native';
import colors from '../../theme/color';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.splashBg,
  },
  centerContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default styles;
