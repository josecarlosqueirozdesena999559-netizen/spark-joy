import React from 'react';
import { MapPin } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import MapComponent from '@/components/map/MapComponent';

const Mapa: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border shrink-0">
        <div className="flex items-center gap-2 px-4 h-14 max-w-lg mx-auto">
          <MapPin className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Mapa de Apoio</h1>
        </div>
      </header>

      <MapComponent />

      <BottomNav />
    </div>
  );
};

export default Mapa;
