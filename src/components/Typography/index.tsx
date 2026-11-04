// @ts-nocheck
import React from 'react';
import { Text, TextStyle, TextProps, StyleSheet } from 'react-native';
import colors from '../../theme/color';
import { FONT_FAMILY, FONT_SIZE, LETTER_SPACING, LINE_HEIGHT } from '../../constants';

import { moderateScale } from '../../utils/responsive';

// Moderate responsive scaler for fonts
const rs = (size: number) => moderateScale(size, 0.4);

type FontWeight = '300' | '400' | '500' | '600' | '700' | '800' | '900';

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'button'
  | 'caption'
  | 'overline'
  | 'label';

type TextAlign = 'left' | 'center' | 'right' | 'justify';
type TextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase';
type TextDecoration = 'none' | 'underline' | 'line-through' | 'underline line-through';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  children?: React.ReactNode;
  color?: string;
  align?: TextAlign;
  weight?: FontWeight;
  size?: number;
  lineHeight?: number;
  letterSpacing?: number;
  transform?: TextTransform;
  decoration?: TextDecoration;
  italic?: boolean;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  children,
  color,
  align = 'left',
  weight,
  size,
  lineHeight,
  letterSpacing,
  transform = 'none',
  decoration = 'none',
  italic = false,
  style,
  ...rest
}) => {
  const themeColors = colors;
  const variantStyle = getVariantStyle(variant, colors as unknown as Record<string, unknown>);

  const flatStyle = (StyleSheet.flatten(style) || {}) as TextStyle;
  const effectiveFontSize = size !== undefined ? rs(size) : (flatStyle.fontSize !== undefined ? flatStyle.fontSize : variantStyle.fontSize);

  // Compute safe lineHeight to prevent text and numbers from being clipped on iOS
  let effectiveLineHeight: number | undefined;
  if (lineHeight !== undefined) {
    effectiveLineHeight = rs(lineHeight);
  } else if (flatStyle.lineHeight !== undefined) {
    effectiveLineHeight = flatStyle.lineHeight;
  } else if (size !== undefined || (flatStyle.fontSize !== undefined && flatStyle.fontSize !== variantStyle.fontSize)) {
    // When custom fontSize is passed without explicit lineHeight, ensure lineHeight scales safely
    effectiveLineHeight = Math.ceil(effectiveFontSize * 1.28);
  } else {
    effectiveLineHeight = variantStyle.lineHeight;
  }

  const customStyle: TextStyle = {
    ...variantStyle,
    color: color || variantStyle.color || themeColors.text.primary,
    textAlign: align,
    fontWeight: weight || variantStyle.fontWeight,
    fontSize: effectiveFontSize,
    lineHeight: effectiveLineHeight,
    letterSpacing: letterSpacing !== undefined ? rs(letterSpacing) : variantStyle.letterSpacing,
    textTransform: transform,
    textDecorationLine: decoration,
    fontStyle: italic ? 'italic' : 'normal',
    includeFontPadding: false,
  };

  return (
    <Text style={[customStyle, style]} {...rest}>
      {children}
    </Text>
  );
};

