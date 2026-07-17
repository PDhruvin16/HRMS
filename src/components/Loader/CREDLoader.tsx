// @ts-nocheck
// @ts-nocheck
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { normalize } from '../../utils/responsive';
import colors from '../../theme/color';

const PulseBar = ({ color, delay, heightVal }: { color: string; delay: number; heightVal: number }) => {
  const animHeight = useSharedValue(normalize(8));

  useEffect(() => {
    const timer = setTimeout(() => {
      animHeight.value = withRepeat(
        withSequence(
          withTiming(heightVal, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(normalize(8), { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, delay);
    return () => clearTimeout(timer);
  }, [animHeight, delay, heightVal]);

  const style = useAnimatedStyle(() => ({
    height: animHeight.value,
  }));

  return (
    <Animated.View style={[styles.bar, { backgroundColor: color, shadowColor: color }, style]} />
  );
};

export const CREDLoader = ({
  text = 'Compiling Insights...',
  style,
  transparentCard = true,
  barColors = ['#35A1DA', '#867ADD', '#D4549F', '#E25760', '#F15A22'],
  textColor = '#111827',
}: {
  text?: string;
  style?: ViewStyle;
  transparentCard?: boolean;
  barColors?: string[];
  textColor?: string;
}) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={transparentCard ? styles.transparentCard : styles.loaderCard}>
        <View style={styles.chartContainer}>
          <PulseBar color={barColors[0]} delay={0} heightVal={normalize(40)} />
          <PulseBar color={barColors[1]} delay={150} heightVal={normalize(60)} />
          <PulseBar color={barColors[2]} delay={300} heightVal={normalize(80)} />
          <PulseBar color={barColors[3]} delay={450} heightVal={normalize(55)} />
          <PulseBar color={barColors[4]} delay={600} heightVal={normalize(35)} />
        </View>
        <Animated.Text style={[styles.text, textStyle, { color: textColor }]}>
          {text}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loaderCard: {
    backgroundColor: colors.white,
    paddingVertical: normalize(40),
    paddingHorizontal: normalize(30),
    borderRadius: normalize(24),
    alignItems: 'center',
    shadowColor: colors.shadowColor || '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  transparentCard: {
    paddingVertical: normalize(40),
    paddingHorizontal: normalize(30),
    alignItems: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: normalize(80),
    gap: normalize(8),
  },
  bar: {
    width: normalize(6),
    borderRadius: normalize(3),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  text: {
    marginTop: normalize(20),
    fontSize: normalize(12),
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
