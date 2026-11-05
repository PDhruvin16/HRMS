import * as Haptics from 'expo-haptics';

export const triggerHaptic = (type: string = 'impactLight') => {
  try {
    let result: Promise<void> | undefined;
    switch (type) {
      case 'impactLight':
        result = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'impactMedium':
        result = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'impactHeavy':
        result = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'notificationSuccess':
        result = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'notificationWarning':
        result = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'notificationError':
        result = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      default:
        result = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    result?.catch(() => {
      // Non-blocking fallback when native module is unavailable
    });
  } catch {
    // Non-blocking fallback
  }
};
export default triggerHaptic;

