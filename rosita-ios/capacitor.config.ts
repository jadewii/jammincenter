import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jadewii.rosita',
  appName: 'Rosita',
  webDir: 'www',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#000000',
    allowsLinkPreview: false,
    // Enable landscape mode
    supportedOrientations: ['landscape'],
    // Disable overscroll/bounce
    scrollEnabled: false,
    // Audio configuration
    limitsNavigationsToAppBoundDomains: false,
    allowsMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FFB6C1',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#000000'
    }
  },
  server: {
    // For development, uncomment to use live reload
    // url: 'http://192.168.1.100:3000',
    // cleartext: true
  }
};

export default config;
