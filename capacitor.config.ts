import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexa.memoryaid',
  appName: 'NEXA',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
