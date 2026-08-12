/**
 * AttendanceStyles.ts
 * All StyleSheet definitions for the Attendance feature.
 * Components and screens import from here instead of defining styles inline.
 */

import { StyleSheet, Dimensions } from 'react-native';
import colors from '../../theme/color';
import { normalize } from '../../utils/responsive';

export const { width: SW } = Dimensions.get('window');

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content:   { paddingHorizontal: normalize(16), paddingTop: normalize(16), paddingBottom: normalize(120) },

  /* ── Tab bar ──────────────────────────────────────────────── */
  tabWrap:        { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.7)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.8)' },
  tabItem:        { paddingHorizontal: normalize(16), alignItems: 'center', paddingVertical: normalize(14), position: 'relative' },
  tabItemActive:  {},
  tabUnderline:   { position: 'absolute', bottom: 0, left: normalize(12), right: normalize(12), height: 3, backgroundColor: colors.primary, borderRadius: 3 },
  tabLabel:       { fontSize: normalize(12), fontWeight: '600', color: colors.text.muted },
  tabLabelActive: { fontSize: normalize(12), fontWeight: '800', color: colors.primary },

  /* ── Hero punch card ─────────────────────────────────────── */
  heroCard:      { borderRadius: normalize(24), padding: normalize(20), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: normalize(16), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.45)', overflow: 'hidden' },
  heroLeft:      { flexDirection: 'row', alignItems: 'center', flex: 1 },
  heroIcon:      { width: normalize(52), height: normalize(52), borderRadius: normalize(18), alignItems: 'center', justifyContent: 'center' },
  heroLabelText: { fontSize: normalize(13), color: colors.text.secondary, fontWeight: '700' },
  heroStatus:    { fontSize: normalize(17), fontWeight: '800', marginTop: normalize(2) },
  heroSince:     { fontSize: normalize(12), color: colors.text.muted, marginTop: normalize(2), fontWeight: '500' },
  punchBtn:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(16), paddingVertical: normalize(12), borderRadius: normalize(16), gap: normalize(6), shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  punchBtnText:  { color: colors.white, fontWeight: '800', fontSize: normalize(13), marginLeft: normalize(4) },

  /* ── Stats scroll ────────────────────────────────────────── */
  statScroll:          { gap: normalize(12), paddingBottom: normalize(4), marginBottom: normalize(16) },
  statCard:            { borderRadius: normalize(24), paddingHorizontal: normalize(10), paddingVertical: normalize(16), alignItems: 'center', width: normalize(124), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  teamStatCard:        { borderRadius: normalize(24), padding: normalize(18), width: normalize(180), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.55)', overflow: 'hidden' },
  teamStatCardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(8) },
  teamStatLabel:       { fontSize: normalize(13), fontWeight: '800', color: colors.black },
  teamStatIconWrap:    { width: normalize(34), height: normalize(34), borderRadius: normalize(10), alignItems: 'center', justifyContent: 'center' },
  teamStatValue:       { fontSize: normalize(22), fontWeight: '900', color: colors.black, marginBottom: normalize(2) },
  teamStatSub:         { fontSize: normalize(11), color: colors.text.secondary, fontWeight: '700' },
  statIconWrap:        { width: normalize(42), height: normalize(42), borderRadius: normalize(12), alignItems: 'center', justifyContent: 'center', marginBottom: normalize(10) },
  statValue:           { fontSize: normalize(17), fontWeight: '900', marginBottom: normalize(4), textAlign: 'center', width: '100%' },
  statLabel:           { fontSize: normalize(11), color: colors.text.secondary, fontWeight: '800', textAlign: 'center' },
  calendarCard:    { borderRadius: normalize(20), padding: normalize(14), marginBottom: normalize(16), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  datePickerGrid:  { flexDirection: 'row', gap: normalize(10) },
  dateFilterBox:   { flex: 1, backgroundColor: colors.white, borderRadius: normalize(12), padding: normalize(10), borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  dateFilterRow:   { flexDirection: 'row', gap: normalize(12), paddingHorizontal: normalize(16), marginBottom: normalize(16) },
  dateFilterInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', borderRadius: normalize(18), paddingHorizontal: normalize(16), paddingVertical: normalize(12), shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  dateFilterLabel: { fontSize: normalize(9), fontWeight: '800', color: colors.text.secondary, marginBottom: normalize(2) },
  dateFilterValue: { fontSize: normalize(12), fontWeight: '700', color: colors.primary },

  datePickerModalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  datePickerModalSheet:   { width: SW - normalize(40), backgroundColor: colors.white, borderRadius: normalize(28), padding: normalize(24), shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 10 },
  datePickerModalHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: normalize(8) },
  datePickerCancelBtn:    { flex: 1, padding: normalize(14), borderRadius: normalize(16), backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center' },
  datePickerSubmitBtn:    { flex: 1, padding: normalize(14), borderRadius: normalize(16), backgroundColor: colors.primary, alignItems: 'center' },

  /* ── Calendar toggle + card ──────────────────────────────── */
  calendarToggleWrap:    { borderRadius: normalize(18), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.45)', marginBottom: normalize(16), overflow: 'hidden' },
  calendarToggle:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: normalize(18), paddingVertical: normalize(16) },
  calendarToggleLeft:    { flexDirection: 'row', alignItems: 'center', gap: normalize(12) },
  calendarToggleText:    { fontSize: normalize(15), fontWeight: '800', color: colors.black },
  calendarToggleChevron: { width: normalize(30), height: normalize(30), borderRadius: normalize(10), backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  legendRow:             { flexDirection: 'row', flexWrap: 'wrap', gap: normalize(10), marginBottom: normalize(12), paddingHorizontal: normalize(6) },
  legendItem:            { flexDirection: 'row', alignItems: 'center', gap: normalize(6) },
  legendDot:             { width: normalize(8), height: normalize(8), borderRadius: normalize(4) },
  legendText:            { fontSize: normalize(11), color: colors.text.secondary, fontWeight: '700' },

  /* ── Section header ──────────────────────────────────────── */
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: normalize(12), marginTop: normalize(16) },
  sectionTitle:     { fontSize: normalize(16), fontWeight: '800', color: colors.black },
  sectionSub:       { fontSize: normalize(13), color: colors.text.muted, fontWeight: '600' },

  dayCard:          { borderRadius: normalize(24), marginBottom: normalize(16), backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden', borderWidth: 1.5, padding: normalize(20) },
  dayCardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: normalize(12) },
  headerLeft:       { flexDirection: 'row', alignItems: 'center', gap: normalize(8) },
  headerRight:      { flexDirection: 'row', flexWrap: 'wrap', gap: normalize(4), flex: 1, justifyContent: 'flex-end' },
  dayCardDate:      { fontSize: normalize(13), fontWeight: '800', color: colors.black },
  dayLocRow:        { flexDirection: 'row', alignItems: 'center', gap: normalize(4), marginTop: normalize(4) },
  dayLocText:       { fontSize: normalize(11), color: colors.text.secondary, fontWeight: '600' },

  statsBlock:   { flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', borderRadius: normalize(8), padding: normalize(10), marginBottom: normalize(8) },
  statItem:     { flex: 1, alignItems: 'center' },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: normalize(4), marginBottom: normalize(4) },
  statLbl:      { fontSize: normalize(9), fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase' },
  statVal:      { fontSize: normalize(15), fontWeight: '800', color: colors.black },

  punchInOutRow: { flexDirection: 'row', gap: normalize(8) },
  punchBox:      { flex: 1, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', borderRadius: normalize(8), padding: normalize(10) },
  punchLabelRow: { flexDirection: 'row', alignItems: 'center', gap: normalize(4), marginBottom: normalize(4) },
  punchLbl:      { fontSize: normalize(10), fontWeight: '700', color: colors.text.secondary },
  punchVal:      { fontSize: normalize(14), fontWeight: '800', color: colors.black },

  detailGridBox: { backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: normalize(12), padding: normalize(12), gap: normalize(10), marginTop: normalize(8) },
  detailRowCol:  { flexDirection: 'row', justifyContent: 'space-between' },
  detailCell:    { flex: 1 },
  detailLbl:     { fontSize: normalize(10), fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase', marginBottom: normalize(2) },
  detailVal:     { fontSize: normalize(13), fontWeight: '800', color: colors.black },
  accordionBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: normalize(6), paddingTop: normalize(10) },
  accordionBtnText: { fontSize: normalize(11), color: colors.primary, fontWeight: '700', textTransform: 'uppercase' },

  statusBadge:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(6), paddingVertical: normalize(2), borderRadius: normalize(6), gap: normalize(4), backgroundColor: 'rgba(0,0,0,0.04)' },
  statusDot:       { width: normalize(6), height: normalize(6), borderRadius: normalize(3) },
  statusBadgeText: { fontSize: normalize(10), fontWeight: '700' },

  issueTag:     { paddingHorizontal: normalize(6), paddingVertical: normalize(2), borderRadius: normalize(6), borderWidth: 1 },
  issueTagText: { fontSize: normalize(9), fontWeight: '700' },

  punchTableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.05)', paddingBottom: normalize(8), marginBottom: normalize(8) },
  th:               { fontSize: normalize(11), fontWeight: '800', color: colors.text.muted },
  punchTableRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: normalize(10), borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  td:               { fontSize: normalize(13), color: colors.black, fontWeight: '600' },
  closeOutlineBtn:     { padding: normalize(12), borderRadius: normalize(10), borderWidth: 1, borderColor: colors.primary, alignItems: 'center' },
  closeOutlineBtnText: { color: colors.primary, fontWeight: '800', fontSize: normalize(14) },

  expandedSection: { marginTop: normalize(10) },
  expandDivider:   { height: 1.5, backgroundColor: 'rgba(0,0,0,0.06)', marginVertical: normalize(12) },
  expandGrid:      { flexDirection: 'row', gap: normalize(12) },
  expandCell:      { flex: 1, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: normalize(14), padding: normalize(14) },
  expandCellTop:   { flexDirection: 'row', alignItems: 'center', gap: normalize(6), marginBottom: normalize(6) },
  expandLabel:     { fontSize: normalize(11), color: colors.text.secondary, fontWeight: '700' },
  expandVal:       { fontSize: normalize(16), fontWeight: '800' },

  /* ── Status count strip ──────────────────────────────────── */
  countStrip:     { borderRadius: normalize(22), padding: normalize(18), flexDirection: 'row', alignItems: 'center', marginBottom: normalize(16), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.45)', overflow: 'hidden' },
  countStripItem: { flex: 1, alignItems: 'center' },
  countStripSep:  { width: 1.5, height: normalize(40), backgroundColor: 'rgba(0,0,0,0.08)' },
  countNum:       { fontSize: normalize(28), fontWeight: '800' },
  countLbl:       { fontSize: normalize(12), color: colors.text.secondary, fontWeight: '700', marginTop: normalize(4) },

  /* ── Request cards ───────────────────────────────────────── */
  reqCard:      { borderRadius: normalize(20), padding: normalize(16), marginBottom: normalize(14), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  reqCardTop:   { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: normalize(8) },
  reqTitle:     { fontSize: normalize(15), fontWeight: '800', color: colors.black },
  reqMeta:      { fontSize: normalize(12), color: colors.text.secondary, marginTop: normalize(4), fontWeight: '500' },
  reqReasonBox: { backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: normalize(12), padding: normalize(10), marginTop: normalize(8) },
  reqReasonText:{ fontSize: normalize(13), color: colors.text.secondary, lineHeight: normalize(18), fontWeight: '500' },

  /* ── Team card ───────────────────────────────────────────── */
  teamCard:       { borderRadius: normalize(20), padding: normalize(16), marginBottom: normalize(14), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  teamCardInner:  { flexDirection: 'row', alignItems: 'center' },
  teamAvatar:     { width: normalize(48), height: normalize(48), borderRadius: normalize(16), alignItems: 'center', justifyContent: 'center' },
  teamAvatarText: { fontSize: normalize(16), fontWeight: '800' },
  teamName:       { fontSize: normalize(15), fontWeight: '800', color: colors.black },
  teamMeta:       { fontSize: normalize(12), color: colors.text.secondary, marginTop: normalize(2), fontWeight: '500' },
  teamHours:      { fontSize: normalize(12), color: colors.text.secondary, marginTop: normalize(4), fontWeight: '700' },

  teamRowCard:  { borderRadius: normalize(16), marginBottom: normalize(10), backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', overflow: 'hidden' },
  teamRowInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: normalize(14) },
  teamRowLeft:  { flexDirection: 'row', alignItems: 'center', flex: 1 },
  teamRowRight: { flexDirection: 'row', alignItems: 'center', gap: normalize(10) },
  teamRowName:  { fontSize: normalize(13), fontWeight: '700', color: colors.black },
  teamRowId:    { fontSize: normalize(10), color: colors.text.secondary, fontWeight: '600', marginTop: normalize(1) },
  teamRowViewBtn:  { borderRadius: normalize(8), borderWidth: 1, borderColor: colors.primary + '50', paddingHorizontal: normalize(14), paddingVertical: normalize(6), backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  teamRowViewText: { fontSize: normalize(11), fontWeight: '800', color: colors.primary },

  /* ── Team filter chips ───────────────────────────────────── */
  chipScroll:     { gap: normalize(10), paddingBottom: normalize(6), marginBottom: normalize(14) },
  chip:           { paddingHorizontal: normalize(16), paddingVertical: normalize(10), borderRadius: normalize(20), backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', overflow: 'hidden' },
  chipActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:       { fontSize: normalize(13), fontWeight: '700', color: colors.text.secondary },
  chipTextActive: { fontSize: normalize(13), fontWeight: '800', color: colors.white },

  /* ── Search bar ──────────────────────────────────────────── */
  searchBar:   { flexDirection: 'row', alignItems: 'center', borderRadius: normalize(16), paddingHorizontal: normalize(16), paddingVertical: normalize(14), gap: normalize(10), marginBottom: normalize(16), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.45)', overflow: 'hidden' },
  searchInput: { flex: 1, fontSize: normalize(15), color: colors.black, padding: 0, fontWeight: '500' },

  /* ── FAB ─────────────────────────────────────────────────── */
  fabWrap: { position: 'absolute', bottom: normalize(110), right: normalize(20) },
  fab:     { borderRadius: normalize(30), shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8, overflow: 'hidden' },
  fabGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(20), paddingVertical: normalize(14), gap: normalize(8) },
  fabText: { color: colors.white, fontWeight: '800', fontSize: normalize(14), letterSpacing: 0.5 },

  /* ── Modal ───────────────────────────────────────────────── */
  modalOverlay:    { flex: 1, justifyContent: 'flex-end' },
  modalSheet:      { backgroundColor: colors.surface, borderTopLeftRadius: normalize(32), borderTopRightRadius: normalize(32), padding: normalize(24), maxHeight: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  modalHandle:     { width: normalize(48), height: normalize(5), borderRadius: normalize(3), backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center', marginBottom: normalize(22) },
  modalTopRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: normalize(24) },
  modalTitle:      { fontSize: normalize(20), fontWeight: '800', color: colors.black },
  modalCloseBtn:   { width: normalize(36), height: normalize(36), borderRadius: normalize(18), backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  modalFieldLabel: { fontSize: normalize(13), fontWeight: '700', color: colors.text.secondary, marginBottom: normalize(8) },
  modalInput:      { backgroundColor: '#F9FAFB', borderRadius: normalize(14), padding: normalize(16), fontSize: normalize(15), color: colors.black, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.05)', fontWeight: '500' },
  modalSubmit:     { borderRadius: normalize(16), paddingVertical: normalize(16), alignItems: 'center', marginTop: normalize(12), marginBottom: normalize(24) },
  modalSubmitText: { color: colors.white, fontWeight: '800', fontSize: normalize(16) },

  /* ── Empty state ─────────────────────────────────────────── */
  emptyWrap:   { alignItems: 'center', paddingVertical: normalize(50), borderRadius: normalize(24), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.3)', marginTop: normalize(10) },
  emptyCircle: { width: normalize(64), height: normalize(64), borderRadius: normalize(32), backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', marginBottom: normalize(16) },
  emptyText:   { color: colors.text.secondary, fontSize: normalize(14), textAlign: 'center', fontWeight: '600' },

  /* ── WFH Approvals Card ──────────────────────────────────── */
  approvalCard:           { borderRadius: normalize(20), padding: normalize(16), marginBottom: normalize(12), backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', overflow: 'hidden' },
  approvalCardHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  approvalCardAvatarWrap: { flexDirection: 'row', alignItems: 'center' },
  approvalEmpName:        { fontSize: normalize(14), fontWeight: '800', color: colors.black },
  approvalEmpCode:        { fontSize: normalize(11), color: colors.text.secondary, fontWeight: '600', marginTop: normalize(1) },
  approvalCardDivider:    { height: 1, backgroundColor: 'rgba(0,0,0,0.06)', marginVertical: normalize(12) },
  approvalCardBody:       { gap: normalize(8) },
  approvalDateRow:        { flexDirection: 'row', alignItems: 'center', gap: normalize(6) },
  approvalDateText:       { fontSize: normalize(13), fontWeight: '700', color: colors.black },
  approvalReasonBox:      { backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: normalize(10), padding: normalize(10), marginTop: normalize(4) },
  approvalReasonLabel:    { fontSize: normalize(11), fontWeight: '700', color: colors.text.secondary, marginBottom: normalize(2) },
  approvalReasonText:     { fontSize: normalize(13), color: colors.text.primary, fontWeight: '500' },
  approvalActionsRow:     { flexDirection: 'row', gap: normalize(10), marginTop: normalize(14) },
  approvalActionBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: normalize(6), paddingVertical: normalize(10), borderRadius: normalize(12), borderWidth: 1, backgroundColor: colors.white },
  approvalActionBtnText:  { fontSize: normalize(13), fontWeight: '800' },
  rejectionTextArea:      { backgroundColor: '#F9FAFB', borderRadius: normalize(14), padding: normalize(16), fontSize: normalize(15), color: colors.black, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.05)', fontWeight: '500', height: normalize(120), textAlignVertical: 'top' },

  /* ── Rejection / Delete Confirmation Modal ───────────────── */
  rejectionOverlay:   { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)' },
  rejectionBox:       { width: SW - normalize(36), backgroundColor: colors.white, borderRadius: normalize(24), padding: normalize(20), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, overflow: 'hidden' },
  rejectionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(12) },
  rejectionTitleIcon: { flexDirection: 'row', alignItems: 'center', gap: normalize(8) },
  rejectionTitle:     { fontSize: normalize(16), fontWeight: '800', color: colors.black },
  rejectionCloseBtn:  { width: normalize(30), height: normalize(30), borderRadius: normalize(15), backgroundColor: 'rgba(0,0,0,0.04)', alignItems: 'center', justifyContent: 'center' },
  rejectionDesc:      { fontSize: normalize(12), color: colors.text.secondary, fontWeight: '500', lineHeight: normalize(18), marginBottom: normalize(14) },
  rejectionInput:     { backgroundColor: '#F9FAFB', borderRadius: normalize(14), padding: normalize(14), fontSize: normalize(14), color: colors.black, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.05)', fontWeight: '500', height: normalize(100), textAlignVertical: 'top', marginBottom: normalize(16) },
  rejectionFooter:    { flexDirection: 'row', gap: normalize(10) },
  rejectionCancelBtn: { flex: 1, paddingVertical: normalize(12), borderRadius: normalize(14), borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  rejectionCancelText: { fontSize: normalize(13), fontWeight: '700', color: colors.text.secondary },
  rejectionSubmitBtn:  { flex: 1, borderRadius: normalize(14), overflow: 'hidden' },
  rejectionSubmitGrad: { paddingVertical: normalize(12), alignItems: 'center', justifyContent: 'center' },
  rejectionSubmitText: { fontSize: normalize(13), fontWeight: '800', color: colors.white },

  /* ── Issue row ───────────────────────────────────────────── */
  issueRow: { flexDirection: 'row', flexWrap: 'wrap', gap: normalize(6) },

  /* ── Center Modal (My Corrections) ────────────────────────── */
  centerModalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: normalize(16) },
  centerModalCard:    { width: '100%', maxWidth: normalize(440), height: '82%', maxHeight: '88%', backgroundColor: colors.white, borderRadius: normalize(24), padding: normalize(20), shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 12, overflow: 'hidden' },
  centerModalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(16) },
  centerModalTitle:   { fontSize: normalize(18), fontWeight: '800', color: colors.black },
  centerModalCloseBtn:{ width: normalize(32), height: normalize(32), borderRadius: normalize(16), backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },

  /* ── Add Punch Card & Rows ────────────────────────────────── */
  addPunchCard:       { backgroundColor: '#F8FAFC', borderRadius: normalize(16), padding: normalize(14), marginBottom: normalize(14), borderWidth: 1.5, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  addPunchTitle:      { fontSize: normalize(13), fontWeight: '800', color: colors.black, marginBottom: normalize(12), letterSpacing: 0.3 },
  addPunchControls:   { flexDirection: 'row', gap: normalize(8), alignItems: 'center' },
  punchTypeSelector:  { flex: 1.1, height: normalize(42), borderRadius: normalize(12), borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: normalize(8) },
  punchTypeSelectorIn: { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.3)' },
  punchTypeSelectorOut:{ backgroundColor: 'rgba(71, 85, 105, 0.08)', borderColor: 'rgba(71, 85, 105, 0.3)' },
  punchTypeSelectText:{ fontSize: normalize(12), fontWeight: '800' },
  punchTypeSelectTextIn: { color: '#059669' },
  punchTypeSelectTextOut:{ color: '#334155' },
  timeInputBox:       { flex: 1.3, height: normalize(42), backgroundColor: colors.white, borderRadius: normalize(12), borderWidth: 1.5, borderColor: '#CBD5E1', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: normalize(10), shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
  timeInputText:      { fontSize: normalize(13), fontWeight: '800', color: colors.black },
  timeIconBadge:      { width: normalize(22), height: normalize(22), borderRadius: normalize(11), backgroundColor: 'rgba(79, 70, 229, 0.1)', alignItems: 'center', justifyContent: 'center' },
  addPunchBtnGrad:    { height: normalize(42), borderRadius: normalize(12), overflow: 'hidden', shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  addPunchBtn:        { height: '100%', paddingHorizontal: normalize(12), justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: normalize(4) },
  addPunchBtnText:    { color: colors.white, fontWeight: '800', fontSize: normalize(13) },

  punchEmptyBox:      { flexDirection: 'row', alignItems: 'center', gap: normalize(10), backgroundColor: '#F8FAFC', borderRadius: normalize(14), padding: normalize(14), marginVertical: normalize(10), borderWidth: 1.5, borderColor: '#E2E8F0' },
  punchEmptyText:     { fontSize: normalize(12), color: colors.text.secondary, fontWeight: '500', flex: 1, lineHeight: normalize(16) },

  punchListContainer: { maxHeight: normalize(210), marginVertical: normalize(10), borderRadius: normalize(14), borderWidth: 1.5, borderColor: '#E2E8F0', overflow: 'hidden', backgroundColor: '#F8FAFC' },
  punchEntryRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: normalize(14), paddingVertical: normalize(12), borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: colors.white },
  punchEntryRowIn:    { borderLeftWidth: 3.5, borderLeftColor: '#10B981' },
  punchEntryRowOut:   { borderLeftWidth: 3.5, borderLeftColor: '#64748B' },
  punchRowLeft:       { flexDirection: 'row', alignItems: 'center', gap: normalize(8) },
  punchInBadge:       { backgroundColor: 'rgba(16, 185, 129, 0.12)', paddingHorizontal: normalize(8), paddingVertical: normalize(3), borderRadius: normalize(6) },
  punchInBadgeText:   { color: '#059669', fontSize: normalize(10), fontWeight: '800' },
  punchOutBadge:      { backgroundColor: 'rgba(100, 116, 139, 0.12)', paddingHorizontal: normalize(8), paddingVertical: normalize(3), borderRadius: normalize(6) },
  punchOutBadgeText:  { color: '#334155', fontSize: normalize(10), fontWeight: '800' },
  punchTimeText:      { fontSize: normalize(13), fontWeight: '800', color: colors.black },
  punchSourceTag:     { fontSize: normalize(11), color: colors.text.muted, fontWeight: '600' },
  addedBadge:         { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: normalize(6), paddingVertical: normalize(2), borderRadius: normalize(4) },
  addedBadgeText:     { color: '#047857', fontSize: normalize(9), fontWeight: '800' },
  deletePunchBtnText: { color: colors.primary, fontSize: normalize(12), fontWeight: '700' },

  /* ── Preview Box ─────────────────────────────────────────── */
  previewContainer:   { backgroundColor: '#F8FAFC', borderRadius: normalize(16), padding: normalize(16), marginVertical: normalize(12), borderWidth: 1.5, borderColor: '#E2E8F0' },
  previewTitle:       { fontSize: normalize(11), fontWeight: '800', color: colors.text.muted, letterSpacing: 0.6, marginBottom: normalize(10) },
  previewGrid:        { flexDirection: 'row', gap: normalize(8) },
  previewCell:        { flex: 1, backgroundColor: colors.white, borderRadius: normalize(12), padding: normalize(12), alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  previewCellLabel:   { fontSize: normalize(9), fontWeight: '800', color: colors.text.secondary, textTransform: 'uppercase', marginBottom: normalize(4) },
  previewCellVal:     { fontSize: normalize(14), fontWeight: '800', color: colors.black },

  sequenceErrorBox:   { flexDirection: 'row', alignItems: 'center', gap: normalize(8), marginTop: normalize(10), backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: normalize(12), borderRadius: normalize(10), borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' },
  sequenceErrorText:  { fontSize: normalize(11), color: '#D97706', fontWeight: '700', flex: 1, lineHeight: normalize(15) },

  /* ── Digital Time Display Banner ─────────────────────────── */
  digitalTimeBanner:  { backgroundColor: '#3730A3', borderRadius: normalize(16), paddingVertical: normalize(14), paddingHorizontal: normalize(16), alignItems: 'center', justifyContent: 'center', marginBottom: normalize(16), shadowColor: '#3730A3', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  digitalTimeText:    { fontSize: normalize(26), fontWeight: '900', color: colors.white, letterSpacing: 1 },
  digitalTimeSub:     { fontSize: normalize(10), fontWeight: '800', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: normalize(2) },

  /* ── Footer Buttons ──────────────────────────────────────── */
  formFooterRow:      { flexDirection: 'row', gap: normalize(12), marginTop: normalize(6), paddingTop: normalize(12), borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: colors.white, width: '100%', alignItems: 'center' },
  formCancelBtn:      { flex: 1, height: normalize(46), borderRadius: normalize(14), borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  formCancelBtnText:  { color: colors.primary, fontWeight: '800', fontSize: normalize(14) },
  formSubmitBtnGrad:  { flex: 1, height: normalize(46), borderRadius: normalize(14), overflow: 'hidden', shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  formSubmitBtn:      { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: normalize(14) },
  formSubmitBtnDisabled: { opacity: 0.55 },
  formSubmitBtnText:  { color: colors.white, fontWeight: '800', fontSize: normalize(14) },
});

export default s;
