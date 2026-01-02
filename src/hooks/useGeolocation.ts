import { useState, useEffect, useCallback, useRef } from 'react';

interface GeolocationState {
  position: { lat: number; lng: number; heading?: number } | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = (watchMode: boolean = false) => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    loading: true,
    error: null,
  });
  const watchIdRef = useRef<number | null>(null);

  const getCurrentPosition = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            position: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              heading: position.coords.heading ?? undefined,
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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setState({
        position: null,
        loading: false,
        error: 'Geolocalização não suportada',
      });
    }
  }, []);

  // Start watching position for real-time tracking
  const startWatching = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState(prev => ({ ...prev, error: 'Geolocalização não suportada' }));
      return;
    }

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          position: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            heading: position.coords.heading ?? undefined,
          },
          loading: false,
          error: null,
        });
      },
      (error) => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Erro ao rastrear localização',
        }));
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 1000 // Allow 1 second cache for smoother updates
      }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (watchMode) {
      // Get initial position then start watching
      getCurrentPosition();
      startWatching();
    } else {
      getCurrentPosition();
    }

    return () => {
      stopWatching();
    };
  }, [watchMode, getCurrentPosition, startWatching, stopWatching]);

  return { 
    ...state, 
    refresh: getCurrentPosition,
    startWatching,
    stopWatching,
  };
};
