/**
 * LeaveTypes.ts
 * Type definitions, color mapping utilities, and helper functions for the Leave feature.
 */

import colors from '../../theme/color';
import { LeaveRequest } from '../../api/leaveApi';

export const getStatusColor = (status: string = ''): string => {
  const s = status.toLowerCase();
  if (s.includes('approve')) return colors.success;
  if (s.includes('reject')) return colors.error;
  if (s.includes('cancel')) return colors.text.muted;
  return colors.warning;
};

export const getRequestCode = (req: LeaveRequest | any): string => {
  if (!req || !req.id) return 'LVR-0000';
  const idStr = String(req.id);
  if (idStr.includes('-')) {
    const parts = idStr.split('-');
    const last = parts[parts.length - 1];
    return `LVR-${last.slice(-4).toUpperCase()}`;
  }
  return `LVR-${idStr.slice(-4).toUpperCase()}`;
};
