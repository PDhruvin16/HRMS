import React, { useEffect, useRef, useState } from 'react';
import { View, StatusBar, Animated, Easing, ImageBackground, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../theme/color';
import styles from './SplashStyle';

const splashImg = require('../../../assets/images/Splash1.png');

const SplashScreen: React.FC = () => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const bgFadeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(4)).current; // Starts massive (zoomed in closer)

  useEffect(() => {
    if (isImageLoaded) {
      Animated.parallel([
        Animated.timing(bgFadeAnim, {
          toValue: 1,
          duration: 600, // Background smoothly fades in once loaded
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1800, // Slower logo fade-in
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1800, // Slower scale down
          easing: Easing.out(Easing.ease), // Smooth cinematic deceleration
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isImageLoaded, bgFadeAnim, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgFadeAnim }]}>
        <ImageBackground
          source={splashImg}
          defaultSource={splashImg}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          fadeDuration={0}
          onLoad={() => setIsImageLoaded(true)}
        >
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
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
