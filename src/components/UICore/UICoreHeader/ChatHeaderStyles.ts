// @ts-nocheck
import { StyleSheet } from 'react-native';
import Colors from '../../../theme/color';
import { normalize } from '../../../utils/responsive';

export const chatStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
  },
  backButton: {
    marginRight: normalize(12),
    padding: normalize(4),
  },
  avatarCircle: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarText: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: Colors.black,
  },
  headerInfo: {
    flex: 1,
    marginRight: normalize(4),
    justifyContent: 'center',
  },
  title: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: Colors.black,
    lineHeight: normalize(18),
  },
  phoneText: {
    fontSize: normalize(12),
    color: Colors.text.gray || '#667781',
    marginTop: normalize(2),
    fontWeight: '400',
    lineHeight: normalize(14),
    includeFontPadding: false,
  },
  statusTextAI: {
    color: Colors.primary,
    fontWeight: '600',
  },
  statusTextManual: {
    color: Colors.success,
    fontWeight: '600',
  },
});
