export const colors = {
  // Base backgrounds
  background: '#F9FAFB', // Clean light gray/off-white background
  surface: '#FFFFFF', // Pure white for cards, headers, modal surfaces
  basecolor: '#F9FAFB',
  white: '#FFFFFF',
  black: '#111827', // Almost black for text and high contrast elements
  transparent: 'transparent',

  // Core brand accents
  primary: '#4F46E5', // Modern Indigo accent
  primaryDark: '#3730A3', // Darker indigo for active/pressed states
  primaryLight: 'rgba(79, 70, 229, 0.08)',
  primaryGlowGradient: ['rgba(79, 70, 229, 0.05)', 'rgba(79, 70, 229, 0.1)'],
  primaryGradient: ['#4F46E5', '#6366F1'],
  primaryGradientLocations: [0, 1],
  primaryGradientUseAngle: true,
  primaryGradientAngle: 90,
  loginButtonBgGradient: ['#3730A3', '#4F46E5', '#6366F1'],
  loginButtonBorderGradient: ['#3730A3', '#4F46E5', '#6366F1'],
  appBackgroundGradient: ['#F9FAFB', '#FFFFFF'],
  splashGradient: ['#3730A3', '#4F46E5', '#6366F1'],
  headerGradientStart: '#4F46E5',
  headerOrange: '#EF4444',

  // App/Tab layouts
  bottomTabBackground: '#FFFFFF',
  bottomTabBorder: '#E5E7EB',
  bottomTabActiveIcon: '#4F46E5',
  bottomTabInactiveIcon: '#9CA3AF',
  bottomTabActiveLabel: '#4F46E5',
  bottomTabInactiveLabel: '#9CA3AF',

  // Borders and Dividers
  border: '#E5E7EB', // Soft border gray
  divider: '#E5E7EB',
  dividerGray: '#F3F4F6',

  // Feedback states
  success: '#10B981', // Emerald green
  successLight: 'rgba(16, 185, 129, 0.08)',
  successBorder: 'rgba(16, 185, 129, 0.2)',
  error: '#EF4444', // Clean red
  errorLight: 'rgba(239, 68, 68, 0.08)',
  errorBorder: 'rgba(239, 68, 68, 0.2)',
  warning: '#F59E0B', // Amber yellow
  warningLight: 'rgba(245, 158, 11, 0.08)',
  warningBorder: 'rgba(245, 158, 11, 0.2)',

  // Typography system
  text: {
    primary: '#111827', // High contrast slate/black for main headers & titles
    secondary: '#4B5563', // Slate gray for body and standard labels
    muted: '#9CA3AF', // Light slate gray for metadata & placeholders
    placeholder: '#9CA3AF',
    gray: '#6B7280',
    tertiary: '#9CA3AF',
  },
  
  // Specific domain colors
  emailBlue: '#2563EB',
  emailBlueLight: 'rgba(37, 99, 235, 0.08)',
  splashBg: '#FFFFFF',
  modalOverlay: 'rgba(17, 24, 39, 0.4)', // Soft darkened backdrop for light UI
  whiteOverlay: 'rgba(0, 0, 0, 0.03)',
  whiteTransparent: 'rgba(255, 255, 255, 0.8)',
  whiteTransparent15: 'rgba(17, 24, 39, 0.08)',
  white05: 'rgba(0, 0, 0, 0.02)',
  white20: 'rgba(0, 0, 0, 0.04)',
  white30: 'rgba(0, 0, 0, 0.06)',
  black04: 'rgba(0, 0, 0, 0.04)',

  // Status mapping
  status: {
    read: '#3b82f6',
    delivered: '#667781',
    sent: '#667781',
    pending: '#667781',
    failed: '#ef4444',
  },
  dividers: {
    gray: '#E5E7EB',
    text: '#4B5563',
  },

  // -------------------------------------------------------------
  // Legacy / Fallback color properties for VoiceBot UI compatibility
  // -------------------------------------------------------------
  muted: '#9CA3AF',
  gray: '#E5E7EB',
  lightGray: '#F3F4F6',
  dark: '#111827',
  primary20: 'rgba(79, 70, 229, 0.2)',
  primary18: 'rgba(79, 70, 229, 0.18)',
  primary12: 'rgba(79, 70, 229, 0.12)',
  primary05: 'rgba(79, 70, 229, 0.05)',
  white90: 'rgba(255, 255, 255, 0.9)',
  whiteTransparent30: 'rgba(0, 0, 0, 0.06)',
  whiteTransparent60: 'rgba(0, 0, 0, 0.12)',
};

export default colors;
