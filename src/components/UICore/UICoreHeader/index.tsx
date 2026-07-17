// @ts-nocheck
import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Animated, {
  Extrapolate,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Search, Filter, Phone, Mail, Bell } from 'lucide-react-native';
import { normalize } from '../../../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UICoreSearch } from '../UICoreSearch';
import { renderLogo } from '../../../utils/renderLogo';
import icons from '../../../constants/icons';
import Colors from '../../../theme/color';
import { Typography } from '../../Typography';
import { useAppSelector } from '../../../hooks/useRedux';
import { triggerHaptic } from '../../../utils/haptic';

import { playgroundStyles } from './PlaygroundHeaderStyles';
import { screenStyles } from './ScreenHeaderStyles';
import { chatStyles } from './ChatHeaderStyles';
import { detailsStyles } from './DetailsHeaderStyles';
import { agentStyles } from './AgentHeaderStyles';

// Exporting variant if user adds more later
export interface UiCoreHeaderVariant {
  type: 'screen' | 'details' | 'chat' | 'playground' | 'agent' | 'home';
  title?: string;
  titleColor?: string;
  subTitle?: string;
  topLabel?: string;
  glowColor?: string;
  glowOpacity?: number;
  count?: number;
  leadData?: {
    contactName: string;
    companyName?: string;
    email?: string;
    phoneNumber?: string;
    status: string;
    initials?: string | ReactNode;
  };
  playgroundData?: {
    selectedAgent: { id: string; name: string } | null;
    onAgentPress?: () => void;
  };
  chatData?: {
    avatarText: string;
    avatarUrl?: string;
    statusText: string;
    phoneNumber?: string;
    email?: string;
    isTyping?: boolean;
    mode?: 'AI' | 'Manual';
  };
}

export interface UiCoreHeaderProps {
  variant: UiCoreHeaderVariant;
  onBack?: () => void;
  onSearch?: () => void;
  onNotification?: () => void;
  onFilter?: () => void;
  bottomContent?: ReactNode;
  searchProps?: {
    isSearchActive: boolean;
    onToggleSearch: () => void;
    query: string;
    onQueryChange: (query: string) => void;
    placeholder?: string;
  };
  rightContent?: ReactNode;
  scrollY?: SharedValue<number>;
  headerBgColor?: string;
  backIcon?: unknown;
}

const MIN_HEADER_HEIGHT = normalize(189);

