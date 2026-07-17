import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ResetPasswordScreen from '../../screens/Auth/Reset/ResetPasswordScreen';

export default function ResetRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Navigation shim to make CLI screen work seamlessly in Expo Router
  const navigationShim: any = {
    navigate: (screen: string, screenParams?: any) => {
      router.push(screen as any);
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

  return <ResetPasswordScreen navigation={navigationShim} route={routeShim} />;
}
