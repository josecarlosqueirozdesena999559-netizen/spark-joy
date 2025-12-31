import { useState, useEffect, useCallback } from 'react';

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
    
    // Use browser Geolocation API (works in web and most mobile browsers)
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
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setState({
        position: null,
        loading: false,
        error: 'Geolocalização não suportada',
      });
    }
  }, []);

  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  return { ...state, refresh: getCurrentPosition };
};
