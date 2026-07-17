// @ts-nocheck
// @ts-nocheck
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Loader from '../Loader';
import { colors } from '../../theme/color';
import { Typography } from '../Typography';

interface Props<T> {
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  data?: T | null;
  children: (data: T) => React.ReactElement | null;
  onRetry?: () => void;
  loadingText?: string;
}

function QueryBoundaryInner<T>({
  isLoading,
  isFetching,
  isError,
  error,
  data,
  children,
  onRetry,
  loadingText = 'Loading...',
}: Props<T>) {
  if (isLoading || isFetching) {
    return <Loader visible text={loadingText} />;
  }

  if (isError) {
    const errorObj = error as Record<string, unknown> | undefined;
    const message =
      (typeof errorObj?.message === 'string' ? errorObj.message : String(error)) ||
      'Something went wrong';
    return (
      <View style={styles.center}>
        <Typography variant="h3" style={styles.errorTitle}>
          Error
        </Typography>
        <Text style={styles.errorMessage}>{message}</Text>
        {onRetry ? (
          <Button title="Retry" onPress={onRetry} color={colors.primaryDark || '#9673e9'} />
        ) : null}
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Typography variant="body1">No data available</Typography>
      </View>
    );
  }

  return children(data as T);
}

const styles = StyleSheet.create({
  center: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    color: colors.errorRed || colors.error,
    marginBottom: 8,
  },
  errorMessage: {
    marginBottom: 12,
    color: colors.convoDark || '#1C1C1E',
  },
});

export default QueryBoundaryInner;
