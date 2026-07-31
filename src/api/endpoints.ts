import Constants from 'expo-constants';

const getSocketBaseUrl = () => {
  const url = (Constants.expoConfig?.extra?.VITE_SOCKET_URL as string | undefined);
  if (!url) {
    const baseUrl = (Constants.expoConfig?.extra?.BASE_URL as string | undefined) || '';
    if (baseUrl.startsWith('http')) {
      return baseUrl.replace('http', 'ws').replace(/\/$/, '') + '/';
    }
    return '';
  }
  return url.endsWith('/') ? url : `${url}/`;
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/user/register/',
    REFRESH_TOKEN: '/auth/refresh/',
    CHANGE_PASSWORD: (() => {
      const basePath = '/user/change_password/';
      return {
        BASE: basePath,
      };
    })(),
    GET_PROFILE: (() => {
      const basePath = '/user/retrive_update/';
      return {
        BASE: basePath,
      };
    })(),
  },

  API: {
    AGENT_TEMPLATES: (() => {
      const basePath = '/core/agent-templates/';
      return {
        BASE: basePath,
      };
    })(),
    KNOWLEDGE_BASE: (() => {
      const basePath = '/core/knowledge-base/';
      return {
        BASE: basePath,
      };
    })(),
    PROBING_QUESTIONS: (() => {
      const basePath = '/core/probing-questions/';
      return {
        BASE: basePath,
      };
    })(),
    KNOWLEDGRBASE: (() => {
      const basePath = '/core/tenant/knowledge_base/';
      return {
        BASE: basePath,
        FETCH_ALL: `${basePath}fetch_all/`,
        DELETE_MULTIPLE_TEXTS: (knowledgeBaseId: string | undefined) =>
          `${basePath}${knowledgeBaseId}/delete_multiple_texts/`,
        DELETE_MULTIPLE_FILES: (knowledgeBaseId: string | undefined) =>
          `${basePath}${knowledgeBaseId}/delete_multiple_files/`,
        DELETE_MULTIPLE_QUESTION_ANSWER: (knowledgeBaseId: string | undefined) =>
          `${basePath}${knowledgeBaseId}/delete_multiple_question_answer/`,
        DELETE_MULTIPLE_WEBSITES: (knowledgeBaseId: string | undefined) =>
          `${basePath}${knowledgeBaseId}/delete_multiple_websites/`,
      };
    })(),
    AGENT_CONFIGURATION: (() => {
      const basePath = '/core/agent-configuration/';
      return {
        BASE: basePath,
      };
    })(),
    LANGUAGE: (() => {
      const basePath = '/core/language/';
      return {
        BASE: basePath,
        FETCH_ALL: `${basePath}fetch_all/`,
      };
    })(),
    TIMEZONE: (() => {
      const basePath = '/core/timezone/';
      return {
        BASE: basePath,
      };
    })(),
    ISOLATED_COUNTRY: (() => {
      const basePath = '/core/isolated-country/';
      return {
        BASE: basePath,
        FETCH_ALL: `${basePath}fetch_all/`,
      };
    })(),
    PRICING_PLAN: (() => {
      const basePath = '/core/pricing-plan/';
      return {
        BASE: basePath,
      };
    })(),
    INVOICE: (() => {
      const basePath = '/core/invoice/';
      return {
        BASE: basePath,
      };
    })(),
    TRANSACTIONS: (() => {
      const basePath = '/core/transactions/';
      return {
        BASE: basePath,
      };
    })(),
    SALES_ANALYTICS_DASHBOARD: (() => {
      const basePath = '/core/sales-analytics-dashboard/';
      return {
        BASE: basePath,
      };
    })(),
    SYSTEM_ANALYTICS_DASHBOARD: (() => {
      const basePath = '/core/system-analytics-dashboard/';
      return {
        BASE: basePath,
      };
    })(),
    GLOBAL_COUNTRY: (() => {
      const basePath = '/core/global-country/';
      return {
        BASE: basePath,
      };
    })(),
    GLOBAL_STATE: (() => {
      const basePath = '/core/global-state/';
      return {
        BASE: basePath,
      };
    })(),
    GLOBAL_CITY: (() => {
      const basePath = '/core/global-city/';
      return {
        BASE: basePath,
      };
    })(),
  },
  HRMS: {
    MASTER: {
      DEPARTMENT: '/master?type=department',
    },
    LEAVE: {
      BALANCE: '/leave/my-balances',
      REQUESTS: '/leave/my-requests',
      ADMIN_REQUESTS: '/leave/admin/requests',
      PENDING: '/leave/pending',
      ADMIN_BALANCES: '/leave/admin/balances',
      TYPES_DROPDOWN: '/leave/types/dropdown',
      MY_LEAVE_DATES: '/leave/my-leave-dates',
      APPLY: '/leave/apply',
      CANCEL: (requestId: string) => `/leave/${requestId}/cancel`,
      ACTION: (requestId: string) => `/leave/action/${requestId}`,
      RESOLVE: (requestId: string) => `/leave/${requestId}/resolve`,
    },
    ATTENDANCE: {
      TODAY:    '/hrms/attendance/today/',
      LOGS:     '/hrms/attendance/logs/',
      SUMMARY:  '/hrms/attendance/summary/',
      MY:       '/attendance/my',
      CHECKIN:  '/hrms/attendance/checkin/',
      CHECKOUT: '/hrms/attendance/checkout/',
      WFH:      '/hrms/attendance/wfh/',
      OVERTIME: '/hrms/attendance/overtime/',
      TEAM:     '/hrms/attendance/team/',
    },
    EMPLOYEES: {
      BASE: '/hrms/employees/',
      DROPDOWN: '/employees/dropdown',
      DETAIL: (id: string) => `/hrms/employees/${id}/`,
      BY_DEPARTMENT: (dept: string) => `/hrms/employees/?department=${encodeURIComponent(dept)}`,
    },
    DEPARTMENTS: {
      BASE: '/hrms/departments/',
      DETAIL: (id: string) => `/hrms/departments/${id}/`,
    },
    DESIGNATIONS: {
      BASE: '/hrms/designations/',
      BY_DEPARTMENT: (dept: string) => `/hrms/designations/?department=${encodeURIComponent(dept)}`,
    },
  },
};
