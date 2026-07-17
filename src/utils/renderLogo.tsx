import React from 'react';
import { Image, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';
import { SvgProps } from 'react-native-svg';

type LogoSource = ImageSourcePropType | React.ComponentType<SvgProps>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractDimensionFromStyle(
  style: StyleProp<ImageStyle> | undefined,
  key: 'width' | 'height',
): number | undefined {
  if (!style) return undefined;

  // StyleProp can be an array, object, or a number (registered style)
  if (Array.isArray(style)) {
    for (const s of style) {
      const v = extractDimensionFromStyle(s as StyleProp<ImageStyle>, key);
      if (v !== undefined) return v;
    }
    return undefined;
  }

  if (isPlainObject(style)) {
    const val = (style as Record<string, unknown>)[key];
    if (typeof val === 'number') return val;
  }

  return undefined;
}

export function renderLogo(
  logoSource: LogoSource | undefined,
  logoStyle?: StyleProp<ImageStyle>,
  defaultSvgSize: { width: number; height: number } = {
    width: 200,
    height: 60,
  },
  extraProps: Record<string, unknown> = {},
) {
  if (!logoSource) return null;

  // If it's a component → treat as SVG
  if (
    typeof logoSource === 'function' ||
    (typeof logoSource === 'object' && logoSource !== null && !('uri' in logoSource))
  ) {
    const SvgLogo = logoSource as React.ComponentType<SvgProps>;

    const width = extractDimensionFromStyle(logoStyle, 'width') ?? defaultSvgSize.width;
    const height = extractDimensionFromStyle(logoStyle, 'height') ?? defaultSvgSize.height;

    const svgProps: SvgProps = {
      width,
      height,
      ...extraProps,
    };

    return <SvgLogo {...svgProps} />;
  }

  // Otherwise → normal image
  return (
    <Image
      source={logoSource as ImageSourcePropType}
      style={logoStyle}
      resizeMode="contain"
      {...extraProps}
    />
  );
}
