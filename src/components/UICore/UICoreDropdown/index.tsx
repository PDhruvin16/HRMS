// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ViewStyle,
  TextStyle,
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { UICoreTextInput } from '../UICoreTextInput';
import { UICoreSearch } from '../UICoreSearch';
import { Typography } from '../../Typography';
import { ChevronDown, ChevronUp, Check } from 'lucide-react-native';
import { colors } from '../../../theme/color';
import { normalize } from '../../../utils/responsive';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface UICoreDropdownProps {
  label?: string;
  value?: string;
  values?: string[];
  placeholder?: string;
  error?: string;
  isOpen?: boolean;
  disabled?: boolean;
  isFocused?: boolean;
  isLoading?: boolean;
  emptyText?: string;
  options?: DropdownOption[];
  onSelect?: (option: DropdownOption) => void;
  onSelectMulti?: (values: string[]) => void;
  onPress?: () => void;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  openUpward?: boolean;
  mode?: 'single' | 'multi';
  required?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isFetchingNextPage?: boolean;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  allowCreate?: boolean;
  onCreateOption?: (searchValue: string) => void;
  isCreatingOption?: boolean;
  inputContainerStyle?: ViewStyle;
  dropdownMenuStyle?: ViewStyle;
  optionStyle?: ViewStyle;
  optionTextStyle?: TextStyle;
  searchInputStyle?: TextStyle;
  searchContainerStyle?: ViewStyle;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

let activeDropdownCloser: (() => void) | null = null;

export const UICoreDropdown: React.FC<UICoreDropdownProps> = ({
  label,
  value,
  values = [],
  placeholder,
  error,
  isOpen = false,
  disabled = false,
  isFocused = false,
  isLoading = false,
  emptyText = 'No options available',
  options = [],
  onSelect,
  onSelectMulti,
  onPress,
  containerStyle,
  leftIcon,
  openUpward = false,
  mode = 'single',
  required = false,
  onEndReached,
  onEndReachedThreshold = 0.5,
  isFetchingNextPage = false,
  searchable = false,
  searchValue = '',
  onSearchChange,
  allowCreate = false,
  onCreateOption,
  isCreatingOption = false,
  inputContainerStyle,
  dropdownMenuStyle,
  optionStyle,
  optionTextStyle,
  searchInputStyle,
  searchContainerStyle,
  style,
  labelStyle,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [autoOpenUpward, setAutoOpenUpward] = useState(false);
  const containerRef = useRef<View>(null);

  const closeDropdown = useCallback(() => {
    setInternalOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (activeDropdownCloser === closeDropdown) {
        activeDropdownCloser = null;
      }
    };
  }, [closeDropdown]);

  const actualOpen = isOpen || internalOpen;

  const showCreateOption =
    searchable &&
    allowCreate &&
    searchValue.trim() !== '' &&
    !options.some((opt) => opt.label?.toLowerCase() === searchValue.trim().toLowerCase());

  const getDisplayLabel = () => {
    if (mode === 'single') {
      const selectedOption = options.find((opt) => opt.value === value);
      return selectedOption ? selectedOption.label : '';
    } else {
      if (!values || values.length === 0) return '';
      if (values.length <= 2) {
        return options
          .filter((opt) => values.includes(opt.value))
          .map((opt) => opt.label)
          .join(', ');
      }
      return `${values.length} Selected`;
    }
  };

  const handlePress = () => {
    if (disabled) return;

    const willOpen = !actualOpen;

    if (willOpen) {
      // Close the previously opened dropdown if there is one
      if (activeDropdownCloser && activeDropdownCloser !== closeDropdown) {
        activeDropdownCloser();
      }
      // Register current dropdown as the active one
      activeDropdownCloser = closeDropdown;

      containerRef.current?.measure((_x, _y, _width, _height, _pageX, pageY) => {
        const screenHeight = Dimensions.get('window').height;
        // If dropdown is in the bottom 45% of the screen, open upward
        if (typeof pageY === 'number' && !isNaN(pageY) && pageY > screenHeight * 0.55) {
          setAutoOpenUpward(true);
        } else {
          setAutoOpenUpward(false);
        }
      });
    } else {
      // If we are closing it, release the global focus registry
      if (activeDropdownCloser === closeDropdown) {
        activeDropdownCloser = null;
      }
    }

    if (onPress) onPress();
    setInternalOpen(willOpen);
  };

  const handleSelect = (option: DropdownOption) => {
    if (mode === 'single') {
      if (onSelect) onSelect(option);
      setInternalOpen(false);
      if (activeDropdownCloser === closeDropdown) {
        activeDropdownCloser = null;
      }
    } else {
      const isSelected = values.includes(option.value);
      const nextValues = isSelected
        ? values.filter((v) => v !== option.value)
        : [...values, option.value];
      if (onSelectMulti) onSelectMulti(nextValues);
    }
  };

  const isOptionSelected = (opt: DropdownOption) => {
    if (mode === 'single') return value === opt.value;
    return values.includes(opt.value);
  };

  return (
    <View
      ref={containerRef}
      style={[
        styles.container,
        actualOpen && styles.activeContainer,
        disabled && styles.disabledDropdown,
        containerStyle,
      ]}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress} disabled={disabled}>
        <UICoreTextInput
          label={label}
          value={getDisplayLabel()}
          placeholder={placeholder}
          error={error}
          disabled={disabled}
          editable={false}
          showSoftInputOnFocus={false}
          caretHidden={true}
          forceFocus={actualOpen || isFocused}
          pointerEvents="none"
          containerStyle={[styles.textInputContainer, styles.dropdownTriggerContainer]}
          inputContainerStyle={[styles.dropdownTriggerInputContainer, inputContainerStyle]}
          leftIcon={leftIcon}
          required={required}
          style={style}
          labelStyle={labelStyle}
          rightIcon={
            actualOpen ? (
              <ChevronUp size={normalize(20)} color={colors.text.secondary} />
            ) : (
              <ChevronDown size={normalize(20)} color={colors.text.secondary} />
            )
          }
        />
      </TouchableOpacity>

      {/* Floating absolute dropdown menu */}
      {actualOpen && (
        <>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => {
              setInternalOpen(false);
              if (activeDropdownCloser === closeDropdown) {
                activeDropdownCloser = null;
              }
            }}
          />
          <View
            style={[
              styles.dropdownMenu,
              styles.dropdownMenuContent,
              openUpward || autoOpenUpward
                ? styles.dropdownMenuUpward
                : styles.dropdownMenuDownward,
              dropdownMenuStyle,
            ]}
          >
            {searchable && (
              <View style={styles.searchContainer}>
                <UICoreSearch
                  value={searchValue}
                  onChangeText={onSearchChange}
                  onClear={() => onSearchChange?.('')}
                  placeholder="Search..."
                  autoFocus={false}
                  containerStyle={styles.searchDropdownContainer}
                  inputContainerStyle={[styles.searchInputContainer, searchContainerStyle]}
                  style={searchInputStyle}
                />
              </View>
            )}

            {isLoading ? (
              <View style={styles.feedbackContainer}>
                <ActivityIndicator size="small" color={colors.inputActive} />
                <Typography style={styles.feedbackText}>Loading...</Typography>
              </View>
            ) : (
              <>
                {options.length === 0 && !showCreateOption ? (
                  <View style={styles.feedbackContainer}>
                    <Typography style={styles.emptyText}>{emptyText}</Typography>
                  </View>
                ) : (
                  <FlatList
                    data={options}
                    keyExtractor={(item, index) => item.value + index.toString()}
                    style={styles.list}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    onEndReached={onEndReached}
                    onEndReachedThreshold={onEndReachedThreshold}
                    ListFooterComponent={
                      isFetchingNextPage ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.primary}
                          style={styles.footerLoader}
                        />
                      ) : null
                    }
                    renderItem={({ item }) => {
                      const selected = isOptionSelected(item);
                      return (
                        <TouchableOpacity
                          style={[
                            styles.optionItem,
                            selected && styles.selectedOptionItem,
                            optionStyle,
                          ]}
                          onPress={() => handleSelect(item)}
                          activeOpacity={0.7}
                        >
                          <Typography style={[styles.optionText, optionTextStyle]}>
                            {item.label}
                          </Typography>
                          {selected && (
                            <Check size={normalize(20)} color={colors.inputActive || colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
                {showCreateOption && (
                  <TouchableOpacity
                    style={[styles.optionItem, styles.createOptionItem]}
                    onPress={() => onCreateOption?.(searchValue.trim())}
                    disabled={isCreatingOption}
                    activeOpacity={0.7}
                  >
                    {isCreatingOption ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Typography style={[styles.optionText, styles.createOptionText]}>
                        + Create "{searchValue.trim()}"
                      </Typography>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    marginBottom: normalize(16),
    zIndex: 1,
  },
  activeContainer: {
    zIndex: 10000,
    elevation: Platform.OS === 'android' ? 99 : undefined,
  },
  disabledDropdown: {
    opacity: 0.5,
  },
  textInputContainer: {
    marginBottom: 0,
  },
  dropdownTriggerContainer: {
    opacity: 1,
  },
  dropdownTriggerInputContainer: {
    backgroundColor: colors.white,
    minHeight: normalize(46),
  },
  dropdownMenu: {
    position: 'absolute',
    left: 0,
    right: 0,
    maxHeight: normalize(220),
    borderRadius: normalize(8),
    paddingVertical: normalize(8),
    borderWidth: 1,
    shadowColor: colors.shadowColor || '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 24 : 8,
    zIndex: 10002,
  },
  dropdownMenuContent: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  backdrop: {
    position: 'absolute',
    top: -normalize(1000),
    bottom: -normalize(1000),
    left: -normalize(1000),
    right: -normalize(1000),
    backgroundColor: 'transparent',
    zIndex: 10001,
  },
  dropdownMenuDownward: {
    top: '100%',
    marginTop: 2,
  },
  dropdownMenuUpward: {
    bottom: '100%',
    marginBottom: 4,
  },
  searchDropdownContainer: {
    marginBottom: 0,
  },
  searchInputContainer: {
    minHeight: normalize(40),
    height: normalize(40),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: normalize(12),
  },
  footerLoader: {
    marginVertical: normalize(10),
  },
  selectedOptionItem: {
    backgroundColor: `${colors.inputActive}1A`,
  },
  createOptionItem: {
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  createOptionText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: normalize(12),
    paddingBottom: normalize(4),
    marginBottom: normalize(4),
  },
  list: {
    paddingHorizontal: normalize(8),
  },
  optionItem: {
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: normalize(8),
    marginBottom: 0,
  },
  optionText: {
    color: colors.inputTextColor || colors.labelColor,
    fontSize: normalize(16),
    fontWeight: '400',
    flex: 1,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(16),
    gap: normalize(8),
  },
  feedbackText: {
    color: colors.text?.secondary || '#888',
    fontSize: normalize(14),
  },
  emptyText: {
    color: colors.text?.secondary || '#888',
    fontSize: normalize(14),
    fontStyle: 'italic',
  },
});

export default UICoreDropdown;
