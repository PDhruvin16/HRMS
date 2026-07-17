// @ts-nocheck
import React, { useMemo, useRef, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSearch } from '../../context/SearchContext';
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import {
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  MoreVertical,
  LucideIcon,
  RefreshCcw,
} from 'lucide-react-native';
import colors from '../../theme/color';
import { normalize } from '../../utils/responsive';
import ActionMenu from '../ActionMenu';

export interface ActionBarProps {
  searchQuery?: string;
  setSearchQuery?: (text: string) => void;
  placeholder?: string;
  onFilter?: () => void;
  onRefresh?: () => void;
  onCreate?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  showCreate?: boolean;
  actionIcon?: LucideIcon;
  menuItems?: Array<{
    id: string;
    label: string;
    icon: LucideIcon;
    onPress: () => void;
    color?: string;
    backgroundColor?: string;
  }>;
}

const ActionBar: React.FC<ActionBarProps> = React.memo(
  ({
    searchQuery,
    setSearchQuery,
    placeholder = 'Search...',
    onFilter,
    onRefresh,
    onCreate,
    onImport,
    onExport,
    showCreate = true,
    actionIcon,
    menuItems,
  }) => {
    const { searchQuery: contextQuery, setSearchQuery: contextSetQuery } = useSearch();
    const finalSearchQuery = searchQuery ?? contextQuery;
    const finalSetSearchQuery = setSearchQuery ?? contextSetQuery;

    const themeColors = colors;
    const inputRef = useRef<TextInput>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const finalMenuItems = useMemo(() => {
      const items = [...(menuItems || [])];
      if (onImport) {
        items.push({
          id: 'import',
          label: 'Import',
          icon: Upload,
          onPress: onImport,
          color: themeColors.info,
        });
      }
      if (onExport) {
        items.push({
          id: 'export',
          label: 'Export',
          icon: Download,
          onPress: onExport,
          color: themeColors.iconOrange,
        });
      }
      return items;
    }, [menuItems, onImport, onExport, themeColors]);

    const hasMenu = finalMenuItems.length > 0;
    const ActionIcon = actionIcon || (hasMenu && !onCreate ? MoreVertical : Plus);

    const handleCreatePress = (event: GestureResponderEvent) => {
      if (hasMenu) {
        const { pageX, pageY } = event.nativeEvent;
        // Position the menu reasonably relative to the button
        setMenuPosition({
          x: Dimensions.get('window').width - pageX,
          y: pageY + normalize(10),
        });
        setMenuVisible(true);
      } else if (onCreate) {
        onCreate();
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.flex1}>
          <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
            <View
              style={[
                styles.searchContainer,
                styles.searchContainerShadow,
                {
                  backgroundColor: themeColors.white,
                  borderColor: themeColors.border,
                  shadowColor: themeColors.shadow,
                },
              ]}
            >
              <Search size={normalize(16)} color={themeColors.gray} />
              <TextInput
                ref={inputRef}
                style={[styles.searchInput, { color: themeColors.dark }]}
                placeholder={placeholder}
                placeholderTextColor={themeColors.gray}
                value={finalSearchQuery}
                onChangeText={finalSetSearchQuery}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>

        {onFilter && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <TouchableOpacity
              onPress={onFilter}
              activeOpacity={0.7}
              style={[
                styles.iconButton,
                {
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.white,
                },
              ]}
            >
              <Filter size={normalize(20)} color={themeColors.dark} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {onRefresh && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <TouchableOpacity
              onPress={onRefresh}
              activeOpacity={0.7}
              style={[
                styles.iconButton,
                {
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.white,
                },
              ]}
            >
              <RefreshCcw size={normalize(20)} color={themeColors.dark} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {showCreate && (onCreate || hasMenu) && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <TouchableOpacity
              style={[
                styles.squareButtonDark,
                styles.createButtonShadow,
                {
                  backgroundColor: themeColors.primary,
                  shadowColor: themeColors.primary,
                },
              ]}
              onPress={handleCreatePress}
              activeOpacity={0.8}
            >
              <ActionIcon size={normalize(18)} color={colors.white} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {hasMenu && (
          <ActionMenu
            visible={menuVisible}
            onClose={() => setMenuVisible(false)}
            position={menuPosition}
            items={finalMenuItems}
          />
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    gap: normalize(12),
  },
  flex1: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: normalize(24),
    paddingHorizontal: normalize(16),
    height: normalize(48),
    gap: normalize(10),
    borderWidth: 1.5, // Crisp border instead of jittery shadow
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(15),
    fontFamily: 'DMSans-Medium',
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontWeight: '500',
    textAlignVertical: 'center',
  },
  iconButton: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  squareButton: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5, // Matching search container
  },
  squareButtonDark: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainerShadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  createButtonShadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 1,
  },
});

export default ActionBar;