const UiCoreHeader: React.FC<UiCoreHeaderProps> = ({
  variant,
  onBack,
  onSearch,
  onNotification,
  onFilter,
  searchProps,
  bottomContent,
  rightContent,
  scrollY,
  headerBgColor = Colors.basecolor,
  backIcon,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAppSelector((state) => state.auth.user);
  const tenant = useAppSelector((state) => state.auth.tenant);
  const unreadCount = useAppSelector((state) => state.notification.unReadNotification?.length || 0);

  // Tactical interaction dispatch wrappers
  const handleBack = React.useCallback(() => {
    triggerHaptic();
    onBack?.();
  }, [onBack]);

  const handleSearch = React.useCallback(() => {
    triggerHaptic();
    onSearch?.();
  }, [onSearch]);

  const handleNotification = React.useCallback(() => {
    triggerHaptic();
    onNotification?.();
  }, [onNotification]);

  const handleFilter = React.useCallback(() => {
    triggerHaptic();
    onFilter?.();
  }, [onFilter]);

  const handleToggleSearch = React.useCallback(() => {
    triggerHaptic();
    searchProps?.onToggleSearch();
  }, [searchProps]);

  const onAgentPress = variant.playgroundData?.onAgentPress;
  const handleAgentPress = React.useCallback(() => {
    triggerHaptic();
    onAgentPress?.();
  }, [onAgentPress]);
  // HOOKS MUST BE AT TOP LEVEL
  const scrollRange = normalize(100);
  const expandedEnd = normalize(60);
  const collapsedStart = normalize(40);
  const transYExpanded = -normalize(20);
  const transYCollapsed = normalize(10);

  const [glowId] = React.useState(() => `glow-${Math.random().toString(36).substr(2, 9)}`);

  const isDetails = variant.type === 'details';
  const isAgent = variant.type === 'agent';
  const isPlayground = variant.type === 'playground';

  // Playground Height Animation
  const playgroundAgent = variant.playgroundData?.selectedAgent;
  const playgroundHeight = useSharedValue(playgroundAgent ? normalize(210) : normalize(260));

  React.useEffect(() => {
    if (isPlayground) {
      playgroundHeight.value = withTiming(playgroundAgent ? normalize(210) : normalize(260), {
        duration: 300,
      });
    }
  }, [playgroundAgent, playgroundHeight, isPlayground]);

  const animatedPlaygroundStyle = useAnimatedStyle(() => {
    if (!isPlayground) return {};
    return { height: playgroundHeight.value };
  });

  const hasContactInfo = isDetails && (variant.leadData?.phoneNumber || variant.leadData?.email);
  const currentMaxHeight = isAgent
    ? normalize(189)
    : hasContactInfo
    ? normalize(284)
    : normalize(260);

  const glowRadius = Platform.OS === 'ios' ? '75%' : '40%';
  const glowOpacityVal =
    Platform.OS === 'ios'
      ? (variant.glowOpacity ?? 0.7) * 0.65
      : (variant.glowOpacity ?? 0.7) * 0.55;

  const animatedHeaderStyle = useAnimatedStyle(() => {
    if (!scrollY || !isDetails) return { height: currentMaxHeight };
    const height = interpolate(
      scrollY.value,
      [0, scrollRange],
      [currentMaxHeight, MIN_HEADER_HEIGHT],
      Extrapolate.CLAMP,
    );
    return { height };
  });

  const expandedOpacity = useAnimatedStyle(() => {
    if (!scrollY || !isDetails) return { opacity: 1 };
    const opacity = interpolate(scrollY.value, [0, expandedEnd], [1, 0], Extrapolate.CLAMP);
    const translateY = interpolate(
      scrollY.value,
      [0, expandedEnd],
      [0, transYExpanded],
      Extrapolate.CLAMP,
    );
    return {
      opacity,
      transform: [{ translateY }],
      pointerEvents: opacity === 0 ? ('none' as const) : ('auto' as const),
    };
  });

  const collapsedOpacity = useAnimatedStyle(() => {
    if (!scrollY || !isDetails) return { opacity: 0 };
    const opacity = interpolate(
      scrollY.value,
      [collapsedStart, scrollRange],
      [0, 1],
      Extrapolate.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [collapsedStart, scrollRange],
      [transYCollapsed, 0],
      Extrapolate.CLAMP,
    );
    return {
      opacity,
      transform: [{ translateY }],
      pointerEvents: opacity === 0 ? ('none' as const) : ('auto' as const),
    };
  });

  const initials =
    variant.type === 'details'
      ? variant.leadData?.initials ||
        variant.leadData?.contactName?.substring(0, 2).toUpperCase() ||
        'LD'
      : 'LD';

  if (variant.type === 'screen') {
    const isSearchActive = searchProps?.isSearchActive;

    return (
      <View style={[screenStyles.wrapper, { paddingTop: insets.top + 2 }]}>
        <View style={screenStyles.headerRow}>
          {isSearchActive ? (
            <View style={screenStyles.searchFullWidth}>
              <UICoreSearch
                autoFocus
                placeholder={searchProps?.placeholder || 'Search...'}
                value={searchProps?.query}
                onChangeText={searchProps?.onQueryChange}
                onClear={searchProps?.onToggleSearch}
                containerStyle={screenStyles.searchNoMargin}
                inputContainerStyle={{
                  minHeight: normalize(40),
                  height: normalize(40),
                  borderRadius: normalize(12),
                }}
                leftIcon={
                  <TouchableOpacity
                    onPress={handleToggleSearch}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {renderLogo(icons.back, { width: normalize(18), height: normalize(18) })}
                  </TouchableOpacity>
                }
              />
            </View>
          ) : (
            <>
              <View style={screenStyles.headerLeft}>
                {onBack ? (
                  <TouchableOpacity
                    style={screenStyles.backButton}
                    onPress={handleBack}
                    activeOpacity={0.7}
                  >
                    {renderLogo(backIcon || icons.back, {
                      width: normalize(20),
                      height: normalize(20),
                      color: variant.titleColor || Colors.black,
                    })}
                  </TouchableOpacity>
                ) : null}

                <View style={{ flexDirection: 'column' }}>
                  {variant.title ? (
                    <Typography
                      style={[
                        screenStyles.title,
                        variant.titleColor ? { color: variant.titleColor } : null,
                      ]}
                    >
                      {variant.title}
                    </Typography>
                  ) : null}

                  {variant.subTitle ? (
                    <Typography
                      style={{
                        fontSize: normalize(11),
                        color: '#6B7280',
                        marginTop: normalize(1),
                        fontWeight: '500',
                      }}
                    >
                      {variant.subTitle}
                    </Typography>
                  ) : null}
                </View>

                {variant.count !== undefined ? (
                  <View style={screenStyles.countBadge}>
                    <Typography style={screenStyles.countText}>
                      {variant.count > 99 ? '99+' : variant.count}
                    </Typography>
                  </View>
                ) : null}
              </View>

              <View style={screenStyles.headerActions}>
                {onSearch ? (
                  <TouchableOpacity
                    style={screenStyles.iconButton}
                    onPress={handleSearch}
                    activeOpacity={0.7}
                  >
                    <Search color={Colors.black} size={normalize(20)} strokeWidth={1.5} />
                  </TouchableOpacity>
                ) : null}
                {onFilter ? (
                  <TouchableOpacity
                    style={screenStyles.iconButton}
                    onPress={handleFilter}
                    activeOpacity={0.7}
                  >
                    <Filter color={Colors.black} size={normalize(20)} strokeWidth={1.5} />
                  </TouchableOpacity>
                ) : null}
                {rightContent}
              </View>
            </>
          )}
        </View>
        {bottomContent ? <View style={screenStyles.bottomArea}>{bottomContent}</View> : null}
      </View>
    );
  }

  if (variant.type === 'chat') {
    return (
      <View style={[chatStyles.wrapper, { paddingTop: insets.top + 2 }]}>
        <View style={chatStyles.headerRow}>
          {onBack && (
            <TouchableOpacity
              style={chatStyles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              {renderLogo(icons.back, { width: normalize(20), height: normalize(20) })}
            </TouchableOpacity>
          )}

          <View style={chatStyles.avatarCircle}>
            {variant.chatData?.avatarUrl ? (
              <Animated.Image
                source={{ uri: variant.chatData.avatarUrl }}
                style={chatStyles.avatarImage}
              />
            ) : (
              <Typography style={chatStyles.avatarText}>{variant.chatData?.avatarText}</Typography>
            )}
          </View>

          <View style={chatStyles.headerInfo}>
            <Typography variant="body1" weight="700" style={chatStyles.title} numberOfLines={1}>
              {variant.title}
            </Typography>
            {variant.chatData?.phoneNumber ? (
              <Typography variant="caption" style={chatStyles.phoneText}>
                {variant.chatData.phoneNumber}
              </Typography>
            ) : variant.chatData?.email ? (
              <Typography variant="caption" style={chatStyles.phoneText}>
                {variant.chatData.email}
              </Typography>
            ) : null}
          </View>

          {rightContent}
        </View>
      </View>
    );
  }

  if (variant.type === 'details') {
    return (
      <Animated.View style={[detailsStyles.container, animatedHeaderStyle]}>
        <View style={detailsStyles.backgroundContainer}>
          <View style={[detailsStyles.baseBg, { backgroundColor: headerBgColor }]} />
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id={glowId} cx="50%" cy="85%" r={glowRadius} fx="50%" fy="85%">
                <Stop
                  offset="0%"
                  stopColor={variant.glowColor || Colors.productText}
                  stopOpacity={glowOpacityVal}
                />
                <Stop offset="100%" stopColor={Colors.basecolor} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${glowId})`} />
          </Svg>
        </View>

        <View style={detailsStyles.topNav}>
          {onBack && (
            <TouchableOpacity
              onPress={handleBack}
              style={detailsStyles.backButton}
              activeOpacity={0.7}
            >
              {renderLogo(icons.Union, {
                width: normalize(24),
                height: normalize(24),
                fill: Colors.white,
              })}
            </TouchableOpacity>
          )}
          <Typography style={detailsStyles.detailsTitle} numberOfLines={1}>
            {variant.title}
          </Typography>
        </View>

        <Animated.View
          style={[
            detailsStyles.expandedProfileContainer,
            expandedOpacity,
            { top: hasContactInfo ? normalize(125) : normalize(135) },
          ]}
        >
          <View style={detailsStyles.avatarCircle}>
            {typeof initials === 'string' ? (
              <Typography style={detailsStyles.avatarText}>{initials}</Typography>
            ) : (
              initials
            )}
          </View>
          <Typography style={detailsStyles.contactName} numberOfLines={1}>
            {variant.leadData?.contactName}
          </Typography>
          <View style={detailsStyles.statusBadge}>
            <Text style={detailsStyles.statusText}>{variant.leadData?.status || 'Active'}</Text>
          </View>

          <View style={detailsStyles.contactRow}>
            {variant.type === 'details' && variant.leadData?.phoneNumber && (
              <View style={detailsStyles.contactItem}>
                <Phone size={normalize(12)} color={Colors.muted} strokeWidth={2} />
                <Typography style={detailsStyles.contactInfoText}>
                  {variant.leadData.phoneNumber}
                </Typography>
              </View>
            )}
            {variant.type === 'details' &&
              variant.leadData?.phoneNumber &&
              variant.leadData?.email && <View style={detailsStyles.verticalDivider} />}
            {variant.type === 'details' && variant.leadData?.email && (
              <View style={detailsStyles.contactItem}>
                <Mail size={normalize(12)} color={Colors.muted} strokeWidth={2} />
                <Typography style={detailsStyles.contactInfoText}>
                  {variant.leadData.email}
                </Typography>
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View
          style={[
            detailsStyles.collapsedProfileContainer,
            collapsedOpacity,
            { top: hasContactInfo ? normalize(122) : normalize(130) },
          ]}
        >
          <View style={detailsStyles.collapsedAvatar}>
            {typeof initials === 'string' ? (
              <Typography style={detailsStyles.collapsedAvatarText}>{initials}</Typography>
            ) : (
              initials
            )}
          </View>
          <View style={detailsStyles.flex1}>
            <View style={detailsStyles.collapsedTopRow}>
              <Typography style={detailsStyles.collapsedName} numberOfLines={1}>
                {variant.type === 'details' ? variant.leadData?.contactName : ''}
              </Typography>
              <View style={detailsStyles.statusBadgeSmall}>
                <Text style={detailsStyles.statusTextSmall}>
                  {variant.type === 'details' ? variant.leadData?.status || 'N/A' : ''}
                </Text>
              </View>
            </View>
            <View style={detailsStyles.collapsedContactRow}>
              {variant.type === 'details' && variant.leadData?.phoneNumber && (
                <View style={detailsStyles.contactItem}>
                  <Phone size={normalize(10)} color={Colors.muted} />
                  <Typography style={detailsStyles.contactInfoTextSmall}>
                    {variant.leadData.phoneNumber}
                  </Typography>
                </View>
              )}
              {variant.type === 'details' &&
                variant.leadData?.phoneNumber &&
                variant.leadData?.email && <View style={detailsStyles.smallVerticalDivider} />}
              {variant.type === 'details' && variant.leadData?.email && (
                <View style={detailsStyles.contactItem}>
                  <Mail size={normalize(10)} color={Colors.muted} />
                  <Typography style={detailsStyles.contactInfoTextSmall}>
                    {variant.leadData.email}
                  </Typography>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    );
  }

  if (variant.type === 'playground') {
    const agent = variant.playgroundData?.selectedAgent;

    return (
      <Animated.View style={[playgroundStyles.container, animatedPlaygroundStyle]}>
        <View style={playgroundStyles.backgroundContainer}>
          <View style={[playgroundStyles.baseBg, { backgroundColor: headerBgColor }]} />
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id={glowId} cx="50%" cy="85%" r={glowRadius} fx="50%" fy="85%">
                <Stop
                  offset="0%"
                  stopColor={variant.glowColor || Colors.productText}
                  stopOpacity={glowOpacityVal}
                />
                <Stop offset="100%" stopColor={Colors.basecolor} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${glowId})`} />
          </Svg>
        </View>

        <View style={[playgroundStyles.topNav, { paddingTop: insets.top + 2 }]}>
          {onBack && (
            <TouchableOpacity
              onPress={handleBack}
              style={playgroundStyles.backButton}
              activeOpacity={0.7}
            >
              {renderLogo(icons.back, {
                width: normalize(20),
                height: normalize(20),
                color: Colors.white,
              })}
            </TouchableOpacity>
          )}
          <Typography style={playgroundStyles.title}>{variant.title || 'Playground'}</Typography>
        </View>

        <View style={playgroundStyles.contentArea}>
          {agent ? (
            <View style={playgroundStyles.activeAgentRow}>
              <View style={playgroundStyles.agentAvatarSmall}>
                {renderLogo(icons.playground, { width: normalize(30), height: normalize(30) })}
              </View>
              <Typography style={playgroundStyles.activeAgentName} numberOfLines={1}>
                {agent.name}
              </Typography>
              <TouchableOpacity
                onPress={handleAgentPress}
                style={playgroundStyles.switchAgentButton}
                activeOpacity={0.7}
              >
                {renderLogo(icons.downarrow, {
                  width: normalize(14),
                  height: normalize(14),
                  color: Colors.white,
                })}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={playgroundStyles.lockedContent}>
              <View style={playgroundStyles.robotIconBox}>
                {renderLogo(icons.playground, { width: normalize(40), height: normalize(40) })}
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleAgentPress}
                style={playgroundStyles.selectAgentButton}
              >
                <Typography style={playgroundStyles.selectAgentText}>Select Agent</Typography>
                {renderLogo(icons.downarrow, {
                  width: normalize(12),
                  height: normalize(12),
                  color: Colors.white,
                })}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    );
  }

  if (variant.type === 'agent') {
    return (
      <Animated.View style={[agentStyles.container, animatedHeaderStyle]}>
        <View style={agentStyles.backgroundContainer}>
          <View style={[agentStyles.baseBg, { backgroundColor: headerBgColor }]} />
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id={glowId} cx="50%" cy="85%" r={glowRadius} fx="50%" fy="85%">
                <Stop
                  offset="0%"
                  stopColor={variant.glowColor || Colors.productText}
                  stopOpacity={glowOpacityVal}
                />
                <Stop offset="100%" stopColor={Colors.basecolor} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${glowId})`} />
          </Svg>
        </View>

        <View style={agentStyles.topNav}>
          {onBack && (
            <TouchableOpacity
              onPress={handleBack}
              style={agentStyles.backButton}
              activeOpacity={0.7}
            >
              {renderLogo(icons.Union, {
                width: normalize(24),
                height: normalize(24),
                fill: Colors.white,
              })}
            </TouchableOpacity>
          )}
          <Typography style={agentStyles.detailsTitle}>{variant.title}</Typography>
        </View>

        <Animated.View style={[agentStyles.expandedProfileContainer, expandedOpacity]}>
          <View style={agentStyles.profileRow}>
            <View style={agentStyles.avatarCircle}>
              {renderLogo(icons.user, {
                width: normalize(24),
                height: normalize(24),
                color: Colors.basecolor,
              })}
            </View>
            <View style={agentStyles.nameColumn}>
              <Typography style={agentStyles.contactName} numberOfLines={1}>
                {variant.leadData?.contactName}
              </Typography>
              <Typography style={agentStyles.companyName} numberOfLines={1}>
                {variant.leadData?.companyName}
              </Typography>
            </View>
            <View style={agentStyles.statusBadge}>
              <Text style={agentStyles.statusText}>{variant.leadData?.status || 'Active'}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[agentStyles.collapsedProfileContainer, collapsedOpacity]}>
          <View style={agentStyles.profileRowSmall}>
            <View style={agentStyles.collapsedAvatar}>
              {renderLogo(icons.user, {
                width: normalize(14),
                height: normalize(14),
                color: Colors.basecolor,
              })}
            </View>
            <View style={agentStyles.nameColumnSmall}>
              <Typography style={agentStyles.collapsedName} numberOfLines={1}>
                {variant.leadData?.contactName}
              </Typography>
              <Typography style={agentStyles.companyNameSmall} numberOfLines={1}>
                {variant.leadData?.companyName}
              </Typography>
            </View>
            <View style={agentStyles.statusBadgeSmall}>
              <Text style={agentStyles.statusTextSmall}>{variant.leadData?.status || 'N/A'}</Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    );
  }

  if (variant.type === 'home') {
    return (
      <View style={[homeHeaderStyles.header, { marginTop: insets.top + normalize(10) }]}>
        <View style={homeHeaderStyles.row}>
          <TouchableOpacity
            style={homeHeaderStyles.avatar}
            onPress={() => {
              triggerHaptic();
              navigation.navigate('Profile');
            }}
            activeOpacity={0.7}
          >
            <Typography weight="700" style={homeHeaderStyles.avatarText}>
              {user?.first_name?.charAt(0).toUpperCase() || 'U'}
            </Typography>
          </TouchableOpacity>
          <View style={homeHeaderStyles.headerText}>
            <Typography weight="700" style={homeHeaderStyles.userName} numberOfLines={1}>
              Hello, {user?.first_name || 'User'}
            </Typography>
            <Typography style={homeHeaderStyles.welcomeText} numberOfLines={1}>
              Welcome to {tenant?.business_name || 'Salesbot'}
            </Typography>
          </View>
        </View>
        <TouchableOpacity
          style={homeHeaderStyles.notificationBtn}
          onPress={onNotification ? handleNotification : handleSearch}
          activeOpacity={0.7}
        >
          <View style={homeHeaderStyles.notificationWrapper}>
            <Bell color={Colors.basecolor} size={normalize(24)} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <View style={homeHeaderStyles.badge}>
                <Typography
                  weight="700"
                  style={homeHeaderStyles.badgeText}
                  numberOfLines={Platform.OS === 'android' ? 1 : undefined}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Typography>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const homeHeaderStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    marginBottom: normalize(12),
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
  welcomeText: { fontSize: normalize(12), color: '#6B7280' },
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
});

export default UiCoreHeader;
