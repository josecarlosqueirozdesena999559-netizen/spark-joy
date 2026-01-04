import { useState, useEffect, useCallback, useRef } from 'react';
import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

interface GeolocationState {
  position: { lat: number; lng: number; heading?: number } | null;
  loading: boolean;
  error: string | null;
}

const isNativePlatform = Capacitor.isNativePlatform();

export const useGeolocation = (watchMode: boolean = false) => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    loading: true,
    error: null,
  });
  const watchIdRef = useRef<string | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const initializedRef = useRef(false);
  const mountedRef = useRef(true);

  // Check and request permissions for Capacitor
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    if (!isNativePlatform) return true;
    
    try {
      let status: PermissionStatus = await Geolocation.checkPermissions();
      
      if (status.location === 'prompt' || status.location === 'prompt-with-rationale') {
        status = await Geolocation.requestPermissions();
      }
      
      if (status.location !== 'granted') {
        setState({
          position: null,
          loading: false,
          error: 'Permissão de localização negada. Ative nas configurações do app.',
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }, []);

  const getCurrentPosition = useCallback(async () => {
    if (!mountedRef.current) return;
    
    if (!initializedRef.current) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    // Check permissions first on native
    if (isNativePlatform) {
      const hasPermission = await checkPermissions();
      if (!hasPermission) return;
    }
    
    try {
      let coords: { latitude: number; longitude: number; heading: number | null };

      if (isNativePlatform) {
        // Use Capacitor Geolocation
        const position: Position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        });
        coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading,
        };
      } else {
        // Use web API
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000,
          });
        });
        coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading,
        };
      }

      if (!mountedRef.current) return;

      const newPosition = {
        lat: coords.latitude,
        lng: coords.longitude,
        heading: coords.heading ?? undefined,
      };

      // Only update if position changed significantly (>10m)
      if (lastPositionRef.current) {
        const latDiff = Math.abs(lastPositionRef.current.lat - newPosition.lat);
        const lngDiff = Math.abs(lastPositionRef.current.lng - newPosition.lng);
        if (latDiff < 0.0001 && lngDiff < 0.0001) {
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
    } catch (error: any) {
      if (!mountedRef.current) return;
      console.error('Geolocation error:', error);
      setState({
        position: null,
        loading: false,
        error: error.message || 'Erro ao obter localização',
      });
    }
  }, [checkPermissions]);

  // Start watching position
  const startWatching = useCallback(async () => {
    // Check permissions first on native
    if (isNativePlatform) {
      const hasPermission = await checkPermissions();
      if (!hasPermission) return;
    }

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      if (isNativePlatform) {
        await Geolocation.clearWatch({ id: watchIdRef.current });
      } else {
        navigator.geolocation.clearWatch(Number(watchIdRef.current));
      }
      watchIdRef.current = null;
    }

    try {
      if (isNativePlatform) {
        // Use Capacitor watchPosition
        watchIdRef.current = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000,
          },
          (position: Position | null, err?: any) => {
            if (!mountedRef.current) return;

            if (err) {
              console.error('Watch position error:', err);
              setState(prev => ({
                ...prev,
                loading: false,
                error: err.message || 'Erro ao rastrear localização',
              }));
              return;
            }

            if (!position) return;

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
          }
        );
      } else {
        // Use web API
        const id = navigator.geolocation.watchPosition(
          (position) => {
            if (!mountedRef.current) return;

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
            if (!mountedRef.current) return;
            setState(prev => ({
              ...prev,
              loading: false,
              error: error.message || 'Erro ao rastrear localização',
            }));
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000,
          }
        );
        watchIdRef.current = String(id);
      }
    } catch (error: any) {
      console.error('Error starting watch:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao iniciar rastreamento',
      }));
    }
  }, [checkPermissions]);

  const stopWatching = useCallback(async () => {
    if (watchIdRef.current !== null) {
      if (isNativePlatform) {
        await Geolocation.clearWatch({ id: watchIdRef.current });
      } else {
        navigator.geolocation.clearWatch(Number(watchIdRef.current));
      }
      watchIdRef.current = null;
    }
  }, []);

  // Run only once on mount
  useEffect(() => {
    mountedRef.current = true;

    getCurrentPosition();
    if (watchMode) {
      startWatching();
    }

    return () => {
      mountedRef.current = false;
      stopWatching();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run once on mount

  return {
    ...state,
    refresh: getCurrentPosition,
    startWatching,
    stopWatching,
  };
};
