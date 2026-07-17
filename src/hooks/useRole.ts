/**
 * useRole — Hook to access the current user's role and permissions
 *
 * Usage:
 *   const { role, isAdmin, isHR, isEmployee, can } = useRole();
 *   if (can('approve_leave')) { ... }
 */
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  AppRole,
  RolePermission,
  isAdmin as checkAdmin,
  isHR as checkHR,
  isEmployee as checkEmployee,
  isAdminOrHR as checkAdminOrHR,
  hasPermission,
  ROLE_LABELS,
} from '../constants/roles';

export const useRole = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const role = (user?.role ?? null) as AppRole | null;

  return {
    /** The raw role string: 'admin' | 'hr' | 'employee' | null */
    role,

    /** Convenience booleans */
    isAdmin:    checkAdmin(role),
    isHR:       checkHR(role),
    isEmployee: checkEmployee(role),
    isAdminOrHR:checkAdminOrHR(role),

    /** Human-readable role label */
    roleLabel: role ? ROLE_LABELS[role] : '',

    /** Department (only for employees) */
    department:   user?.department   ?? null,
    /** Designation within department */
    designation:  user?.designation  ?? null,

    /** Permission check — returns true if the current role can perform this action */
    can: (permission: RolePermission): boolean => hasPermission(role, permission),

    /** User object (full) */
    user,
  };
};

export default useRole;
