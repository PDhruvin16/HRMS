import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAppSelector } from '../../hooks/useRedux';
import colors from '../../theme/color';
import { Typography } from '../../components/Typography';
import {
  Clock,
  Calendar,
  Star,
  Wallet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Home,
  Check,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
} from 'lucide-react-native';
import moment from 'moment';
import { normalize, screenWidth } from '../../utils/responsive';
import CustomHeader from '../../components/Header';

export const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);
  
  const todayDate = moment().format('YYYY-MM-DD');
  const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');

  // Static placeholders (API calls disabled for Dashboard)
  const attendanceStatus = { isCheckedIn: false, checkInTime: '--:--' };
  const leaveSummary = {
    balances: [
      { code: 'CL', available: 2.5 },
      { code: 'EL', available: 3 },
      { code: 'SL', available: 2 },
      { code: 'OT', available: 0 }
    ]
  };
  const attSummary = { totalWorking: '0h 0m' };
  const isAttLoading = false;
  const isLeaveLoading = false;
  const isSummaryLoading = false;

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderIconWrap}>
        <Icon size={normalize(16)} color={colors.white} />
      </View>
      <Typography variant="h3" style={styles.sectionHeaderTitle}>{title}</Typography>
    </View>
  );

  const GridCard = ({ title, subtitle, value, valueColor, icon: Icon, badgeText, badgeColor, isPrimary }: any) => {
    const content = (
      <>
        {/* Widget Watermark */}
        {Icon && (
          <View style={{ position: 'absolute', right: -normalize(20), bottom: -normalize(20), opacity: isPrimary ? 0.15 : 0.04, transform: [{ scale: 1.5 }] }}>
            <Icon size={normalize(100)} color={isPrimary ? colors.white : colors.primary} />
          </View>
        )}
        <View style={styles.gridCardHeader}>
          <Typography style={[styles.gridCardTitle, isPrimary && { color: 'rgba(255,255,255,0.85)' }]}>{title}</Typography>
          {Icon && (
            <View style={[styles.iconFloat, isPrimary && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Icon size={normalize(14)} color={isPrimary ? colors.white : colors.text.secondary} />
            </View>
          )}
        </View>
        {badgeText ? (
          <View style={[styles.badge, { backgroundColor: badgeColor }, isPrimary && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', shadowColor: badgeColor, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4 }]}>
            {badgeText === 'Present' || badgeText === 'On Time' ? (
              <Check size={normalize(12)} color={colors.white} style={{ marginRight: normalize(4) }} />
            ) : null}
            <Typography style={styles.badgeText}>{badgeText}</Typography>
          </View>
        ) : (
          <Typography style={[styles.gridCardValue, valueColor && { color: valueColor }, isPrimary && { color: colors.white }]}>
            {value}
          </Typography>
        )}
        {subtitle && <Typography style={[styles.gridCardSubtitle, isPrimary && { color: 'rgba(255,255,255,0.8)' }]}>{subtitle}</Typography>}
      </>
    );

    if (isPrimary) {
      return (
        <View style={[styles.gridCard, { padding: 0, borderWidth: 0, shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 }]}>
          <LinearGradient
            colors={[colors.primary, '#4C1D95']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ flex: 1, padding: normalize(20), position: 'relative', overflow: 'hidden' }}
          >
            {content}
          </LinearGradient>
        </View>
      );
    }

    return (
      <BlurView intensity={90} tint="light" style={[styles.gridCard, { padding: normalize(20), borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, position: 'relative', overflow: 'hidden' }]}>
        {content}
      </BlurView>
    );
  };

  const StatBox = ({ title, value, subtitle, icon: Icon, iconColor, bgTint }: any) => (
    <BlurView intensity={90} tint="light" style={[styles.gridCard, { padding: normalize(20), borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, position: 'relative', overflow: 'hidden' }]}>
      {/* Watermark */}
      {Icon && (
        <View style={{ position: 'absolute', right: -normalize(15), bottom: -normalize(15), opacity: 0.05, transform: [{ scale: 1.2 }] }}>
          <Icon size={normalize(80)} color={iconColor} />
        </View>
      )}
      <View style={styles.gridCardHeader}>
        <Typography style={[styles.gridCardTitle, { color: iconColor, fontWeight: '900' }]}>{title}</Typography>
        {Icon && (
          <View style={[styles.iconFloat, { backgroundColor: bgTint }]}>
            <Icon size={normalize(16)} color={iconColor} />
          </View>
        )}
      </View>
      <Typography style={styles.gridCardValue}>{value}</Typography>
      <Typography style={styles.gridCardSubtitle}>{subtitle}</Typography>
    </BlurView>
  );

  const LeaveBar = ({ label, days, color }: any) => {
    // Add opacity to hex color for track background
    const trackColor = color + '25'; 
    return (
      <View style={styles.leaveBarContainer}>
        <View style={styles.leaveBarHeader}>
          <Typography style={styles.leaveBarLabel}>{label}</Typography>
          <Typography style={[styles.leaveBarValue, { color }]}>{days} days</Typography>
        </View>
        <View style={[styles.leaveBarTrack, { backgroundColor: trackColor }]}>
          <Animated.View entering={FadeInDown.delay(400).springify()} style={[styles.leaveBarFill, { backgroundColor: color, width: days > 0 ? '40%' : '0%' }]} />
        </View>
      </View>
    );
  };

  const WideCard = ({ title, children }: any) => (
    <BlurView intensity={90} tint="light" style={[styles.wideCard, { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={styles.wideCardHeader}>
        <Typography style={styles.wideCardTitle}>{title}</Typography>
        <ChevronRight size={normalize(18)} color={colors.text.muted} />
      </View>
      <View style={styles.wideCardBody}>
        {children}
      </View>
    </BlurView>
  );

  const getGreeting = () => {
    const hour = moment().hour();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      {/* Modern Gradient Background */}
      <LinearGradient
        colors={['#F8FAFC', '#EEF2FF', '#F5F3FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <CustomHeader
        variant={{
          type: 'basic',
          title: 'QuantumBot HRMS',
        }}
      />
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(50).springify()} style={styles.pageTitleContainer}>
          <Typography variant="h1" style={styles.pageTitle}>
            {getGreeting()}, {user?.firstName || 'Team'} {user?.lastName || ''}!
          </Typography>
          <Typography style={styles.pageSubtitle}>{moment().format('dddd, DD MMMM YYYY')}</Typography>
        </Animated.View>

        {/* Section 1: Today's Attendance */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <SectionHeader icon={Clock} title="Today's Attendance" />
          <View style={styles.gridRow}>
            <GridCard 
              isPrimary
              title="STATUS TODAY" 
              badgeText={attendanceStatus?.isCheckedIn ? "Present" : "Absent"} 
              badgeColor={attendanceStatus?.isCheckedIn ? colors.success : colors.error}
              subtitle="Mode: OFFICE" 
            />
            <GridCard 
              title="LEAVING TIME" 
              icon={Clock}
              value={attendanceStatus?.isCheckedIn ? ((attendanceStatus as any).leavingTime || '06:00 pm') : '--:--'} 
              subtitle="Expected punch out" 
            />
          </View>
          <View style={styles.gridRow}>
            <GridCard 
              title="WORKING HOURS" 
              icon={Clock}
              value={isAttLoading ? "..." : (attSummary?.totalWorking || "0h 0m")} 
              subtitle="So far today" 
            />
            <GridCard 
              title="PUNCTUALITY" 
              badgeText={attendanceStatus?.isCheckedIn ? "On Time" : "N/A"} 
              badgeColor={attendanceStatus?.isCheckedIn ? colors.success : colors.text.muted}
            />
          </View>
        </Animated.View>

        {/* Section 2: This Month at a Glance */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <SectionHeader icon={Calendar} title="This Month at a Glance" />
          <View style={styles.gridRow}>
            <StatBox title="DAYS PRESENT" value={isSummaryLoading ? "..." : "9"} subtitle="This month" icon={CheckCircle2} iconColor={colors.success} bgTint="rgba(16, 185, 129, 0.2)" />
            <StatBox title="DAYS ABSENT" value={isSummaryLoading ? "..." : "0"} subtitle="This month" icon={XCircle} iconColor={colors.error} bgTint="rgba(239, 68, 68, 0.2)" />
          </View>
          <View style={styles.gridRow}>
            <StatBox title="LATE ARRIVALS" value={isSummaryLoading ? "..." : "0"} subtitle="This month" icon={AlertTriangle} iconColor={colors.warning} bgTint="rgba(245, 158, 11, 0.2)" />
            <StatBox title="LWP COUNT" value={isSummaryLoading ? "..." : "0"} subtitle="Leave without pay" icon={Calendar} iconColor={colors.primary} bgTint="rgba(139, 92, 246, 0.2)" />
          </View>
        </Animated.View>

        {/* Section 2.5: Team Members */}
        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <SectionHeader icon={Users} title="Team Members" />
          <View style={styles.gridRow}>
            <StatBox title="PRESENT" value="0" subtitle="On duty today" icon={UserCheck} iconColor={colors.success} bgTint="rgba(16, 185, 129, 0.2)" />
            <StatBox title="ABSENT" value="0" subtitle="Not checked in" icon={UserX} iconColor={colors.error} bgTint="rgba(239, 68, 68, 0.2)" />
          </View>
          <View style={styles.gridRow}>
            <StatBox title="LATE ARRIVALS" value="0" subtitle="Arrived late" icon={Clock} iconColor={colors.warning} bgTint="rgba(245, 158, 11, 0.2)" />
            <StatBox title="WFH" value="0" subtitle="Remote work" icon={Home} iconColor={colors.primary} bgTint="rgba(139, 92, 246, 0.2)" />
          </View>
        </Animated.View>

        {/* Section 3: Leave Management */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <SectionHeader icon={Calendar} title="Leave Management" />
          <WideCard title="Leave Balances">
            {isLeaveLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <LeaveBar label="Casual Leave" days={leaveSummary?.balances?.find(b => b.code === 'CL')?.available || 2.5} color={colors.success} />
                <LeaveBar label="Early Leave" days={leaveSummary?.balances?.find(b => b.code === 'EL')?.available || 3} color={colors.primary} />
                <LeaveBar label="Sick Leave" days={leaveSummary?.balances?.find(b => b.code === 'SL')?.available || 2} color={colors.warning} />
                <LeaveBar label="Compensatory leave" days={leaveSummary?.balances?.find(b => b.code === 'OT')?.available || 0} color={colors.error} />
              </>
            )}
          </WideCard>
          <WideCard title="Recent Leave Requests">
            <View style={styles.emptyBox}>
              <Typography style={styles.emptyText}>No leave requests yet.</Typography>
            </View>
          </WideCard>
        </Animated.View>

        {/* Section 4: Performance & Training */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <SectionHeader icon={Star} title="Performance & Training" />
          <WideCard title="KPI Performance">
            <View style={styles.emptyBox}>
              <Typography style={styles.emptyText}>No KPI scores available yet.</Typography>
            </View>
          </WideCard>
          <WideCard title="Training Progress">
            <View style={styles.emptyBox}>
              <Typography style={styles.emptyText}>No training assignments.</Typography>
            </View>
          </WideCard>
        </Animated.View>

        {/* Section 5: My Services & Upcoming */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <SectionHeader icon={Wallet} title="My Services & Upcoming" />
          <WideCard title="Employee Services">
            <View style={styles.serviceRow}>
              <View style={styles.serviceRowLeft}>
                <View style={[styles.serviceIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Typography style={styles.serviceIcon}>📄</Typography>
                </View>
                <Typography style={styles.serviceLabel}>Latest Payslip</Typography>
              </View>
              <Typography style={[styles.serviceValue, { color: colors.success }]}>Not generated</Typography>
            </View>
            <View style={styles.serviceRow}>
              <View style={styles.serviceRowLeft}>
                <View style={[styles.serviceIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                  <Typography style={styles.serviceIcon}>💰</Typography>
                </View>
                <Typography style={styles.serviceLabel}>Pending Expense Claims</Typography>
              </View>
              <Typography style={styles.serviceValue}>0</Typography>
            </View>
            <View style={[styles.serviceRow, styles.noBorder]}>
              <View style={styles.serviceRowLeft}>
                <View style={[styles.serviceIconWrap, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                  <Typography style={styles.serviceIcon}>💻</Typography>
                </View>
                <Typography style={styles.serviceLabel}>Assets Held</Typography>
              </View>
              <Typography style={[styles.serviceValue, { color: colors.primary }]}>0</Typography>
            </View>
          </WideCard>
          <WideCard title="Upcoming Holidays">
            <View style={styles.emptyBox}>
              <Typography style={styles.emptyText}>No upcoming holidays.</Typography>
            </View>
          </WideCard>
        </Animated.View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(140),
  },
  
  pageTitleContainer: {
    marginBottom: normalize(20),
    paddingHorizontal: normalize(8),
  },
  pageTitle: {
    color: colors.black,
    fontWeight: '900',
    fontSize: normalize(26),
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    color: colors.primary,
    fontSize: normalize(14),
    fontWeight: '700',
    marginTop: normalize(4),
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
    paddingHorizontal: normalize(4),
    marginTop: normalize(16),
  },
  sectionHeaderIconWrap: {
    backgroundColor: colors.primary,
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(10),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionHeaderTitle: {
    color: '#1E293B',
    fontWeight: '900',
    fontSize: normalize(17),
    letterSpacing: -0.3,
  },

  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(12),
  },
  gridCard: {
    width: (screenWidth - normalize(44)) / 2,
    borderRadius: normalize(24),
    padding: normalize(16),
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    overflow: 'hidden',
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  iconFloat: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(10),
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCardTitle: {
    color: colors.text.secondary,
    fontSize: normalize(10),
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  gridCardValue: {
    color: colors.black,
    fontSize: normalize(22),
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  gridCardSubtitle: {
    color: colors.text.muted,
    fontSize: normalize(12),
    fontWeight: '600',
    marginTop: normalize(4),
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(20),
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: colors.white,
    fontSize: normalize(12),
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  wideCard: {
    borderRadius: normalize(24),
    padding: normalize(20),
    marginBottom: normalize(16),
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    overflow: 'hidden',
  },
  wideCardHeader: {
    marginBottom: normalize(16),
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    paddingBottom: normalize(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wideCardTitle: {
    color: '#1E293B',
    fontSize: normalize(15),
    fontWeight: '900',
  },
  wideCardBody: {
    paddingBottom: normalize(2),
  },
  emptyBox: {
    paddingVertical: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: normalize(12),
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: normalize(13),
    fontWeight: '600',
  },

  leaveBarContainer: {
    marginBottom: normalize(16),
  },
  leaveBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(8),
  },
  leaveBarLabel: {
    color: '#334155',
    fontSize: normalize(13),
    fontWeight: '700',
  },
  leaveBarValue: {
    fontSize: normalize(13),
    fontWeight: '900',
  },
  leaveBarTrack: {
    height: normalize(8),
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: normalize(4),
    overflow: 'hidden',
  },
  leaveBarFill: {
    height: '100%',
    borderRadius: normalize(4),
  },

  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(12),
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  noBorder: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  serviceRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconWrap: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  serviceIcon: {
    fontSize: normalize(16),
  },
  serviceLabel: {
    color: '#334155',
    fontSize: normalize(14),
    fontWeight: '700',
  },
  serviceValue: {
    color: '#1E293B',
    fontSize: normalize(15),
    fontWeight: '900',
  },
});
