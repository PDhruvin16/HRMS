// @ts-nocheck
import { StyleSheet, Platform } from 'react-native';
import Colors from '../../../theme/color';
import { normalize } from '../../../utils/responsive';

export const screenStyles = StyleSheet.create({
  wrapper: {
    paddingBottom: normalize(4),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(6),
  },
  searchFullWidth: {
    flex: 1,
  },
  searchNoMargin: {
    marginBottom: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8), // Tighter, cleaner fit next to title
  },
  backButton: {
    marginRight: normalize(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: Colors.black,
  },
  countBadge: {
    minWidth: normalize(20), // Responsive horizontal dilation
    height: normalize(20),
    borderRadius: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: normalize(6), // Buffer for 99+ expansion
  },
  countText: {
    fontSize: normalize(9), // Precise fitting
    color: Colors.text.gray,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center', // Android alignment lock
    includeFontPadding: false, // Android padding normalization
    lineHeight: normalize(11), // Clamp vertical footprint
    marginTop: Platform.OS === 'ios' ? -1 : 0, // Compensate for iOS baseline drift
  },
  headerActions: {
    flexDirection: 'row',
    gap: normalize(10),
    minHeight: normalize(40),
    alignItems: 'center',
  },
  iconButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomArea: {
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(8),
  },
});
