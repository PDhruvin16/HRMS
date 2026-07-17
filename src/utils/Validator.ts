// validators.ts
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: unknown) => boolean;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const MEDIA_RULES = {
  image: {
    types: ['image/jpeg', 'image/jpg', 'image/png'],
    maxSizeMB: 5,
  },
  video: {
    types: ['video/mp4'],
    maxSizeMB: 16,
  },
  document: {
    types: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    ],
    maxSizeMB: 100,
  },
};

export const validateMediaFile = (
  file: {
    type: string;
    size: number; // in bytes
    name?: string;
  },
  category: 'image' | 'video' | 'document',
) => {
  const rules = MEDIA_RULES[category];

  if (!rules) {
    return { valid: false, message: 'Invalid media category' };
  }

  // ✅ Type validation
  if (!rules.types.includes(file.type)) {
    return {
      valid: false,
      message: `Invalid file type. Allowed: ${rules.types.join(', ')}`,
    };
  }

  // ✅ Size validation
  const fileSizeMB = file.size / (1024 * 1024);

  if (fileSizeMB > rules.maxSizeMB) {
    return {
      valid: false,
      message: `File size exceeds ${rules.maxSizeMB} MB`,
    };
  }

  return { valid: true };
};

/**
 * Validate a single field based on rules
 */
export const validateField = (value: unknown, rules: ValidationRule, fieldName: string): string => {
  // Required validation
  if (rules.required) {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return rules.message || `${fieldName} is required`;
    }
  }

  // If value is empty and not required, skip other validations
  const isEmpty =
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0);
  if (isEmpty && !rules.required) {
    return '';
  }

  // String-based validations
  if (typeof value === 'string') {
    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return rules.message || `${fieldName} must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.message || `${fieldName} must not exceed ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message || `${fieldName} format is invalid`;
    }
  }

  // Number-based validations
  if (
    typeof value === 'number' ||
    (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value)))
  ) {
    const numValue = typeof value === 'number' ? value : Number(value);

    // Min value validation
    if (rules.min !== undefined && numValue < rules.min) {
      return rules.message || `${fieldName} must be at least ${rules.min}`;
    }

    // Max value validation
    if (rules.max !== undefined && numValue > rules.max) {
      return rules.message || `${fieldName} must not exceed ${rules.max}`;
    }
  }

  // Custom validation
  if (rules.custom && !rules.custom(value)) {
    return rules.message || `${fieldName} is invalid`;
  }

  return '';
};

/**
 * Validate all fields based on validation rules
 */
export const validateForm = (
  formData: { [key: string]: unknown },
  validationRules: ValidationRules,
): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(validationRules).forEach((fieldName) => {
    const value = formData[fieldName];
    const rules = validationRules[fieldName];
    const error = validateField(value, rules, fieldName);

    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

/**
 * Check if form has any errors
 */
export const hasErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

// Common validation patterns
export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  /**
   * Phone number patterns
   */
  phoneIN: /^[6-9]\d{9}$/,
  // India: 10-digit mobile numbers starting with 6–9

  phoneUS: /^\d{10}$/,
  // US: 10-digit national numbers (no country code)

  phoneInternational: /^\+?[1-9]\d{7,14}$/,
  // E.164 format: +<country_code><number>, max 15 digits

  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z\s]+$/,
  numeric: /^[0-9]+$/,
  orderNo: /^[A-Z]{3}-\d{4}-\d{3}$/i, // e.g., ORD-2024-001
  batchNo: /^[A-Z]\d{4}-\d{3}$/i, // e.g., B2024-001
  sku: /^[A-Z]{3}-\d{3}$/i, // e.g., ADH-001
  whatsappTemplateName: /^(?!.*\s)(?!.*[A-Z]).*$/,
  emoji:
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u,
};

/**
 * Validate phone number based on country code
 */
export const validatePhone = (value: string, countryCode: string = 'IN'): boolean => {
  const cleaned = value.replace(/[\s-]/g, '');
  const digitsOnly = cleaned.replace(/[^0-9+]/g, '');
  if (countryCode === 'IN') {
    return PATTERNS.phoneIN.test(digitsOnly);
  }
  if (countryCode === 'US' || countryCode === 'CA') {
    return PATTERNS.phoneUS.test(digitsOnly);
  }
  return PATTERNS.phoneInternational.test(digitsOnly);
};

// Common validation rules
export const COMMON_RULES = {
  required: (fieldName: string): ValidationRule => ({
    required: true,
    message: `${fieldName} is required`,
  }),

  email: (): ValidationRule => ({
    pattern: PATTERNS.email,
    message: 'Please enter a valid email address',
  }),

  phoneIN: (): ValidationRule => ({
    pattern: PATTERNS.phoneIN,
    message: 'Please enter a valid 10-digit Indian mobile number',
  }),

  phoneUS: (): ValidationRule => ({
    pattern: PATTERNS.phoneUS,
    message: 'Please enter a valid 10-digit phone number',
  }),

  phoneInternational: (): ValidationRule => ({
    pattern: PATTERNS.phoneInternational,
    message: 'Please enter a valid phone number',
  }),

  minLength: (length: number, fieldName: string): ValidationRule => ({
    minLength: length,
    message: `${fieldName} must be at least ${length} characters`,
  }),

  maxLength: (length: number, fieldName: string): ValidationRule => ({
    maxLength: length,
    message: `${fieldName} must not exceed ${length} characters`,
  }),

  positiveNumber: (fieldName: string): ValidationRule => ({
    min: 1,
    message: `${fieldName} must be greater than 0`,
  }),

  range: (min: number, max: number, fieldName: string): ValidationRule => ({
    min,
    max,
    message: `${fieldName} must be between ${min} and ${max}`,
  }),

  url: (): ValidationRule => ({
    // eslint-disable-next-line no-useless-escape
    pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
    message: 'Please enter a valid URL',
  }),
};

/**
 * Merges server-side field errors with existing validation errors.
 * Useful for mapping backend response errors back to the UI form.
 */
export const applyServerErrors = (
  serverErrors: Record<string, string>,
  setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>,
) => {
  setErrors((prev) => ({
    ...prev,
    ...serverErrors,
  }));
};
