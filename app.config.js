const path = require('path');

module.exports = {
  expo: {
    name: 'HRMS App',
    slug: 'hrms-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'hrmsapp',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.yourcompany.hrmsapp',
    },
    android: {
      package: 'com.yourcompany.hrmsapp',
      adaptiveIcon: {
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#ffffff',
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
        },
      ],
      [
        'expo-font',
        {
          fonts: [],
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    // ─── Expose .env values to the app via Constants.expoConfig.extra ─────────
    extra: {
      BASE_URL: process.env.BASE_URL || 'https://hrms.apistage.quantumbot.ai/api/v1',
      SOCKET_URL: process.env.WEBRTC_SIGNALING_SERVER || '',
    },
  },
};
