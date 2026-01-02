import React from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type HeatMapFilter = 'users' | 'alerts';

interface HeatMapFiltersProps {
  activeFilter: HeatMapFilter;
  onFilterChange: (filter: HeatMapFilter) => void;
}

const HeatMapFilters: React.FC<HeatMapFiltersProps> = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="px-4">
      <ToggleGroup 
        type="single" 
        value={activeFilter} 
        onValueChange={(value) => value && onFilterChange(value as HeatMapFilter)}
        className="w-full bg-muted rounded-lg p-1"
      >
        <ToggleGroupItem 
          value="users" 
          className="flex-1 gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <Users className="w-4 h-4" />
          <span className="text-xs">Concentração de Usuárias</span>
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="alerts" 
          className="flex-1 gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs">Volume de Alertas</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default HeatMapFilters;
