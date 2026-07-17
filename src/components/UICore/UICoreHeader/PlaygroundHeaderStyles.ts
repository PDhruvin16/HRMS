// @ts-nocheck
import { StyleSheet } from 'react-native';
import { normalize } from '../../../utils/responsive';
import Colors from '../../../theme/color';

export const playgroundStyles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  baseBg: {
    flex: 1,
  },
  glowOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: normalize(80),
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    marginTop: normalize(5), // Pull top nav up
  },
  backButton: {
    marginRight: normalize(12),
    padding: normalize(4),
  },
  title: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: Colors.white,
  },
  contentArea: {
    paddingHorizontal: normalize(20),
    marginTop: normalize(22),
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  lockedContent: {
    alignItems: 'center',
  },
  robotIconBox: {
    width: normalize(54),
    height: normalize(54),
    borderRadius: normalize(16),
    backgroundColor: Colors.contactCardBg, // #C2D0F2
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  selectAgentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: normalize(12),
    height: normalize(32),
    borderRadius: normalize(12),
    justifyContent: 'center',
    gap: normalize(6),
  },
  selectAgentText: {
    fontSize: normalize(13),
    color: Colors.white,
    fontWeight: '600',
  },
  activeAgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
    marginTop: normalize(10),
  },
  agentAvatarSmall: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(10),
    backgroundColor: Colors.contactCardBg, // #C2D0F2
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(16),
  },
  activeAgentName: {
    flex: 1,
    fontSize: normalize(18),
    fontWeight: '700',
    color: Colors.white,
  },
  switchAgentButton: {
    width: normalize(35),
    height: normalize(27),
    borderRadius: normalize(8),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default playgroundStyles;
