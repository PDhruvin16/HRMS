import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logoutAndClear } from '../../store/slices/authSlice';
import colors from '../../theme/color';
import { Typography } from '../../components/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  User,
  Shield,
  Bell,
  Briefcase,
  LogOut,
  ChevronRight,
  Mail,
  GraduationCap,
  FileText,
  Activity,
  Lock,
  MapPin,
  Phone,
  CreditCard,
  Eye,
  ShieldCheck,
  Heart,
} from 'lucide-react-native';
import { normalize } from '../../utils/responsive';
import CustomHeader from '../../components/Header';
import { useProfileQuery } from '../../hooks/useQueries';

type ProfileTabKey = 'personal' | 'contact' | 'work' | 'education' | 'documents' | 'bgv_health' | 'salary';

const PROFILE_TABS: { key: ProfileTabKey; label: string; icon: any }[] = [
  { key: 'personal', label: 'Personal', icon: User },
  { key: 'contact', label: 'Contact', icon: Mail },
  { key: 'work', label: 'Work', icon: Briefcase },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'bgv_health', label: 'Bgv & Health', icon: Activity },
  { key: 'salary', label: 'Salary', icon: Lock },
];

const ModernInfoTile: React.FC<{ label: string; value?: string | number | null; fullWidth?: boolean }> = ({
  label,
  value,
  fullWidth = false,
}) => (
  <View style={[styles.infoTile, fullWidth && { width: '100%' }]}>
    <Typography style={styles.infoTileLabel}>{label}</Typography>
    <Typography style={styles.infoTileValue} numberOfLines={2}>
      {value || '—'}
    </Typography>
  </View>
);

