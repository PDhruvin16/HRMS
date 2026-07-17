// @ts-nocheck
import React, { useRef, useEffect } from 'react';
import { TextInput, StyleSheet, Animated, TouchableOpacity, ViewStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';
import colors from '../../theme/color';
import { normalize } from '../../utils/responsive';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
  autoFocus = false,
}) => {
  const themeColors = colors;

  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacityAnim, scaleAnim]);

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.lightGray,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <Search size={normalize(18)} color={themeColors.gray} style={styles.searchIcon} />
      <TextInput
        style={[styles.input, { color: themeColors.dark }]}
        placeholder={placeholder}
        placeholderTextColor={themeColors.gray}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X size={normalize(18)} color={themeColors.gray} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    borderRadius: normalize(12),
    marginHorizontal: normalize(16),
    marginVertical: normalize(8),
  },
  searchIcon: {
    marginRight: normalize(8),
  },
  input: {
    flex: 1,
    fontSize: normalize(15),
    padding: 0,
  },
  clearButton: {
    padding: normalize(4),
  },
});

export default SearchBar;
