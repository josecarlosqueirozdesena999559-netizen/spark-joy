import React from 'react';
import { Users } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import BrazilStatesMap from '@/components/map/BrazilStatesMap';
import { MotivationalBanner } from '@/components/shared/MotivationalBanner';

const Mapa: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-lg border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2 px-4 h-14 max-w-lg mx-auto">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Mapa de Usuárias</h1>
        </div>
      </header>

      <div className="pt-2 px-4">
        <MotivationalBanner />
      </div>

      <BrazilStatesMap />

      <BottomNav />
    </div>
  );
};

export default Mapa;
