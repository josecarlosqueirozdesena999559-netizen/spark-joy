import React, { useEffect, useState, useCallback, useRef } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, Source, Layer } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import { Shield, Navigation, Phone, RefreshCw, Loader2, AlertTriangle, MapPin, X, Clock, Route, ChevronUp, ChevronDown, CornerUpRight, CornerUpLeft, ArrowUp, RotateCcw, Flag, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePoliceStations, PoliceStation } from '@/hooks/usePoliceStations';
import StationBottomSheet from './StationBottomSheet';
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

function formatMeters(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
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

// Get icon for maneuver type
function getManeuverIcon(type: string, modifier?: string) {
  if (type === 'arrive') return Flag;
  if (type === 'depart') return Play;
  if (type === 'turn') {
    if (modifier?.includes('left')) return CornerUpLeft;
    if (modifier?.includes('right')) return CornerUpRight;
    return RotateCcw;
  }
  if (type === 'end of road' || type === 'fork' || type === 'merge') {
    if (modifier?.includes('left')) return CornerUpLeft;
    if (modifier?.includes('right')) return CornerUpRight;
  }
  if (type === 'roundabout' || type === 'rotary') return RotateCcw;
  return ArrowUp;
}

// Translate maneuver instructions to Portuguese
function translateInstruction(instruction: string): string {
  return instruction
    .replace(/Turn left/gi, 'Vire à esquerda')
    .replace(/Turn right/gi, 'Vire à direita')
    .replace(/Continue straight/gi, 'Continue em frente')
    .replace(/Continue/gi, 'Continue')
    .replace(/Head/gi, 'Siga')
    .replace(/north/gi, 'norte')
    .replace(/south/gi, 'sul')
    .replace(/east/gi, 'leste')
    .replace(/west/gi, 'oeste')
    .replace(/onto/gi, 'na')
    .replace(/on/gi, 'na')
    .replace(/toward/gi, 'em direção a')
    .replace(/You have arrived/gi, 'Você chegou ao destino')
    .replace(/Your destination is on the/gi, 'Seu destino está à')
    .replace(/left/gi, 'esquerda')
    .replace(/right/gi, 'direita')
    .replace(/slight left/gi, 'ligeiramente à esquerda')
    .replace(/slight right/gi, 'ligeiramente à direita')
    .replace(/sharp left/gi, 'curva fechada à esquerda')
    .replace(/sharp right/gi, 'curva fechada à direita')
    .replace(/Take the/gi, 'Pegue a')
    .replace(/exit/gi, 'saída')
    .replace(/roundabout/gi, 'rotatória')
    .replace(/at the roundabout/gi, 'na rotatória')
    .replace(/Keep/gi, 'Mantenha-se')
    .replace(/Merge/gi, 'Entre');
}

interface StationWithDistance extends PoliceStation {
  distance: number;
}

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
}

interface RouteInfo {
  geometry: GeoJSON.LineString;
  distance: number;
  duration: number;
  station: StationWithDistance;
  steps: RouteStep[];
}

