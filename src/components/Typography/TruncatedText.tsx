// @ts-nocheck
// @ts-nocheck
import React from 'react';
import { Typography } from './index';
import Tooltip from '../Tooltip';

interface TruncatedTextWithTooltipProps {
  text: string;
  style?: import('react-native').TextStyle;
  weight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  variant?: 'caption' | 'body1' | 'body2';
  numberOfLines?: number;
  limit?: number;
}

export const TruncatedTextWithTooltip: React.FC<TruncatedTextWithTooltipProps> = ({
  text,
  style,
  weight,
  variant = 'caption',
  numberOfLines = 1,
  limit = 20,
}) => {
  if (!text) return null;
  const isTruncated = text.length > limit;
  const displayText = isTruncated ? text.substring(0, limit).trim() + '...' : text;

  if (!isTruncated) {
    return (
      <Typography variant={variant} weight={weight} style={style} numberOfLines={numberOfLines}>
        {text}
      </Typography>
    );
  }

  return (
    <Tooltip content={text} triggerStyle={style}>
      <Typography variant={variant} weight={weight} style={style} numberOfLines={numberOfLines}>
        {displayText}
      </Typography>
    </Tooltip>
  );
};

export default TruncatedTextWithTooltip;
