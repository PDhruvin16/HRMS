import React, { useEffect } from 'react';
import { StyleSheet, Platform, ActivityIndicator, View, StatusBar } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PersistGate } from 'redux-persist/integration/react';
// import { StatusBar } from 'expo-status-bar';
import { store, persistor } from '../store';
import { queryClient } from '../hooks/useQueries';
import { useAppSelector } from '../hooks/useRedux';
import colors from '../theme/color';
import { warmTokenCache } from '../utils/Storage';
import { ToastProvider } from '../context/ToastContext';
import SplashScreen from '../screens/Splash/SplashScreen';
import '../services/api';

// ─── Auth Gate ───────────────────────────────────────────────────────────────
// Watches auth state and redirects accordingly using Expo Router
const AuthGate: React.FC = () => {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (isAuthenticated && inAuthGroup) {
      // Logged in but on auth screen → go to app
      router.replace('/(app)');
    } else if (!isAuthenticated && !inAuthGroup) {
      // Not logged in but trying to access app → go to login
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, segments]);

  return <Slot />;
};

// ─── Root Layout ─────────────────────────────────────────────────────────────
const RootLayout: React.FC = () => {
  // Warm AsyncStorage token cache on startup so axios interceptors work
  useEffect(() => {
    warmTokenCache();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView
          style={Platform.OS === 'android' ? styles.androidRoot : styles.flex1}
          edges={Platform.OS === 'android' ? ['left', 'right', 'bottom'] : []}
        >
          <ReduxProvider store={store}>
            <PersistGate
              loading={<SplashScreen />}
              persistor={persistor}
            >
              <QueryClientProvider client={queryClient}>
                <ToastProvider>
                  <StatusBar  translucent barStyle="dark-content" backgroundColor="transparent" />

                  {/* <StatusBar style="light" translucent={true}  /> */}
                  <AuthGate />
                </ToastProvider>
              </QueryClientProvider>
            </PersistGate>
          </ReduxProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root:        { flex: 1 },
  flex1:       { flex: 1 },
  androidRoot: { flex: 1, backgroundColor: colors.background },
  loaderWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});

export default RootLayout;
