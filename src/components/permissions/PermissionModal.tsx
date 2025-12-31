import { useState, useEffect } from 'react';
import { Shield, MapPin, Phone, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PermissionModalProps {
  onPermissionGranted: () => void;
}

export const PermissionModal = ({ onPermissionGranted }: PermissionModalProps) => {
  const [open, setOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    // Check if permissions were already granted
    const permissionsGranted = localStorage.getItem('permissions_granted');
    if (!permissionsGranted) {
      setOpen(true);
    } else {
      onPermissionGranted();
    }
  }, [onPermissionGranted]);

  const handleRequestPermissions = async () => {
    setRequesting(true);
    
    try {
      // Request geolocation permission via browser API
      if ('geolocation' in navigator) {
        await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
      }
      
      // Mark permissions as granted
      localStorage.setItem('permissions_granted', 'true');
      setOpen(false);
      onPermissionGranted();
    } catch (error) {
      console.log('Permission request:', error);
      // Even if user denies, we allow them to continue (they can enable later)
      localStorage.setItem('permissions_granted', 'true');
      setOpen(false);
      onPermissionGranted();
    } finally {
      setRequesting(false);
    }
  };

  const permissions = [
    {
      icon: MapPin,
      title: 'Localização Precisa',
      description: 'Para encontrar delegacias próximas e enviar sua localização em emergências.'
    },
    {
      icon: Bell,
      title: 'Localização em Segundo Plano',
      description: 'Para que o botão S.O.S funcione mesmo com o app fechado.'
    },
    {
      icon: Phone,
      title: 'Chamadas Telefônicas',
      description: 'Para ligar diretamente para delegacias com um único toque.'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Sua Segurança é Prioridade</DialogTitle>
          <DialogDescription className="text-base">
            Para proteger você da melhor forma, precisamos de algumas permissões:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {permissions.map((permission, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                <permission.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{permission.title}</h4>
                <p className="text-sm text-muted-foreground">{permission.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleRequestPermissions} 
            disabled={requesting}
            className="w-full"
            size="lg"
          >
            {requesting ? 'Solicitando...' : 'Permitir e Continuar'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Você pode alterar essas permissões a qualquer momento nas configurações do seu dispositivo.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
