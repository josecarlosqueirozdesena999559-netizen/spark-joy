import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import { Loader2 } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { HeatMapFilter } from './HeatMapFilters';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9zZWNhcmxvc3FqZGZuZiIsImEiOiJjbWp2dnZzNjI1bHYyM2VwczV2eXFiZzNzIn0.tkqBfgDN54sp53HwuM6gGw';

interface CommunityHeatMapProps {
  filter: HeatMapFilter;
}

export interface CommunityHeatMapRef {
  flyToCity: (lng: number, lat: number, cityName: string) => void;
}

// Generate sample heatmap data points across Brazil
const generateHeatmapData = (filter: HeatMapFilter): GeoJSON.FeatureCollection => {
  const brazilCities = [
    { lng: -46.6333, lat: -23.5505, weight: filter === 'users' ? 1 : 0.6 }, // São Paulo
    { lng: -43.1729, lat: -22.9068, weight: filter === 'users' ? 0.8 : 0.9 }, // Rio de Janeiro
    { lng: -43.9378, lat: -19.9167, weight: filter === 'users' ? 0.6 : 0.4 }, // Belo Horizonte
    { lng: -51.2177, lat: -30.0346, weight: filter === 'users' ? 0.5 : 0.3 }, // Porto Alegre
    { lng: -49.2733, lat: -25.4284, weight: filter === 'users' ? 0.5 : 0.5 }, // Curitiba
    { lng: -47.9292, lat: -15.7801, weight: filter === 'users' ? 0.4 : 0.7 }, // Brasília
    { lng: -38.5014, lat: -3.7172, weight: filter === 'users' ? 0.4 : 0.5 }, // Fortaleza
    { lng: -34.8811, lat: -8.0476, weight: filter === 'users' ? 0.4 : 0.6 }, // Recife
    { lng: -38.5108, lat: -12.9714, weight: filter === 'users' ? 0.5 : 0.8 }, // Salvador
    { lng: -60.0251, lat: -3.1190, weight: filter === 'users' ? 0.2 : 0.3 }, // Manaus
    { lng: -48.5044, lat: -1.4558, weight: filter === 'users' ? 0.2 : 0.4 }, // Belém
    { lng: -49.2539, lat: -16.6869, weight: filter === 'users' ? 0.3 : 0.3 }, // Goiânia
    { lng: -35.7353, lat: -9.6658, weight: filter === 'users' ? 0.2 : 0.5 }, // Maceió
    { lng: -44.3030, lat: -2.5307, weight: filter === 'users' ? 0.2 : 0.4 }, // São Luís
    { lng: -40.3378, lat: -20.3155, weight: filter === 'users' ? 0.3 : 0.3 }, // Vitória
  ];

  return {
    type: 'FeatureCollection',
    features: brazilCities.map((city) => ({
      type: 'Feature',
      properties: { weight: city.weight },
      geometry: {
        type: 'Point',
        coordinates: [city.lng, city.lat],
      },
    })),
  };
};

const CommunityHeatMap = forwardRef<CommunityHeatMapRef, CommunityHeatMapProps>(
  ({ filter }, ref) => {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({
      longitude: -55.0,
      latitude: -15.0,
      zoom: 3.5,
    });
    const [heatmapData, setHeatmapData] = useState<GeoJSON.FeatureCollection>(() =>
      generateHeatmapData(filter)
    );

    const { position, loading: geoLoading } = useGeolocation(false);

    // Update heatmap data when filter changes
    useEffect(() => {
      setHeatmapData(generateHeatmapData(filter));
    }, [filter]);

    // Center on user position when available
    useEffect(() => {
      if (position && mapRef.current) {
        setViewState((prev) => ({
          ...prev,
          longitude: position.lng,
          latitude: position.lat,
          zoom: 10,
        }));
      }
    }, [position]);

    // Expose flyToCity method to parent
    useImperativeHandle(ref, () => ({
      flyToCity: (lng: number, lat: number, cityName: string) => {
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 11,
            duration: 2000,
          });
        }
      },
    }));

    const heatmapColor = filter === 'users' 
      ? [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(236, 72, 153, 0)',
          0.2, 'rgba(236, 72, 153, 0.3)',
          0.4, 'rgba(219, 39, 119, 0.5)',
          0.6, 'rgba(190, 24, 93, 0.7)',
          0.8, 'rgba(157, 23, 77, 0.9)',
          1, 'rgba(131, 24, 67, 1)',
        ]
      : [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(251, 191, 36, 0)',
          0.2, 'rgba(251, 191, 36, 0.3)',
          0.4, 'rgba(245, 158, 11, 0.5)',
          0.6, 'rgba(217, 119, 6, 0.7)',
          0.8, 'rgba(180, 83, 9, 0.9)',
          1, 'rgba(146, 64, 14, 1)',
        ];

    if (geoLoading) {
      return (
        <div className="flex-1 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Carregando mapa...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />

          <Source id="heatmap-data" type="geojson" data={heatmapData}>
            <Layer
              id="heatmap-layer"
              type="heatmap"
              paint={{
                'heatmap-weight': ['get', 'weight'],
                'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
                'heatmap-color': heatmapColor as any,
                'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 30, 9, 60],
                'heatmap-opacity': 0.8,
              }}
            />
          </Source>
        </Map>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border/50">
          <p className="text-xs font-medium text-foreground mb-2">
            {filter === 'users' ? 'Concentração de Usuárias' : 'Volume de Alertas'}
          </p>
          <div className="flex items-center gap-1">
            <div 
              className="h-2 w-20 rounded-sm"
              style={{
                background: filter === 'users'
                  ? 'linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(131, 24, 67, 1))'
                  : 'linear-gradient(to right, rgba(251, 191, 36, 0.3), rgba(146, 64, 14, 1))',
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Baixo</span>
            <span>Alto</span>
          </div>
        </div>
      </div>
    );
  }
);

CommunityHeatMap.displayName = 'CommunityHeatMap';

export default CommunityHeatMap;
