import React, { useRef, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import CommunityStatsCards from '@/components/community/CommunityStatsCards';
import HeatMapFilters, { type HeatMapFilter } from '@/components/community/HeatMapFilters';
import DonationProgressBar from '@/components/community/DonationProgressBar';
import CitySearch from '@/components/community/CitySearch';
import CommunityHeatMap, { type CommunityHeatMapRef } from '@/components/community/CommunityHeatMap';
import { useCommunityStats } from '@/hooks/useCommunityStats';

const Mapa: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<HeatMapFilter>('users');
  const heatMapRef = useRef<CommunityHeatMapRef>(null);
  const { stats, loading } = useCommunityStats();

  const handleCitySelect = (lng: number, lat: number, cityName: string) => {
    heatMapRef.current?.flyToCity(lng, lat, cityName);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border shrink-0">
        <div className="flex items-center gap-2 px-4 h-14 max-w-lg mx-auto">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Dados da Comunidade</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Stats Cards */}
        <div className="py-4">
          <CommunityStatsCards
            usersOnline={stats.usersOnline}
            activeAlerts={stats.activeAlerts}
            citiesCovered={stats.citiesCovered}
            loading={loading}
          />
        </div>

        {/* Donation Progress */}
        <div className="pb-4">
          <DonationProgressBar
            progress={stats.donationProgress}
            goal={stats.donationGoal}
          />
        </div>

        {/* City Search */}
        <div className="pb-3">
          <CitySearch onCitySelect={handleCitySelect} />
        </div>

        {/* Heat Map Filters */}
        <div className="pb-3">
          <HeatMapFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        {/* Heat Map */}
        <CommunityHeatMap ref={heatMapRef} filter={activeFilter} />
      </div>

      <BottomNav />
    </div>
  );
};

export default Mapa;
