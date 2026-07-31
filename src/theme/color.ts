export const colors = {
  // Base backgrounds
  background: '#F8FAFC', // Crisp Slate Light Background
  surface: '#FFFFFF', // Pure White Card Surface
  basecolor: '#F8FAFC',
  white: '#FFFFFF',
  black: '#0F172A', // Deep Slate for high contrast headers
  transparent: 'transparent',

  // Core brand accents
  primary: '#4F46E5', // Vibrant Modern Indigo accent
  primaryDark: '#3730A3', // Darker indigo for active states
  primaryLight: 'rgba(79, 70, 229, 0.08)',
  primaryGlowGradient: ['rgba(79, 70, 229, 0.05)', 'rgba(79, 70, 229, 0.1)'],
  primaryGradient: ['#4F46E5', '#6366F1'],
  primaryGradientLocations: [0, 1],
  primaryGradientUseAngle: true,
  primaryGradientAngle: 90,
  loginButtonBgGradient: ['#3730A3', '#4F46E5', '#6366F1'],
  loginButtonBorderGradient: ['#3730A3', '#4F46E5', '#6366F1'],
  appBackgroundGradient: ['#EFF6FF', '#F8FAFC', '#FFFFFF'],
  splashGradient: ['#3730A3', '#4F46E5', '#6366F1'],
  headerGradientStart: '#4F46E5',
  headerOrange: '#EF4444',

  // App/Tab layouts
  bottomTabBackground: '#FFFFFF',
  bottomTabBorder: '#E2E8F0',
  bottomTabActiveIcon: '#4F46E5',
  bottomTabInactiveIcon: '#94A3B8',
  bottomTabActiveLabel: '#4F46E5',
  bottomTabInactiveLabel: '#94A3B8',

  // Borders and Dividers
  border: '#E2E8F0', // Soft Crisp Border Gray
  divider: '#E2E8F0',
  dividerGray: '#F1F5F9',

  // Feedback states
  success: '#10B981', // Emerald green
  successLight: 'rgba(16, 185, 129, 0.1)',
  successBorder: 'rgba(16, 185, 129, 0.25)',
  error: '#EF4444', // Clean red
  errorLight: 'rgba(239, 68, 68, 0.1)',
  errorBorder: 'rgba(239, 68, 68, 0.25)',
  warning: '#F59E0B', // Amber yellow
  warningLight: 'rgba(245, 158, 11, 0.1)',
  warningBorder: 'rgba(245, 158, 11, 0.25)',

  // Typography system
  text: {
    primary: '#0F172A', // Ultra high-contrast Dark Slate for titles
    secondary: '#475569', // Slate gray for body and labels
    muted: '#94A3B8', // Light slate gray for metadata & placeholders
    placeholder: '#94A3B8',
    gray: '#64748B',
    tertiary: '#94A3B8',
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
