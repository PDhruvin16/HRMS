// Comprehensive validation utilities for form fields

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

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

// REGEX PATTERNS

export const VALIDATION_PATTERNS = {
  // Indian mobile number: 10 digits starting with 6-9
  MOBILE: /^[6-9]\d{9}$/,

  // Pincode: 6 digits
  PINCODE: /^[1-9]\d{5}$/,

  // Email: Standard email pattern
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // PAN: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,

  // GST: 2 digits, 5 letters, 4 digits, 1 letter, 1 alphanumeric, Z, 1 alphanumeric
  GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,

  // TAN: 4 letters, 5 digits, 1 letter (e.g., ABCD12345E)
  TAN: /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/,

  // IFSC: 4 letters, 0, 6 alphanumeric (e.g., SBIN0001234)
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,

  // Account Number: 9-18 digits
  ACCOUNT_NUMBER: /^\d{9,18}$/,

  // MSME Registration: UDYAM-XX-00-0000000 format
  MSME: /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/,

  // Vehicle Number: Various Indian formats (e.g., MH12AB1234, GJ01AA1234)
  VEHICLE_NUMBER: /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/,

  // Only alphabets and spaces
  ALPHABETS_ONLY: /^[A-Za-z\s]+$/,

  // Alphanumeric with spaces
  ALPHANUMERIC: /^[A-Za-z0-9\s]+$/,
};

// Common validation patterns (from validators.ts)
export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9]{10}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z\s]+$/,
  numeric: /^[0-9]+$/,
  orderNo: /^[A-Z]{3}-\d{4}-\d{3}$/i, // e.g., ORD-2024-001
  batchNo: /^[A-Z]\d{4}-\d{3}$/i, // e.g., B2024-001
  sku: /^[A-Z]{3}-\d{3}$/i, // e.g., ADH-001
};

// RULE-BASED VALIDATION (from validators.ts)

/**
 * Validate a single field based on rules
 */
