import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGeolocation } from './useGeolocation';

export const useUserLocation = () => {
  const { user } = useAuth();
  const { position } = useGeolocation(false);
  const lastSavedRef = useRef<{ lat: number; lng: number } | null>(null);

  const saveLocation = useCallback(async (lat: number, lng: number) => {
    if (!user) return;

    // Avoid saving if position hasn't changed significantly
    if (lastSavedRef.current) {
      const latDiff = Math.abs(lastSavedRef.current.lat - lat);
      const lngDiff = Math.abs(lastSavedRef.current.lng - lng);
      if (latDiff < 0.01 && lngDiff < 0.01) return;
    }

    try {
      // Get city and state using reverse geocoding (basic approach)
      let city = null;
      let state = null;
      
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place,region&country=br&access_token=pk.eyJ1Ijoiam9zZWNhcmxvc3FqZGZuZiIsImEiOiJjbWp2dnZzNjI1bHYyM2VwczV2eXFiZzNzIn0.tkqBfgDN54sp53HwuM6gGw`
        );
        const data = await response.json();
        
        if (data.features) {
          const placeFeature = data.features.find((f: any) => f.place_type.includes('place'));
          const regionFeature = data.features.find((f: any) => f.place_type.includes('region'));
          
          if (placeFeature) city = placeFeature.text;
          if (regionFeature) state = regionFeature.text;
        }
      } catch (error) {
        console.error('Error getting location name:', error);
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          latitude: lat,
          longitude: lng,
          city,
          state,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving location:', error);
      } else {
        lastSavedRef.current = { lat, lng };
      }
    } catch (error) {
      console.error('Error saving location:', error);
    }
  }, [user]);

  // Save location when position changes
  useEffect(() => {
    if (position && user) {
      saveLocation(position.lat, position.lng);
    }
  }, [position, user, saveLocation]);

  return { saveLocation };
};
