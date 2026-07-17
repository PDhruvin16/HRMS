// @ts-nocheck
import { StyleSheet } from 'react-native';
import Colors from '../../../theme/color';
import { normalize } from '../../../utils/responsive';

export const agentStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 10,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  baseBg: {
    flex: 1,
    backgroundColor: Colors.basecolor,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: normalize(50),
    paddingHorizontal: normalize(20),
    height: normalize(90),
  },
  backButton: {
    marginRight: normalize(12),
    padding: normalize(4),
  },
  detailsTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: Colors.white,
  },
  expandedProfileContainer: {
    position: 'absolute',
    top: normalize(116),
    left: 0,
    right: 0,
    paddingHorizontal: normalize(20),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(10),
    backgroundColor: Colors.contactCardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(16),
    borderWidth: 1,
    borderColor: Colors.white + '33',
  },
  nameColumn: {
    flex: 1,
  },
  contactName: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: Colors.white,
  },
  companyName: {
    fontSize: normalize(12),
    color: Colors.white + 'CC',
    marginTop: normalize(2),
  },
  statusBadge: {
    paddingHorizontal: normalize(10),
    height: normalize(22),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: Colors.success,
    backgroundColor: Colors.success + '1A',
  },
  statusText: {
    fontSize: normalize(10),
    fontWeight: '600',
    color: Colors.success,
  },
  collapsedProfileContainer: {
    position: 'absolute',
    top: normalize(116),
    left: 0,
    right: 0,
    paddingHorizontal: normalize(20),
  },
  profileRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsedAvatar: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(8),
    backgroundColor: Colors.contactCardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  nameColumnSmall: {
    flex: 1,
  },
  collapsedName: {
    fontSize: normalize(15),
    fontWeight: '700',
    color: Colors.white,
  },
  companyNameSmall: {
    fontSize: normalize(11),
    color: Colors.white + '99',
  },
  statusBadgeSmall: {
    paddingHorizontal: normalize(8),
    height: normalize(18),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: Colors.success,
    backgroundColor: Colors.success + '1A',
  },
  statusTextSmall: {
    fontSize: normalize(9),
    fontWeight: '600',
    color: Colors.success,
  },
});
