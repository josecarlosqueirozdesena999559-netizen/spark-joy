import React from 'react';
import { X, Phone, Mail, MapPin, Copy, Navigation, Route, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { toast } from 'sonner';

interface StationInfo {
  id: number;
  name: string;
  type: string;
  distance: number;
  phone?: string;
  email?: string;
  address?: string;
  lat: number;
  lng: number;
}

interface StationBottomSheetProps {
  station: StationInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowRoute: (station: StationInfo) => void;
  loadingRoute?: boolean;
  routeInfo?: {
    distance: number;
    duration: number;
  } | null;
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

const StationBottomSheet: React.FC<StationBottomSheetProps> = ({
  station,
  open,
  onOpenChange,
  onShowRoute,
  loadingRoute,
  routeInfo,
}) => {
  if (!station) return null;

  const handleCall = () => {
    if (station.phone) {
      window.location.href = `tel:${station.phone.replace(/\s/g, '')}`;
    }
  };

  const handleEmail = () => {
    if (station.email) {
      window.location.href = `mailto:${station.email}`;
    }
  };

  const handleCopyAddress = async () => {
    if (station.address) {
      try {
        await navigator.clipboard.writeText(station.address);
        toast.success('Endereço copiado!', {
          description: station.address,
          duration: 2000,
        });
      } catch (err) {
        toast.error('Não foi possível copiar o endereço');
      }
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border/50 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-left text-lg">{station.name}</DrawerTitle>
              <DrawerDescription className="text-left mt-1">
                <span className="text-primary font-medium">{station.type}</span>
                <span className="mx-2">•</span>
                <span>{formatDistance(station.distance)} de distância</span>
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-4 space-y-4">
          {/* Address section */}
          {station.address && (
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Endereço</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {station.address}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0"
                onClick={handleCopyAddress}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Contact info */}
          <div className="grid grid-cols-1 gap-3">
            {station.phone && (
              <button
                onClick={handleCall}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
              >
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Telefone</p>
                  <p className="text-sm text-primary">{station.phone}</p>
                </div>
              </button>
            )}

            {station.email && (
              <button
                onClick={handleEmail}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">E-mail</p>
                  <p className="text-sm text-primary truncate">{station.email}</p>
                </div>
              </button>
            )}
          </div>

          {/* No contact info message */}
          {!station.phone && !station.email && !station.address && (
            <div className="p-4 bg-muted/30 rounded-xl text-center">
              <p className="text-sm text-muted-foreground">
                Informações de contato não disponíveis para este local.
              </p>
            </div>
          )}

          {/* Route info if available */}
          {routeInfo && (
            <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
              <div className="flex items-center gap-1.5 text-primary">
                <Route className="w-4 h-4" />
                <span className="text-sm font-medium">{formatDistance(routeInfo.distance)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{formatDuration(routeInfo.duration)}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 gap-2 h-12"
              onClick={() => onShowRoute(station)}
              disabled={loadingRoute}
            >
              {loadingRoute ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              Ver Rota
            </Button>
            {station.phone && (
              <Button
                variant="secondary"
                className="gap-2 h-12 px-6"
                onClick={handleCall}
              >
                <Phone className="w-4 h-4" />
                Ligar
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default StationBottomSheet;
