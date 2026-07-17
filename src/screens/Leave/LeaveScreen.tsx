import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../hooks/useRedux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, Layout, useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Calendar } from 'react-native-calendars';
import {
  useLeaveSummaryQuery,
  useLeaveRequestsQuery,
  useApplyLeaveMutation,
  useApproveRejectLeaveMutation,
} from '../../hooks/useQueries';
import colors from '../../theme/color';
import { Typography } from '../../components/Typography';
import {
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarRange,
  ChevronDown,
  TrendingUp,
  FileText,
  UploadCloud,
  Search,
  Filter,
  LayoutDashboard,
  CalendarDays,
  Wallet,
} from 'lucide-react-native';
import moment from 'moment';
import { normalize, screenWidth } from '../../utils/responsive';
import CustomHeader from '../../components/Header';
import CustomButton from '../../components/Button';
import CustomInput from '../../components/Input';
import SelectDropdown from '../../components/Dropdown';
import { DetailedLeaveBalance } from '../../api/leaveApi';

export const LeaveScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);
  const userRole = (user as any)?.role || 'developer';

  // Navigation State
  const [activeTab, setActiveTab] = useState<'individual' | 'management'>('individual');
  const [dashboardView, setDashboardView] = useState<'overview' | 'calendar'>('overview');

  // Modal State
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState<'start' | 'end' | null>(null);
  const [tempDate, setTempDate] = useState('');

  // Form State
  const [leaveType, setLeaveType] = useState('Casual Leave (CL)');
  const [dayType, setDayType] = useState('Full Day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Accordion State
  const [activityExpanded, setActivityExpanded] = useState(false);
  const activityExpandedShared = useSharedValue(0);

  const toggleActivity = async () => {
    await Haptics.selectionAsync();
    setActivityExpanded(!activityExpanded);
    activityExpandedShared.value = activityExpanded ? 0 : 1;
  };

  const marginTopVal = normalize(16);
  const paddingTopVal = normalize(12);

  const activityStyle = useAnimatedStyle(() => ({
    maxHeight: withTiming(activityExpandedShared.value ? 200 : 0, { duration: 300 }),
    opacity: withTiming(activityExpandedShared.value ? 1 : 0, { duration: 250 }),
    marginTop: withTiming(activityExpandedShared.value ? marginTopVal : 0, { duration: 300 }),
    paddingTop: withTiming(activityExpandedShared.value ? paddingTopVal : 0, { duration: 300 }),
  }));

  // TanStack Query Hooks
  const { data: summaryResponse, isLoading: isSummaryLoading } = useLeaveSummaryQuery();
  const { data: requests = [], isLoading: isReqLoading } = useLeaveRequestsQuery('my'); // Only fetching 'my' leaves for the Management tab based on screenshot
  
  const { mutateAsync: applyLeave, isPending: isSubmitting } = useApplyLeaveMutation();

  const handleApplyLeave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!startDate || !endDate || !reason) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    try {
      const totalDays = moment(endDate).diff(moment(startDate), 'days') + 1;
      await applyLeave({
        leave_type: leaveType as any,
        start_date: startDate,
        end_date: endDate,
        reason,
        total_days: totalDays,
        status: 'Pending',
        employee_name: `${user?.first_name} ${user?.last_name}`,
        employee_role: userRole,
      });
      setIsApplyModalVisible(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error(e);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return colors.success;
      case 'Cancelled': return colors.text.muted;
      case 'Rejected': return colors.error;
      default: return colors.warning;
    }
  };

  // --- UI COMPONENTS ---

  const renderTopTabs = () => (
    <View style={s.topTabsWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.topTabsScroll}>
        <TouchableOpacity style={[s.topTab, activeTab === 'individual' && s.topTabActive]} onPress={() => { Haptics.selectionAsync(); setActiveTab('individual'); }}>
          <Typography style={[s.topTabText, activeTab === 'individual' && s.topTabTextActive]}>Individual Dashboard</Typography>
        </TouchableOpacity>
        <TouchableOpacity style={[s.topTab, activeTab === 'management' && s.topTabActive]} onPress={() => { Haptics.selectionAsync(); setActiveTab('management'); }}>
          <Typography style={[s.topTabText, activeTab === 'management' && s.topTabTextActive]}>My Leaves</Typography>
        </TouchableOpacity>
      </ScrollView>
      <View style={s.topTabsDivider} />
    </View>
  );

  const renderSubTabs = () => (
    <View style={s.subTabsWrapper}>
      <Typography variant="h2" style={s.pageTitle}>Leave Overview</Typography>
      <View style={[s.subTabsGroup, { padding: 4 }]}>
        <TouchableOpacity style={[s.subTab, dashboardView === 'overview' && s.subTabActive, { paddingVertical: 8, paddingHorizontal: 24 }]} onPress={() => { Haptics.selectionAsync(); setDashboardView('overview'); }}>
          <LayoutDashboard size={18} color={dashboardView === 'overview' ? colors.primary : colors.text.muted} />
        </TouchableOpacity>
        <TouchableOpacity style={[s.subTab, dashboardView === 'calendar' && s.subTabActive, { paddingVertical: 8, paddingHorizontal: 24 }]} onPress={() => { Haptics.selectionAsync(); setDashboardView('calendar'); }}>
          <CalendarDays size={18} color={dashboardView === 'calendar' ? colors.primary : colors.text.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOverviewHeroCards = () => {
    if (isSummaryLoading || !summaryResponse) return <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />;
    const { metrics } = summaryResponse;
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statScroll}>
        <BlurView intensity={50} tint="light" style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: colors.text.muted + '18' }]}><CalendarRange size={normalize(18)} color={colors.text.muted} /></View>
          <Typography style={[s.statValue, { color: colors.text.primary }]}>{metrics.totalAvailable.toFixed(1)}</Typography>
          <Typography style={s.statLabel} numberOfLines={2}>Available</Typography>
        </BlurView>
        <BlurView intensity={50} tint="light" style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: colors.success + '18' }]}><TrendingUp size={normalize(18)} color={colors.success} /></View>
          <Typography style={[s.statValue, { color: colors.success }]}>{metrics.usedThisYear.toFixed(1)}</Typography>
          <Typography style={s.statLabel} numberOfLines={2}>Used (YTD)</Typography>
        </BlurView>
        <BlurView intensity={50} tint="light" style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: colors.warning + '18' }]}><Clock size={normalize(18)} color={colors.warning} /></View>
          <Typography style={[s.statValue, { color: colors.warning }]}>{metrics.totalPending.toFixed(1)}</Typography>
          <Typography style={s.statLabel} numberOfLines={2}>Pending</Typography>
        </BlurView>
        <BlurView intensity={50} tint="light" style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: colors.primary + '18' }]}><CheckCircle2 size={normalize(18)} color={colors.primary} /></View>
          <Typography style={[s.statValue, { color: colors.primary }]}>{metrics.approvedThisMonth}</Typography>
          <Typography style={s.statLabel} numberOfLines={2}>Approved</Typography>
        </BlurView>
      </ScrollView>
    );
  };

  const renderBalanceCard = (bal: DetailedLeaveBalance, index: number) => (
    <Animated.View key={bal.code} entering={FadeInDown.delay(index * 100).springify()}>
      <BlurView intensity={50} tint="light" style={[s.balanceCard, { padding: normalize(20), borderRadius: normalize(24), backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', marginBottom: normalize(16), overflow: 'hidden' }]}>
        <View style={s.bcHeader}>
          <View>
            <Typography style={s.bcTitle}>{bal.name}</Typography>
            <View style={s.bcTags}>
              <View style={s.bcTag}><Typography style={s.bcTagText}>{bal.code}</Typography></View>
              <View style={[s.bcTag, { backgroundColor: bal.isPaid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
                <Typography style={[s.bcTagText, { color: bal.isPaid ? colors.success : colors.warning }]}>{bal.isPaid ? 'PAID' : 'UNPAID'}</Typography>
              </View>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {bal.code === 'LWP' ? (
              <Typography variant="h1" style={[s.bcAvailable, { color: colors.primary }]}>∞</Typography>
            ) : (
              <Typography variant="h2" style={[s.bcAvailable, { color: colors.primary }]}>{bal.available.toFixed(2)}</Typography>
            )}
            <Typography style={s.bcAvailableSub}>AVAILABLE</Typography>
          </View>
        </View>
        
        <View style={s.bcMetricsRow}>
          <View style={s.bcMetric}><Typography style={s.bcMetricTitle}>ACCRUED</Typography><Typography style={s.bcMetricVal}>{bal.accrued.toFixed(2)}</Typography></View>
          <View style={s.bcMetric}><Typography style={s.bcMetricTitle}>ENTITLED</Typography><Typography style={s.bcMetricVal}>{bal.entitled.toFixed(2)}</Typography></View>
          <View style={[s.bcMetric, s.bcMetricHighlight, { backgroundColor: 'rgba(245,158,11,0.05)' }]}><Typography style={[s.bcMetricTitle, { color: colors.warning }]}>PENDING</Typography><Typography style={[s.bcMetricVal, { color: colors.warning }]}>{bal.pending.toFixed(2)}</Typography></View>
          <View style={[s.bcMetric, s.bcMetricHighlight, { backgroundColor: 'rgba(239,68,68,0.05)' }]}><Typography style={[s.bcMetricTitle, { color: colors.error }]}>USED</Typography><Typography style={[s.bcMetricVal, { color: colors.error }]}>{bal.used.toFixed(2)}</Typography></View>
          <View style={s.bcMetric}><Typography style={s.bcMetricTitle}>ADJUSTED</Typography><Typography style={s.bcMetricVal}>{bal.adjusted.toFixed(2)}</Typography></View>
        </View>
      </BlurView>
    </Animated.View>
  );

  const renderIndividualDashboard = () => (
    <Animated.View style={{ flex: 1 }} entering={FadeInDown.duration(300)}>
      {renderSubTabs()}
      
      {dashboardView === 'overview' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {renderOverviewHeroCards()}
          
          <View style={s.sectionHeader}>
            <Typography style={s.sectionTitle}>Leave Balances — {moment().format('YYYY')}</Typography>
          </View>
          
          {isSummaryLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            summaryResponse?.balances.map((b, i) => renderBalanceCard(b, i))
          )}

          <View style={s.recentActivityRow}>
            <Typography style={s.sectionTitle}>Recent Activity</Typography>
          </View>
          
          <TouchableOpacity activeOpacity={0.8} onPress={toggleActivity}>
            <BlurView intensity={50} tint="light" style={s.activityCard}>
              <View style={s.activityHeader}>
                <View style={s.activityIcon}><XCircle size={16} color={colors.text.muted} /></View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Typography style={s.activityTitle}>Early Leave</Typography>
                  <View style={s.statusTag}><Typography style={s.statusTagText}>Cancelled</Typography></View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <CalendarRange size={12} color={colors.primary} />
                    <Typography style={s.activityMeta}>06 Jul — 06 Jul, 2026</Typography>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color={colors.primary} />
                    <Typography style={s.activityMeta}>1.00 Day</Typography>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                {activityExpanded ? <ChevronDown size={20} color={colors.text.muted} style={{ transform: [{ rotate: '180deg' }] }} /> : <ChevronDown size={20} color={colors.text.muted} />}
              </View>
            </View>
            
            <Animated.View style={[s.activityReason, activityStyle, { borderTopWidth: activityExpanded ? 1 : 0, borderTopColor: 'rgba(0,0,0,0.05)' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <FileText size={12} color={colors.text.muted} />
                <Typography style={s.activityReasonTitle}>LEAVE REASON</Typography>
              </View>
              <Typography style={s.activityReasonText}>
                Requesting early leave due to a sudden family medical emergency. My grandfather's health has unexpectedly deteriorated, and I need to accompany him to the hospital as there is no one else available to assist him.
              </Typography>
              </Animated.View>
            </BlurView>
          </TouchableOpacity>

        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content}>
           <BlurView intensity={60} tint="light" style={s.calendarWrapper}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingRight: normalize(16), paddingTop: normalize(16), gap: normalize(4) }}>
               <Typography style={{ fontSize: normalize(12), color: colors.success, fontWeight: '700' }}>
                 {requests.filter(r => r.status === 'Approved').length} approved
               </Typography>
               <Typography style={{ fontSize: normalize(12), color: colors.text.muted, fontWeight: '700', marginHorizontal: 2 }}>·</Typography>
               <Typography style={{ fontSize: normalize(12), color: colors.warning, fontWeight: '700' }}>
                 {requests.filter(r => r.status === 'Pending').length} pending
               </Typography>
            </View>

            <Calendar
              current={moment().format('YYYY-MM-DD')}
              markedDates={requests.reduce((acc: any, curr) => {
                const isApproved = curr.status === 'Approved';
                const color = isApproved ? colors.success : colors.warning;
                acc[curr.start_date] = { 
                  customStyles: { 
                    container: { backgroundColor: color + '18', borderRadius: normalize(8) },
                    text: { color: color, fontWeight: '800' }
                  } 
                };
                return acc;
              }, {})}
              markingType={'custom'}
              theme={{
                calendarBackground: 'transparent',
                textSectionTitleColor: colors.text.muted,
                todayTextColor: colors.primary,
                dayTextColor: colors.black,
                textDisabledColor: colors.text.light,
                arrowColor: colors.primary,
                monthTextColor: colors.black,
                textMonthFontWeight: '800',
                textDayHeaderFontWeight: '700',
              }}
            />
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', padding: normalize(16), gap: normalize(12), borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' }}>
               <Typography style={{ fontSize: normalize(11), color: colors.text.primary, fontWeight: '700' }}>Status:</Typography>
               
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
                  <Typography style={{ fontSize: normalize(11), color: colors.text.secondary }}>Approved</Typography>
               </View>
               
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.warning }} />
                  <Typography style={{ fontSize: normalize(11), color: colors.text.secondary }}>Pending TL</Typography>
               </View>
               
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' }} />
                  <Typography style={{ fontSize: normalize(11), color: colors.text.secondary }}>Pending HR</Typography>
               </View>
               
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error }} />
                  <Typography style={{ fontSize: normalize(11), color: colors.text.secondary }}>Rejected</Typography>
               </View>
               
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.text.muted }} />
                  <Typography style={{ fontSize: normalize(11), color: colors.text.secondary }}>Cancelled</Typography>
               </View>
               
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: normalize(6) }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#EA580C' }} />
                  <Typography style={{ fontSize: normalize(11), color: colors.text.secondary }}>Public Holiday</Typography>
               </View>
            </View>
          </BlurView>
        </ScrollView>
      )}
    </Animated.View>
  );

  const renderManagementTab = () => (
    <Animated.View style={{ flex: 1 }} entering={FadeInDown.duration(300)}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.mgtHeader}>
          <View style={{ flex: 1 }}>
            <Typography variant="h2" style={s.pageTitle}>Leave Management</Typography>
            <Typography style={s.pageSubtitle}>Manage your leave requests and balances.</Typography>
          </View>
          <TouchableOpacity activeOpacity={0.8} onPress={async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsApplyModalVisible(true); }} style={s.mgtApplyBtn}>
            <LinearGradient colors={colors.loginButtonBgGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.mgtApplyGrad}>
              <Plus size={16} color={colors.white} />
              <Typography style={s.mgtApplyText}>Apply Leave</Typography>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statScroll}>
          <BlurView intensity={50} tint="light" style={s.statCard}>
            <View style={[s.statIconWrap, { backgroundColor: colors.text.muted + '18' }]}><FileText size={normalize(18)} color={colors.text.muted} /></View>
            <Typography style={[s.statValue, { color: colors.text.primary }]}>1</Typography>
            <Typography style={s.statLabel} numberOfLines={2}>Requests</Typography>
          </BlurView>
          <BlurView intensity={50} tint="light" style={s.statCard}>
            <View style={[s.statIconWrap, { backgroundColor: colors.success + '18' }]}><CheckCircle2 size={normalize(18)} color={colors.success} /></View>
            <Typography style={[s.statValue, { color: colors.success }]}>0</Typography>
            <Typography style={s.statLabel} numberOfLines={2}>Approved</Typography>
          </BlurView>
          <BlurView intensity={50} tint="light" style={s.statCard}>
            <View style={[s.statIconWrap, { backgroundColor: colors.error + '18' }]}><XCircle size={normalize(18)} color={colors.error} /></View>
            <Typography style={[s.statValue, { color: colors.error }]}>0</Typography>
            <Typography style={s.statLabel} numberOfLines={2}>Rejected</Typography>
          </BlurView>
          <BlurView intensity={50} tint="light" style={s.statCard}>
            <View style={[s.statIconWrap, { backgroundColor: colors.warning + '18' }]}><Clock size={normalize(18)} color={colors.warning} /></View>
            <Typography style={[s.statValue, { color: colors.warning }]}>0</Typography>
            <Typography style={s.statLabel} numberOfLines={2}>Pending</Typography>
          </BlurView>
        </ScrollView>

        <View style={s.filterRow}>
          <View style={s.searchBox}>
            <Search size={16} color={colors.text.muted} />
            <TextInput placeholder="Search..." style={s.searchInput} placeholderTextColor={colors.text.light} />
          </View>
          <TouchableOpacity style={s.filterBtn}>
            <Filter size={16} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Request List (Mobile optimized cards matching Attendance history style) */}
        {requests.map((req, i) => (
          <TouchableOpacity activeOpacity={0.8} key={req.id}>
            <BlurView intensity={50} tint="light" style={s.activityCard}>
              <View style={s.activityHeader}>
                <View style={s.activityIcon}><CalendarRange size={16} color={colors.primary} /></View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Typography style={s.activityTitle}>{req.leave_type} Leave</Typography>
                  <View style={[s.statusTag, { backgroundColor: getStatusColor(req.status) + '15' }]}>
                    <Typography style={[s.statusTagText, { color: getStatusColor(req.status) }]}>{req.status}</Typography>
                  </View>
                </View>
                <View style={{ gap: 4, marginTop: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CalendarRange size={12} color={colors.text.muted} />
                    <Typography style={s.activityMeta}>{req.start_date} — {req.end_date}</Typography>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Clock size={12} color={colors.text.muted} />
                    <Typography style={s.activityMeta}>{req.total_days.toFixed(2)} Day(s)</Typography>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Typography style={s.activityApplied}>ID</Typography>
                <Typography style={s.activityAppliedVal}>#{req.id}</Typography>
              </View>
            </View>
            <View style={[s.activityReason, { marginTop: normalize(16), paddingTop: normalize(12), borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <FileText size={12} color={colors.text.muted} />
                <Typography style={s.activityReasonTitle}>REASON</Typography>
              </View>
              <Typography style={s.activityReasonText} numberOfLines={2}>
                {req.reason}
              </Typography>
            </View>
            </BlurView>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </Animated.View>
  );

  const renderApplyModal = () => {

    const isSameDate = startDate === endDate && startDate !== '';
    const selectedDays = startDate && endDate ? moment(endDate).diff(moment(startDate), 'days') + 1 : 0;
    
    // Mock balances based on screenshot
    const availableBalance = 2.50; 
    const usedBalance = 0.00;
    const isOverBalance = selectedDays > availableBalance;

    return (
      <Modal visible={isApplyModalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <Animated.View entering={FadeInUp.springify()} style={[s.modalContent, { paddingBottom: insets.bottom || 24, position: 'relative' }]}>
            
            {/* The Date Picker Overlay (Avoids nested Modals which break on iOS) */}
            {activeDatePicker && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.white, borderRadius: normalize(24), zIndex: 100 }]}>
                <View style={s.modalHeaderRow}>
                  <Typography variant="h3" style={s.modalTitle}>
                    Select {activeDatePicker === 'start' ? 'From Date' : 'To Date'}
                  </Typography>
                  <TouchableOpacity onPress={() => { setActiveDatePicker(null); setTempDate(''); }} style={s.modalCloseBtn}>
                    <XCircle size={24} color={colors.text.muted} />
                  </TouchableOpacity>
                </View>
                <View style={[s.calendarWrapper, { marginHorizontal: normalize(24), marginVertical: normalize(16), borderWidth: 0 }]}>
                  <Calendar
                    current={tempDate || (activeDatePicker === 'start' ? startDate : endDate) || moment().format('YYYY-MM-DD')}
                    markedDates={{
                      [tempDate || (activeDatePicker === 'start' ? startDate : endDate)]: { selected: true, selectedColor: colors.primary, selectedTextColor: colors.white }
                    }}
                    onDayPress={(day: any) => setTempDate(day.dateString)}
                    theme={{
                      calendarBackground: 'transparent',
                      textSectionTitleColor: colors.text.muted,
                      todayTextColor: colors.primary,
                      dayTextColor: colors.text.primary,
                      textDisabledColor: 'rgba(0,0,0,0.1)',
                      monthTextColor: colors.text.primary,
                      textDayFontFamily: 'DMSans-Medium',
                      textMonthFontFamily: 'DMSans-Bold',
                      textDayHeaderFontFamily: 'DMSans-Medium',
                    }}
                  />
                </View>
                <View style={[s.modalFooter, { marginTop: 'auto' }]}>
                   <TouchableOpacity style={s.cancelBtn} onPress={() => { setActiveDatePicker(null); setTempDate(''); }}>
                     <Typography style={s.cancelBtnText}>Cancel</Typography>
                   </TouchableOpacity>
                   <TouchableOpacity style={[s.submitBtn, !tempDate && { opacity: 0.5 }]} onPress={() => {
                     if (activeDatePicker === 'start') setStartDate(tempDate);
                     else setEndDate(tempDate);
                     setActiveDatePicker(null);
                     setTempDate('');
                   }} disabled={!tempDate}>
                     <Typography style={s.submitBtnText}>OK</Typography>
                   </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={s.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View style={s.modalIconBg}><CalendarRange size={20} color={colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Typography variant="h3" style={s.modalTitle}>Apply for Leave</Typography>
                  <Typography style={[s.modalSub, { flexWrap: 'wrap' }]}>Your request will be sent to your reporting manager for approval.</Typography>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsApplyModalVisible(false)} style={s.modalCloseBtn}>
                <XCircle size={24} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={s.modalScroll} 
              contentContainerStyle={{ paddingBottom: normalize(80) }}
              showsVerticalScrollIndicator={false}
            >
              
              <View style={s.inputGroup}>
                <SelectDropdown
                  label="Leave Type"
                  required
                  placeholder="Select leave type..."
                  options={[
                    { id: 'Casual Leave (CL)', label: 'Casual Leave (CL)' },
                    { id: 'Compensatory leave (OT)', label: 'Compensatory leave (OT) — 0 Balance', disabled: true },
                    { id: 'Early Leave (EL)', label: 'Early Leave (EL)' },
                    { id: 'Leave Without Pay (LWP)', label: 'Leave Without Pay (LWP)' },
                    { id: 'Sick Leave (SL)', label: 'Sick Leave (SL)' },
                  ] as any}
                  value={leaveType}
                  onChange={(val) => setLeaveType(val as string)}
                />
              </View>

              <View style={s.balanceInfoBox}>
                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <FileText size={16} color={colors.text.primary} />
                    <Typography style={s.balanceInfoLabel}>Available balance</Typography>
                    <Typography style={s.balanceInfoSub}>(Used: {usedBalance.toFixed(2)})</Typography>
                 </View>
                 <View style={s.balanceInfoTag}>
                    <Typography style={s.balanceInfoTagText}>{availableBalance} days</Typography>
                 </View>
              </View>

              <View style={s.dividerContainer}><View style={s.dividerLine} /><Typography style={s.dividerText}>Duration</Typography><View style={s.dividerLine} /></View>

              <View style={s.rowInputs}>
                <View style={[s.inputGroup, { flex: 1 }]}>
                  <Typography style={s.inputLabel}>FROM DATE <Typography style={{ color: colors.error }}>*</Typography></Typography>
                  <TouchableOpacity style={s.inputWrapper} onPress={() => { setTempDate(startDate); setActiveDatePicker('start'); }}>
                    <TextInput style={s.modalInputWithIcon} placeholder="Select Date" value={startDate ? moment(startDate).format('MMM DD, YYYY') : ''} editable={false} pointerEvents="none" />
                    <CalendarRange size={16} color={colors.text.muted} style={s.inputIconRight} />
                  </TouchableOpacity>
                </View>
                <View style={[s.inputGroup, { flex: 1 }]}>
                  <Typography style={s.inputLabel}>TO DATE <Typography style={{ color: colors.error }}>*</Typography></Typography>
                  <TouchableOpacity style={s.inputWrapper} onPress={() => { setTempDate(endDate); setActiveDatePicker('end'); }}>
                    <TextInput style={s.modalInputWithIcon} placeholder="Select Date" value={endDate ? moment(endDate).format('MMM DD, YYYY') : ''} editable={false} pointerEvents="none" />
                    <CalendarRange size={16} color={colors.text.muted} style={s.inputIconRight} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: normalize(16) }}>
                <Clock size={12} color={colors.text.muted} />
                <Typography style={s.inputHelpText}>Weekends & public holidays are automatically excluded from the day count</Typography>
              </View>

              <View style={s.rowInputs}>
                <View style={[s.inputGroup, { flex: 1 }]}>
                  <Typography style={s.inputLabel}>No. of Days</Typography>
                  <View style={s.inputWrapper}>
                    <CalendarRange size={16} color={colors.text.muted} style={s.inputIconLeft} />
                    <TextInput style={[s.modalInputDisabled, { paddingLeft: 36 }]} value={selectedDays ? `${selectedDays} days` : ''} editable={false} />
                  </View>
                </View>
                <View style={[s.inputGroup, { flex: 1 }]}>
                  {isSameDate ? (
                    <SelectDropdown
                      label="Day Type"
                      options={[
                        { id: 'Full Day', label: 'Full Day' },
                        { id: 'First Half', label: 'First Half' },
                        { id: 'Second Half', label: 'Second Half' },
                      ]}
                      value={dayType}
                      onChange={(val) => setDayType(val as string)}
                    />
                  ) : (
                    <>
                      <Typography style={s.inputLabel}>Day Type</Typography>
                      <TextInput style={s.modalInputDisabled} value="Full Day" editable={false} />
                      <Typography style={[s.inputHelpText, { marginTop: 4 }]}>Half-day: select same From & To date</Typography>
                    </>
                  )}
                </View>
              </View>
              
              {isOverBalance && (
                <Typography style={{ color: colors.error, fontSize: normalize(12), marginTop: normalize(-8), marginBottom: normalize(16) }}>
                  Warning: You have requested {selectedDays} days but your balance is only {availableBalance} days.
                </Typography>
              )}

              {selectedDays > 0 && (
                <View style={s.appSummaryBox}>
                  <Typography style={s.appSummaryTitle}>APPLICATION SUMMARY</Typography>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: normalize(12) }}>
                    <View style={{ alignItems: 'center' }}>
                      <Typography style={s.appSummaryLabel}>Leave Type</Typography>
                      <Typography style={s.appSummaryValue}>CL</Typography>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Typography style={s.appSummaryLabel}>Days Requested</Typography>
                      <Typography style={s.appSummaryValue}>{selectedDays}</Typography>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Typography style={s.appSummaryLabel}>Balance After</Typography>
                      <Typography style={[s.appSummaryValue, { color: isOverBalance ? colors.error : colors.warning }]}>
                        {Math.max(availableBalance - selectedDays, 0)} days
                      </Typography>
                    </View>
                  </View>
                </View>
              )}

              <View style={s.dividerContainer}><View style={s.dividerLine} /><Typography style={s.dividerText}>Details</Typography><View style={s.dividerLine} /></View>

              <View style={s.inputGroup}>
                <Typography style={s.inputLabel}>Reason <Typography style={{ color: colors.error }}>*</Typography></Typography>
                <TextInput 
                  style={[s.modalInput, { height: 100, textAlignVertical: 'top' }]} 
                  placeholder="Describe the reason for leave..." 
                  multiline 
                  value={reason} 
                  onChangeText={setReason} 
                />
                <Typography style={s.inputHelpText}>0/500 characters</Typography>
              </View>

              <View style={s.inputGroup}>
                <Typography style={s.inputLabel}>ATTACHMENT (optional · PDF / JPG / PNG · max 5 MB)</Typography>
                <TouchableOpacity style={s.uploadBox} activeOpacity={0.7}>
                  <UploadCloud size={24} color={colors.text.muted} />
                  <Typography style={s.uploadTitle}>Click to upload</Typography>
                  <Typography style={s.uploadSub}>PDF, JPG or PNG up to 5 MB</Typography>
                </TouchableOpacity>
              </View>

            </ScrollView>

            <View style={s.modalFooter}>
               <TouchableOpacity style={s.cancelBtn} onPress={() => setIsApplyModalVisible(false)}>
                 <Typography style={s.cancelBtnText}>Cancel</Typography>
               </TouchableOpacity>
               <TouchableOpacity style={s.submitBtn} onPress={handleApplyLeave}>
                 {isSubmitting ? <ActivityIndicator color={colors.white} /> : <Typography style={s.submitBtnText}>Submit Request</Typography>}
               </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={s.container}>
      <LinearGradient colors={['#F0F8FF', '#E6F0FA', '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <CustomHeader variant={{ type: 'basic', title: 'Leave' }} />
      
      {renderTopTabs()}

      {activeTab === 'individual' ? renderIndividualDashboard() : renderManagementTab()}

      {/* Apply Leave FAB removed from Individual Dashboard Overview as per user request */}

      {renderApplyModal()}
    </View>
  );
};

const s = StyleSheet.create({
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

  // Stat Cards (Attendance Style)
  statScroll: { paddingHorizontal: normalize(16), paddingBottom: normalize(16), paddingTop: normalize(16), gap: normalize(12) },
  statCard: { borderRadius: normalize(20), padding: normalize(16), alignItems: 'center', width: normalize(110), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  statIconWrap: { width: normalize(36), height: normalize(36), borderRadius: normalize(18), alignItems: 'center', justifyContent: 'center', marginBottom: normalize(8) },
  statValue: { fontSize: normalize(20), fontWeight: '800', marginBottom: normalize(2) },
  statLabel: { fontSize: normalize(11), color: colors.text.muted, fontWeight: '600', textAlign: 'center', lineHeight: normalize(14) },

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
  
  bcMetricsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: normalize(12), padding: normalize(12) },
  bcMetric: { alignItems: 'center', flex: 1, paddingVertical: normalize(4) },
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
  mgtHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: normalize(20) },
  mgtApplyBtn: { overflow: 'hidden', borderRadius: normalize(12) },
  mgtApplyGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: normalize(16), height: normalize(44), gap: normalize(8) },
  mgtApplyText: { fontSize: normalize(14), fontWeight: '700', color: colors.white },
  mgtStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: normalize(12), marginBottom: normalize(24) },
  mgtStatCard: { width: (screenWidth - normalize(44)) / 2, backgroundColor: colors.white, padding: normalize(16), borderRadius: normalize(12), borderWidth: 1 },
  mgtStatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(12) },
  mgtStatTitle: { fontSize: normalize(10), fontWeight: '800', color: colors.primary, letterSpacing: 0.5 },
  mgtStatVal: { fontSize: normalize(28), fontWeight: '800', color: colors.black },
  mgtStatSub: { fontSize: normalize(12), color: colors.text.muted, marginTop: normalize(2) },

  filterRow: { flexDirection: 'row', gap: normalize(12), marginBottom: normalize(16) },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, paddingHorizontal: normalize(12), height: normalize(44), borderRadius: normalize(12), borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  searchInput: { flex: 1, marginLeft: normalize(8), fontSize: normalize(14), color: colors.text.primary },
  filterBtn: { width: normalize(44), height: normalize(44), backgroundColor: colors.white, borderRadius: normalize(12), borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },

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
  fabWrap: { position: 'absolute', bottom: normalize(24), left: normalize(24), right: normalize(24) },
  fab: { overflow: 'hidden', borderRadius: normalize(16), shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  fabGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: normalize(16), gap: normalize(8) },
  fabText: { color: colors.white, fontSize: normalize(16), fontWeight: '700' },

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
  inputHelpText: { fontSize: normalize(11), color: colors.text.light, marginTop: normalize(4) },

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
});
