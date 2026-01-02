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
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const initializedRef = useRef(false);

  const getCurrentPosition = useCallback(async () => {
    if (!initializedRef.current) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            heading: position.coords.heading ?? undefined,
          };
          
          // Only update if position changed significantly (>10m)
          if (lastPositionRef.current) {
            const latDiff = Math.abs(lastPositionRef.current.lat - newPosition.lat);
            const lngDiff = Math.abs(lastPositionRef.current.lng - newPosition.lng);
            if (latDiff < 0.0001 && lngDiff < 0.0001) {
              // Position hasn't changed enough, just update loading state
              setState(prev => ({ ...prev, loading: false }));
              return;
            }
          }
          
          lastPositionRef.current = { lat: newPosition.lat, lng: newPosition.lng };
          initializedRef.current = true;
          
          setState({
            position: newPosition,
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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
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
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          heading: position.coords.heading ?? undefined,
        };
        
        // Only update if position changed significantly (>10m) to avoid loop
        if (lastPositionRef.current) {
          const latDiff = Math.abs(lastPositionRef.current.lat - newPosition.lat);
          const lngDiff = Math.abs(lastPositionRef.current.lng - newPosition.lng);
          if (latDiff < 0.0001 && lngDiff < 0.0001) {
            // Position hasn't changed enough
            return;
          }
        }
        
        lastPositionRef.current = { lat: newPosition.lat, lng: newPosition.lng };
        initializedRef.current = true;
        
        setState({
          position: newPosition,
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
        maximumAge: 5000 // Allow 5 second cache for stability
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
