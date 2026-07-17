/**
 * Extracts a readable error message from an API error response.
 * Ports logic from the v2 project and adapts it for React Native/Axios.
 */

export interface ApiError {
  response?: {
    data?: {
      message?: string | Array<Record<string, string>> | Record<string, string[]>;
      data?: unknown;
    };
    status?: number;
  };
  message?: string;
  code?: string;
}

export interface FieldErrorMap {
  [key: string]: string;
}

/**
 * Extract field-level errors from API response
 */
export const getFieldErrors = (error: ApiError): FieldErrorMap | null => {
  const data = error?.response?.data;
  const message = data?.message;

  const fieldErrors: FieldErrorMap = {};

  // CASE 1: message is an array of objects (v2 style)
  if (Array.isArray(message)) {
    message.forEach((errObj) => {
      if (typeof errObj === 'object' && errObj !== null) {
        Object.entries(errObj).forEach(([field, msg]) => {
          if (typeof msg === 'string') {
            fieldErrors[field] = msg;
          }
        });
      }
    });
    return Object.keys(fieldErrors).length ? fieldErrors : null;
  }

  // CASE 2: data is an object with field names as keys and arrays of strings as values (DRF style)
  // Example: { "email": ["This field is required."] }
  if (typeof message === 'object' && message !== null) {
    Object.entries(message).forEach(([field, msgs]) => {
      if (Array.isArray(msgs) && msgs.length > 0 && typeof msgs[0] === 'string') {
        fieldErrors[field] = msgs[0];
      } else if (typeof msgs === 'string') {
        fieldErrors[field] = msgs;
      }
    });
    return Object.keys(fieldErrors).length ? fieldErrors : null;
  }

  return null;
};

/**
 * Extract readable Api error message
 */
export const getApiErrorMessage = (error: ApiError): string => {
  if (!error?.response) {
    if (error?.message === 'Network Error') {
      return 'Network error — Please check your internet connection.';
    }

    if (error?.message?.includes('timeout')) {
      return 'Request timed out — Please try again.';
    }

    if (error?.code === 'ECONNABORTED') {
      return 'Connection aborted — Please try again.';
    }

    return error?.message || 'Unable to reach the server.';
  }

  // ✔ Response exists → backend returned an error
  const status = error.response.status;
  const data = error.response.data;

  // Handler for extracting readable string messages from various backend error formats
  if (typeof data === 'string') {
    return data;
  }

  if (typeof data === 'object' && data !== null) {
    const dataObj = data as Record<string, unknown>;
    
    if (typeof dataObj.message === 'string') return dataObj.message;
    if (typeof dataObj.detail === 'string') return dataObj.detail;
    if (typeof dataObj.error === 'string') return dataObj.error;
    
    if (Array.isArray(dataObj.non_field_errors) && dataObj.non_field_errors.length > 0 && typeof dataObj.non_field_errors[0] === 'string') {
      return dataObj.non_field_errors[0];
    }
    
    // Fallback: search for any field-level string or array error (e.g. { "email": ["Enter a valid email address."] })
    for (const key of Object.keys(dataObj)) {
      const val = dataObj[key];
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
        return val[0];
      }
      if (typeof val === 'string') {
        return val;
      }
    }
  }

  // Specific status codes fallback
  if (status) {
    switch (status) {
      case 400:
        return 'Bad Request — Please check your inputs.';
      case 401:
        return 'Unauthorized — Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 408:
        return 'Request timeout — Please try again.';
      case 413:
        return 'File too large — upload a smaller file.';
      case 429:
        return 'Too many requests — Please slow down.';
      default:
        if (status >= 500 && status <= 599) {
          return 'Something went wrong on the server - please try again later.';
        }
        return `An error occurred (Status: ${status}).`;
    }
  }

  return 'An unexpected error occurred.';
};
