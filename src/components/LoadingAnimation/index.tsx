// @ts-nocheck
import React, { useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Colors from '../../theme/color';

interface LoadingAnimationProps {
  visible?: boolean;
  overlay?: boolean;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  visible = true,
  overlay = true,
}) => {
  const h1 = useSharedValue(12);
  const h2 = useSharedValue(12);
  const h3 = useSharedValue(12);
  const h4 = useSharedValue(12);

  useEffect(() => {
    if (visible) {
      h1.value = withRepeat(
        withSequence(
          withTiming(45, { duration: 400, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
          withTiming(15, { duration: 300, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
          withTiming(60, { duration: 500, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
          withTiming(12, { duration: 400, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
        ),
        -1,
        true,
      );

      h2.value = withRepeat(
        withSequence(
          withTiming(20, { duration: 300, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
          withTiming(60, { duration: 450, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
          withTiming(15, { duration: 350, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
          withTiming(40, { duration: 400, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
        ),
        -1,
        true,
      );

      h3.value = withRepeat(
        withSequence(
          withTiming(55, { duration: 500, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
          withTiming(12, { duration: 350, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
          withTiming(35, { duration: 400, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
          withTiming(20, { duration: 300, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
        ),
        -1,
        true,
      );

      h4.value = withRepeat(
        withSequence(
          withTiming(15, { duration: 350, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
          withTiming(40, { duration: 400, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
          withTiming(12, { duration: 300, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
          withTiming(55, { duration: 450, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
        ),
        -1,
        true,
      );
    } else {
      h1.value = 12;
      h2.value = 12;
      h3.value = 12;
      h4.value = 12;
    }
  }, [visible, h1, h2, h3, h4]);

  const style1 = useAnimatedStyle(() => ({ height: h1.value }));
  const style2 = useAnimatedStyle(() => ({ height: h2.value }));
  const style3 = useAnimatedStyle(() => ({ height: h3.value }));
  const style4 = useAnimatedStyle(() => ({ height: h4.value }));

  if (!visible) return null;

  const renderContent = () => (
    <View style={styles.container}>
      <View style={styles.barsRow}>
        <Animated.View style={[styles.bar, styles.bar1, style1]} />
        <Animated.View style={[styles.bar, styles.bar2, style2]} />
        <Animated.View style={[styles.bar, styles.bar3, style3]} />
        <Animated.View style={[styles.bar, styles.bar4, style4]} />
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          {renderContent()}
        </View>
      </Modal>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  container: {
    padding: 24,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 80,
    width: 100,
    gap: 8,
  },
  bar: {
    width: 10,
    borderRadius: 5,
  },
  bar1: { backgroundColor: '#35A1DA' },
  bar2: { backgroundColor: '#D4549F' },
  bar3: { backgroundColor: '#F15A22' },
  bar4: { backgroundColor: '#867ADD' },
});

export default LoadingAnimation;
