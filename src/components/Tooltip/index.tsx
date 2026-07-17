// @ts-nocheck
// @ts-nocheck
/**
 * Tooltip / Popover Component
 * ────────────────────────────────────────────────────────────────────────────
 * Mobile equivalent of a web hover popover.
 *
 * HOW IT WORKS:
 *   • Wrap any element with <Tooltip content={...}> … </Tooltip>
 *   • On TAP (or LONG PRESS via triggerOnLongPress prop) it measures the
 *     trigger's position on screen using ref.measure(), then renders the
 *     popover in a transparent full-screen Modal, positioned relative to
 *     the trigger.
 *   • Tapping the backdrop (outside the popover) dismisses it.
 *   • Works on both iOS and Android — Modal is the safest cross-platform
 *     way to render content above all other UI, including inside ScrollViews.
 *
 * USAGE:
 *   // Simple string content
 *   <Tooltip content="This is the Phone ID from your WhatsApp Business account">
 *     <TouchableOpacity><InfoIcon /></TouchableOpacity>
 *   </Tooltip>
 *
 *   // Rich content (React node)
 *   <Tooltip
 *     content={
 *       <View>
 *         <Typography>PENDING</Typography>
 *         <Typography>ETL Task Queued</Typography>
 *       </View>
 *     }
 *     placement="left"
 *   >
 *     <StatusBadge />
 *   </Tooltip>
 *
 *   // On a plain View (not touchable) — use triggerOnLongPress
 *   <Tooltip content="Details here" triggerOnLongPress>
 *     <View><Text>Tap &amp; hold me</Text></View>
 *   </Tooltip>
 */

import React, { useRef, useState, useCallback, ReactNode, useMemo } from 'react';
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  ScrollView,
} from 'react-native';
import colors from '../../theme/color';
import { normalize, screenWidth, screenHeight } from '../../utils/responsive';
import { Typography } from '../Typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TooltipProps {
  /** Content to show inside the popover — string text or any ReactNode */
  content: ReactNode;
  /** Children that act as the trigger */
  children: ReactNode;
  /** Which side the popover appears. Default: 'bottom' */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** If true, the popover triggers on long press instead of tap */
  triggerOnLongPress?: boolean;
  /** Max width of the popover. Default: 240 */
  maxWidth?: number;
  /** Custom style for the popover container */
  popoverStyle?: ViewStyle;
  /** Controlled: if provided, this overrides internal open state */
  visible?: boolean;
  /** Controlled: called when tooltip wants to close */
  onClose?: () => void;
  /** Controlled: called when tooltip wants to open */
  onOpen?: () => void;
  /** Custom style for the trigger wrapper View */
  triggerStyle?: ViewStyle;
}

