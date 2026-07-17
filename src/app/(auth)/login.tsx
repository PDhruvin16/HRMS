import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import LoginScreen from '../../screens/Auth/Login/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Navigation shim to make CLI screen work seamlessly in Expo Router
  const navigationShim: any = {
    navigate: (screen: string, screenParams?: any) => {
      if (screen === 'ResetPassword') {
        router.push({ pathname: '/(auth)/reset', params: screenParams });
      } else {
        router.push(screen as any);
      }
    },
    replace: (screen: string) => {
      router.replace(screen as any);
    },
    goBack: () => {
      router.back();
    },
  };

  const routeShim: any = {
    params: params || {},
  };

  return <LoginScreen navigation={navigationShim} route={routeShim} />;
}
