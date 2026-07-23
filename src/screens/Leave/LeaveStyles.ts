/**
 * LeaveStyles.ts
 * All StyleSheet definitions for the Leave feature.
 * Components and screens import from here instead of defining styles inline.
 */

import { StyleSheet } from 'react-native';
import colors from '../../theme/color';
import { normalize, screenWidth } from '../../utils/responsive';

export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: normalize(16), paddingBottom: normalize(100) },
  
  // Top Tabs
  topTabsWrapper: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', backgroundColor: 'transparent' },
  topTabsScroll: { paddingHorizontal: normalize(16) },
  topTab: { paddingVertical: normalize(12), marginRight: normalize(24), borderBottomWidth: 2, borderBottomColor: 'transparent' },
  topTabActive: { borderBottomColor: colors.primary },
  topTabText: { fontSize: normalize(14), fontWeight: '600', color: colors.text.muted },
  topTabTextActive: { color: colors.primary, fontWeight: '700' },
  topTabsDivider: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.05)', zIndex: -1 },

  // Sub Tabs
  subTabsWrapper: { paddingHorizontal: normalize(16), paddingTop: normalize(16), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pageTitle: { fontSize: normalize(20), fontWeight: '800', color: colors.black },
  pageSubtitle: { fontSize: normalize(13), color: colors.text.muted, marginTop: normalize(4), maxWidth: '80%' },
  subTabsGroup: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: normalize(8), padding: normalize(4) },
  subTab: { paddingHorizontal: normalize(12), paddingVertical: normalize(6), borderRadius: normalize(6) },
  subTabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  subTabText: { fontSize: normalize(12), fontWeight: '600', color: colors.text.muted },
  subTabTextActive: { color: colors.primary },

  // Summary Card
  summaryCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: normalize(16),
    padding: normalize(16),
    marginTop: normalize(12),
    marginBottom: normalize(16),
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  summaryCardTitle: {
    fontSize: normalize(11),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.6,
    marginBottom: normalize(12),
  },
  summaryGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryGridCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  summaryGridHeader: {
    fontSize: normalize(11),
    color: colors.text.muted,
    marginBottom: normalize(6),
  },
  summaryGridVal: {
    fontSize: normalize(14),
    fontWeight: '800',
    color: colors.text.primary,
  },

  // Stat Cards
  statScroll: { paddingHorizontal: 0, paddingBottom: normalize(8), paddingTop: normalize(2), gap: normalize(10) },
  statCard: { borderRadius: normalize(16), padding: normalize(12), alignItems: 'center', width: normalize(100), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  statIconWrap: { width: normalize(32), height: normalize(32), borderRadius: normalize(16), alignItems: 'center', justifyContent: 'center', marginBottom: normalize(6) },
  statValue: { fontSize: normalize(18), fontWeight: '800', marginBottom: normalize(2) },
  statLabel: { fontSize: normalize(10), color: colors.text.muted, fontWeight: '600', textAlign: 'center', lineHeight: normalize(13) },

  // Approvals Analytics Cards (Matching Web Design Reference)
  approvalStatCard: {
    borderRadius: normalize(16),
    padding: normalize(14),
    width: normalize(135),
    borderWidth: 1.5,
    justifyContent: 'space-between',
  },
  approvalStatLabel: {
    fontSize: normalize(9),
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  approvalStatVal: {
    fontSize: normalize(22),
    fontWeight: '900',
    marginTop: normalize(4),
  },
  approvalStatSub: {
    fontSize: normalize(10),
    fontWeight: '500',
    color: colors.text.muted,
    marginTop: normalize(2),
  },

  sectionHeader: { marginTop: normalize(16), marginBottom: normalize(12) },
  sectionTitle: { fontSize: normalize(16), fontWeight: '800', color: colors.black },

  // Balance Card
  balanceCard: { backgroundColor: colors.white, borderRadius: normalize(16), padding: normalize(16), marginBottom: normalize(12), borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  bcHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: normalize(16) },
  bcTitle: { fontSize: normalize(16), fontWeight: '700', color: colors.black, marginBottom: normalize(6) },
  bcTags: { flexDirection: 'row', gap: normalize(6) },
  bcTag: { paddingHorizontal: normalize(6), paddingVertical: normalize(2), backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: normalize(4) },
  bcTagText: { fontSize: normalize(10), fontWeight: '700', color: colors.text.primary },
  bcAvailable: { fontSize: normalize(24), fontWeight: '800' },
  bcAvailableSub: { fontSize: normalize(10), fontWeight: '700', color: colors.text.muted, marginTop: normalize(2), letterSpacing: 0.5 },
  
  bcMetricsContainer: { backgroundColor: '#F8FAFC', borderRadius: normalize(12), padding: normalize(12) },
  bcMetricsRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: normalize(8) },
  bcMetricsRowBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  bcMetric: { alignItems: 'center', flex: 1, paddingVertical: normalize(6) },
  bcMetricHighlight: { borderRadius: normalize(8) },
  bcMetricTitle: { fontSize: normalize(9), fontWeight: '700', color: colors.text.muted, marginBottom: normalize(4), letterSpacing: 0.5 },
  bcMetricVal: { fontSize: normalize(13), fontWeight: '700', color: colors.black },

  // Activity Card
  recentActivityRow: { marginTop: normalize(16), marginBottom: normalize(12) },
  activityCard: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: normalize(24), padding: normalize(16), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', marginBottom: normalize(12), overflow: 'hidden' },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  activityIcon: { width: normalize(32), height: normalize(32), borderRadius: normalize(16), backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  activityTitle: { fontSize: normalize(14), fontWeight: '700', color: colors.black },
  statusTag: { paddingHorizontal: normalize(6), paddingVertical: normalize(2), backgroundColor: '#F1F5F9', borderRadius: normalize(10) },
  statusTagText: { fontSize: normalize(10), fontWeight: '600', color: colors.text.muted },
  activityMeta: { fontSize: normalize(11), color: colors.text.muted, fontWeight: '500' },
  activityApplied: { fontSize: normalize(9), fontWeight: '800', color: colors.black, letterSpacing: 0.5 },
  activityAppliedVal: { fontSize: normalize(11), fontWeight: '700', color: colors.text.primary, marginTop: normalize(2) },
  
  activityReason: { overflow: 'hidden' },
  activityReasonTitle: { fontSize: normalize(10), fontWeight: '700', color: colors.text.muted, letterSpacing: 0.5 },
  activityReasonText: { fontSize: normalize(13), color: colors.text.primary, lineHeight: normalize(20) },

  // Management Tab
  mgtHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: normalize(8) },
  mgtApplyBtn: { overflow: 'hidden', borderRadius: normalize(12) },
  mgtApplyGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(14), height: normalize(40), gap: normalize(6) },
  mgtApplyText: { fontSize: normalize(13), fontWeight: '700', color: colors.white },
  mgtStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: normalize(12), marginBottom: normalize(24) },
  mgtStatCard: { width: (screenWidth - normalize(44)) / 2, backgroundColor: colors.white, padding: normalize(16), borderRadius: normalize(12), borderWidth: 1 },
  mgtStatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(12) },
  mgtStatTitle: { fontSize: normalize(10), fontWeight: '800', color: colors.primary, letterSpacing: 0.5 },
  mgtStatVal: { fontSize: normalize(28), fontWeight: '800', color: colors.black },
  searchRow: { flexDirection: 'row', gap: normalize(10), alignItems: 'center', marginBottom: normalize(12) },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: normalize(6), backgroundColor: 'rgba(59, 130, 246, 0.08)', paddingHorizontal: normalize(12), paddingVertical: normalize(6), borderRadius: normalize(20), borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
  activeChipText: { fontSize: normalize(11), color: colors.primary, fontWeight: '700' },
  filterScrollContainer: { gap: normalize(8), paddingBottom: normalize(8), paddingTop: normalize(2), alignItems: 'center' },
  filterDropdownWrap: { width: normalize(135) },
  customRangeBtn: {
    height: normalize(40),
    backgroundColor: colors.white,
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: normalize(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: normalize(6),
  },
  customRangeBtnText: {
    fontSize: normalize(12),
    color: colors.text.primary,
    fontWeight: '600',
  },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, paddingHorizontal: normalize(12), height: normalize(40), borderRadius: normalize(12), borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  searchInput: { flex: 1, marginLeft: normalize(8), fontSize: normalize(13), color: colors.text.primary },
  filterBtn: { width: normalize(48), height: normalize(48), backgroundColor: colors.white, borderRadius: normalize(16), borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center' },

  reqCard: { backgroundColor: colors.white, padding: normalize(16), borderRadius: normalize(16), marginBottom: normalize(12), borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  reqCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: normalize(12) },
  reqType: { fontSize: normalize(15), fontWeight: '700', color: colors.black },
  reqId: { fontSize: normalize(12), color: colors.text.muted, marginTop: normalize(2) },
  reqStatusTag: { paddingHorizontal: normalize(8), paddingVertical: normalize(4), borderRadius: normalize(6) },
  reqStatusText: { fontSize: normalize(11), fontWeight: '700' },
  reqDetails: { flexDirection: 'row', gap: normalize(24), marginBottom: normalize(12), paddingBottom: normalize(12), borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  reqDetailItem: {},
  reqDetailLabel: { fontSize: normalize(11), color: colors.text.muted, marginBottom: normalize(2) },
  reqDetailVal: { fontSize: normalize(13), fontWeight: '600', color: colors.text.primary },
  reqReasonBox: {},
  reqReasonLabel: { fontSize: normalize(11), color: colors.text.muted, marginBottom: normalize(4) },
  reqReasonText: { fontSize: normalize(13), color: colors.text.primary, lineHeight: normalize(20) },

  // FAB
  fabPosition: { position: 'absolute', bottom: normalize(85), right: normalize(16), zIndex: 99 },
  fabBtn: { borderRadius: normalize(24), overflow: 'hidden', shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  fabGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(18), paddingVertical: normalize(12), gap: normalize(6) },
  fabText: { color: colors.white, fontSize: normalize(13), fontWeight: '800' },

  // Apply Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: normalize(24), borderTopRightRadius: normalize(24), maxHeight: '90%' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: normalize(24), paddingBottom: normalize(16), borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  modalIconBg: { width: normalize(40), height: normalize(40), borderRadius: normalize(12), backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: normalize(18), fontWeight: '800', color: colors.black },
  modalSub: { fontSize: normalize(12), color: colors.text.muted, marginTop: normalize(2) },
  modalCloseBtn: { padding: normalize(4) },
  
  modalScroll: { padding: normalize(24) },
  inputGroup: { marginBottom: normalize(16) },
  inputLabel: { fontSize: normalize(11), fontWeight: '700', color: colors.text.muted, letterSpacing: 0.5, marginBottom: normalize(6) },
  modalInput: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: normalize(8), paddingHorizontal: normalize(12), height: normalize(44), fontSize: normalize(14), color: colors.text.primary },
  
  balanceInfoBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: normalize(12), borderWidth: 1, borderColor: '#E2E8F0', borderRadius: normalize(12), backgroundColor: colors.white, marginBottom: normalize(16) },
  balanceInfoLabel: { fontSize: normalize(13), fontWeight: '600', color: colors.text.primary },
  balanceInfoSub: { fontSize: normalize(12), color: colors.text.muted },
  balanceInfoTag: { backgroundColor: '#FEF3C7', paddingHorizontal: normalize(12), paddingVertical: normalize(6), borderRadius: normalize(16) },
  balanceInfoTagText: { fontSize: normalize(12), fontWeight: '700', color: '#B45309' },

  inputWrapper: { position: 'relative', justifyContent: 'center' },
  modalInputWithIcon: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: normalize(8), paddingHorizontal: normalize(12), height: normalize(44), fontSize: normalize(14), color: colors.text.primary, paddingRight: normalize(36) },
  inputIconRight: { position: 'absolute', right: normalize(12) },
  modalInputDisabled: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: normalize(8), paddingHorizontal: normalize(12), height: normalize(44), fontSize: normalize(14), color: colors.text.muted },
  inputIconLeft: { position: 'absolute', left: normalize(12), zIndex: 1 },

  fauxDropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: normalize(8), paddingHorizontal: normalize(12), height: normalize(44) },
  fauxDropdownText: { fontSize: normalize(14), color: colors.text.primary },
  rowInputs: { flexDirection: 'row', gap: normalize(12) },
  inputHelpText: { fontSize: normalize(11), color: colors.text.muted, marginTop: normalize(4) },

  appSummaryBox: { borderWidth: 1, borderColor: '#DBEAFE', backgroundColor: '#EFF6FF', borderRadius: normalize(12), padding: normalize(16), marginBottom: normalize(16) },
  appSummaryTitle: { fontSize: normalize(10), fontWeight: '800', color: colors.primary, letterSpacing: 0.5 },
  appSummaryLabel: { fontSize: normalize(11), color: colors.text.muted, marginBottom: normalize(4) },
  appSummaryValue: { fontSize: normalize(14), fontWeight: '700', color: colors.text.primary },

  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: normalize(8), marginBottom: normalize(20) },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: normalize(12), fontSize: normalize(12), color: colors.text.muted, fontWeight: '600' },

  uploadBox: { borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: normalize(12), padding: normalize(24), alignItems: 'center', backgroundColor: '#F8FAFC' },
  uploadTitle: { fontSize: normalize(14), fontWeight: '600', color: colors.primary, marginTop: normalize(12), marginBottom: normalize(4) },
  uploadSub: { fontSize: normalize(12), color: colors.text.muted },

  modalFooter: { flexDirection: 'row', gap: normalize(12), padding: normalize(24), paddingTop: normalize(16), borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  cancelBtn: { flex: 1, height: normalize(48), borderRadius: normalize(12), backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: normalize(15), fontWeight: '600', color: colors.text.primary },
  submitBtn: { flex: 1, height: normalize(48), borderRadius: normalize(12), backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { fontSize: normalize(15), fontWeight: '600', color: colors.white },

  calendarWrapper: { marginTop: normalize(16), borderRadius: normalize(16), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },

  // Mobile Card Box styles for My Leaves tab listing
  mobileCardWrapper: {
    marginBottom: normalize(8),
    borderRadius: normalize(16),
    overflow: 'hidden',
  },
  mobileCardBlur: {
    padding: normalize(12),
    borderRadius: normalize(16),
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  mobileCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileCodeBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(6),
  },
  mobileCodeBadgeText: {
    fontSize: normalize(11),
    fontWeight: '800',
    color: colors.primary,
  },
  mobileLeaveTypeName: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: colors.black,
  },
  mobileStatusBadge: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(10),
  },
  mobileStatusText: {
    fontSize: normalize(11),
    fontWeight: '700',
  },
  mobileCardCompactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: normalize(8),
  },
  mobileCardCompactText: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: colors.text.primary,
  },
  mobileCardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginTop: normalize(6),
    paddingTop: normalize(6),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  mobileCardSubText: {
    fontSize: normalize(11),
    color: colors.text.muted,
    fontWeight: '500',
  },
  mobileCardReasonText: {
    fontSize: normalize(11),
    color: colors.text.secondary,
    fontWeight: '500',
    flex: 1,
  },

  // Center Details Modal styles
  centerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
  },
  centerModalCard: {
    width: '100%',
    maxWidth: normalize(440),
    backgroundColor: colors.white,
    borderRadius: normalize(24),
    padding: normalize(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  centerModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: normalize(14),
    marginBottom: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  centerModalIconWrap: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerModalTitle: {
    fontSize: normalize(16),
    fontWeight: '800',
    color: colors.black,
  },
  centerModalSub: {
    fontSize: normalize(12),
    color: colors.text.muted,
    marginTop: normalize(2),
  },
  centerModalCloseBtn: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsTableBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: normalize(16),
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  detailsTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(11),
    paddingHorizontal: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailsRowLabel: {
    width: '38%',
    fontSize: normalize(11),
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  detailsRowVal: {
    flex: 1,
    fontSize: normalize(13),
    fontWeight: '600',
    color: colors.text.primary,
  },
  detailsStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: normalize(12),
    alignSelf: 'flex-start',
  },
  detailsStatusText: {
    fontSize: normalize(12),
    fontWeight: '700',
  },
  codeBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: normalize(4),
  },
  codeBadgeText: {
    fontSize: normalize(11),
    fontWeight: '700',
    color: colors.primary,
  },
  mobileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgePill: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(6),
    borderWidth: 1,
  },
  badgeText: {
    fontSize: normalize(11),
    fontWeight: '700',
  },
  mobileDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: normalize(8),
    paddingTop: normalize(10),
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.8)',
  },
  mobileGridCol: {
    width: '33.33%',
    paddingRight: normalize(4),
  },
  mobileGridLabel: {
    fontSize: normalize(10),
    fontWeight: '600',
    color: colors.text.muted,
    textTransform: 'uppercase',
  },
  mobileGridVal: {
    fontSize: normalize(13),
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: normalize(2),
  },
});
