// @ts-nocheck
// @ts-nocheck
import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View, Animated, Platform } from 'react-native';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import colors from '../../theme/color';
import { Typography } from '../Typography';
import { normalize } from '../../utils/responsive';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToasterProps {
  message: string;
  type: ToastType;
  duration?: number;
  onHide: () => void;
}

export const Toaster: React.FC<ToasterProps> = ({ message, type, duration = 3000, onHide }) => {
  const themeColors = colors;

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, [fadeAnim, slideAnim, onHide]);

  useEffect(() => {
    // Show toast
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide toast after duration
    const timer = setTimeout(() => {
      hide();
    }, duration);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, duration, hide]);

  const config = {
    success: {
      icon: CheckCircle2,
      color: themeColors.success,
      bgColor: themeColors.success + '15',
      label: 'Success',
    },
    error: {
      icon: AlertCircle,
      color: themeColors.error,
      bgColor: themeColors.error + '15',
      label: 'Error',
    },
    warning: {
      icon: AlertTriangle,
      color: themeColors.warning,
      bgColor: themeColors.warning + '15',
      label: 'Warning',
    },
    info: {
      icon: Info,
      color: themeColors.info,
      bgColor: themeColors.info + '15',
      label: 'Info',
    },
  };

  const { icon: Icon, color, bgColor, label } = config[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.toastWrapper, { backgroundColor: themeColors.white }]}>
        <View style={[styles.glassOverlay, { borderColor: color + '30' }]} />

        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <Icon size={normalize(20)} color={color} strokeWidth={2.5} />
          </View>

          <View style={styles.textContainer}>
            <Typography variant="caption" weight="800" style={[styles.labelType, { color }]}>
              {label.toUpperCase()}
            </Typography>
            <Typography
              variant="body2"
              weight="600"
              color={themeColors.darkText || '#1F2937'}
              style={styles.message}
            >
              {message}
            </Typography>
          </View>

          <View style={styles.closeButton}>
            <X size={normalize(16)} color={themeColors.darkText || '#1F2937'} />
          </View>
        </View>

        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: color,
              transform: [{ scaleX: fadeAnim }],
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? normalize(60) : normalize(40),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: normalize(16),
  },
  toastWrapper: {
    width: '100%',
    maxWidth: normalize(400),
    borderRadius: normalize(20),
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: normalize(20),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalize(12),
    paddingRight: normalize(16),
  },
  iconContainer: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: normalize(12),
    justifyContent: 'center',
  },
  labelType: {
    letterSpacing: 0.5,
  },
  message: {
    marginTop: normalize(2),
    lineHeight: normalize(18),
  },
  closeButton: {
    padding: normalize(4),
    opacity: 0.5,
  },
  progressBar: {
    height: normalize(3),
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    opacity: 0.6,
  },
});
