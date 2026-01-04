import React, { useEffect, useRef, useState } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import { Flame, Filter, Users, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUserLocation } from '@/hooks/useUserLocation';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9zZWNhcmxvc3FqZGZuZiIsImEiOiJjbWp2dnZzNjI1bHYyM2VwczV2eXFiZzNzIn0.tkqBfgDN54sp53HwuM6gGw';

interface UserLocation {
  latitude: number;
  longitude: number;
  state: string | null;
}

type FilterType = 'all' | 'SP' | 'RJ' | 'MG' | 'other';

const HeatMap: React.FC = () => {
  const mapRef = useRef<MapRef>(null);
  const [loading, setLoading] = useState(true);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [totalUsers, setTotalUsers] = useState(0);
  const [viewState, setViewState] = useState({
    longitude: -55.0,
    latitude: -15.0,
    zoom: 3.5,
  });

  // Hook to save current user's location
  useUserLocation();

  // Fetch real user locations from database
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('profiles')
        .select('latitude, longitude, state', { count: 'exact' })
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .is('deleted_at', null);

      if (error) {
        console.error('Error fetching locations:', error);
        return;
      }

      setUserLocations(data || []);
      
      // Get total user count (including those without location)
      const { count: totalCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);
      
      setTotalUsers(totalCount || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    fetchData();

    // Subscribe to profile changes for real-time updates
    const channel = supabase
      .channel('profiles-location-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          // Refetch data when any profile changes
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter locations based on state
  const filteredLocations = userLocations.filter(loc => {
    if (filter === 'all') return true;
    if (filter === 'SP') return loc.state?.includes('São Paulo') || loc.state?.includes('Sao Paulo');
    if (filter === 'RJ') return loc.state?.includes('Rio de Janeiro');
    if (filter === 'MG') return loc.state?.includes('Minas Gerais');
    if (filter === 'other') {
      return !loc.state?.includes('São Paulo') && 
             !loc.state?.includes('Sao Paulo') && 
             !loc.state?.includes('Rio de Janeiro') && 
             !loc.state?.includes('Minas Gerais');
    }
    return true;
  });

  // Create GeoJSON for heatmap
  const geojsonData: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: filteredLocations.map(loc => ({
      type: 'Feature',
      properties: {
        weight: 1,
      },
      geometry: {
        type: 'Point',
        coordinates: [loc.longitude, loc.latitude],
      },
    })),
  };

  const heatmapLayer: mapboxgl.HeatmapLayerSpecification = {
    id: 'heatmap-layer',
    type: 'heatmap',
    source: 'heatmap-source',
    paint: {
      'heatmap-weight': 1,
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(236, 72, 153, 0)',
        0.2, 'rgba(244, 114, 182, 0.4)',
        0.4, 'rgba(236, 72, 153, 0.6)',
        0.6, 'rgba(219, 39, 119, 0.8)',
        0.8, 'rgba(190, 24, 93, 0.9)',
        1, 'rgba(157, 23, 77, 1)',
      ],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 30, 9, 50],
      'heatmap-opacity': 0.8,
    },
  };

  const usersWithLocation = userLocations.length;

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {/* Filter bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2 flex-wrap">
        <div className="bg-card/95 backdrop-blur-md rounded-xl p-2 shadow-lg border border-border/50 flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {(['all', 'SP', 'RJ', 'MG', 'other'] as FilterType[]).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? 'default' : 'ghost'}
                className="h-7 text-xs"
                onClick={() => setFilter(f)}
              >
                {f === 'all' && 'Todos'}
                {f === 'SP' && 'SP'}
                {f === 'RJ' && 'RJ'}
                {f === 'MG' && 'MG'}
                {f === 'other' && 'Outros'}
              </Button>
            ))}
          </div>
        </div>
        
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
          <Users className="w-3.5 h-3.5" />
          {usersWithLocation}/{totalUsers} usuárias
        </Badge>
      </div>

      {/* Legend */}
      <div className="absolute bottom-24 left-4 z-10 bg-card/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">Densidade</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-24 h-3 rounded-full bg-gradient-to-r from-pink-200 via-pink-500 to-pink-900" />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Baixa</span>
          <span>Alta</span>
        </div>
      </div>

      {/* Refresh button */}
      <Button
        size="icon"
        variant="secondary"
        className="absolute bottom-24 right-4 z-10 shadow-lg"
        onClick={fetchData}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
      </Button>

      {/* Map */}
      <div className="flex-1">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          maxBounds={[[-75, -35], [-30, 6]]}
        >
          <NavigationControl position="top-right" />
          
          <Source id="heatmap-source" type="geojson" data={geojsonData}>
            <Layer {...heatmapLayer} />
          </Source>
        </Map>
      </div>

      {/* Empty state */}
      {!loading && usersWithLocation === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-card/95 backdrop-blur-md rounded-xl p-6 shadow-lg border border-border/50 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">Nenhuma usuária com localização</p>
            <p className="text-xs text-muted-foreground mt-1">
              As usuárias aparecerão aqui quando compartilharem sua localização
            </p>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-card rounded-xl p-4 shadow-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Carregando dados...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatMap;