// @ts-nocheck
import React from 'react';
import { StyleSheet } from 'react-native';
import { UICoreTextInput, UICoreTextInputProps } from '../UICoreTextInput';
import { Search, X } from 'lucide-react-native';
import colors from '../../../theme/color';
import { normalize } from '../../../utils/responsive';

export interface UICoreSearchProps extends Omit<UICoreTextInputProps, 'onClear'> {
  onClear?: () => void;
}

export const UICoreSearch: React.FC<UICoreSearchProps> = ({ value, onClear, ...props }) => {
  return (
    <UICoreTextInput
      {...props}
      value={value}
      placeholder={props.placeholder || 'Search...'}
      leftIcon={props.leftIcon || <Search size={normalize(20)} color={colors.text.secondary} />}
      rightIcon={
        props.rightIcon ||
        (value ? <X size={normalize(20)} color={colors.text.secondary} /> : undefined)
      }
      onRightIconPress={props.onRightIconPress || onClear}
      inputContainerStyle={[styles.searchContainer, props.inputContainerStyle] as never}
    />
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    borderRadius: normalize(24),
    minHeight: normalize(48),
  },
});
