/**
 * HRMS Role & Department Constants
 * ─────────────────────────────────────────────────────────────────────────────
 * System roles  : Admin, HR
 * Employee roles: Everyone else — scoped by Department → Designation
 */

// ─── System-level roles ────────────────────────────────────────────────────
export const SYSTEM_ROLES = ['admin', 'hr'] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

// ─── Employee role type ────────────────────────────────────────────────────
export const EMPLOYEE_ROLE = 'employee' as const;
export type EmployeeRole = typeof EMPLOYEE_ROLE;

// ─── Union role type stored on the user object ────────────────────────────
export type AppRole = SystemRole | EmployeeRole;

// ─── Departments ──────────────────────────────────────────────────────────
export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'Human Resources',
  'Customer Support',
  'Legal',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

// ─── Designations per Department ──────────────────────────────────────────
export const DESIGNATIONS_BY_DEPARTMENT: Record<Department, string[]> = {
  Engineering: [
    'Junior Developer',
    'Developer',
    'Senior Developer',
    'Tech Lead',
    'Engineering Manager',
    'Architect',
  ],
  Design: [
    'UI Designer',
    'UX Designer',
    'Senior Designer',
    'Design Lead',
    'Creative Director',
  ],
  Product: [
    'Associate Product Manager',
    'Product Manager',
    'Senior Product Manager',
    'Group Product Manager',
    'VP of Product',
  ],
  Marketing: [
    'Marketing Executive',
    'Marketing Manager',
    'Content Strategist',
    'Brand Manager',
    'Head of Marketing',
  ],
  Sales: [
    'Sales Executive',
    'Senior Sales Executive',
    'Account Manager',
    'Sales Manager',
    'Head of Sales',
  ],
  Finance: [
    'Finance Analyst',
    'Senior Finance Analyst',
    'Finance Manager',
    'Controller',
    'CFO',
  ],
  Operations: [
    'Operations Analyst',
    'Operations Manager',
    'Senior Operations Manager',
    'Head of Operations',
    'COO',
  ],
  'Human Resources': [
    'HR Executive',
    'HR Manager',
    'Senior HR Manager',
    'Head of HR',
    'CHRO',
  ],
  'Customer Support': [
    'Support Executive',
    'Senior Support Executive',
    'Support Lead',
    'Customer Success Manager',
  ],
  Legal: [
    'Legal Analyst',
    'Legal Counsel',
    'Senior Legal Counsel',
    'Head of Legal',
  ],
};

// ─── Role display labels ───────────────────────────────────────────────────
export const ROLE_LABELS: Record<AppRole, string> = {
  admin:    'Admin',
  hr:       'HR',
  employee: 'Employee',
};

// ─── Role permission helpers ───────────────────────────────────────────────
export const isAdmin   = (role?: AppRole | null): boolean => role === 'admin';
export const isHR      = (role?: AppRole | null): boolean => role === 'hr';
export const isEmployee= (role?: AppRole | null): boolean => role === 'employee';
export const isAdminOrHR = (role?: AppRole | null): boolean => role === 'admin' || role === 'hr';

/** Checks if a user has a specific permission based on role */
export const hasPermission = (
  role: AppRole | null | undefined,
  permission: RolePermission,
): boolean => {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};

// ─── Feature-level permissions ────────────────────────────────────────────
export type RolePermission =
  | 'view_all_employees'
  | 'manage_employees'
  | 'approve_leave'
  | 'view_team_leave'
  | 'view_all_attendance'
  | 'manage_departments'
  | 'manage_designations'
  | 'view_payroll'
  | 'manage_payroll'
  | 'view_own_profile'
  | 'apply_leave'
  | 'view_own_attendance'
  | 'view_reports';

export const ROLE_PERMISSIONS: Record<AppRole, RolePermission[]> = {
  admin: [
    'view_all_employees',
    'manage_employees',
    'approve_leave',
    'view_team_leave',
    'view_all_attendance',
    'manage_departments',
    'manage_designations',
    'view_payroll',
    'manage_payroll',
    'view_own_profile',
    'apply_leave',
    'view_own_attendance',
    'view_reports',
  ],
  hr: [
    'view_all_employees',
    'manage_employees',
    'approve_leave',
    'view_team_leave',
    'view_all_attendance',
    'manage_departments',
    'manage_designations',
    'view_payroll',
    'view_own_profile',
    'apply_leave',
    'view_own_attendance',
    'view_reports',
  ],
  employee: [
    'view_own_profile',
    'apply_leave',
    'view_own_attendance',
  ],
};
