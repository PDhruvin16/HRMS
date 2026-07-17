/**
 * employeeApi — handles all employee, department & designation API calls
 */
import { ApiClient } from '../services/apiClients';
import { API_ENDPOINTS } from './endpoints';
import { AppRole, Department } from '../constants/roles';

// ─── Types ────────────────────────────────────────────────────────────────
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  employee_id: string;
  role: AppRole;
  department: Department | string;
  designation: string;
  date_of_joining: string;
  manager_name?: string;
  profile_picture?: string;
  is_active: boolean;
}

export interface Department_API {
  id: string;
  name: Department | string;
  head_name?: string;
  employee_count?: number;
}

export interface Designation_API {
  id: string;
  title: string;
  department: Department | string;
}

export interface CreateEmployeePayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: AppRole;
  department?: string;
  designation?: string;
  phone_number?: string;
  date_of_joining?: string;
  manager_id?: string;
}

// ─── Mock data (used as fallback) ────────────────────────────────────────
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1', first_name: 'Arjun',  last_name: 'Mehta',  email: 'arjun@company.com',
    employee_id: 'EMP-001', role: 'employee',
    department: 'Engineering', designation: 'Senior Developer',
    date_of_joining: '2023-03-01', is_active: true,
  },
  {
    id: '2', first_name: 'Neha', last_name: 'Singh', email: 'neha@company.com',
    employee_id: 'EMP-002', role: 'employee',
    department: 'Design', designation: 'UX Designer',
    date_of_joining: '2023-06-15', is_active: true,
  },
  {
    id: '3', first_name: 'Rohit', last_name: 'Verma', email: 'rohit@company.com',
    employee_id: 'EMP-003', role: 'employee',
    department: 'Marketing', designation: 'Marketing Manager',
    date_of_joining: '2022-11-20', is_active: true,
  },
  {
    id: '4', first_name: 'Priya', last_name: 'Sharma', email: 'priya@company.com',
    employee_id: 'EMP-004', role: 'employee',
    department: 'Engineering', designation: 'Developer',
    date_of_joining: '2024-01-10', is_active: true,
  },
  {
    id: '5', first_name: 'Admin', last_name: 'User', email: 'admin@company.com',
    employee_id: '', role: 'admin',
    department: '', designation: '',
    date_of_joining: '2021-01-01', is_active: true,
  },
];

// ─── API ──────────────────────────────────────────────────────────────────
export const employeeApi = {
  /** Fetch all employees (Admin/HR only) */
  getAllEmployees: async (): Promise<Employee[]> => {
    try {
      const res = await ApiClient.get<any>(API_ENDPOINTS.HRMS.EMPLOYEES.BASE);
      return (res as any).data || res;
    } catch {
      return MOCK_EMPLOYEES;
    }
  },

  /** Fetch employees filtered by department */
  getEmployeesByDepartment: async (department: string): Promise<Employee[]> => {
    try {
      const res = await ApiClient.get<any>(
        API_ENDPOINTS.HRMS.EMPLOYEES.BY_DEPARTMENT(department),
      );
      return (res as any).data || res;
    } catch {
      return MOCK_EMPLOYEES.filter((e) => e.department === department);
    }
  },

  /** Get a single employee by ID */
  getEmployee: async (id: string): Promise<Employee> => {
    try {
      const res = await ApiClient.get<any>(API_ENDPOINTS.HRMS.EMPLOYEES.DETAIL(id));
      return (res as any).data || res;
    } catch {
      return MOCK_EMPLOYEES.find((e) => e.id === id) ?? MOCK_EMPLOYEES[0];
    }
  },

  /** Create a new employee (Admin/HR only) */
  createEmployee: async (payload: CreateEmployeePayload): Promise<Employee> => {
    const res = await ApiClient.post<Employee>(API_ENDPOINTS.HRMS.EMPLOYEES.BASE, payload);
    return (res as any).data || res;
  },

  /** Update an employee (Admin/HR only) */
  updateEmployee: async (id: string, payload: Partial<CreateEmployeePayload>): Promise<Employee> => {
    const res = await ApiClient.patch<Employee>(
      API_ENDPOINTS.HRMS.EMPLOYEES.DETAIL(id),
      payload,
    );
    return (res as any).data || res;
  },

  /** Deactivate/delete an employee (Admin only) */
  deleteEmployee: async (id: string): Promise<void> => {
    await ApiClient.delete(API_ENDPOINTS.HRMS.EMPLOYEES.DETAIL(id));
  },

  /** Fetch all departments */
  getDepartments: async (): Promise<Department_API[]> => {
    try {
      const res = await ApiClient.get<any>(API_ENDPOINTS.HRMS.DEPARTMENTS.BASE);
      return (res as any).data || res;
    } catch {
      return [
        { id: '1', name: 'Engineering',      employee_count: 12 },
        { id: '2', name: 'Design',           employee_count: 5  },
        { id: '3', name: 'Product',          employee_count: 4  },
        { id: '4', name: 'Marketing',        employee_count: 7  },
        { id: '5', name: 'Finance',          employee_count: 6  },
        { id: '6', name: 'Operations',       employee_count: 8  },
        { id: '7', name: 'Human Resources',  employee_count: 3  },
        { id: '8', name: 'Customer Support', employee_count: 10 },
      ];
    }
  },

  /** Fetch designations — optionally filtered by department */
  getDesignations: async (department?: string): Promise<Designation_API[]> => {
    try {
      const url = department
        ? API_ENDPOINTS.HRMS.DESIGNATIONS.BY_DEPARTMENT(department)
        : API_ENDPOINTS.HRMS.DESIGNATIONS.BASE;
      const res = await ApiClient.get<any>(url);
      return (res as any).data || res;
    } catch {
      const { DESIGNATIONS_BY_DEPARTMENT } = require('../constants/roles');
      if (department && DESIGNATIONS_BY_DEPARTMENT[department]) {
        return (DESIGNATIONS_BY_DEPARTMENT[department] as string[]).map(
          (title: string, i: number) => ({ id: String(i + 1), title, department }),
        );
      }
      return [];
    }
  },
};

export default employeeApi;