interface TriggerLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'bottom',
  triggerOnLongPress = false,
  maxWidth = 240,
  popoverStyle,
  visible: controlledVisible,
  onClose: controlledOnClose,
  onOpen: controlledOnOpen,
  triggerStyle,
}) => {
  const themeColors = colors;

  // Internal state (used when not controlled externally)
  const [internalVisible, setInternalVisible] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<TriggerLayout | null>(null);
  const [popoverSize, setPopoverSize] = useState({ width: 0, height: 0 });

  const triggerRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  // Resolve controlled vs uncontrolled
  const isVisible = controlledVisible !== undefined ? controlledVisible : internalVisible;

  const show = useCallback(() => {
    if (controlledOnOpen) {
      controlledOnOpen();
    } else {
      setInternalVisible(true);
    }
  }, [controlledOnOpen]);

  const hide = useCallback(() => {
    // Animate out, then hide
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      if (controlledOnClose) {
        controlledOnClose();
      } else {
        setInternalVisible(false);
      }
    });
  }, [controlledOnClose, fadeAnim, scaleAnim]);

  // When modal becomes visible, animate in
  React.useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, scaleAnim]);

  // Measure trigger position then show
  const handleTrigger = useCallback(() => {
    if (isVisible) {
      hide();
      return;
    }
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setTriggerLayout({ x, y, width, height, pageX, pageY });
      show();
    });
  }, [isVisible, hide, show]);

  // ─── Compute popover position ─────────────────────────────────────────────
  const popoverLayout = useMemo(() => {
    if (!triggerLayout) return null;

    const GAP = normalize(8);
    const SCREEN_MARGIN = normalize(12);
    const { pageX, pageY, width, height } = triggerLayout;
    const popW = popoverSize.width || maxWidth;
    const popH = popoverSize.height || 80;

    let left = pageX + width / 2 - popW / 2;
    let top = 0;
    let computedPlacement = placement;

    // Constrain left position
    left = Math.max(SCREEN_MARGIN, Math.min(left, screenWidth - popW - SCREEN_MARGIN));

    // Vertical flipping logic: determine best side based on available space
    // instead of measured height to prevent layout calculation loops (flickering).
    if (placement === 'bottom' || placement === 'top') {
      const spaceBelow = screenHeight - (pageY + height + GAP + SCREEN_MARGIN);
      const spaceAbove = pageY - (GAP + SCREEN_MARGIN);

      if (placement === 'bottom') {
        // If we don't have many pixels below (> 160) and we have more space above, flip.
        if (spaceBelow < normalize(160) && spaceAbove > spaceBelow) {
          computedPlacement = 'top';
        }
      } else {
        // If we don't have many pixels above (> 160) and we have more space below, flip.
        if (spaceAbove < normalize(160) && spaceBelow > spaceAbove) {
          computedPlacement = 'bottom';
        }
      }
    }

    switch (computedPlacement) {
      case 'top':
        top = pageY - popH - GAP;
        break;
      case 'left':
        top = pageY + height / 2 - popH / 2;
        left = Math.max(SCREEN_MARGIN, pageX - popW - GAP);
        break;
      case 'right':
        top = pageY + height / 2 - popH / 2;
        left = Math.min(screenWidth - popW - SCREEN_MARGIN, pageX + width + GAP);
        break;
      case 'bottom':
      default:
        top = pageY + height + GAP;
        break;
    }

    // Constraint: Height should never overflow the screen (either side)
    const availableSpace =
      computedPlacement === 'top'
        ? pageY - (GAP + SCREEN_MARGIN)
        : screenHeight - (pageY + height + GAP + SCREEN_MARGIN);

    const maxHeight = Math.max(availableSpace, normalize(100)); // Minimum 100 height

    return { style: { top, left, maxHeight }, placement: computedPlacement };
  }, [triggerLayout, popoverSize, placement, maxWidth]);

  const computePopoverStyle = (): ViewStyle => {
    return popoverLayout?.style || { top: 0, left: 0 };
  };

  // ─── Arrow position ───────────────────────────────────────────────────────
  const renderArrow = () => {
    if (!triggerLayout) return null;

    const { pageX, width } = triggerLayout;
    const popW = popoverSize.width || maxWidth;
    const SCREEN_MARGIN = normalize(12);

    // Calculate where trigger is relative to popover left edge
    let popLeft = pageX + width / 2 - popW / 2;
    popLeft = Math.max(SCREEN_MARGIN, Math.min(popLeft, screenWidth - popW - SCREEN_MARGIN));

    // Arrow should point to trigger center
    const arrowLeft = pageX + width / 2 - popLeft - normalize(6);

    const arrowStyle: ViewStyle = { left: arrowLeft };

    switch (popoverLayout?.placement) {
      case 'top':
        return <View style={[styles.arrow, styles.arrowBottom, arrowStyle]} />;
      case 'left':
        return <View style={[styles.arrow, styles.arrowRight]} />;
      case 'right':
        return <View style={[styles.arrow, styles.arrowLeft]} />;
      case 'bottom':
      default:
        return <View style={[styles.arrow, styles.arrowTop, arrowStyle]} />;
    }
  };

  return (
    <>
      {/* Trigger wrapper — we use ref to measure position */}
      <View ref={triggerRef} collapsable={false} style={triggerStyle}>
        {triggerOnLongPress ? (
          // If we want long-press on a plain View
          <TouchableOpacity activeOpacity={1} onLongPress={handleTrigger} delayLongPress={400}>
            {children}
          </TouchableOpacity>
        ) : (
          // Normal tap trigger
          <TouchableOpacity activeOpacity={0.7} onPress={handleTrigger}>
            {children}
          </TouchableOpacity>
        )}
      </View>

      {/* Popover rendered in a transparent full-screen Modal */}
      <Modal
        visible={isVisible}
        transparent
        animationType="none" // we handle animation ourselves
        onRequestClose={hide}
        statusBarTranslucent // important on Android to position over status bar
      >
        {/* Backdrop — tap to dismiss */}
        <TouchableWithoutFeedback onPress={hide}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Popover */}
        <Animated.View
          style={[
            styles.popover,
            { maxWidth, opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            computePopoverStyle(),
            popoverStyle,
          ]}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setPopoverSize({ width, height });
          }}
        >
          {renderArrow()}
          <ScrollView
            showsVerticalScrollIndicator={true}
            bounces={false}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.scrollContent}
          >
            {typeof content === 'string' ? (
              // If string, wrap in a default Typography to keep colors/styles consistent
              <Typography variant="caption" style={{ color: themeColors.white }}>
                {content}
              </Typography>
            ) : (
              content
            )}
          </ScrollView>
        </Animated.View>
      </Modal>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = (() => {
  const themeColors = colors;
  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
    },
    scrollContent: {
      flexGrow: 0,
    },
    popover: {
      position: 'absolute',
      backgroundColor: themeColors.dark,
      borderRadius: normalize(10),
      padding: normalize(12),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: normalize(4) },
      shadowOpacity: 0.25,
      shadowRadius: normalize(8),
      elevation: 12,
      // Ensure it doesn't go off-screen to the right
      right: undefined,
    },
    // Arrow triangles using border trick
    arrow: {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    },
    arrowTop: {
      top: -normalize(6),
      left: normalize(16),
      borderLeftWidth: normalize(6),
      borderRightWidth: normalize(6),
      borderBottomWidth: normalize(6),
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: themeColors.dark,
    },
    arrowBottom: {
      bottom: -normalize(6),
      left: normalize(16),
      borderLeftWidth: normalize(6),
      borderRightWidth: normalize(6),
      borderTopWidth: normalize(6),
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: themeColors.dark,
    },
    arrowLeft: {
      left: -normalize(6),
      top: normalize(12),
      borderTopWidth: normalize(6),
      borderBottomWidth: normalize(6),
      borderRightWidth: normalize(6),
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      borderRightColor: themeColors.dark,
    },
    arrowRight: {
      right: -normalize(6),
      top: normalize(12),
      borderTopWidth: normalize(6),
      borderBottomWidth: normalize(6),
      borderLeftWidth: normalize(6),
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      borderLeftColor: themeColors.dark,
    },
  });
})();

export default Tooltip;
