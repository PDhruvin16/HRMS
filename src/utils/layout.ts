import { Platform } from 'react-native';
import { normalize } from './responsive';
const TAB_BAR_HEIGHT = normalize(56);

/**
 * Calculates the total height occupied by the Bottom Tab Bar from the bottom of the screen.
 * This includes the tab bar's own height and its bottom offset (safe area/extra margin).
 * @param bottomInset The bottom safe area inset from useSafeAreaInsets()
 */
export const getBottomTabBarHeight = (bottomInset: number) => {
  const tabBottomPosition =
    Platform.OS === 'ios' ? Math.max(bottomInset, normalize(12)) : normalize(20);
  return tabBottomPosition + TAB_BAR_HEIGHT;
};

/**
 * Returns the desired gap between the Bottom Tab Bar and any floating component (like a button in a modal).
 */
export const getDesiredBottomGap = () => normalize(24);
