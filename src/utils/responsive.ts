import { Dimensions, PixelRatio } from 'react-native';
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';

// Get the actual device dimensions
const { width: scrWidth, height: scrHeight } = Dimensions.get('window');

// Check if device is a tablet
export const isTablet = Math.min(scrWidth, scrHeight) >= 600;

// Standard design width and height used in Sketch/Figma (usually iPhone X or similar)
// If tablet, use a larger guideline base width to prevent UI from blowing up linearly
const guidelineBaseWidth = isTablet ? 768 : 375;
const guidelineBaseHeight = isTablet ? 1024 : 812;

/**
 * Calculates responsive width percentage based on the design guideline width.
 * @param size Width value from design (e.g. 20)
 * @returns Responsive width in percentage string (e.g. '5.33%') or DP if used directly
 */
export const wp = (size: number) => {
  return widthPercentageToDP((size / guidelineBaseWidth) * 100);
};

export const hp = (size: number) => {
  return heightPercentageToDP((size / guidelineBaseHeight) * 100);
};

export { widthPercentageToDP as wpRaw, heightPercentageToDP as hpRaw };

/**
 * Normalizes size for fonts, icons or padding based on pixel ratio and screen dimension
 * Provides a highly reliable scale factor across Android & iOS devices for general sizes
 * @param size Size value from design
 * @returns Normalized pixel size
 */
export const normalize = (size: number) => {
  const scale = scrWidth / guidelineBaseWidth;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Moderate scaling for elements that shouldn't grow linearly with screen size
 * (e.g. padding, button heights, font sizes)
 * @param size Base size
 * @param factor Scaling factor (0 to 1), 0.5 is default
 */
export const moderateScale = (size: number, factor = 0.3) => {
  return size + (normalize(size) - size) * factor;
};

export const screenWidth = scrWidth;
export const screenHeight = scrHeight;
