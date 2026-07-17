// @ts-nocheck
// @ts-nocheck
import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Platform, Modal, StatusBar } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, Easing, useSharedValue } from 'react-native-reanimated';
import { Bell } from 'lucide-react-native';
import { Typography } from '../Typography';
import { normalize, isTablet } from '../../utils/responsive';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../theme/color';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationHelpers, ParamListBase } from '@react-navigation/native';
import { useAppSelector } from '../../hooks/useRedux';
import { hasPermission } from '../../utils/permissionUtils';
import icons from '../../constants/icons';
import { renderLogo } from '../../utils/renderLogo';
import { triggerHaptic } from '../../utils/haptic';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Height of the bottom tab bar (tabHeight + curveHeight, matches BottomTabNavigator)
const TAB_BAR_HEIGHT = normalize(84);

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  activeRoute: string;
  navigationProp?: NavigationHelpers<ParamListBase> | null;
  onTabNavigate?: (routeName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, onClose, navigationProp, onTabNavigate }) => {
  const isNavigatingRef = useRef(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const user = useAppSelector((state) => state.auth.user);
  const tenant = useAppSelector((state) => state.auth.tenant);
  const unreadCount = useAppSelector((state) => state.notification.unReadNotification?.length || 0);

  // Reanimated shared values (v4 compatible: bridge JS prop via useEffect)
  const SIDEBAR_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT;
  const slideAnim = useSharedValue(SIDEBAR_HEIGHT);
  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      slideAnim.value = withTiming(0, {
        duration: 380,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      });
      fadeAnim.value = withTiming(1, { duration: 280 });
    } else {
      slideAnim.value = withTiming(SIDEBAR_HEIGHT, {
        duration: 350,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      });
      fadeAnim.value = withTiming(0, { duration: 250 });
    }
  }, [isVisible]);

  const animatedSidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  // isAdmin is set to true so all items show without permission checks
  const isAdmin = true;

  const allAvailableItems = useMemo(() => {
    return [
      {
        id: 'Analytics',
        label: 'Sales &\nSystem',
        icon: icons.ic_SalesSystem,
        route: 'Analytics',
      },
      {
        id: 'Contacts',
        label: 'Contact',
        icon: icons.ic_Contact,
        route: 'Contacts',
        permissionKey: 'contacts',
      },
      {
        id: 'Customers',
        label: 'Customer',
        icon: icons.ic_Customer,
        route: 'Customers',
        permissionKey: 'customers',
      },
      {
        id: 'WhatsApp',
        label: 'WhatsApp',
        icon: icons.ic_WhatsApp,
        route: 'Integration',
        permissionKey: 'whatsapp_integration',
      },
      {
        id: 'Email',
        label: 'Email',
        icon: icons.ic_Email,
        route: 'Integration',
        permissionKey: 'email_integration',
      },
      {
        id: 'Instagram',
        label: 'Instagram',
        icon: icons.ic_Instagram,
        route: 'Integration',
        permissionKey: 'integrations',
      },
      {
        id: 'Linkedin',
        label: 'Linkedin',
        icon: icons.ic_Linkedin,
        route: 'Integration',
        permissionKey: 'integrations',
      },
      {
        id: 'Calendly',
        label: 'Calendly',
        icon: icons.ic_Calendly,
        route: 'Integration',
        permissionKey: 'calendly_integration',
      },
      {
        id: 'KnowledgeBase',
        label: 'Knowledge\nBase',
        icon: icons.ic_KnowledgeBase,
        route: 'KnowledgeBase',
        permissionKey: 'knowledge_base',
      },
      {
        id: 'Product',
        label: 'Product &\nService',
        icon: icons.ic_ProductService,
        route: 'Product',
        permissionKey: 'products',
      },
      {
        id: 'AssetsSharing',
        label: 'Assets &\nSharing',
        icon: icons.ic_AssetsSharing,
        route: 'AssetsSharing',
        permissionKey: 'assets_sharing',
      },
      {
        id: 'Calendar',
        label: 'Calendar',
        icon: icons.ic_Calendar,
        route: 'Leads',
        params: { initialTab: 'Calendar' },
        permissionKey: 'calendar_setting',
      },
      {
        id: 'Agent',
        label: 'Agent',
        icon: icons.ic_Agent,
        route: 'Agent',
        permissionKey: 'agent_configuration',
      },
      { id: 'Playground', label: 'Playground', icon: icons.ic_Playground, route: 'Playground' },
      { id: 'Leads', label: 'Leads', icon: icons.ic_Leads, route: 'Leads', permissionKey: 'leads' },
      {
        id: 'Campaign',
        label: 'Campaign',
        icon: icons.ic_Campaign,
        route: 'Campaign',
        permissionKeys: ['whatsapp_campaigns', 'email_campaigns'],
      },
      {
        id: 'Templates',
        label: 'Template',
        icon: icons.ic_Template,
        route: 'Templates',
        permissionKeys: ['whatsapp_templates', 'email_templates'],
      },
    ];
    // All items shown — isAdmin = true bypasses permission filtering for mock testing
  }, []);

  const hasAgentConfig = useMemo(
    () => allAvailableItems.some((i) => ['Agent', 'Playground'].includes(i.id)),
    [allAvailableItems],
  );
  const hasLeadsSection = useMemo(
    () => allAvailableItems.some((i) => i.id === 'Leads'),
    [allAvailableItems],
  );
  const hasIntegrationSection = useMemo(
    () =>
      allAvailableItems.some((i) =>
        ['WhatsApp', 'Email', 'Instagram', 'Linkedin', 'Calendly'].includes(i.id),
      ),
    [allAvailableItems],
  );
  const hasCompanySection = useMemo(
    () =>
      allAvailableItems.some((i) =>
        ['KnowledgeBase', 'Product', 'AssetsSharing', 'Calendar'].includes(i.id),
      ),
    [allAvailableItems],
  );
  const hasAnalyticsSection = true; // ALWAYS VISIBLE: System Analytics never hidden by permissions
  const hasContactCustomerSection = useMemo(
    () => allAvailableItems.some((i) => ['Contacts', 'Customers'].includes(i.id)),
    [allAvailableItems],
  );
  const hasCampaignTemplateSection = useMemo(
    () => allAvailableItems.some((i) => ['Campaign', 'Templates'].includes(i.id)),
    [allAvailableItems],
  );

  const handleNavigate = (routeName: keyof AppStackParamList, params?: Record<string, unknown>) => {
    triggerHaptic();
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    onClose();
    setTimeout(() => {
      if (navigationProp) {
        navigationProp.navigate(routeName as string, params);
      } else {
        navigation.navigate(routeName as string, params);
      }
      isNavigatingRef.current = false;
    }, 400);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Full-screen backdrop — tapping anywhere (including tab bar area) closes the sidebar */}
      <Animated.View style={[styles.overlay, animatedBackdropStyle]} pointerEvents={isVisible ? 'auto' : 'none'}>
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* Sidebar panel — slides up and stops above the tab bar */}
      <Animated.View style={[styles.sidebarContainer, animatedSidebarStyle]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'transparent']}
          style={[styles.headerGradient, { height: insets.top + normalize(100) }]}
        />

        <View style={[styles.header, { marginTop: insets.top + normalize(20) }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.row}
            onPress={() => handleNavigate('Profile')}
          >
            <View style={styles.avatar}>
              <Typography weight="700" style={styles.avatarText}>
                {user?.first_name?.charAt(0).toUpperCase() || 'U'}
              </Typography>
            </View>
            <View style={styles.headerText}>
              <Typography weight="700" style={styles.userName}>
                Hello, {user?.first_name || 'User'}
              </Typography>
              <Typography style={styles.welcomeText}>
                Welcome to {tenant?.business_name || 'Salesbot'}
              </Typography>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => handleNavigate('Notifications')}
          >
            <View style={styles.notificationWrapper}>
              <Bell color={Colors.basecolor} size={normalize(24)} strokeWidth={1.5} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Typography
                    weight="700"
                    style={styles.badgeText}
                    numberOfLines={Platform.OS === 'android' ? 1 : undefined}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Typography>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {(() => {
            const cardsContent = (
              <>
                <TouchableOpacity
                  style={[styles.bigCard, styles.bgContact, isTablet && styles.tabletBigCard]}
                  onPress={() => handleNavigate('CreateContact')}
                >
                  <Typography weight="700" style={styles.bigCardTitle}>
                    {'Create New\nContacts'}
                  </Typography>
                  <View style={styles.bigCardIcon}>
                    {renderLogo(icons.ic_CreateContacts, {
                      width: normalize(isTablet ? 80 : 100),
                      height: normalize(isTablet ? 80 : 100),
                    })}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.bigCard, styles.bgCustomer, isTablet && styles.tabletBigCard]}
                  onPress={() => handleNavigate('CreateCustomer')}
                >
                  <Typography weight="700" style={styles.bigCardTitle}>
                    {'Create New\nCustomer'}
                  </Typography>
                  <View style={styles.bigCardIcon}>
                    {renderLogo(icons.ic_CreateCustomer, {
                      width: normalize(isTablet ? 80 : 100),
                      height: normalize(isTablet ? 80 : 100),
                    })}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.bigCard,
                    styles.bgLeads,
                    isTablet && styles.tabletBigCard,
                    isTablet && styles.noRightMargin,
                  ]}
                  onPress={() => handleNavigate('CreateLead')}
                >
                  <Typography weight="700" style={styles.bigCardTitle}>
                    {'Create New\nLeads'}
                  </Typography>
                  <View style={styles.bigCardIcon}>
                    {renderLogo(icons.ic_CreateLeads, {
                      width: normalize(isTablet ? 80 : 100),
                      height: normalize(isTablet ? 80 : 100),
                    })}
                  </View>
                </TouchableOpacity>
              </>
            );

            return isTablet ? (
              <View style={styles.tabletCardsRow}>{cardsContent}</View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.carouselContainer}
                contentContainerStyle={styles.carouselContent}
              >
                {cardsContent}
              </ScrollView>
            );
          })()}

          {/* Row for Analytics and Contact & Customer */}
          {(hasAnalyticsSection || hasContactCustomerSection) && (
            <View style={styles.sectionRow}>
              {/* Analytics Section */}
              {hasAnalyticsSection && (
                <View
                  style={[
                    styles.sectionCard,
                    hasContactCustomerSection ? styles.halfCard : styles.flex1,
                    styles.card92,
                  ]}
                >
                  <Typography style={styles.sectionTitle}>Analytics</Typography>
                  <View style={styles.gridContainer}>
                    <TouchableOpacity
                      style={styles.gridItemSingle}
                      onPress={() => handleNavigate('Analytics')}
                    >
                      <View style={styles.iconWrapperSmall}>
                        {renderLogo(icons.ic_SalesSystem, {
                          width: normalize(24),
                          height: normalize(24),
                        })}
                      </View>
                      <Typography style={styles.gridLabelSmall} numberOfLines={2}>
                        {'Sales &\nSystem'}
                      </Typography>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Contact & Customer Section */}
              {hasContactCustomerSection && (
                <View
                  style={[
                    styles.sectionCard,
                    hasAnalyticsSection ? styles.fullCard : styles.flex1,
                    styles.card92,
                  ]}
                >
                  <Typography style={styles.sectionTitle}>Contact & Customer</Typography>
                  <View style={styles.gridContainer}>
                    {allAvailableItems
                      .filter((i) => ['Contacts', 'Customers'].includes(i.id))
                      .map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.gridItemSingle}
                          onPress={() =>
                            handleNavigate(
                              item.route as keyof AppStackParamList,
                              item.params as Record<string, unknown>,
                            )
                          }
                        >
                          <View style={styles.iconWrapperSmall}>
                            {renderLogo(item.icon, { width: normalize(24), height: normalize(24) })}
                          </View>
                          <Typography style={styles.gridLabelSmall} numberOfLines={2}>
                            {item.label}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Integration Section */}
          {hasIntegrationSection && (
            <View style={styles.sectionCard}>
              <Typography style={styles.sectionTitle}>Integration</Typography>
              <View style={styles.gridContainer}>
                {allAvailableItems
                  .filter((i) =>
                    ['WhatsApp', 'Email', 'Instagram', 'Linkedin', 'Calendly'].includes(i.id),
                  )
                  .map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.gridItem, styles.grid20]}
                      onPress={() =>
                        handleNavigate(
                          item.route as keyof AppStackParamList,
                          item.params as Record<string, unknown>,
                        )
                      }
                    >
                      <View style={styles.iconWrapperSmall}>
                        {renderLogo(item.icon, { width: normalize(24), height: normalize(24) })}
                      </View>
                      <Typography style={styles.gridLabelSmall} numberOfLines={2}>
                        {item.label}
                      </Typography>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          )}

          {/* Company Section - 4 icons in one row */}
          {hasCompanySection && (
            <View style={[styles.sectionCard, styles.cardCompany]}>
              <Typography style={styles.sectionTitle}>Company</Typography>
              <View style={styles.gridContainer}>
                {allAvailableItems
                  .filter((i) =>
                    ['KnowledgeBase', 'Product', 'AssetsSharing', 'Calendar'].includes(i.id),
                  )
                  .map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.gridItem, styles.grid25]}
                      onPress={() =>
                        handleNavigate(
                          item.route as keyof AppStackParamList,
                          item.params as Record<string, unknown>,
                        )
                      }
                    >
                      <View style={styles.iconWrapperSmall}>
                        {renderLogo(item.icon, { width: normalize(24), height: normalize(24) })}
                      </View>
                      <Typography style={styles.gridLabelSmall} numberOfLines={2}>
                        {item.label}
                      </Typography>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          )}

          {/* Agent Configuration and Leads Section */}
          {(hasAgentConfig || hasLeadsSection) && (
            <View style={styles.sectionRow}>
              {hasAgentConfig && (
                <View style={[styles.sectionCard, hasLeadsSection ? styles.flex15 : styles.flex1]}>
                  <Typography style={styles.sectionTitle}>Agent Configuration</Typography>
                  <View style={styles.gridContainer}>
                    {allAvailableItems
                      .filter((i) => ['Agent', 'Playground'].includes(i.id))
                      .map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.gridItemSingle}
                          onPress={() =>
                            handleNavigate(
                              item.route as keyof AppStackParamList,
                              item.params as Record<string, unknown>,
                            )
                          }
                        >
                          <View style={styles.iconWrapperSmall}>
                            {renderLogo(item.icon, { width: normalize(24), height: normalize(24) })}
                          </View>
                          <Typography style={styles.gridLabelSmall} numberOfLines={2}>
                            {item.label}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}

              {hasLeadsSection && (
                <View style={[styles.sectionCard, styles.flex1]}>
                  <Typography style={styles.sectionTitle}>Leads</Typography>
                  <View style={styles.gridContainer}>
                    {allAvailableItems
                      .filter((i) => ['Leads'].includes(i.id))
                      .map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.gridItemSingle}
                          onPress={() =>
                            handleNavigate(
                              item.route as keyof AppStackParamList,
                              item.params as Record<string, unknown>,
                            )
                          }
                        >
                          <View style={styles.iconWrapperSmall}>
                            {renderLogo(item.icon, { width: normalize(24), height: normalize(24) })}
                          </View>
                          <Typography style={styles.gridLabelSmall} numberOfLines={2}>
                            {item.label}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Campaign & Template Section */}
          {hasCampaignTemplateSection && (
            <View style={[styles.sectionCard, styles.cardCompany]}>
              <Typography style={styles.sectionTitle}>Campaign & Template</Typography>
              <View style={styles.gridContainer}>
                {allAvailableItems
                  .filter((i) => ['Campaign', 'Templates'].includes(i.id))
                  .map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.gridItemSingle}
                      onPress={() =>
                        handleNavigate(
                          item.route as keyof AppStackParamList,
                          item.params as Record<string, unknown>,
                        )
                      }
                    >
                      <View style={styles.iconCenterOnly}>
                        {renderLogo(item.icon, { width: normalize(28), height: normalize(28) })}
                      </View>
                      <Typography style={styles.gridLabelSmall} numberOfLines={2}>
                        {item.label}
                      </Typography>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          )}

          <View style={styles.spacer150} />
        </ScrollView>
      </Animated.View>

      {/*
        Tab bar phantom touch layer:
        The Modal covers the real tab bar. These transparent touch areas sit at the bottom
        of the Modal and map exactly to each tab position. Tapping them closes the sidebar
        AND navigates — so the user never has to tap twice.
      */}
      <View style={styles.tabBarPhantom} pointerEvents="box-none">
        {/* Home */}
        <TouchableOpacity
          style={styles.phantomTab}
          activeOpacity={0.01}
          onPress={() => { onClose(); onTabNavigate?.('Home'); }}
        />
        {/* Contacts */}
        <TouchableOpacity
          style={styles.phantomTab}
          activeOpacity={0.01}
          onPress={() => { onClose(); onTabNavigate?.('Contacts'); }}
        />
        {/* Center action (Conversations) */}
        <TouchableOpacity
          style={styles.phantomTab}
          activeOpacity={0.01}
          onPress={() => { onClose(); onTabNavigate?.('Conversations'); }}
        />
        {/* Leads */}
        <TouchableOpacity
          style={styles.phantomTab}
          activeOpacity={0.01}
          onPress={() => { onClose(); onTabNavigate?.('Leads'); }}
        />
        {/* More — just close, already in More */}
        <TouchableOpacity
          style={styles.phantomTab}
          activeOpacity={0.01}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Phantom layer at the bottom of the Modal — matches real tab bar position
  tabBarPhantom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
  },
  phantomTab: {
    flex: 1,
    height: TAB_BAR_HEIGHT,
  },
  fullAbsolute: { ...StyleSheet.absoluteFillObject, zIndex: 9999, elevation: 9999 },
  backdrop: { ...StyleSheet.absoluteFillObject },
  // Overlay covers the FULL screen — tapping tab bar area also dismisses sidebar
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sidebarContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    // Stops above the tab bar so tab items are visually visible through the transparent Modal
    bottom: TAB_BAR_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: '#F8F9FB',
    overflow: 'hidden',
  },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    marginBottom: normalize(20),
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    backgroundColor: Colors.basecolor + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.basecolor, fontSize: normalize(18), fontWeight: '700' },
  headerText: { marginLeft: normalize(12) },
  userName: { fontSize: normalize(16), color: Colors.basecolor },
  welcomeText: { fontSize: normalize(12), color: Colors.text.gray },
  notificationBtn: {
    padding: normalize(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationWrapper: {
    position: 'relative',
    padding: normalize(2),
  },
  badge: {
    position: 'absolute',
    top: normalize(-2),
    right: normalize(-6),
    backgroundColor: Colors.error,
    borderRadius: normalize(10),
    minWidth: Platform.OS === 'android' ? normalize(28) : normalize(16),
    height: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(4),
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: normalize(7),
    lineHeight: normalize(9),
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  scrollContent: { paddingHorizontal: normalize(20) },
  sectionRow: { flexDirection: 'row', gap: normalize(12), marginBottom: normalize(16) },
  carouselContainer: { marginBottom: normalize(16) },
  carouselContent: { paddingRight: normalize(20) },
  bigCard: {
    width: normalize(150),
    height: normalize(190),
    borderRadius: normalize(20),
    padding: normalize(16),
    marginRight: normalize(16),
    justifyContent: 'space-between',
  },
  bgContact: { backgroundColor: '#EAF8F1' },
  bgCustomer: { backgroundColor: '#FDE9ED' },
  bgLeads: { backgroundColor: '#FCF5E5' },
  bigCardTitle: { fontSize: normalize(16), color: Colors.basecolor },
  bigCardIcon: { alignSelf: 'center', marginTop: normalize(10) },
  tabletCardsRow: {
    flexDirection: 'row',
    gap: normalize(12),
    marginBottom: normalize(16),
    width: '100%',
  },
  tabletBigCard: {
    flex: 1,
    marginRight: 0,
    width: undefined,
  },
  noRightMargin: {
    marginRight: 0,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: normalize(20),
    padding: normalize(12),
    marginBottom: normalize(16),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
  },
  card92: { height: normalize(98) },
  cardCompany: { height: normalize(112) },
  halfCard: { flex: 1, marginBottom: 0 },
  fullCard: { flex: 1.8, marginBottom: 0 },
  flex15: { flex: 1.5, marginBottom: 0 },
  flex1: { flex: 1, marginBottom: 0 },
  spacer150: { height: normalize(150) },
  sectionTitle: {
    fontSize: normalize(12),
    fontWeight: '700',
    color: Colors.basecolor,
    marginBottom: normalize(6),
  },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '33.33%', alignItems: 'center', marginBottom: normalize(16) },
  grid20: { width: '20%' },
  grid25: { width: '25%', marginBottom: 0 },
  gridItemSingle: { flex: 1, alignItems: 'center' },
  iconWrapper: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(12),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(8),
  },
  iconCenterOnly: { alignItems: 'center', justifyContent: 'center', marginBottom: normalize(8) },
  iconWrapperSmall: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(8),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(2),
  },
  gridLabel: {
    fontSize: normalize(11),
    color: Colors.basecolor,
    textAlign: 'center',
    paddingHorizontal: normalize(4),
    fontWeight: '400',
  },
  gridLabelSmall: {
    fontSize: normalize(9.5),
    color: Colors.basecolor,
    textAlign: 'center',
    paddingHorizontal: normalize(2),
    lineHeight: normalize(11),
    fontWeight: '700',
  },
});

export default Sidebar;
