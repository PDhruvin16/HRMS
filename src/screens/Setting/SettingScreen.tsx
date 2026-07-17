import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
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
} from 'lucide-react-native';
import { storage } from '../../utils/Storage';
import { normalize } from '../../utils/responsive';
import CustomHeader from '../../components/Header';

export const SettingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  
  const user = useAppSelector((state) => state.auth.user);

  // Preference switches state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [wfhRemindersEnabled, setWfhRemindersEnabled] = useState(true);

  const handleLogout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    dispatch(logoutAndClear());
  };

  const handleToggle = async (value: boolean, setter: (val: boolean) => void) => {
    await Haptics.selectionAsync();
    setter(value);
  };

  const userRole = user?.roles?.[0] || 'employee';

  return (
    <View style={styles.container}>
      {/* Universal Premium Background Gradient */}
      <LinearGradient
        colors={['#F0F8FF', '#E6F0FA', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <CustomHeader
        variant={{
          type: 'basic',
          title: 'Settings',
        }}
      />
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >

        {/* Profile summary card */}
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <BlurView intensity={60} tint="light" style={styles.glassProfileCard}>
            <View style={styles.heroLeft}>
              <View style={styles.heroIcon}>
                {user?.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={{ width: '100%', height: '100%', borderRadius: normalize(30) }} />
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
              <Typography style={styles.roleText}>{userRole.toUpperCase()}</Typography>
            </View>
          </BlurView>
        </Animated.View>

        {/* Employment Details Section */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <BlurView intensity={50} tint="light" style={styles.glassSectionCard}>
            <View style={styles.sectionHeader}>
              <Briefcase size={normalize(18)} color={colors.black} />
              <Typography style={styles.sectionTitle}>Employment Details</Typography>
            </View>

            <View style={styles.detailRow}>
              <Typography style={styles.detailLabel}>Employee ID</Typography>
              <Typography style={styles.detailValue}>
                {user?.employeeId || 'EMP-2026-089'}
              </Typography>
            </View>

            <View style={styles.detailRow}>
              <Typography style={styles.detailLabel}>Department</Typography>
              <Typography style={styles.detailValue}>
                {user?.department || 'Mobile Development'}
              </Typography>
            </View>

            <View style={styles.detailRow}>
              <Typography style={styles.detailLabel}>Date of Joining</Typography>
              <Typography style={styles.detailValue}>
                {user?.dateOfJoining || 'Jan 10, 2025'}
              </Typography>
            </View>

            <View style={[styles.detailRow, styles.noBorder]}>
              <Typography style={styles.detailLabel}>Reporting Manager</Typography>
              <Typography style={styles.detailValue}>
                {user?.managerName || 'Rajesh Kumar'}
              </Typography>
            </View>
          </BlurView>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <BlurView intensity={50} tint="light" style={styles.glassSectionCard}>
            <View style={styles.sectionHeader}>
              <Bell size={normalize(18)} color={colors.black} />
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

        {/* Account Settings Menu */}
        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <BlurView intensity={50} tint="light" style={styles.glassSectionCard}>
            <View style={styles.sectionHeader}>
              <Shield size={normalize(18)} color={colors.black} />
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
        <Animated.View entering={FadeInUp.delay(500).springify()}>
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            style={{ marginTop: normalize(10) }}
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
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(120),
    paddingTop: normalize(10),
  },
  
  /* --- Profile Card --- */
  glassProfileCard: {
    borderRadius: normalize(24),
    padding: normalize(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(20),
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.45)',
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

  /* --- Section Cards --- */
  glassSectionCard: {
    borderRadius: normalize(24),
    padding: normalize(20),
    marginBottom: normalize(16),
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: normalize(1),
    borderColor: 'rgba(0,0,0,0.06)',
    paddingBottom: normalize(12),
    marginBottom: normalize(12),
  },
  sectionTitle: {
    color: colors.black,
    fontWeight: '800',
    fontSize: normalize(15),
    marginLeft: normalize(10),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: normalize(12),
    borderBottomWidth: normalize(1),
    borderColor: 'rgba(0,0,0,0.04)',
  },
  detailLabel: {
    color: colors.text.secondary,
    fontSize: normalize(13),
    fontWeight: '600',
  },
  detailValue: {
    color: colors.black,
    fontWeight: '700',
    fontSize: normalize(13),
  },
  
  /* --- Switches --- */
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(10),
    borderBottomWidth: normalize(1),
    borderColor: 'rgba(0,0,0,0.04)',
  },
  switchLabel: {
    color: colors.black,
    fontSize: normalize(14),
    fontWeight: '700',
  },
  switchSublabel: {
    color: colors.text.secondary,
    marginTop: normalize(4),
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
    paddingVertical: normalize(16),
    borderRadius: normalize(18),
    borderWidth: 1.5,
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
