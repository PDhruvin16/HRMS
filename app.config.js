module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    BASE_URL: process.env.BASE_URL || 'https://hrms.apistage.quantumbot.ai/api/v1',
    SOCKET_URL: process.env.WEBRTC_SIGNALING_SERVER || '',
    VITE_SOCKET_URL: process.env.VITE_SOCKET_URL || process.env.WEBRTC_SIGNALING_SERVER || '',
  },
});

