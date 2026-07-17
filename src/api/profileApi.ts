import { ApiClient } from '../services/apiClients';
import { API_ENDPOINTS } from './endpoints';
import { AppRole, Department } from '../constants/roles';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  /** 'admin' | 'hr' | 'employee' */
  role: AppRole;
  /** Only for employees — the department they belong to */
  department?: Department | string;
  /** Designation within the department, e.g. 'Senior Developer' */
  designation?: string;
  employee_id?: string;
  date_of_joining?: string;
  manager_name?: string;
  phone_number?: string;
  profile_picture?: string;
}

export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await ApiClient.get<any>(API_ENDPOINTS.AUTH.GET_PROFILE.BASE);
      const result = (response as any).data || response;
      if (result && result.id) return result;
    } catch (e) {
      console.warn('Profile fetch failed, using fallback mock data:', e);
    }

    // Mock fallback — simulates an employee in Engineering dept
    return {
      id: '1',
      email: 'priya@company.com',
      first_name: 'Priya',
      last_name: 'Sharma',
      role: 'employee',
      department: 'Engineering',
      designation: 'Senior Developer',
      employee_id: 'EMP-2026-089',
      date_of_joining: '2025-01-10',
      manager_name: 'Rajesh Kumar',
      phone_number: '+91 9876543210',
    };
  },

  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await ApiClient.patch<UserProfile>(
      API_ENDPOINTS.AUTH.GET_PROFILE.BASE,
      profileData,
    );
    return (response as any).data || response;
  },
};

export default profileApi;
