import React, { useEffect } from 'react';
import { Shield, Navigation, Phone, MapPin, RefreshCw, Loader2, AlertTriangle, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePoliceStations, PoliceStation } from '@/hooks/usePoliceStations';
import { ScrollArea } from '@/components/ui/scroll-area';

// Calculate distance between two coordinates in km
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
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

interface StationWithDistance extends PoliceStation {
  distance: number;
}

interface StationRadarCardProps {
  station: StationWithDistance;
}

const StationRadarCard: React.FC<StationRadarCardProps> = ({ station }) => {
  const handleDirections = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleCall = () => {
    if (station.phone) {
      window.location.href = `tel:${station.phone.replace(/\s/g, '')}`;
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card/95 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground leading-tight">{station.name}</h3>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                {formatDistance(station.distance)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{station.type}</p>
            {station.phone && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {station.phone}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1 gap-2 h-11"
            onClick={handleDirections}
          >
            <Navigation className="w-4 h-4" />
            Como Chegar
          </Button>
          
          {station.phone && (
            <Button
              variant="secondary"
              className="flex-1 gap-2 h-11"
              onClick={handleCall}
            >
              <Phone className="w-4 h-4" />
              Ligar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SecurityRadar: React.FC = () => {
  const {
    position,
    loading: geoLoading,
    error: geoError,
    refresh: refreshLocation,
  } = useGeolocation();
  
  const { stations, loading: stationsLoading, error: stationsError, fetchStations } =
    usePoliceStations();

  // Fetch police stations when position is available
  useEffect(() => {
    if (position) {
      fetchStations(position.lat, position.lng, 20);
    }
  }, [position, fetchStations]);

  const handleRefresh = () => {
    refreshLocation();
    if (position) {
      fetchStations(position.lat, position.lng, 20);
    }
  };

  // Sort stations by distance
  const stationsWithDistance: StationWithDistance[] = position
    ? stations
        .map(station => ({
          ...station,
          distance: calculateDistance(position.lat, position.lng, station.lat, station.lng),
        }))
        .sort((a, b) => a.distance - b.distance)
    : [];

  if (geoLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4 p-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground text-center">Obtendo sua localização...</p>
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
          {geoError ||
            "Não foi possível obter sua localização. Verifique as permissões do seu navegador."}
        </p>
        <Button onClick={refreshLocation} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header with stats */}
      <div className="px-4 py-3 bg-card/50 border-b border-border">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Radar className="w-4 h-4 text-primary" />
            </div>
            {stationsLoading ? (
              <span className="text-sm text-muted-foreground">Buscando delegacias...</span>
            ) : stationsError ? (
              <span className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Erro ao carregar
              </span>
            ) : (
              <span className="text-sm font-medium text-foreground">
                {stations.length} delegacia{stations.length !== 1 ? 's' : ''} em 20km
              </span>
            )}
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

      {/* Station list */}
      <ScrollArea className="flex-1">
        <div className="p-4 pb-24 max-w-lg mx-auto">
          {stationsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando delegacias próximas...</p>
            </div>
          ) : stationsError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">{stationsError}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </Button>
            </div>
          ) : stationsWithDistance.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Nenhuma delegacia encontrada em um raio de 20km.
              </p>
              <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {stationsWithDistance.map(station => (
                <StationRadarCard key={station.id} station={station} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SecurityRadar;