export const validateFieldWithRules = (
  value: unknown,
  rules: ValidationRule,
  fieldName: string,
): string => {
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
  if (!value && !rules.required) {
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
  if (typeof value === 'number' || !isNaN(Number(value))) {
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
    const error = validateFieldWithRules(value, rules, fieldName);

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

// Common validation rules (from validators.ts)
export const COMMON_RULES = {
  required: (fieldName: string): ValidationRule => ({
    required: true,
    message: `${fieldName} is required`,
  }),

  email: (): ValidationRule => ({
    pattern: PATTERNS.email,
    message: 'Please enter a valid email address',
  }),

  phone: (): ValidationRule => ({
    pattern: PATTERNS.phone,
    message: 'Please enter a valid 10-digit phone number',
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
};

// PHONE NUMBER VALIDATION

export const validatePhoneNumber = (phone: string, required: boolean = true): ValidationResult => {
  const cleaned = phone.replace(/[\s\-+()]/g, '');

  if (!cleaned && !required) {
    return { isValid: true };
  }

  if (!cleaned) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove country code if present
  const phoneWithoutCode =
    cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.substring(2) : cleaned;

  if (!VALIDATION_PATTERNS.MOBILE.test(phoneWithoutCode)) {
    return {
      isValid: false,
      error: 'Invalid phone number. Must be 10 digits starting with 6-9',
    };
  }

  return { isValid: true };
};

// EMAIL VALIDATION

export const validateEmail = (email: string, required: boolean = false): ValidationResult => {
  const trimmed = email.trim();

  if (!trimmed && !required) {
    return { isValid: true };
  }

  if (!trimmed) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!VALIDATION_PATTERNS.EMAIL.test(trimmed)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
};

// PINCODE VALIDATION

export const validatePincode = (pincode: string, required: boolean = true): ValidationResult => {
  const cleaned = pincode.trim();

  if (!cleaned && !required) {
    return { isValid: true };
  }

  if (!cleaned) {
    return { isValid: false, error: 'Pincode is required' };
  }

  if (!VALIDATION_PATTERNS.PINCODE.test(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid pincode. Must be 6 digits and cannot start with 0',
    };
  }

  return { isValid: true };
};

// PAN VALIDATION

export const validatePAN = (pan: string, required: boolean = true): ValidationResult => {
  const cleaned = pan.trim().toUpperCase();

  if (!cleaned && !required) {
    return { isValid: true };
  }

  if (!cleaned) {
    return { isValid: false, error: 'PAN is required' };
  }

  if (cleaned.length !== 10) {
    return { isValid: false, error: 'PAN must be exactly 10 characters' };
  }

  if (!VALIDATION_PATTERNS.PAN.test(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid PAN format. Must be like ABCDE1234F',
    };
  }

  return { isValid: true };
};

// GST VALIDATION

export const validateGST = (gst: string, required: boolean = false): ValidationResult => {
  const cleaned = gst.trim().toUpperCase();

  if (!cleaned && !required) {
    return { isValid: true };
  }

  if (!cleaned) {
    return { isValid: false, error: 'GST number is required' };
  }

  if (cleaned.length !== 15) {
    return { isValid: false, error: 'GST must be exactly 15 characters' };
  }

  if (!VALIDATION_PATTERNS.GST.test(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid GST format. Must be like 27ABCDE1234F1Z5',
    };
  }

  return { isValid: true };
};

// TAN VALIDATION

export const validateTAN = (tan: string, required: boolean = false): ValidationResult => {
  const cleaned = tan.trim().toUpperCase();

  if (!cleaned && !required) {
    return { isValid: true };
  }

  if (!cleaned) {
    return { isValid: false, error: 'TAN is required' };
  }

  if (cleaned.length !== 10) {
    return { isValid: false, error: 'TAN must be exactly 10 characters' };
  }

  if (!VALIDATION_PATTERNS.TAN.test(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid TAN format. Must be like ABCD12345E',
    };
  }

  return { isValid: true };
};

// IFSC CODE VALIDATION

export const validateIFSC = (ifsc: string, required: boolean = false): ValidationResult => {
  const cleaned = ifsc.trim().toUpperCase();

  if (!cleaned && !required) {
    return { isValid: true };
  }

  if (!cleaned) {
    return { isValid: false, error: 'IFSC code is required' };
  }

  if (cleaned.length !== 11) {
    return { isValid: false, error: 'IFSC code must be exactly 11 characters' };
  }

  if (!VALIDATION_PATTERNS.IFSC.test(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid IFSC format. Must be like SBIN0001234',
    };
  }

  return { isValid: true };
};

// ACCOUNT NUMBER VALIDATION

export const validateAccountNumber = (
  accountNumber: string,
  required: boolean = false,
): ValidationResult => {
  const cleaned = accountNumber.trim();

  if (!cleaned && !required) {
    return { isValid: true };
  }

  if (!cleaned) {
    return { isValid: false, error: 'Account number is required' };
  }

  if (!VALIDATION_PATTERNS.ACCOUNT_NUMBER.test(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid account number. Must be 9-18 digits',
    };
  }

  return { isValid: true };
};

// MSME REGISTRATION VALIDATION

export const validateMSME = (msme: string, required: boolean = false): ValidationResult => {
  const cleaned = msme.trim().toUpperCase();

  if (!cleaned && !required) {
    return { isValid: true };
  }

  if (!cleaned) {
    return { isValid: false, error: 'MSME registration number is required' };
  }

  if (!VALIDATION_PATTERNS.MSME.test(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid MSME format. Must be like UDYAM-XX-00-0000000',
    };
  }

  return { isValid: true };
};

// VEHICLE NUMBER VALIDATION

export const validateVehicleNumber = (
  vehicleNumber: string,
  required: boolean = false,
): ValidationResult => {
  const cleaned = vehicleNumber.trim().toUpperCase().replace(/[\s-]/g, '');

  if (!cleaned && !required) {
    return { isValid: true };
  }

  if (!cleaned) {
    return { isValid: false, error: 'Vehicle number is required' };
  }

  if (!VALIDATION_PATTERNS.VEHICLE_NUMBER.test(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid vehicle number. Must be like MH12AB1234',
    };
  }

  return { isValid: true };
};

// TEXT VALIDATION

export const validateText = (
  text: string,
  required: boolean = true,
  minLength?: number,
  maxLength?: number,
  pattern?: RegExp,
): ValidationResult => {
  const trimmed = text.trim();

  if (!trimmed && !required) {
    return { isValid: true };
  }

  if (!trimmed) {
    return { isValid: false, error: 'This field is required' };
  }

  if (minLength && trimmed.length < minLength) {
    return {
      isValid: false,
      error: `Must be at least ${minLength} characters`,
    };
  }

  if (maxLength && trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `Must not exceed ${maxLength} characters`,
    };
  }

  if (pattern && !pattern.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid format',
    };
  }

  return { isValid: true };
};

// NUMBER VALIDATION

export const validateNumber = (
  value: string | number,
  required: boolean = true,
  min?: number,
  max?: number,
): ValidationResult => {
  const str = String(value).trim();

  if (!str && !required) {
    return { isValid: true };
  }

  if (!str) {
    return { isValid: false, error: 'This field is required' };
  }

  const num = Number(str);

  if (isNaN(num)) {
    return { isValid: false, error: 'Must be a valid number' };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `Must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `Must not exceed ${max}` };
  }

  return { isValid: true };
};

// FIRM NAME VALIDATION

export const validateFirmName = (firmName: string, required: boolean = true): ValidationResult => {
  return validateText(firmName, required, 2, 100);
};

// CONTACT NAME VALIDATION

export const validateContactName = (name: string, required: boolean = true): ValidationResult => {
  const result = validateText(name, required, 2, 50, VALIDATION_PATTERNS.ALPHABETS_ONLY);

  if (!result.isValid && result.error === 'Invalid format') {
    return { isValid: false, error: 'Name should contain only letters' };
  }

  return result;
};

// ADDRESS VALIDATION

export const validateAddress = (address: string, required: boolean = false): ValidationResult => {
  return validateText(address, required, 10, 500);
};

// CREDIT LIMIT VALIDATION

export const validateCreditLimit = (
  creditLimit: string,
  required: boolean = false,
): ValidationResult => {
  return validateNumber(creditLimit, required, 0, 100000000);
};

// COMPREHENSIVE FIELD VALIDATOR

export const validateField = (
  fieldType: string,
  value: unknown,
  required: boolean = false,
  fieldName?: string,
): ValidationResult => {
  const stringValue = typeof value === 'string' ? value : String(value || '');
  const numberValue =
    typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : 0;

  switch (fieldType) {
    case 'phone':
      return validatePhoneNumber(stringValue, required);

    case 'email':
      return validateEmail(stringValue, required);

    case 'number':
      if (fieldName === 'pincode') {
        return validatePincode(stringValue, required);
      }
      if (fieldName === 'creditLimit') {
        return validateCreditLimit(stringValue, required);
      }
      return validateNumber(numberValue, required);

    case 'text':
      if (fieldName === 'pan') {
        return validatePAN(stringValue, required);
      }
      if (fieldName === 'gst' || fieldName === 'gstNumber') {
        return validateGST(stringValue, required);
      }
      if (fieldName === 'tan') {
        return validateTAN(stringValue, required);
      }
      if (fieldName === 'ifscCode') {
        return validateIFSC(stringValue, required);
      }
      if (fieldName === 'accountNumber') {
        return validateAccountNumber(stringValue, required);
      }
      if (fieldName === 'msmeRegistrationNo') {
        return validateMSME(stringValue, required);
      }
      if (fieldName === 'vehicleNumber') {
        return validateVehicleNumber(stringValue, required);
      }
      if (fieldName === 'firmName') {
        return validateFirmName(stringValue, required);
      }
      if (fieldName === 'contactName') {
        return validateContactName(stringValue, required);
      }
      return validateText(stringValue, required);

    case 'textarea':
      if (fieldName === 'address' || fieldName === 'registeredAddress') {
        return validateAddress(stringValue, required);
      }
      return validateText(stringValue, required, 0, 1000);

    default:
      return validateText(stringValue, required);
  }
};

// FORMAT HELPERS

export const formatPhoneNumber = (phone: string | number): string => {
  const phoneStr = String(phone);
  const cleaned = phoneStr.replace(/[\s\-+()]/g, '');

  // Extract the last 10 digits as the base phone number
  const baseNumber = cleaned.length >= 10 ? cleaned.slice(-10) : cleaned;

  if (baseNumber.length === 10) {
    return `+91 ${baseNumber.substring(0, 5)} ${baseNumber.substring(5)}`;
  }

  return phoneStr;
};

export const formatPincode = (pincode: string): string => {
  return pincode.replace(/\D/g, '').substring(0, 6);
};

export const formatPAN = (pan: string): string => {
  return pan.toUpperCase().substring(0, 10);
};

export const formatGST = (gst: string): string => {
  return gst.toUpperCase().substring(0, 15);
};

export const formatVehicleNumber = (vehicleNumber: string): string => {
  return vehicleNumber.toUpperCase().replace(/[\s-]/g, '');
};
