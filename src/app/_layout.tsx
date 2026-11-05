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
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import colors from '../theme/color';
import { warmTokenCache } from '../utils/Storage';
import { ToastProvider } from '../context/ToastContext';
import SplashScreen from '../screens/Splash/SplashScreen';
import AuthEvents, { AUTH_LOGOUT_EVENT } from '../utils/AuthEvents';
import { logoutAndClear } from '../store/slices/authSlice';
import { markAppMounted } from './(app)/_layout';
import '../services/api';
import * as Haptics from 'expo-haptics';

// Safe-guard expo-haptics so missing native binary linking never crashes the UI
try {
  const origImpact = Haptics.impactAsync;
  const origNotify = Haptics.notificationAsync;
  const origSelect = Haptics.selectionAsync;

  (Haptics as any).impactAsync = async (...args: any[]) => {
    try {
      return await origImpact(...args);
    } catch {
      // Non-blocking fallback
    }
  };
  (Haptics as any).notificationAsync = async (...args: any[]) => {
    try {
      return await origNotify(...args);
    } catch {
      // Non-blocking fallback
    }
  };
  (Haptics as any).selectionAsync = async () => {
    try {
      return await origSelect();
    } catch {
      // Non-blocking fallback
    }
  };
} catch {
  // Ignore
}


// ─── Auth Gate ───────────────────────────────────────────────────────────────
// Watches auth state and redirects accordingly using Expo Router
const AuthGate: React.FC = () => {
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    const unsubscribe = AuthEvents.on(AUTH_LOGOUT_EVENT, () => {
      dispatch(logoutAndClear());
    });
    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inAuthOrSplash = inAuthGroup;

    if (isAuthenticated && inAuthGroup) {
      // Logged in from auth screen → never show splash after pressing login button
      markAppMounted();
      router.replace('/(app)');
    } else if (!isAuthenticated && !inAuthOrSplash) {
      // Not logged in but trying to access app → go to login
      markAppMounted();
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
                  <StatusBar barStyle="dark-content" />
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