// -------------------- Variant Styles --------------------
const getVariantStyle = (
  variant: TypographyVariant,
  themeColors: Record<string, unknown>,
): TextStyle => {
  const themeColorValues = themeColors as unknown as {
    text: { primary: string; secondary: string; tertiary: string };
  };
  const variants: Record<TypographyVariant, TextStyle> = {
    h1: {
      fontFamily: FONT_FAMILY.bold,
      fontSize: rs(FONT_SIZE['4xl']),
      lineHeight: rs(FONT_SIZE['4xl'] * LINE_HEIGHT.tight),
      fontWeight: '800',
      letterSpacing: rs(LETTER_SPACING.tight - 0.5),
      color: themeColorValues.text.primary,
    },
    h2: {
      fontFamily: FONT_FAMILY.bold,
      fontSize: rs(FONT_SIZE['3xl']),
      lineHeight: rs(FONT_SIZE['3xl'] * LINE_HEIGHT.tight),
      fontWeight: '800',
      letterSpacing: rs(LETTER_SPACING.tight - 0.5),
      color: themeColorValues.text.primary,
    },
    h3: {
      fontFamily: FONT_FAMILY.semiBold,
      fontSize: rs(FONT_SIZE['2xl']),
      lineHeight: rs(FONT_SIZE['2xl'] * LINE_HEIGHT.tight),
      fontWeight: '700',
      letterSpacing: rs(LETTER_SPACING.tight),
      color: themeColorValues.text.primary,
    },
    h4: {
      fontFamily: FONT_FAMILY.semiBold,
      fontSize: rs(FONT_SIZE.xl),
      lineHeight: rs(FONT_SIZE.xl * LINE_HEIGHT.tight),
      fontWeight: '700',
      letterSpacing: rs(LETTER_SPACING.tight),
      color: themeColorValues.text.primary,
    },
    h5: {
      fontFamily: FONT_FAMILY.medium,
      fontSize: rs(FONT_SIZE.lg),
      lineHeight: rs(FONT_SIZE.lg * LINE_HEIGHT.normal),
      fontWeight: '500',
      letterSpacing: rs(LETTER_SPACING.normal),
      color: themeColorValues.text.primary,
    },
    h6: {
      fontFamily: FONT_FAMILY.medium,
      fontSize: rs(FONT_SIZE.md),
      lineHeight: rs(FONT_SIZE.md * LINE_HEIGHT.normal),
      fontWeight: '500',
      letterSpacing: rs(LETTER_SPACING.wide),
      color: themeColorValues.text.primary,
    },
    subtitle1: {
      fontFamily: FONT_FAMILY.medium,
      fontSize: rs(FONT_SIZE.md),
      lineHeight: rs(FONT_SIZE.md * LINE_HEIGHT.relaxed),
      fontWeight: '500',
      letterSpacing: rs(LETTER_SPACING.normal),
      color: themeColorValues.text.secondary,
    },
    subtitle2: {
      fontFamily: FONT_FAMILY.medium,
      fontSize: rs(FONT_SIZE.base),
      lineHeight: rs(FONT_SIZE.base * LINE_HEIGHT.relaxed),
      fontWeight: '500',
      letterSpacing: rs(LETTER_SPACING.normal),
      color: themeColorValues.text.secondary,
    },
    body1: {
      fontFamily: FONT_FAMILY.regular,
      fontSize: rs(FONT_SIZE.md),
      lineHeight: rs(FONT_SIZE.md * LINE_HEIGHT.relaxed),
      fontWeight: '400',
      letterSpacing: rs(LETTER_SPACING.normal),
      color: themeColorValues.text.primary,
    },
    body2: {
      fontFamily: FONT_FAMILY.regular,
      fontSize: rs(FONT_SIZE.base),
      lineHeight: rs(FONT_SIZE.base * LINE_HEIGHT.relaxed),
      fontWeight: '400',
      letterSpacing: rs(LETTER_SPACING.normal),
      color: themeColorValues.text.primary,
    },
    button: {
      fontFamily: FONT_FAMILY.semiBold,
      fontSize: rs(FONT_SIZE.md),
      lineHeight: rs(FONT_SIZE.md * LINE_HEIGHT.tight),
      fontWeight: '600',
      letterSpacing: rs(LETTER_SPACING.wide),
      textTransform: 'uppercase',
      color: themeColorValues.text.primary,
    },
    caption: {
      fontFamily: FONT_FAMILY.regular,
      fontSize: rs(FONT_SIZE.sm),
      lineHeight: rs(FONT_SIZE.sm * LINE_HEIGHT.normal),
      fontWeight: '400',
      letterSpacing: rs(LETTER_SPACING.normal),
      color: themeColorValues.text.secondary,
    },
    overline: {
      fontFamily: FONT_FAMILY.medium,
      fontSize: rs(FONT_SIZE.xs),
      lineHeight: rs(FONT_SIZE.xs * LINE_HEIGHT.normal),
      fontWeight: '500',
      letterSpacing: rs(LETTER_SPACING.widest),
      textTransform: 'uppercase',
      color: themeColorValues.text.tertiary,
    },
    label: {
      fontFamily: FONT_FAMILY.medium,
      fontSize: rs(FONT_SIZE.sm),
      lineHeight: rs(FONT_SIZE.sm * LINE_HEIGHT.normal),
      fontWeight: '500',
      letterSpacing: rs(LETTER_SPACING.normal),
      color: themeColorValues.text.secondary,
    },
  };

  return variants[variant];
};

// -------------------- Preset Typography Components --------------------
export const H1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
);

export const H2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
);

export const H3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
);

export const H4: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h4" {...props} />
);

export const H5: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h5" {...props} />
);

export const H6: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h6" {...props} />
);

export const Subtitle1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="subtitle1" {...props} />
);

export const Subtitle2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="subtitle2" {...props} />
);

export const Body1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body1" {...props} />
);

export const Body2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body2" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption" {...props} />
);

export const Overline: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="overline" {...props} />
);

export const Label: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="label" {...props} />
);

export const ButtonText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="button" {...props} />
);