const SecurityRadar: React.FC = () => {
  const mapRef = useRef<MapRef>(null);
  const [selectedStation, setSelectedStation] = useState<StationWithDistance | null>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [followUser, setFollowUser] = useState(true);
  const [viewState, setViewState] = useState({
    longitude: -46.6333,
    latitude: -23.5505,
    zoom: 15,
  });

  // Use watch mode for real-time tracking
  const {
    position,
    loading: geoLoading,
    error: geoError,
    refresh: refreshLocation,
  } = useGeolocation(true);
  
  const { stations, loading: stationsLoading, error: stationsError, fetchStations } =
    usePoliceStations();

  // Auto-center map on user position when following
  useEffect(() => {
    if (position && followUser) {
      setViewState(prev => ({
        ...prev,
        longitude: position.lng,
        latitude: position.lat,
      }));
    }
  }, [position, followUser]);

  // Fetch stations when position is available
  useEffect(() => {
    if (position) {
      fetchStations(position.lat, position.lng, 20);
    }
  }, [position?.lat, position?.lng, fetchStations]);

  // Update current step based on user position during navigation
  useEffect(() => {
    if (!isNavigating || !position || !routeInfo) return;

    // Find the closest step to the current position
    let closestStepIndex = currentStepIndex;
    let minDistance = Infinity;

    routeInfo.steps.forEach((step, index) => {
      if (index >= currentStepIndex) {
        const stepDistance = calculateDistance(
          position.lat,
          position.lng,
          step.maneuver.location[1],
          step.maneuver.location[0]
        );
        if (stepDistance < minDistance) {
          minDistance = stepDistance;
          closestStepIndex = index;
        }
      }
    });

    // Update step if user is within 50 meters of the next maneuver
    if (minDistance < 0.05 && closestStepIndex > currentStepIndex) {
      setCurrentStepIndex(closestStepIndex);
    }
  }, [position, isNavigating, routeInfo, currentStepIndex]);

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
        `https://api.mapbox.com/directions/v5/mapbox/driving/${position.lng},${position.lat};${station.lng},${station.lat}?geometries=geojson&steps=true&language=pt&access_token=${MAPBOX_TOKEN}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const steps: RouteStep[] = route.legs[0].steps.map((step: any) => ({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration,
          maneuver: {
            type: step.maneuver.type,
            modifier: step.maneuver.modifier,
            location: step.maneuver.location,
          },
        }));

        setRouteInfo({
          geometry: route.geometry,
          distance: route.distance / 1000,
          duration: route.duration,
          station,
          steps,
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
            padding: { top: 100, bottom: 280, left: 50, right: 50 },
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
    setBottomSheetOpen(false);
    setSelectedStation(null);
    fetchRoute(station);
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setCurrentStepIndex(0);
    setShowAllSteps(false);
    
    // Zoom to current position with higher zoom for navigation
    if (position) {
      setViewState({
        longitude: position.lng,
        latitude: position.lat,
        zoom: 17,
      });
    }
  };

  const handleClearRoute = () => {
    setRouteInfo(null);
    setIsNavigating(false);
    setCurrentStepIndex(0);
    setShowAllSteps(false);
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

  const currentStep = routeInfo?.steps[currentStepIndex];
  const nextStep = routeInfo?.steps[currentStepIndex + 1];

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {/* Map container */}
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => {
            setViewState(evt.viewState);
          }}
          onDragStart={() => setFollowUser(false)}
          mapStyle="mapbox://styles/mapbox/navigation-day-v1"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl 
            position="top-right" 
            trackUserLocation 
            showUserHeading
            positionOptions={{ enableHighAccuracy: true }}
            onGeolocate={() => setFollowUser(true)}
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
                id="route-line-bg"
                type="line"
                paint={{
                  'line-color': '#ffffff',
                  'line-width': 10,
                  'line-opacity': 0.9,
                }}
                layout={{
                  'line-join': 'round',
                  'line-cap': 'round',
                }}
              />
              <Layer
                id="route-line"
                type="line"
                paint={{
                  'line-color': '#ec4899',
                  'line-width': 6,
                  'line-opacity': 1,
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
              <div className="absolute -inset-4 bg-primary/30 rounded-full animate-ping" />
              <div className="w-8 h-8 bg-primary rounded-full border-3 border-white shadow-lg flex items-center justify-center relative z-10">
                <Navigation 
                  className="w-4 h-4 text-primary-foreground" 
                  style={{ 
                    transform: position.heading ? `rotate(${position.heading}deg)` : undefined 
                  }} 
                />
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
                if (!isNavigating && !routeInfo) {
                  setSelectedStation(station);
                  setBottomSheetOpen(true);
                }
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

        {/* Re-center button - shows when not following user */}
        {!followUser && !routeInfo && (
          <Button
            size="sm"
            className="absolute bottom-24 right-4 gap-2 shadow-lg"
            onClick={() => setFollowUser(true)}
          >
            <Navigation className="w-4 h-4" />
            Centralizar
          </Button>
        )}
      </div>

      {/* Navigation panel - Active navigation mode */}
      {routeInfo && isNavigating && currentStep && (
        <div className="absolute bottom-20 left-4 right-4 bg-card/95 backdrop-blur-md rounded-xl border border-border/50 shadow-lg overflow-hidden">
          {/* Current instruction */}
          <div className="p-4 bg-primary/10 border-b border-border/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shrink-0">
                {React.createElement(getManeuverIcon(currentStep.maneuver.type, currentStep.maneuver.modifier), {
                  className: "w-7 h-7 text-primary-foreground"
                })}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-foreground leading-tight">
                  {translateInstruction(currentStep.instruction)}
                </p>
                <p className="text-sm text-primary font-medium mt-1">
                  {formatMeters(currentStep.distance)}
                </p>
              </div>
            </div>
          </div>

          {/* Next step preview */}
          {nextStep && (
            <div className="px-4 py-3 flex items-center gap-3 border-b border-border/50">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0">
                {React.createElement(getManeuverIcon(nextStep.maneuver.type, nextStep.maneuver.modifier), {
                  className: "w-4 h-4 text-muted-foreground"
                })}
              </div>
              <p className="text-sm text-muted-foreground flex-1 truncate">
                Depois: {translateInstruction(nextStep.instruction)}
              </p>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatMeters(nextStep.distance)}
              </span>
            </div>
          )}

          {/* Expandable steps list */}
          <div className="px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between h-8"
              onClick={() => setShowAllSteps(!showAllSteps)}
            >
              <span className="text-xs text-muted-foreground">
                Passo {currentStepIndex + 1} de {routeInfo.steps.length}
              </span>
              {showAllSteps ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
          </div>

          {showAllSteps && (
            <ScrollArea className="max-h-48 border-t border-border/50">
              <div className="p-2 space-y-1">
                {routeInfo.steps.map((step, index) => {
                  const StepIcon = getManeuverIcon(step.maneuver.type, step.maneuver.modifier);
                  const isActive = index === currentStepIndex;
                  const isPast = index < currentStepIndex;
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        isActive ? 'bg-primary/10' : isPast ? 'opacity-50' : ''
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-primary' : 'bg-muted'
                      }`}>
                        <StepIcon className={`w-3.5 h-3.5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                      </div>
                      <p className={`text-xs flex-1 ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {translateInstruction(step.instruction)}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatMeters(step.distance)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {/* Bottom actions */}
          <div className="p-3 border-t border-border/50 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-primary font-semibold">{formatDistance(routeInfo.distance)}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{formatDuration(routeInfo.duration)}</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5"
              onClick={handleClearRoute}
            >
              <X className="w-4 h-4" />
              Encerrar
            </Button>
          </div>
        </div>
      )}

      {/* Route preview panel - Before starting navigation */}
      {routeInfo && !isNavigating && (
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
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Navigation className="w-4 h-4" />
                <span className="text-sm">{routeInfo.steps.length} passos</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                className="flex-1 gap-2 h-11"
                onClick={handleStartNavigation}
              >
                <Play className="w-4 h-4" />
                Iniciar Navegação
              </Button>
              {routeInfo.station.phone && (
                <Button
                  variant="secondary"
                  className="gap-2 h-11"
                  onClick={() => handleCall(routeInfo.station.phone!)}
                >
                  <Phone className="w-4 h-4" />
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

      {/* Station details bottom sheet */}
      <StationBottomSheet
        station={selectedStation}
        open={bottomSheetOpen}
        onOpenChange={(open) => {
          setBottomSheetOpen(open);
          if (!open) setSelectedStation(null);
        }}
        onShowRoute={handleShowRoute}
        loadingRoute={loadingRoute}
      />
    </div>
  );
};

export default SecurityRadar;
