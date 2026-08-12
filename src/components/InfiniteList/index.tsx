// @ts-nocheck
// @ts-nocheck
import React from 'react';
import {
  FlatList,
  View,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,               
  ListRenderItem,
  FlatListProps,
  Platform,
} from 'react-native';
import { Typography } from '../Typography';
import Colors from '../../theme/color';
import { normalize } from '../../utils/responsive';

interface InfiniteListProps<T> extends Partial<FlatListProps<T>> {
  data: T[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  renderItem: ListRenderItem<T>;
  renderSkeleton: () => React.ReactElement;
  // themeColors prop removed
  emptyMessage?: string;
  skeletonCount?: number;
  containerStyle?: unknown;
}

/**
 * A standardized Infinite Scrolling List component.
 * Handles loading states, pagination, pull-to-refresh, and empty states.
 */
export function InfiniteList<T>({
  data,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onRefresh,
  isRefreshing,
  renderItem,
  renderSkeleton,
  // themeColors removed
  emptyMessage = 'No data found',
  skeletonCount = 8,
  containerStyle,
  contentContainerStyle,
  ListHeaderComponent,
  ...rest
}: InfiniteListProps<T>) {
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      onLoadMore();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return <View style={styles.footerSpacer} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Typography style={styles.loadingText}>Loading more...</Typography>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Typography variant="body1" color={Colors.black} align="center">
          {emptyMessage}
        </Typography>
      </View>
    );
  };

  // Use flatlist data itself for skeletons to leverage native grid architecture flawlessly
  const displayData = isLoading
    ? Array.from({ length: skeletonCount }).map((_, i) => ({
        id: `skeleton-${i}`,
        _isSkeleton: true,
      }))
    : data;

  // Auto fill dynamic grid deficiencies to prevent single items from expanding to 100%
  const numCols = rest.numColumns || 1;
  let finalData = displayData as (T | { id: string; _isSkeleton?: boolean; _isSpacer?: boolean })[];
  if (!isLoading && numCols > 1 && displayData.length % numCols !== 0) {
    const missingSlots = numCols - (displayData.length % numCols);
    const dummies = Array.from({ length: missingSlots }).map((_, i) => ({
      id: `grid-spacer-${i}`,
      _isSpacer: true,
    }));
    finalData = [...displayData, ...dummies];
  }

  const finalRenderItem = (info: {
    item: T | { id: string; _isSkeleton?: boolean; _isSpacer?: boolean };
    index: number;
  }) => {
    if (isLoading) return renderSkeleton();
    if ((info.item as { _isSpacer?: boolean })._isSpacer) {
      // Return an invisible balanced anchor ensuring standard item keeps 50% width
      return <View style={styles.spacer} />;
    }
    return renderItem(info as ListRenderItemInfo<T>);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        data={finalData}
        renderItem={finalRenderItem}
        keyExtractor={(item: T | { id: string }, index: number) =>
          (item as { id: string }).id?.toString() || index.toString()
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={rest.onEndReachedThreshold ?? 0.8}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={10}
        windowSize={10}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: normalize(100), // Buffer for FAB/Tab bar
  },
  listContent: {
    width: '100%',
  },
  footerLoader: {
    paddingVertical: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: normalize(8),
  },
  loadingText: {
    fontSize: normalize(12),
    color: Colors.text.muted,
    fontWeight: '600',
  },
  footerSpacer: {
    height: normalize(40),
  },
  emptyContainer: {
    marginTop: normalize(100),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(40),
  },
  skeletonGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  spacer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
