export const APP_NAME = 'Toagosei';
export const APP_TAGLINE = 'App tagline';

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
];

export const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];

export default {
  APP_NAME,
  APP_TAGLINE,
  LANGUAGES,
  DATE_FORMATS,
};

export const FONTS = {
  // Font families
  // Regular weights
  thin: 'DMSans-Thin',
  extraLight: 'DMSans-ExtraLight',
  light: 'DMSans-Light',
  regular: 'DMSans-Regular',
  medium: 'DMSans-Medium',
  semiBold: 'DMSans-SemiBold',
  bold: 'DMSans-Bold',
  extraBold: 'DMSans-ExtraBold',
  black: 'DMSans-Black',

  // Italic variants
  thinItalic: 'DMSans-ThinItalic',
  extraLightItalic: 'DMSans-ExtraLightItalic',
  lightItalic: 'DMSans-LightItalic',
  italic: 'DMSans-Italic',
  mediumItalic: 'DMSans-MediumItalic',
  semiBoldItalic: 'DMSans-SemiBoldItalic',
  boldItalic: 'DMSans-BoldItalic',
  extraBoldItalic: 'DMSans-ExtraBoldItalic',
  blackItalic: 'DMSans-BlackItalic',

  // Optical sizes (optional – use only if needed)
  opt18pt: {
    regular: 'DMSans_18pt-Regular',
    medium: 'DMSans_18pt-Medium',
    semiBold: 'DMSans_18pt-SemiBold',
    bold: 'DMSans_18pt-Bold',
  },
  opt24pt: {
    regular: 'DMSans_24pt-Regular',
    medium: 'DMSans_24pt-Medium',
    semiBold: 'DMSans_24pt-SemiBold',
    bold: 'DMSans_24pt-Bold',
  },
  opt36pt: {
    regular: 'DMSans_36pt-Regular',
    medium: 'DMSans_36pt-Medium',
    semiBold: 'DMSans_36pt-SemiBold',
    bold: 'DMSans_36pt-Bold',
  },

  // Font sizes
  md: 16,
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font weights
  weight: {
    light: '300',
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
};
export const FONT_FAMILY = {
  regular: 'DMSans-Regular',
  medium: 'DMSans-Medium',
  semiBold: 'DMSans-SemiBold',
  bold: 'DMSans-Bold',
  light: 'DMSans-Light',
  extraBold: 'DMSans-ExtraBold',
  black: 'DMSans-Black',
};

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
  '6xl': 42,
};

export const LINE_HEIGHT = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
};

export const LETTER_SPACING = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
};

export interface IOutletTypeOption {
  key: OutletType;
  title: string;
  description: string;
  icon: string;
}

export type OutletType = 'RETAILER' | 'DISTRIBUTOR';

export interface IOutletFlowConfig {
  title: string;
  steps: string[];
}

export const OUTLET_TYPES: IOutletTypeOption[] = [
  {
    key: 'RETAILER',
    title: 'Retailer',
    description: 'Hardware store, building materials',
    icon: 'store',
  },
  {
    key: 'DISTRIBUTOR',
    title: 'Distributor',
    description: 'Wholesale distributor',
    icon: 'warehouse',
  },
];

export const OUTLET_FLOW_CONFIG: Record<OutletType, IOutletFlowConfig> = {
  RETAILER: {
    title: 'Add New Retailer',
    steps: [
      'Type',
      'RetailerInformation',
      'BusinessDetails',
      'PreOrder',
      'SchemesCommercials',
      'ShopImages',
      'Review',
    ],
  },
  DISTRIBUTOR: {
    title: 'Add New Distributor',
    steps: [
      'Type',
      'BasicDetails',
      'ProductCommercial',
      'KYCDetails',
      'ImagesDocuments',
      'CountersWarehousesFleet',
      'PreOrderStaff',
      'Review',
    ],
  },
};