export const SettingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const { data: profileData } = useProfileQuery();

  const [activeTab, setActiveTab] = useState<ProfileTabKey>('personal');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [wfhRemindersEnabled, setWfhRemindersEnabled] = useState(true);

  const handleLogout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    dispatch(logoutAndClear());
  };

  const handleTabSelect = async (tabKey: ProfileTabKey) => {
    await Haptics.selectionAsync();
    setActiveTab(tabKey);
  };

  const handleToggle = async (value: boolean, setter: (val: boolean) => void) => {
    await Haptics.selectionAsync();
    setter(value);
  };

  const userRole = (user?.roles?.[0] || user?.role || 'employee').toUpperCase();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F0F8FF', '#E6F0FA', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <CustomHeader
        variant={{
          type: 'basic',
          title: 'Settings & Profile',
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* FIRST CARD: Original Redux-bound profile summary card */}
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <BlurView intensity={60} tint="light" style={styles.glassProfileCard}>
            <View style={styles.heroLeft}>
              <View style={styles.heroIcon}>
                {user?.profileImage || profileData?.profile_picture ? (
                  <Image
                    source={{ uri: user?.profileImage || profileData?.profile_picture }}
                    style={{ width: '100%', height: '100%', borderRadius: normalize(18) }}
                  />
                ) : (
                  <Typography variant="h2" style={styles.avatarText}>
                    {user?.firstName?.charAt(0) || 'P'}
                  </Typography>
                )}
              </View>
              <View style={{ marginLeft: normalize(14), flex: 1 }}>
                <Typography variant="h2" style={styles.profileName} numberOfLines={1}>
                  {user?.firstName || 'Priya'} {user?.lastName || 'Sharma'}
                </Typography>
                <Typography style={styles.profileEmail} numberOfLines={1}>
                  {user?.email || 'developer@company.com'}
                </Typography>
              </View>
            </View>
            <View style={styles.roleBadge}>
              <Typography style={styles.roleText}>{userRole}</Typography>
            </View>
          </BlurView>
        </Animated.View>

        {/* Sub-tabs Category Navigation Bar */}
        <Animated.View entering={FadeInUp.delay(150).springify()}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContainer}
          >
            {PROFILE_TABS.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => handleTabSelect(tab.key)}
                  activeOpacity={0.8}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={[colors.primary, '#4F46E5']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.tabPillActiveGrad}
                    >
                      <IconComp size={normalize(15)} color={colors.white} />
                      <Typography style={styles.tabLabelActive}>
                        {tab.label}
                      </Typography>
                    </LinearGradient>
                  ) : (
                    <View style={styles.tabPill}>
                      <IconComp size={normalize(15)} color={colors.text.secondary} />
                      <Typography style={styles.tabLabel}>
                        {tab.label}
                      </Typography>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Dynamic Tab Content Cards */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          {activeTab === 'personal' && (
            <BlurView intensity={65} tint="light" style={styles.glassSectionCard}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#818CF8', '#6366F1']}
                  style={styles.sectionIconGrad}
                >
                  <User size={normalize(16)} color={colors.white} />
                </LinearGradient>
                <Typography style={styles.sectionTitle}>Personal Information</Typography>
              </View>

              <View style={styles.gridContainer}>
                <ModernInfoTile label="FULL NAME (AS PER AADHAAR)" value={`${user?.firstName || 'System'} ${user?.lastName || 'Admin'}`} fullWidth />
                <ModernInfoTile label="FIRST NAME" value={user?.firstName || 'System'} />
                <ModernInfoTile label="MIDDLE NAME" value="—" />
                <ModernInfoTile label="LAST NAME" value={user?.lastName || 'Admin'} />
                <ModernInfoTile label="DATE OF BIRTH" value="—" />
                <ModernInfoTile label="AGE" value="—" />
                <ModernInfoTile label="GENDER" value="—" />
                <ModernInfoTile label="BLOOD GROUP" value="O+" />
                <ModernInfoTile label="NATIONALITY" value="Indian" />
                <ModernInfoTile label="MARITAL STATUS" value="Single" />
              </View>
            </BlurView>
          )}

          {activeTab === 'contact' && (
            <>
              <BlurView intensity={65} tint="light" style={styles.glassSectionCard}>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={['#60A5FA', '#3B82F6']}
                    style={styles.sectionIconGrad}
                  >
                    <Mail size={normalize(16)} color={colors.white} />
                  </LinearGradient>
                  <Typography style={styles.sectionTitle}>Email & Phone</Typography>
                </View>
                <View style={styles.gridContainer}>
                  <ModernInfoTile label="WORK EMAIL" value={user?.email || 'sysadmin@company.com'} fullWidth />
                  <ModernInfoTile label="PERSONAL EMAIL" value="—" />
                  <ModernInfoTile label="PERSONAL MOBILE" value={user?.phone || '+91 9876543210'} />
                  <ModernInfoTile label="ALTERNATE NUMBER" value="—" fullWidth />
                </View>
              </BlurView>

              <BlurView intensity={65} tint="light" style={styles.glassSectionCard}>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={['#34D399', '#10B981']}
                    style={styles.sectionIconGrad}
                  >
                    <MapPin size={normalize(16)} color={colors.white} />
                  </LinearGradient>
                  <Typography style={styles.sectionTitle}>Current Address</Typography>
                </View>
                <View style={styles.gridContainer}>
                  <ModernInfoTile label="ADDRESS LINE 1" value="—" fullWidth />
                  <ModernInfoTile label="ADDRESS LINE 2" value="—" fullWidth />
                  <ModernInfoTile label="CITY" value="—" />
                  <ModernInfoTile label="STATE" value="—" />
                  <ModernInfoTile label="PIN CODE" value="—" />
                </View>
              </BlurView>

              <BlurView intensity={65} tint="light" style={styles.glassSectionCard}>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={['#F87171', '#EF4444']}
                    style={styles.sectionIconGrad}
                  >
                    <Phone size={normalize(16)} color={colors.white} />
                  </LinearGradient>
                  <Typography style={styles.sectionTitle}>Emergency Contacts</Typography>
                </View>
                <View style={styles.gridContainer}>
                  <ModernInfoTile label="NAME" value="—" />
                  <ModernInfoTile label="RELATION" value="—" />
                  <ModernInfoTile label="PHONE" value="—" />
                </View>
              </BlurView>
            </>
          )}

          {activeTab === 'work' && (
            <>
              <BlurView intensity={65} tint="light" style={styles.glassSectionCard}>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={['#FBBF24', '#F59E0B']}
                    style={styles.sectionIconGrad}
                  >
                    <Briefcase size={normalize(16)} color={colors.white} />
                  </LinearGradient>
                  <Typography style={styles.sectionTitle}>Job Details</Typography>
                </View>
                <View style={styles.gridContainer}>
                  <ModernInfoTile label="EMPLOYEE CODE" value={user?.empCode || user?.employeeId || 'SYS-ADM-001'} />
                  <ModernInfoTile label="DESIGNATION" value={user?.designation || 'System Administrator'} />
                  <ModernInfoTile label="DEPARTMENT" value={user?.department || 'IT & Operations'} />
                  <ModernInfoTile label="EMPLOYMENT TYPE" value="Full Time" />
                  <ModernInfoTile label="STATUS" value="Active" />
                  <ModernInfoTile label="ROLE" value={userRole} />
                  <ModernInfoTile label="SHIFT" value="Day Shift (09:00 - 18:00)" fullWidth />
                  <ModernInfoTile label="DATE OF JOINING" value={user?.dateOfJoining || '10 Jan 2025'} />
                  <ModernInfoTile label="CONFIRMATION DATE" value="—" />
                  <ModernInfoTile label="PROBATION PERIOD" value="3 months" />
                  <ModernInfoTile label="WORKING DAYS/WEEK" value="5 days" />
                  <ModernInfoTile label="WORK MODE" value="On-site" />
                  <ModernInfoTile label="WORK LOCATION" value="Headquarters" />
                </View>
              </BlurView>

              <BlurView intensity={65} tint="light" style={styles.glassSectionCard}>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={['#2DD4BF', '#14B8A6']}
                    style={styles.sectionIconGrad}
                  >
                    <CreditCard size={normalize(16)} color={colors.white} />
                  </LinearGradient>
                  <Typography style={styles.sectionTitle}>Bank Account Details</Typography>
                </View>
                <View style={styles.gridContainer}>
                  <ModernInfoTile label="BANK NAME" value="—" />
                  <ModernInfoTile label="ACCOUNT NUMBER" value="—" />
                  <ModernInfoTile label="ACCOUNT TYPE" value="Savings" />
                  <ModernInfoTile label="IFSC CODE" value="—" />
                </View>
              </BlurView>
            </>
          )}

          {activeTab === 'education' && (
            <BlurView intensity={65} tint="light" style={styles.glassSectionCard}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#A78BFA', '#8B5CF6']}
                  style={styles.sectionIconGrad}
                >
                  <GraduationCap size={normalize(16)} color={colors.white} />
                </LinearGradient>
                <Typography style={styles.sectionTitle}>Education</Typography>
              </View>
              <View style={styles.emptyContainer}>
                <GraduationCap size={normalize(32)} color={colors.text.muted} style={{ marginBottom: normalize(8) }} />
                <Typography style={{ fontSize: normalize(13), color: colors.text.muted, fontWeight: '600' }}>
                  No education records found
                </Typography>
              </View>
            </BlurView>
          )}

          {activeTab === 'documents' && (
            <BlurView intensity={65} tint="light" style={styles.glassSectionCard}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#C084FC', '#A855F7']}
                  style={styles.sectionIconGrad}
                >
                  <FileText size={normalize(16)} color={colors.white} />
                </LinearGradient>
                <Typography style={styles.sectionTitle}>Identity Documents</Typography>
              </View>

              <View style={{ gap: normalize(14) }}>
                {/* Aadhaar Section */}
                <View style={styles.docSubSection}>
                  <Typography style={styles.docSubHeader}>AADHAAR</Typography>
                  <View style={styles.gridContainer}>
                    <ModernInfoTile label="AADHAAR NUMBER" value="—" />
                    <View style={styles.infoTile}>
                      <Typography style={styles.infoTileLabel}>AADHAAR DOCUMENT</Typography>
                      <TouchableOpacity style={styles.docBadgeBtn} activeOpacity={0.7}>
                        <Eye size={12} color={colors.primary} />
                        <Typography style={styles.docBadgeText}>View Aadhaar</Typography>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* PAN Section */}
                <View style={styles.docSubSection}>
                  <Typography style={styles.docSubHeader}>PAN</Typography>
                  <View style={styles.gridContainer}>
                    <ModernInfoTile label="PAN NUMBER" value="—" />
                    <View style={styles.infoTile}>
                      <Typography style={styles.infoTileLabel}>PAN DOCUMENT</Typography>
                      <TouchableOpacity style={styles.docBadgeBtn} activeOpacity={0.7}>
                        <Eye size={12} color={colors.primary} />
                        <Typography style={styles.docBadgeText}>View PAN</Typography>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* UAN Section */}
                <View style={{ paddingTop: normalize(4) }}>
                  <Typography style={styles.docSubHeader}>UAN / PF</Typography>
                  <View style={styles.gridContainer}>
                    <ModernInfoTile label="UAN NUMBER" value="—" />
                  </View>
                </View>
              </View>
            </BlurView>
          )}

          {activeTab === 'bgv_health' && (
            <>
              {/* Card 1: Background Verification */}
              <BlurView intensity={65} tint="light" style={styles.glassSectionCard}>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={['#A78BFA', '#8B5CF6']}
                    style={styles.sectionIconGrad}
                  >
                    <ShieldCheck size={normalize(16)} color={colors.white} />
                  </LinearGradient>
                  <Typography style={styles.sectionTitle}>Background Verification</Typography>
                </View>
                <View style={styles.gridContainer}>
                  <ModernInfoTile label="BGV STATUS" value="Not Initiated" />
                  <ModernInfoTile label="POLICE VERIFICATION" value="No" />
                  <ModernInfoTile label="PREVIOUS COMPANY VERIFICATION" value="—" fullWidth />
                  <ModernInfoTile label="HR OUTCOME" value="—" />
                  <ModernInfoTile label="VERIFICATION REMARKS" value="—" fullWidth />
                </View>
              </BlurView>

              {/* Card 2: Health & Disability */}
              <BlurView intensity={65} tint="light" style={styles.glassSectionCard}>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={['#FB7185', '#F43F5E']}
                    style={styles.sectionIconGrad}
                  >
                    <Heart size={normalize(16)} color={colors.white} />
                  </LinearGradient>
                  <Typography style={styles.sectionTitle}>Health & Disability</Typography>
                </View>
                <View style={styles.gridContainer}>
                  <ModernInfoTile label="KNOWN MEDICAL CONDITIONS" value="—" fullWidth />
                  <ModernInfoTile label="IS DISABLED?" value="No" />
                </View>
              </BlurView>
            </>
          )}

          {activeTab === 'salary' && (
            <BlurView intensity={65} tint="light" style={styles.glassSectionCard}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#34D399', '#10B981']}
                  style={styles.sectionIconGrad}
                >
                  <Lock size={normalize(16)} color={colors.white} />
                </LinearGradient>
                <Typography style={styles.sectionTitle}>Salary & Compensation</Typography>
              </View>
              <View style={styles.gridContainer}>
                <ModernInfoTile label="BASIC SALARY" value="Confidential" />
                <ModernInfoTile label="HRA" value="Confidential" />
                <ModernInfoTile label="SPECIAL ALLOWANCES" value="Confidential" />
                <ModernInfoTile label="GROSS SALARY" value="Confidential" />
              </View>
            </BlurView>
          )}
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <BlurView intensity={50} tint="light" style={styles.glassSectionCard}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#60A5FA', '#3B82F6']}
                style={styles.sectionIconGrad}
              >
                <Bell size={normalize(16)} color={colors.white} />
              </LinearGradient>
              <Typography style={styles.sectionTitle}>App Preferences</Typography>
            </View>

            <View style={styles.switchRow}>
              <View>
                <Typography style={styles.switchLabel}>Push Notifications</Typography>
                <Typography variant="caption" style={styles.switchSublabel}>
                  Get notified of leave status changes
                </Typography>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={(val) => handleToggle(val, setNotificationsEnabled)}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={[styles.switchRow, styles.noBorder]}>
              <View>
                <Typography style={styles.switchLabel}>WFH Reminders</Typography>
                <Typography variant="caption" style={styles.switchSublabel}>
                  Alert to check in on WFH days
                </Typography>
              </View>
              <Switch
                value={wfhRemindersEnabled}
                onValueChange={(val) => handleToggle(val, setWfhRemindersEnabled)}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </BlurView>
        </Animated.View>

        {/* Security Menu */}
        <Animated.View entering={FadeInUp.delay(350).springify()}>
          <BlurView intensity={50} tint="light" style={styles.glassSectionCard}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#9CA3AF', '#4B5563']}
                style={styles.sectionIconGrad}
              >
                <Shield size={normalize(16)} color={colors.white} />
              </LinearGradient>
              <Typography style={styles.sectionTitle}>Security</Typography>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.8}
              onPress={() => Haptics.selectionAsync()}
            >
              <View style={styles.menuItemLeft}>
                <User size={normalize(18)} color={colors.text.secondary} />
                <Typography style={styles.menuItemText}>Change Password</Typography>
              </View>
              <ChevronRight size={normalize(16)} color={colors.text.secondary} />
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        {/* Logout button */}
        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            style={{ marginTop: normalize(6) }}
          >
            <LinearGradient
              colors={['#FEF2F2', '#FEE2E2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoutButtonGlass}
            >
              <LogOut size={normalize(18)} color={colors.error} style={{ marginRight: normalize(10) }} />
              <Typography style={styles.logoutButtonText}>Log Out Securely</Typography>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(120),
    paddingTop: normalize(10),
  },

  /* --- Top Hero Profile Card (Restored Original Redux Binding) --- */
  glassProfileCard: {
    borderRadius: normalize(24),
    padding: normalize(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(16),
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    backgroundColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: normalize(10),
  },
  heroIcon: {
    width: normalize(52),
    height: normalize(52),
    borderRadius: normalize(18),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: normalize(22),
  },
  profileName: {
    color: colors.black,
    fontWeight: '800',
    fontSize: normalize(16),
  },
  profileEmail: {
    color: colors.text.secondary,
    fontSize: normalize(12),
    marginTop: normalize(2),
    fontWeight: '600',
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(12),
  },
  roleText: {
    color: colors.primary,
    fontSize: normalize(9),
    fontWeight: '800',
    letterSpacing: normalize(0.5),
  },

  /* --- Sub-Tabs Scroll Bar --- */
  tabScrollContainer: {
    gap: normalize(8),
    paddingBottom: normalize(14),
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(8),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  tabPillActiveGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(8),
    borderRadius: normalize(20),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  tabLabel: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tabLabelActive: {
    fontSize: normalize(13),
    fontWeight: '700',
    color: colors.white,
  },

  /* --- Section Cards --- */
  glassSectionCard: {
    borderRadius: normalize(20),
    padding: normalize(16),
    marginBottom: normalize(14),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    paddingBottom: normalize(12),
    marginBottom: normalize(14),
  },
  sectionIconGrad: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: colors.black,
    fontWeight: '800',
    fontSize: normalize(15),
    marginLeft: normalize(10),
  },

  /* --- Modern Grid Items (Mini Tiles) --- */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(10),
  },
  infoTile: {
    width: '48%',
    backgroundColor: 'rgba(248, 250, 252, 0.85)',
    borderRadius: normalize(12),
    padding: normalize(10),
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  infoTileLabel: {
    fontSize: normalize(10),
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  infoTileValue: {
    fontSize: normalize(13),
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: normalize(3),
  },

  /* --- Empty State --- */
  emptyContainer: {
    paddingVertical: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* --- Document Badges --- */
  docSubSection: {
    borderBottomWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    paddingBottom: normalize(12),
  },
  docSubHeader: {
    fontSize: normalize(11),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: normalize(10),
  },
  docBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    marginTop: normalize(4),
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  docBadgeText: {
    fontSize: normalize(11),
    fontWeight: '700',
    color: colors.primary,
  },

  /* --- Switches --- */
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(10),
    borderBottomWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.5)',
  },
  switchLabel: {
    color: colors.black,
    fontSize: normalize(14),
    fontWeight: '700',
  },
  switchSublabel: {
    color: colors.text.secondary,
    marginTop: normalize(2),
    fontWeight: '500',
  },

  /* --- Menu --- */
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(10),
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    color: colors.black,
    fontSize: normalize(14),
    marginLeft: normalize(12),
    fontWeight: '600',
  },
  noBorder: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },

  /* --- Logout Button --- */
  logoutButtonGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(14),
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutButtonText: {
    color: colors.error,
    fontWeight: '800',
    fontSize: normalize(15),
  },
});
