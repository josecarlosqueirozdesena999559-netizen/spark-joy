import React from 'react';
import { MapPin, Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import BottomNav from '@/components/layout/BottomNav';

const Mapa: React.FC = () => {
  return (
    <div className="min-h-screen bg-background safe-area-inset pb-20">
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-2 px-4 h-16 max-w-lg mx-auto">
          <MapPin className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Mapa de Apoio</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Construction className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h2 className="font-semibold text-foreground mb-2">Em breve</h2>
            <p className="text-muted-foreground text-sm">
              O mapa com locais de apoio está sendo desenvolvido para você.
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default Mapa;
