import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePoliceStations, PoliceStation } from '@/hooks/usePoliceStations';
import StationCard from './StationCard';
import { Loader2, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix for default marker icons in webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom user location marker (pink)
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #ec4899, #db2777);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(236, 72, 153, 0.5);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Custom police station marker (shield icon)
const policeIcon = L.divIcon({
  className: 'custom-police-marker',
  html: `
    <div style="
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border: 2px solid white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// Component to recenter map when position changes
const MapRecenter: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  
  return null;
};

const MapComponent: React.FC = () => {
  const { position, loading: geoLoading, error: geoError, refresh: refreshLocation } = useGeolocation();
  const { stations, loading: stationsLoading, fetchStations } = usePoliceStations();
  const [selectedStation, setSelectedStation] = useState<PoliceStation | null>(null);

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

  if (geoLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Obtendo sua localização...</p>
      </div>
    );
  }

  if (geoError || !position) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4 p-4 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="font-semibold text-foreground">Localização não disponível</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          {geoError || 'Não foi possível obter sua localização. Verifique as permissões do seu navegador.'}
        </p>
        <Button onClick={refreshLocation} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={14}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapRecenter lat={position.lat} lng={position.lng} />
        
        {/* User location marker */}
        <Marker position={[position.lat, position.lng]} icon={userIcon}>
          <Popup>Você está aqui</Popup>
        </Marker>
        
        {/* Police station markers */}
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={policeIcon}
            eventHandlers={{
              click: () => setSelectedStation(station),
            }}
          />
        ))}
      </MapContainer>

      {/* Refresh button */}
      <Button
        size="icon"
        variant="secondary"
        className="absolute top-4 right-4 z-[1000] shadow-lg"
        onClick={handleRefresh}
        disabled={stationsLoading}
      >
        <RefreshCw className={`w-4 h-4 ${stationsLoading ? 'animate-spin' : ''}`} />
      </Button>

      {/* Station count badge */}
      {stations.length > 0 && (
        <div className="absolute top-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-border">
          <span className="text-sm font-medium text-foreground">
            {stations.length} delegacia{stations.length !== 1 ? 's' : ''} encontrada{stations.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Selected station card */}
      {selectedStation && (
        <StationCard
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
        />
      )}
    </div>
  );
};

export default MapComponent;
