import React, { useEffect, useRef } from 'react';
import { View, StatusBar, Animated, Easing, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import MaskedViewBase from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../theme/color';
import styles from './SplashStyle';

// Type workaround for @react-native-masked-view/masked-view with React 19 JSX types
const MaskedView = MaskedViewBase as unknown as React.ComponentType<{
  style?: StyleProp<ViewStyle>;
  maskElement: React.ReactElement;
  children?: React.ReactNode;
  androidRenderingMode?: 'software' | 'hardware';
}>;



const SplashScreen: React.FC = () => {
  const bgFadeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(4)).current; // Starts massive (zoomed in closer)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bgFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [bgFadeAnim, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={[StyleSheet.absoluteFill, styles.centerContainer, { opacity: bgFadeAnim }]}>
        {/* Centered SalesBot Text with Masked Linear Gradient */}
        <Animated.View
          style={[
            styles.centerContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <MaskedView
            style={styles.maskedView}
            maskElement={
              <View style={styles.maskContent}>
                <Animated.Text style={styles.brandText}>HRMS App</Animated.Text>
              </View>
            }
          >
            <LinearGradient
              colors={colors.splashGradient as [string, string, ...string[]]}
              locations={[0.0781, 0.5065, 0.9604]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </MaskedView>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
