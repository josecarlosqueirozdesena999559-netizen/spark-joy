import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5bfb496e25b84319abc28cd3e86ee28c',
  appName: 'Por Elas',
  webDir: 'dist',
  server: {
    url: 'https://www.porelas.online',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
      iconColor: "#E91E63",
      androidIcon: "ic_stat_notification"
    },
    Geolocation: {
      // Enable high accuracy GPS
    },
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#E91E63',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  },
  android: {
    // These permissions will be added to AndroidManifest.xml when you run npx cap sync
    // ACCESS_FINE_LOCATION - GPS de alta precisão
    // ACCESS_COARSE_LOCATION - Localização por rede
    // ACCESS_BACKGROUND_LOCATION - Localização em segundo plano para S.O.S
    // CALL_PHONE - Ligar para delegacia com um clique
  }
};

export default config;
