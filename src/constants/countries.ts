export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  maxLength: number;
}

export const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', maxLength: 10 },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', maxLength: 10 },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', maxLength: 10 },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', maxLength: 9 },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', maxLength: 9 },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', maxLength: 10 },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', maxLength: 8 },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', maxLength: 11 },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', maxLength: 9 },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', maxLength: 10 },
];

export const getCountryByDialCode = (dialCode: string): Country | undefined => {
  return COUNTRIES.find((c) => c.dialCode === dialCode);
};

export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find((c) => c.code === code);
};
