import React, { useState, useMemo } from 'react';
import { Tabs } from 'expo-router';
import {
  View,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Settings,
  Plus,
  X,
  FileText,
  Briefcase,
} from 'lucide-react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import colors from '../../theme/color';
import { Typography } from '../../components/Typography';
import { normalize } from '../../utils/responsive';
import usePermissions from '../../hooks/usePermissions';
import SplashScreen from '../../screens/Splash/SplashScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getTabIcon = (routeName: string, isFocused: boolean) => {
  const color = isFocused ? colors.primary : '#8e8e93';
  const size = normalize(22);
  switch (routeName) {
    case 'index':      return <LayoutDashboard size={size} color={color} />;
    case 'leave':      return <CalendarDays size={size} color={color} />;
    case 'attendance': return <Clock size={size} color={color} />;
    case 'setting':    return <Settings size={size} color={color} />;
    default:           return <LayoutDashboard size={size} color={color} />;
  }
};

const getTabLabel = (routeName: string) => {
  switch (routeName) {
    case 'index':      return 'Dashboard';
    case 'leave':      return 'Leave';
    case 'attendance': return 'Attendance';
    case 'setting':    return 'Setting';
    default:           return routeName;
  }
};

interface TabItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  isCenter?: boolean;
}

const TabItem = ({ routeName, isFocused, onPress, isCenter }: TabItemProps) => {
  const activeColor   = colors.bottomTabActiveIcon;
  const inactiveColor = colors.bottomTabInactiveIcon;

  if (isCenter) {
    return (
      <View style={styles.specialButtonContainer}>
        <TouchableOpacity
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPress();
          }}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.specialButtonGradient}
          >
            <View style={styles.specialButton}>
              <Plus size={normalize(24)} color={colors.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const Icon       = getTabIcon(routeName, isFocused);
  const labelColor = isFocused ? activeColor : inactiveColor;

  return (
    <TouchableOpacity
      onPress={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={styles.tabItem}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {Icon}
        <Typography
          variant="caption"
          style={[styles.tabLabel, { color: labelColor, fontWeight: isFocused ? '700' : '500' }]}
        >
          {getTabLabel(routeName)}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, navigation, onCenterPress }: any) => {
  const insets         = useSafeAreaInsets();
  const activeRoute    = state.routes[state.index]?.name;
  const tabHeight      = normalize(60);
  const safeBottom     = Platform.OS === 'android' ? 0 : insets.bottom;
  const wrapperHeight  = tabHeight + safeBottom;
  const notchWidth     = normalize(56);
  const notchDepth     = normalize(22);
  const center         = SCREEN_WIDTH / 2;

  const path = `
    M 0,0
    L ${center - notchWidth},0
    C ${center - notchWidth * 0.6},0 ${center - notchWidth * 0.45},${notchDepth} ${center},${notchDepth}
    C ${center + notchWidth * 0.45},${notchDepth} ${center + notchWidth * 0.6},0 ${center + notchWidth},0
    L ${SCREEN_WIDTH},0
    L ${SCREEN_WIDTH},${wrapperHeight}
    L 0,${wrapperHeight}
    Z
  `;

  return (
    <View style={[styles.tabBarWrapper, { height: wrapperHeight }]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={wrapperHeight} viewBox={`0 0 ${SCREEN_WIDTH} ${wrapperHeight}`}>
          <Path
            d={path}
            fill={colors.bottomTabBackground}
            stroke={colors.bottomTabBorder}
            strokeWidth={normalize(1)}
          />
        </Svg>
      </View>

      <View style={[styles.tabBarContainer, { height: tabHeight, bottom: safeBottom }]}>
        <TabItem routeName="index"      isFocused={activeRoute === 'index'}      onPress={() => navigation.navigate('index')} />
        <TabItem routeName="leave"      isFocused={activeRoute === 'leave'}      onPress={() => navigation.navigate('leave')} />
        <View style={styles.middleSpacer} />
        <TabItem routeName="attendance" isFocused={activeRoute === 'attendance'} onPress={() => navigation.navigate('attendance')} />
        <TabItem routeName="setting"    isFocused={activeRoute === 'setting'}    onPress={() => navigation.navigate('setting')} />
      </View>

      <View style={[styles.floatingActionContainer, { top: -normalize(16) }]} pointerEvents="box-none">
        <TabItem routeName="center" isFocused={false} onPress={onCenterPress} isCenter />
      </View>
    </View>
  );
};

let isAppFirstMount = true;

export default function AppLayout() {
  usePermissions();
  const [showSplash, setShowSplash] = useState(isAppFirstMount);
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);

  React.useEffect(() => {
    if (isAppFirstMount) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        isAppFirstMount = false;
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <>
      <Tabs
        tabBar={(props) => (
          <CustomTabBar {...props} onCenterPress={() => setQuickActionsVisible(true)} />
        )}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="leave" />
        <Tabs.Screen name="attendance" />
        <Tabs.Screen name="setting" />
        <Tabs.Screen name="employee-attendance" options={{ href: null }} />
      </Tabs>

      {/* Quick Actions Modal */}
      <Modal
        visible={quickActionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQuickActionsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setQuickActionsVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="h3" style={styles.modalTitle}>Quick Actions</Typography>
              <TouchableOpacity onPress={() => setQuickActionsVisible(false)}>
                <X size={normalize(20)} color={colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionCard} onPress={() => setQuickActionsVisible(false)}>
                <LinearGradient colors={['rgba(34,197,94,0.1)', 'rgba(34,197,94,0.02)']} style={styles.actionCardGrad}>
                  <Clock size={normalize(24)} color={colors.success} />
                  <Typography style={styles.actionCardText}>Quick Check-in</Typography>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={() => setQuickActionsVisible(false)}>
                <LinearGradient colors={['rgba(197,88,229,0.1)', 'rgba(197,88,229,0.02)']} style={styles.actionCardGrad}>
                  <FileText size={normalize(24)} color={colors.primary} />
                  <Typography style={styles.actionCardText}>Apply Leave</Typography>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={() => setQuickActionsVisible(false)}>
                <LinearGradient colors={['rgba(10,116,218,0.1)', 'rgba(10,116,218,0.02)']} style={styles.actionCardGrad}>
                  <Briefcase size={normalize(24)} color={colors.emailBlue} />
                  <Typography style={styles.actionCardText}>Request WFH</Typography>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper:       { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: -normalize(4) }, shadowOpacity: 0.03, shadowRadius: normalize(10), elevation: 8 },
  tabBarContainer:     { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' },
  tabItem:             { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  iconContainer:       { alignItems: 'center', justifyContent: 'center' },
  tabLabel:            { fontSize: normalize(10), marginTop: normalize(4) },
  middleSpacer:        { width: normalize(52) },
  floatingActionContainer: { position: 'absolute', left: (SCREEN_WIDTH - normalize(52)) / 2, alignItems: 'center', backgroundColor: 'transparent' },
  specialButtonContainer:  { width: normalize(52), height: normalize(52), borderRadius: normalize(26), overflow: 'hidden', shadowColor: colors.primary, shadowOffset: { width: 0, height: normalize(4) }, shadowOpacity: 0.35, shadowRadius: normalize(8), elevation: 8 },
  specialButtonGradient:   { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  specialButton:           { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContent:   { backgroundColor: '#0D0D0D', borderTopLeftRadius: normalize(24), borderTopRightRadius: normalize(24), padding: normalize(24), borderWidth: normalize(1), borderColor: 'rgba(255,255,255,0.1)' },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: normalize(20) },
  modalTitle:     { color: colors.white, fontWeight: '700' },
  actionsGrid:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: normalize(16) },
  actionCard:     { width: (SCREEN_WIDTH - normalize(64)) / 3, borderRadius: normalize(16), overflow: 'hidden', borderWidth: normalize(1), borderColor: 'rgba(255,255,255,0.08)' },
  actionCardGrad: { padding: normalize(16), alignItems: 'center', justifyContent: 'center' },
  actionCardText: { color: colors.white, fontSize: normalize(11), fontWeight: '700', marginTop: normalize(10), textAlign: 'center' },
});
