import React, { useEffect, useRef, useState } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import { Flame, Filter, Users, RefreshCw, Loader2, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUserLocation } from '@/hooks/useUserLocation';
import { ScrollArea } from '@/components/ui/scroll-area';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9zZWNhcmxvc3FqZGZuZiIsImEiOiJjbWp2dnZzNjI1bHYyM2VwczV2eXFiZzNzIn0.tkqBfgDN54sp53HwuM6gGw';

// Brazil bounds to restrict map view
const BRAZIL_BOUNDS: [[number, number], [number, number]] = [
  [-73.9872, -33.7683], // Southwest
  [-34.7299, 5.2718],   // Northeast
];

interface UserLocation {
  latitude: number;
  longitude: number;
  state: string | null;
}

interface StateCount {
  state: string;
  count: number;
}

// Main states for quick filter
const MAIN_STATES = ['SP', 'RJ', 'MG', 'BA', 'CE', 'RS'];

type FilterType = 'all' | string;

const HeatMap: React.FC = () => {
  const mapRef = useRef<MapRef>(null);
  const [loading, setLoading] = useState(true);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [totalUsers, setTotalUsers] = useState(0);
  const [showOtherStates, setShowOtherStates] = useState(false);
  const [stateCounts, setStateCounts] = useState<StateCount[]>([]);
  const [viewState, setViewState] = useState({
    longitude: -55.0,
    latitude: -15.0,
    zoom: 3.5,
  });

  // Hook to save current user's location
  useUserLocation();

  // Extract state abbreviation from full state name
  const getStateAbbreviation = (stateName: string | null): string => {
    if (!stateName) return 'Desconhecido';
    
    const stateMap: Record<string, string> = {
      'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
      'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
      'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
      'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
      'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
      'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
      'São Paulo': 'SP', 'Sao Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
    };

    for (const [fullName, abbr] of Object.entries(stateMap)) {
      if (stateName.includes(fullName)) return abbr;
    }
    return stateName.substring(0, 2).toUpperCase();
  };

  // Fetch real user locations from database
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('latitude, longitude, state')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .is('deleted_at', null);

      if (error) {
        console.error('Error fetching locations:', error);
        return;
      }

      setUserLocations(data || []);
      
      // Calculate state counts
      const counts: Record<string, number> = {};
      (data || []).forEach(loc => {
        const abbr = getStateAbbreviation(loc.state);
        counts[abbr] = (counts[abbr] || 0) + 1;
      });

      const sortedCounts = Object.entries(counts)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count);
      
      setStateCounts(sortedCounts);
      
      // Get total user count (all profiles, not just with location)
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
    const abbr = getStateAbbreviation(loc.state);
    return abbr === filter;
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

  // Get states not in main filter
  const otherStates = stateCounts.filter(s => !MAIN_STATES.includes(s.state));

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {/* Filter bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-card/95 backdrop-blur-md rounded-xl p-2 shadow-lg border border-border/50 flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1 flex-wrap">
              <Button
                size="sm"
                variant={filter === 'all' ? 'default' : 'ghost'}
                className="h-7 text-xs"
                onClick={() => setFilter('all')}
              >
                Todos
              </Button>
              {MAIN_STATES.map((state) => {
                const stateData = stateCounts.find(s => s.state === state);
                return (
                  <Button
                    key={state}
                    size="sm"
                    variant={filter === state ? 'default' : 'ghost'}
                    className="h-7 text-xs gap-1"
                    onClick={() => setFilter(state)}
                  >
                    {state}
                    {stateData && <span className="text-[10px] opacity-70">({stateData.count})</span>}
                  </Button>
                );
              })}
              <Button
                size="sm"
                variant={showOtherStates || (!MAIN_STATES.includes(filter) && filter !== 'all') ? 'secondary' : 'ghost'}
                className="h-7 text-xs gap-1"
                onClick={() => setShowOtherStates(!showOtherStates)}
              >
                Outros
                {showOtherStates ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
            </div>
          </div>
          
          <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 whitespace-nowrap">
            <Users className="w-3.5 h-3.5" />
            {totalUsers} usuárias cadastradas
          </Badge>
        </div>

        {/* Other states dropdown */}
        {showOtherStates && otherStates.length > 0 && (
          <div className="bg-card/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-border/50 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Outros estados</span>
            </div>
            <ScrollArea className="max-h-40">
              <div className="flex flex-wrap gap-1">
                {otherStates.map(({ state, count }) => (
                  <Button
                    key={state}
                    size="sm"
                    variant={filter === state ? 'default' : 'outline'}
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      setFilter(state);
                      setShowOtherStates(false);
                    }}
                  >
                    {state}
                    <span className="text-[10px] opacity-70">({count})</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
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
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          maxBounds={BRAZIL_BOUNDS}
          minZoom={3}
        >
          <NavigationControl position="top-right" />
          
          <Source id="heatmap-source" type="geojson" data={geojsonData}>
            <Layer {...heatmapLayer} />
          </Source>
        </Map>
      </div>

      {/* Empty state */}
      {!loading && filteredLocations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-card/95 backdrop-blur-md rounded-xl p-6 shadow-lg border border-border/50 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">Nenhuma usuária neste filtro</p>
            <p className="text-xs text-muted-foreground mt-1">
              Selecione outro estado ou "Todos" para ver os dados
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
