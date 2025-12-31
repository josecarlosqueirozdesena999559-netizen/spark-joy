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
    Geolocation: {
      // Enable high accuracy GPS
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
