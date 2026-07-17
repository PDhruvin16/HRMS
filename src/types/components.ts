import { ReactNode } from 'react';
import { ViewStyle, TextStyle, ImageStyle, StyleProp } from 'react-native';

// Common Component Props
export interface BaseComponentProps {
  style?: StyleProp<ViewStyle | TextStyle | ImageStyle>;
  children?: ReactNode;
  testID?: string;
}

// Button Component Types
export interface ButtonProps extends BaseComponentProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'gray' | 'light' | 'custom';
  size?: 'small' | 'medium' | 'large';
  icon?: boolean;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

// Input Component Types
export interface InputProps extends BaseComponentProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconPress?: () => void;
  tooltipContent?: ReactNode;
  required?: boolean;
  inputStyle?: TextStyle;
}

// Card Component Types
export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  image?: string;
  onPress?: () => void;
  elevated?: boolean;
  rounded?: boolean;
  padding?: number;
  margin?: number;
}

// Customer Card Component Types
// export interface CustomerCardProps extends BaseComponentProps {
//   customer: Customer;
//   onPress: (customer: Customer) => void;
// }

// Modal Component Types
export interface ModalProps extends BaseComponentProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  transparent?: boolean;
  fullScreen?: boolean;
}

// List Component Types
export interface ListProps<T = unknown> extends BaseComponentProps {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListEmptyComponent?: ReactNode;
  ListHeaderComponent?: ReactNode;
  ListFooterComponent?: ReactNode;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
}

// Avatar Component Types
export interface AvatarProps extends BaseComponentProps {
  source?: string;
  size?: number;
  rounded?: boolean;
  initials?: string;
  fallbackColor?: string;
  onPress?: () => void;
}

// Badge Component Types
export interface BadgeProps extends BaseComponentProps {
  text: string | number;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  dot?: boolean;
}

// Chip Component Types
export interface ChipProps extends BaseComponentProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  variant?: 'outlined' | 'filled';
  color?: string;
  disabled?: boolean;
}

// Divider Component Types
export interface DividerProps extends BaseComponentProps {
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  thickness?: number;
  spacing?: number;
}

// Skeleton Component Types
export interface SkeletonProps extends BaseComponentProps {
  width?: number | string;
  height?: number | string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

// Toast Component Types
export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  onPress?: () => void;
  onDismiss?: () => void;
}

// Loading Component Types
export interface LoadingProps extends BaseComponentProps {
  visible: boolean;
  text?: string;
  size?: 'small' | 'large' | number;
  color?: string;
  overlay?: boolean;
  transparent?: boolean;
}

// Form Component Types
export interface FormProps extends BaseComponentProps {
  onSubmit: (values: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
  validationSchema?: Record<string, unknown>;
  children: ReactNode;
}

export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'phone' | 'url';
  required?: boolean;
  validation?: Record<string, unknown>;
  component?: ReactNode;
}

// Search Component Types
export interface SearchProps extends BaseComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: (text: string) => void;
  placeholder?: string;
  showClearButton?: boolean;
  loading?: boolean;
  suggestions?: string[];
  onSuggestionPress?: (suggestion: string) => void;
}

// Filter Component Types
export interface FilterProps extends BaseComponentProps {
  filters: FilterOption[];
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  multiple?: boolean;
  showClearAll?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
  color?: string;
}

// Sort Component Types
export interface SortProps extends BaseComponentProps {
  options: SortOption[];
  selectedOption: string;
  onSortChange: (option: string) => void;
  showLabel?: boolean;
}

export interface SortOption {
  label: string;
  value: string;
  direction?: 'asc' | 'desc';
}

// Pagination Component Types
export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisible?: number;
}

// Chart Component Types
export interface ChartProps extends BaseComponentProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  width?: number;
  height?: number;
  color?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

// Calendar Component Types
export interface CalendarProps extends BaseComponentProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  markedDates?: MarkedDate[];
  minDate?: Date;
  maxDate?: Date;
  showTodayButton?: boolean;
  showMonthYearPicker?: boolean;
}

export interface MarkedDate {
  date: string;
  marked?: boolean;
  dotColor?: string;
  textColor?: string;
  selected?: boolean;
  selectedColor?: string;
}

// Image Component Types
export interface ImageProps extends BaseComponentProps {
  source: string;
  width?: number;
  height?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: ReactNode;
  fallback?: ReactNode;
  cache?: boolean;
}
