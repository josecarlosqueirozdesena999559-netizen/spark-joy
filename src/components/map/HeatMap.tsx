import React, { useEffect, useRef, useState } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import { Flame, Filter, Users, MapPin, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9zZWNhcmxvc3FqZGZuZiIsImEiOiJjbWp2dnZzNjI1bHYyM2VwczV2eXFiZzNzIn0.tkqBfgDN54sp53HwuM6gGw';

// Brazilian states with sample coordinates for demonstration
const BRAZIL_STATES = [
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333, weight: 0.9 },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, weight: 0.85 },
  { name: 'Minas Gerais', lat: -19.9167, lng: -43.9345, weight: 0.7 },
  { name: 'Bahia', lat: -12.9714, lng: -38.5014, weight: 0.65 },
  { name: 'Paraná', lat: -25.4284, lng: -49.2733, weight: 0.6 },
  { name: 'Rio Grande do Sul', lat: -30.0346, lng: -51.2177, weight: 0.55 },
  { name: 'Pernambuco', lat: -8.0476, lng: -34.877, weight: 0.5 },
  { name: 'Ceará', lat: -3.7172, lng: -38.5433, weight: 0.45 },
  { name: 'Pará', lat: -1.4558, lng: -48.4902, weight: 0.4 },
  { name: 'Goiás', lat: -16.6869, lng: -49.2648, weight: 0.35 },
  { name: 'Maranhão', lat: -2.5307, lng: -44.3068, weight: 0.3 },
  { name: 'Santa Catarina', lat: -27.5954, lng: -48.548, weight: 0.45 },
  { name: 'Amazonas', lat: -3.119, lng: -60.0217, weight: 0.25 },
  { name: 'Espírito Santo', lat: -20.3155, lng: -40.3128, weight: 0.35 },
  { name: 'Mato Grosso', lat: -15.601, lng: -56.0974, weight: 0.2 },
  { name: 'Distrito Federal', lat: -15.7942, lng: -47.8822, weight: 0.5 },
];

interface HeatMapPoint {
  lat: number;
  lng: number;
  weight: number;
}

type FilterType = 'all' | 'high' | 'medium' | 'low';

const HeatMap: React.FC = () => {
  const mapRef = useRef<MapRef>(null);
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<HeatMapPoint[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [totalUsers, setTotalUsers] = useState(0);
  const [viewState, setViewState] = useState({
    longitude: -55.0,
    latitude: -15.0,
    zoom: 3.5,
  });

  // Fetch user data and generate heatmap points
  const fetchData = async () => {
    setLoading(true);
    try {
      // Get count of users
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      setTotalUsers(count || 0);

      // Generate heatmap data based on states (simulating user distribution)
      // In a real app, you would fetch actual user locations
      const points: HeatMapPoint[] = [];
      
      BRAZIL_STATES.forEach(state => {
        // Create multiple points around each state center for heat effect
        const numPoints = Math.floor(state.weight * 20) + 5;
        for (let i = 0; i < numPoints; i++) {
          const offsetLat = (Math.random() - 0.5) * 2;
          const offsetLng = (Math.random() - 0.5) * 2;
          points.push({
            lat: state.lat + offsetLat,
            lng: state.lng + offsetLng,
            weight: state.weight * (0.7 + Math.random() * 0.3),
          });
        }
      });
      
      setHeatmapData(points);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter heatmap data based on intensity
  const filteredData = heatmapData.filter(point => {
    if (filter === 'all') return true;
    if (filter === 'high') return point.weight >= 0.7;
    if (filter === 'medium') return point.weight >= 0.4 && point.weight < 0.7;
    if (filter === 'low') return point.weight < 0.4;
    return true;
  });

  // Create GeoJSON for heatmap
  const geojsonData: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: filteredData.map(point => ({
      type: 'Feature',
      properties: {
        weight: point.weight,
      },
      geometry: {
        type: 'Point',
        coordinates: [point.lng, point.lat],
      },
    })),
  };

  const heatmapLayer: mapboxgl.HeatmapLayerSpecification = {
    id: 'heatmap-layer',
    type: 'heatmap',
    source: 'heatmap-source',
    paint: {
      'heatmap-weight': ['get', 'weight'],
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
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 20, 9, 40],
      'heatmap-opacity': 0.8,
    },
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {/* Filter bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2 flex-wrap">
        <div className="bg-card/95 backdrop-blur-md rounded-xl p-2 shadow-lg border border-border/50 flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {(['all', 'high', 'medium', 'low'] as FilterType[]).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? 'default' : 'ghost'}
                className="h-7 text-xs"
                onClick={() => setFilter(f)}
              >
                {f === 'all' && 'Todos'}
                {f === 'high' && 'Alta'}
                {f === 'medium' && 'Média'}
                {f === 'low' && 'Baixa'}
              </Button>
            ))}
          </div>
        </div>
        
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
          <Users className="w-3.5 h-3.5" />
          {totalUsers} usuárias
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
          maxBounds={[[-75, -35], [-30, 6]]} // Restrict to Brazil region
        >
          <NavigationControl position="top-right" />
          
          <Source id="heatmap-source" type="geojson" data={geojsonData}>
            <Layer {...heatmapLayer} />
          </Source>
        </Map>
      </div>

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