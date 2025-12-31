import { useState, useEffect, useCallback } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';

interface GeolocationState {
  position: { lat: number; lng: number } | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    loading: true,
    error: null,
  });

  const getCurrentPosition = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Try Capacitor Geolocation first (for native apps)
      const permission = await Geolocation.checkPermissions();
      
      if (permission.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          throw new Error('Permissão de localização negada');
        }
      }

      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      setState({
        position: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        loading: false,
        error: null,
      });
    } catch (capacitorError) {
      // Fallback to browser Geolocation API
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setState({
              position: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
              loading: false,
              error: null,
            });
          },
          (error) => {
            setState({
              position: null,
              loading: false,
              error: error.message || 'Erro ao obter localização',
            });
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setState({
          position: null,
          loading: false,
          error: 'Geolocalização não suportada',
        });
      }
    }
  }, []);

  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  return { ...state, refresh: getCurrentPosition };
};
