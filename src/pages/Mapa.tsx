import React, { useState } from 'react';
import { Flame, Shield, Users } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import BrazilStatesMap from '@/components/map/BrazilStatesMap';
import HeatMap from '@/components/map/HeatMap';
import SecurityRadar from '@/components/map/SecurityRadar';
import { MotivationalBanner } from '@/components/shared/MotivationalBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Mapa: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radar' | 'calor'>('radar');

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-lg border-b border-border/30 shrink-0">
        <div className="flex flex-col px-4 pt-3 pb-2 max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Mapa do Brasil</h1>
          </div>
          
          {/* Tabs compactas e organizadas */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'radar' | 'calor')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 bg-muted/50 p-1 rounded-xl gap-1">
              <TabsTrigger 
                value="radar" 
                className="flex items-center gap-2 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Shield className="w-4 h-4" />
                Delegacias
              </TabsTrigger>
              <TabsTrigger 
                value="calor" 
                className="flex items-center gap-2 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Users className="w-4 h-4" />
                Usuárias
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <div className="pt-2 px-4">
        <MotivationalBanner />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'radar' ? (
          <SecurityRadar />
        ) : (
          <HeatMap />
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Mapa;
