// @ts-nocheck
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  Modal,
  Dimensions,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import type { FC } from 'react';
import colors from '../../theme/color';
import { Typography } from '../Typography';
import { moderateScale } from '../../utils/responsive';
import { ChevronDown, Check, X, Search, Plus } from 'lucide-react-native';
import { TextInput } from 'react-native';

const windowHeight = Dimensions.get('window').height;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

// Types
export interface SelectOption {
  id: string | number;
  label: string;
  value?: string | number;
  unitLabel?: string;
  disabled?: boolean;
}

export interface SelectDropdownProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  mode?: 'single' | 'multi';
  value?: string | number | null;
  values?: (string | number)[];
  onChange?: (value: string | number | null, option?: SelectOption) => void;
  onChangeMulti?: (values: (string | number)[]) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  style?: ViewStyle;
  onBlur?: () => void;
  leftIcon?: React.ReactNode;
  searchable?: boolean;
  placeholderSearch?: string;
  enableCreate?: boolean;
  onCreateOption?: (query: string) => void;
  direction?: 'up' | 'down' | 'auto';
  loading?: boolean;
  fetchOptions?: () => void;
  onSearch?: (query: string) => void;
  reset?: () => void;
}

const SelectDropdown: FC<SelectDropdownProps> = ({
  label,
  placeholder = 'Select an option',
  options = [],
  mode = 'single',
  value = null,
  values = [],
  onChange,
  onChangeMulti,
  disabled = false,
  required = false,
  error,
  style,
  onBlur,
  leftIcon,
  searchable = false,
  placeholderSearch = 'Search...',
  enableCreate = false,
  onCreateOption,
  direction = 'auto',
  loading = false,
  fetchOptions,
  onSearch,
  reset,
}) => {
  const themeColors = colors;

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const inputRef = useRef<View>(null);
  const searchInputRef = useRef<TextInput>(null);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const MAX_DROPDOWN_HEIGHT = moderateScale(260);

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [open, rotateAnim]);

  useEffect(() => {
    onSearch?.(searchQuery);
  }, [searchQuery, onSearch]);

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const getOptionKey = useCallback((opt: SelectOption) => opt.id ?? opt.value, []);

  const toggleOpen = useCallback(() => {
    if (!disabled) {
      setOpen((prev) => {
        if (prev && onBlur) onBlur();
        if (prev) {
          setSearchQuery(''); // Clear search when closing
          reset?.();
        }
        return !prev;
      });
    }
  }, [disabled, onBlur, reset]);

  const filteredOptions = !searchQuery
    ? options
    : options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()));

  const showCreateOption =
    enableCreate &&
    searchQuery &&
    !options.some((opt) => opt.label.toLowerCase() === searchQuery.toLowerCase());

  const isSelected = useCallback(
    (key: string | number): boolean => {
      if (mode === 'single') return value === key;
      return Array.isArray(values) && values.some((item) => String(item) === String(key));
    },
    [mode, value, values],
  );

  const handleSelect = useCallback(
    (opt: SelectOption, operation?: 'remove') => {
      const key = opt.id ?? opt.value;
      if (mode === 'single') {
        onChange?.(key ?? null, opt);
        setOpen(false);
        onBlur?.();
      } else {
        let next: (string | number)[];
        if (operation === 'remove') {
          next = values.filter((v) => v !== key);
        } else {
          if (values.includes(key!)) {
            next = values.filter((v) => v !== key);
          } else {
            next = [...values, key!];
          }
        }
        onChangeMulti?.(next);
      }
    },
    [mode, values, onChange, onChangeMulti, onBlur],
  );

  const getSelectedLabel = useMemo((): string => {
    if (mode === 'single') {
      if (!value) return placeholder;
      const selectedOption = options.find((o) => getOptionKey(o) === value);
      return selectedOption?.label || placeholder;
    }
    return placeholder;
  }, [mode, value, placeholder, options, getOptionKey]);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Typography variant="label" style={styles.label}>
          {label}
          {required && (
            <Typography variant="label" style={styles.required}>
              {' '}
              *
            </Typography>
          )}
        </Typography>
      )}

      <Pressable
        ref={inputRef}
        style={[
          styles.inputContainer,
          open && styles.focusedContainer,
          disabled && styles.disabledContainer,
          !!error && styles.errorContainer,
        ]}
        onPress={() => {
          if (open) {
            setOpen(false);
            onBlur?.();
            reset?.();
            return;
          }
          if (inputRef.current) {
            inputRef.current.measureInWindow(
              (x: number, y: number, width: number, height: number) => {
                // On Android inside a statusBarTranslucent Modal, measureInWindow
                // already returns absolute screen coords (from top of screen,
                // including status bar). Do NOT add StatusBar.currentHeight again.
                setDropdownLayout({ x, y, width, height });
                setOpen(true);
              },
            );
          } else {
            toggleOpen();
          }
        }}
        disabled={disabled}
      >
        <View style={styles.inputContentContainer}>
          {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}

          <View style={styles.inputContent}>
            {mode === 'single' ? (
              <Typography
                variant="body2"
                style={[styles.inputText, !value ? styles.placeholderText : styles.selectedText]}
              >
                {getSelectedLabel}
              </Typography>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
                bounces={false}
              >
                {values.length === 0 ? (
                  <Typography variant="body2" style={[styles.inputText, styles.placeholderText]}>
                    {placeholder}
                  </Typography>
                ) : (
                  values.map((v: string | number) => {
                    const option = options.find((o) => getOptionKey(o) === v);
                    return (
                      <View style={styles.chip} key={v}>
                        <Typography variant="caption" style={styles.chipText} numberOfLines={1}>
                          {option?.label || String(v)}
                        </Typography>
                        <TouchableOpacity
                          style={styles.chipCloseBtn}
                          onPress={() => {
                            if (option) handleSelect(option, 'remove');
                          }}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <X size={moderateScale(12)} color={themeColors.dark} />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            )}
          </View>

          <View style={styles.iconContainer}>
            <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
              <ChevronDown size={moderateScale(20)} color={themeColors.gray} />
            </Animated.View>
          </View>
        </View>
      </Pressable>

      {error && (
        <Typography variant="caption" style={styles.errorText}>
          {error}
        </Typography>
      )}

      {open && (
        <React.Fragment>
          {(() => {
            const refHeight = Platform.OS === 'android' ? SCREEN_HEIGHT : windowHeight;
            const spaceBelow =
              refHeight - (dropdownLayout.y + dropdownLayout.height) - moderateScale(8);
            const spaceAbove = dropdownLayout.y - moderateScale(8);
            const openUp =
              direction === 'up' ||
              (direction === 'auto' && spaceBelow < moderateScale(200) && spaceAbove > spaceBelow);
            const effectiveMaxHeight = Math.min(
              MAX_DROPDOWN_HEIGHT,
              openUp ? spaceAbove : spaceBelow,
            );
            const floatingGap = moderateScale(4);

            return (
              <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={toggleOpen}
                statusBarTranslucent
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={toggleOpen}
                >
                  <View
                    key={`${options.length}-${searchQuery}`}
                    style={[
                      styles.modalDropdown,
                      {
                        left: dropdownLayout.x,
                        width: dropdownLayout.width,
                        maxHeight: Math.max(moderateScale(120), effectiveMaxHeight),
                      },
                      openUp
                        ? {
                            bottom: refHeight - dropdownLayout.y + floatingGap,
                          }
                        : {
                            top: dropdownLayout.y + dropdownLayout.height + floatingGap,
                          },
                    ]}
                    onStartShouldSetResponder={() => true}
                  >
                    <View style={styles.menuContainer}>
                      {searchable && (
                        <View style={styles.searchContainer}>
                          <Search size={moderateScale(18)} color={themeColors.gray} />
                          <TextInput
                            ref={searchInputRef}
                            style={styles.searchInput}
                            placeholder={placeholderSearch}
                            placeholderTextColor={themeColors.gray}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                          />
                          {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                              <X size={moderateScale(16)} color={themeColors.gray} />
                            </TouchableOpacity>
                          )}
                        </View>
                      )}

                      <ScrollView
                        style={styles.menu}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={true}
                        bounces={false}
                        keyboardShouldPersistTaps="handled"
                        onScroll={({ nativeEvent }) => {
                          if (
                            fetchOptions &&
                            !loading &&
                            nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
                              nativeEvent.contentSize.height - 20
                          ) {
                            fetchOptions();
                          }
                        }}
                        scrollEventThrottle={400}
                      >
                        {showCreateOption && (
                          <TouchableOpacity
                            style={styles.createOption}
                            onPress={() => {
                              const query = searchQuery;
                              setSearchQuery('');
                              onCreateOption?.(query);
                            }}
                          >
                            <View style={styles.createIconWrapper}>
                              <Plus size={moderateScale(18)} color={themeColors.primary} />
                            </View>
                            <Typography variant="body2" style={styles.createOptionText}>
                              Create "{searchQuery}"
                            </Typography>
                          </TouchableOpacity>
                        )}

                        {filteredOptions.length === 0 && !showCreateOption ? (
                          <View style={styles.emptyContainer}>
                            <Typography variant="body2" style={styles.emptyText}>
                              No options available
                            </Typography>
                          </View>
                        ) : (
                          filteredOptions.map((opt, index) => {
                            const key = getOptionKey(opt);
                            const isLast = index === filteredOptions.length - 1;
                            const selected = isSelected(key!);

                            return (
                              <TouchableOpacity
                                key={key}
                                style={[
                                  styles.option,
                                  !isLast && styles.optionBorder,
                                  selected && mode === 'single' && styles.selectedOptionBg,
                                  opt.disabled && { opacity: 0.5 },
                                ]}
                                onPress={() => !opt.disabled && handleSelect(opt)}
                                activeOpacity={opt.disabled ? 1 : 0.6}
                              >
                                {mode === 'multi' && (
                                  <View style={styles.checkboxContainer}>
                                    <View style={[styles.checkbox, selected && styles.checkedBox]}>
                                      {selected && (
                                        <Check size={moderateScale(12)} color={themeColors.white} />
                                      )}
                                    </View>
                                  </View>
                                )}
                                <Typography
                                  variant="body2"
                                  style={[styles.optionText, selected && styles.selectedOptionText]}
                                >
                                  {opt.label}
                                </Typography>

                                {mode === 'single' && selected && (
                                  <Check size={moderateScale(18)} color={themeColors.primary} />
                                )}
                              </TouchableOpacity>
                            );
                          })
                        )}
                        {loading && (
                          <View style={styles.loadingContainer}>
                            <Typography variant="caption" style={styles.loadingText}>
                              Loading...
                            </Typography>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  </View>
                </TouchableOpacity>
              </Modal>
            );
          })()}
        </React.Fragment>
      )}
    </View>
  );
};

const styles = (() => {
  const themeColors = colors;
  return StyleSheet.create({
    container: {
      marginBottom: moderateScale(16),
      position: 'relative',
      zIndex: 100,
    },
    label: {
      marginBottom: moderateScale(6),
      fontFamily: 'DMSans-Medium',
    },
    required: {
      color: themeColors.error,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: themeColors.border,
      borderRadius: moderateScale(14),
      minHeight: moderateScale(48),
      backgroundColor: themeColors.white,
    },
    focusedContainer: {
      borderColor: themeColors.primary,
    },
    disabledContainer: {
      backgroundColor: themeColors.lightGray,
      opacity: 0.6,
    },
    errorContainer: {
      borderColor: themeColors.error,
    },
    inputContentContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    leftIconWrapper: {
      paddingLeft: moderateScale(14),
      paddingRight: moderateScale(4),
    },
    inputContent: {
      flex: 1,
      paddingVertical: moderateScale(10),
      paddingHorizontal: moderateScale(14),
      justifyContent: 'center',
    },
    inputText: {
      fontSize: moderateScale(15),
      fontFamily: 'DMSans-Regular',
    },
    placeholderText: {
      color: themeColors.gray,
    },
    selectedText: {
      color: themeColors.dark,
    },
    iconContainer: {
      paddingHorizontal: moderateScale(12),
    },
    errorText: {
      color: themeColors.error,
      fontSize: moderateScale(12),
      marginTop: moderateScale(4),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    modalDropdown: {
      position: 'absolute',
      borderRadius: moderateScale(14),
      borderWidth: 1,
      borderColor: themeColors.border,
      backgroundColor: themeColors.white,
      shadowColor: themeColors.dark || '#000',
      shadowOffset: { width: 0, height: moderateScale(8) },
      shadowOpacity: 0.12,
      shadowRadius: moderateScale(16),
      elevation: 12,
      overflow: 'hidden',
    },
    menu: {
      maxHeight: moderateScale(260),
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: moderateScale(14),
      paddingHorizontal: moderateScale(16),
    },
    optionBorder: {
      borderBottomColor: themeColors.lightGray,
      borderBottomWidth: 1,
    },
    selectedOptionBg: {
      backgroundColor: themeColors.lightGray + '40',
    },
    optionText: {
      flex: 1,
      fontSize: moderateScale(15),
      fontFamily: 'DMSans-Regular',
      color: themeColors.dark,
    },
    selectedOptionText: {
      fontFamily: 'DMSans-Medium',
    },
    checkboxContainer: {
      marginRight: moderateScale(12),
    },
    checkbox: {
      width: moderateScale(20),
      height: moderateScale(20),
      borderRadius: moderateScale(6),
      borderWidth: 1.5,
      borderColor: themeColors.gray,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkedBox: {
      backgroundColor: themeColors.primary,
      borderColor: themeColors.primary,
      borderWidth: 0,
    },
    chipsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(8),
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: moderateScale(10),
      paddingRight: moderateScale(4),
      height: moderateScale(28),
      borderRadius: moderateScale(14),
      backgroundColor: themeColors.lightGray,
      marginRight: Platform.OS === 'android' ? moderateScale(8) : 0,
    },
    chipText: {
      fontSize: moderateScale(13),
      fontFamily: 'DMSans-Medium',
      color: themeColors.dark,
    },
    chipCloseBtn: {
      marginLeft: moderateScale(4),
      padding: moderateScale(4),
      borderRadius: moderateScale(10),
    },
    emptyContainer: {
      paddingVertical: moderateScale(24),
      alignItems: 'center',
    },
    emptyText: {
      fontSize: moderateScale(14),
      fontFamily: 'DMSans-Regular',
      color: themeColors.gray,
    },
    menuContainer: {
      flex: 1,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(12),
      borderBottomWidth: 1,
      borderBottomColor: themeColors.lightGray,
      backgroundColor: themeColors.white,
    },
    searchInput: {
      flex: 1,
      marginLeft: moderateScale(8),
      fontSize: moderateScale(14),
      fontFamily: 'DMSans-Medium',
      color: themeColors.dark,
      padding: 0,
    },
    createOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: moderateScale(14),
      paddingHorizontal: moderateScale(16),
      backgroundColor: themeColors.primary + '10',
      borderBottomWidth: 1,
      borderBottomColor: themeColors.lightGray,
    },
    createIconWrapper: {
      width: moderateScale(20),
      height: moderateScale(20),
      borderRadius: moderateScale(6),
      backgroundColor: themeColors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: moderateScale(12),
    },
    createOptionText: {
      fontSize: moderateScale(15),
      fontFamily: 'DMSans-Medium',
      color: themeColors.primary,
    },
    loadingContainer: {
      paddingVertical: moderateScale(12),
      alignItems: 'center',
    },
    loadingText: {
      color: themeColors.gray,
    },
  });
})();

export default SelectDropdown;
