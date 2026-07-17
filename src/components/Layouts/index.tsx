// @ts-nocheck
import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader, { CustomHeaderProps } from '../Header';
import Colors from '../../theme/color';

/**
 * App layout wrapper: SafeAreaView + static background from color.ts + optional Header.
 */
interface AppLayoutProps {
  children: ReactNode;
  headerProps?: CustomHeaderProps;
  showHeader?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, headerProps, showHeader = true }) => {
  const shouldShowHeader = showHeader && headerProps;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {shouldShowHeader && headerProps ? <CustomHeader {...headerProps} /> : null}
        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default AppLayout;
