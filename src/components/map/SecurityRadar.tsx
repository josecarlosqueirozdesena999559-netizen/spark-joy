import React, { useEffect, useState, useCallback, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, Source, Layer } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import { Shield, Navigation, Phone, RefreshCw, Loader2, AlertTriangle, MapPin, X, Clock, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePoliceStations, PoliceStation } from '@/hooks/usePoliceStations';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9zZWNhcmxvc3FqZGZuZiIsImEiOiJjbWp2dnZzNjI1bHYyM2VwczV2eXFiZzNzIn0.tkqBfgDN54sp53HwuM6gGw';

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
}

interface StationWithDistance extends PoliceStation {
  distance: number;
}

interface RouteInfo {
  geometry: GeoJSON.LineString;
  distance: number;
  duration: number;
  station: StationWithDistance;
}

const SecurityRadar: React.FC = () => {
  const mapRef = useRef<MapRef>(null);
  const [selectedStation, setSelectedStation] = useState<StationWithDistance | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: -46.6333,
    latitude: -23.5505,
    zoom: 14,
  });

  const {
    position,
    loading: geoLoading,
    error: geoError,
    refresh: refreshLocation,
  } = useGeolocation();
  
  const { stations, loading: stationsLoading, error: stationsError, fetchStations } =
    usePoliceStations();

  useEffect(() => {
    if (position) {
      setViewState(prev => ({
        ...prev,
        longitude: position.lng,
        latitude: position.lat,
      }));
      fetchStations(position.lat, position.lng, 20);
    }
  }, [position, fetchStations]);

  const handleRefresh = useCallback(() => {
    refreshLocation();
    if (position) {
      fetchStations(position.lat, position.lng, 20);
    }
  }, [refreshLocation, position, fetchStations]);

  const fetchRoute = useCallback(async (station: StationWithDistance) => {
    if (!position) return;

    setLoadingRoute(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${position.lng},${position.lat};${station.lng},${station.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteInfo({
          geometry: route.geometry,
          distance: route.distance / 1000, // Convert to km
          duration: route.duration,
          station,
        });

        // Fit map to show the route
        if (mapRef.current) {
          const coordinates = route.geometry.coordinates;
          const bounds = coordinates.reduce(
            (acc: [[number, number], [number, number]], coord: [number, number]) => {
              return [
                [Math.min(acc[0][0], coord[0]), Math.min(acc[0][1], coord[1])],
                [Math.max(acc[1][0], coord[0]), Math.max(acc[1][1], coord[1])],
              ];
            },
            [[Infinity, Infinity], [-Infinity, -Infinity]]
          );

          mapRef.current.fitBounds(bounds, {
            padding: { top: 100, bottom: 200, left: 50, right: 50 },
            duration: 1000,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    } finally {
      setLoadingRoute(false);
    }
  }, [position]);

  const handleShowRoute = (station: StationWithDistance) => {
    setSelectedStation(null);
    fetchRoute(station);
  };

  const handleClearRoute = () => {
    setRouteInfo(null);
    if (position) {
      setViewState(prev => ({
        ...prev,
        longitude: position.lng,
        latitude: position.lat,
        zoom: 14,
      }));
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  const handleOpenGoogleMaps = (station: StationWithDistance) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  const stationsWithDistance: StationWithDistance[] = position
    ? stations.map(station => ({
        ...station,
        distance: calculateDistance(position.lat, position.lng, station.lat, station.lng),
      }))
    : [];

  if (geoLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4 p-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground text-center">Obtendo sua localização precisa...</p>
      </div>
    );
  }

  if (geoError || !position) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4 p-6 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="font-semibold text-foreground">Localização não disponível</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          {geoError || "Não foi possível obter sua localização. Verifique as permissões do seu navegador."}
        </p>
        <Button onClick={refreshLocation} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {/* Map container */}
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl 
            position="top-right" 
            trackUserLocation 
            showUserHeading
            positionOptions={{ enableHighAccuracy: true }}
          />

          {/* Route layer */}
          {routeInfo && (
            <Source
              id="route"
              type="geojson"
              data={{
                type: 'Feature',
                properties: {},
                geometry: routeInfo.geometry,
              }}
            >
              <Layer
                id="route-line"
                type="line"
                paint={{
                  'line-color': '#ec4899',
                  'line-width': 5,
                  'line-opacity': 0.9,
                }}
                layout={{
                  'line-join': 'round',
                  'line-cap': 'round',
                }}
              />
            </Source>
          )}

          {/* User location marker */}
          <Marker longitude={position.lng} latitude={position.lat}>
            <div className="relative">
              <div className="absolute -inset-3 bg-primary/20 rounded-full animate-ping" />
              <div className="w-6 h-6 bg-primary rounded-full border-3 border-background shadow-lg flex items-center justify-center relative z-10">
                <div className="w-2 h-2 bg-background rounded-full" />
              </div>
            </div>
          </Marker>

          {/* Police station markers */}
          {stationsWithDistance.map(station => (
            <Marker
              key={station.id}
              longitude={station.lng}
              latitude={station.lat}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedStation(station);
              }}
            >
              <div className="cursor-pointer transform hover:scale-110 transition-transform">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-background ${
                  routeInfo?.station.id === station.id ? 'bg-green-500' : 'bg-primary'
                }`}>
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            </Marker>
          ))}

          {/* Popup for selected station */}
          {selectedStation && !routeInfo && (
            <Popup
              longitude={selectedStation.lng}
              latitude={selectedStation.lat}
              anchor="bottom"
              onClose={() => setSelectedStation(null)}
              closeButton={true}
              closeOnClick={false}
              className="station-popup"
              offset={25}
            >
              <div className="p-2 min-w-[220px]">
                <h3 className="font-semibold text-foreground text-sm">{selectedStation.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedStation.type}</p>
                <p className="text-xs text-primary font-medium mt-1">
                  {formatDistance(selectedStation.distance)} de distância
                </p>
                {selectedStation.phone && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedStation.phone}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="flex-1 gap-1 h-9 text-xs"
                    onClick={() => handleShowRoute(selectedStation)}
                    disabled={loadingRoute}
                  >
                    {loadingRoute ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Route className="w-3 h-3" />
                    )}
                    Ver Rota
                  </Button>
                  {selectedStation.phone && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1 h-9 text-xs"
                      onClick={() => handleCall(selectedStation.phone!)}
                    >
                      <Phone className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </Popup>
          )}
        </Map>

        {/* Loading overlay */}
        {stationsLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <div className="bg-card p-4 rounded-lg shadow-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-foreground">Buscando delegacias...</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {stationsError && (
          <div className="absolute bottom-4 left-4 right-4 bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <span className="text-xs text-destructive flex-1">{stationsError}</span>
            <Button size="sm" variant="ghost" onClick={handleRefresh} className="h-7 px-2">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Route info panel */}
      {routeInfo && (
        <div className="absolute bottom-20 left-4 right-4 bg-card/95 backdrop-blur-md rounded-xl border border-border/50 shadow-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm">{routeInfo.station.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{routeInfo.station.type}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0"
                onClick={handleClearRoute}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-primary">
                <Route className="w-4 h-4" />
                <span className="text-sm font-medium">{formatDistance(routeInfo.distance)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{formatDuration(routeInfo.duration)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                className="flex-1 gap-2 h-10"
                onClick={() => handleOpenGoogleMaps(routeInfo.station)}
              >
                <Navigation className="w-4 h-4" />
                Abrir no Google Maps
              </Button>
              {routeInfo.station.phone && (
                <Button
                  variant="secondary"
                  className="gap-2 h-10"
                  onClick={() => handleCall(routeInfo.station.phone!)}
                >
                  <Phone className="w-4 h-4" />
                  Ligar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom info bar - only show when no route is active */}
      {!routeInfo && (
        <div className="absolute bottom-20 left-4 right-4 bg-card/95 backdrop-blur-md rounded-xl p-3 border border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {stationsWithDistance.length} delegacia{stationsWithDistance.length !== 1 ? 's' : ''} encontrada{stationsWithDistance.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground">Toque em uma para ver a rota</p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={stationsLoading}
            >
              <RefreshCw className={`w-4 h-4 ${stationsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityRadar;
