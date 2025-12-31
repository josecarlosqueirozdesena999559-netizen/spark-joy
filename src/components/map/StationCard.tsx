import React from 'react';
import { Navigation, Phone, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { PoliceStation } from '@/hooks/usePoliceStations';

interface StationCardProps {
  station: PoliceStation;
  onClose: () => void;
}

const StationCard: React.FC<StationCardProps> = ({ station, onClose }) => {
  const handleDirections = () => {
    // Try native geo scheme first, fallback to Google Maps URL
    const geoUrl = `geo:${station.lat},${station.lng}?q=${station.lat},${station.lng}(${encodeURIComponent(station.name)})`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
    
    // Try geo scheme for native apps
    const link = document.createElement('a');
    link.href = geoUrl;
    link.click();
    
    // Fallback timeout for web
    setTimeout(() => {
      window.open(googleMapsUrl, '_blank');
    }, 500);
  };

  const handleCall = () => {
    if (station.phone) {
      window.location.href = `tel:${station.phone.replace(/\s/g, '')}`;
    }
  };

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-[1000] shadow-xl border-primary/20 bg-card/95 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{station.name}</h3>
              <p className="text-sm text-muted-foreground">{station.type}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -mt-1 -mr-1"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1 gap-2"
            onClick={handleDirections}
          >
            <Navigation className="w-4 h-4" />
            Como Chegar
          </Button>
          
          {station.phone && (
            <Button
              variant="secondary"
              className="flex-1 gap-2"
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

export default StationCard;
