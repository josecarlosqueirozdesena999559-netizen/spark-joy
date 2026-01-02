import React from 'react';
import { Users, AlertTriangle, MapPin, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CommunityStatsCardsProps {
  usersOnline: number;
  activeAlerts: number;
  citiesCovered: number;
  loading: boolean;
}

const CommunityStatsCards: React.FC<CommunityStatsCardsProps> = ({
  usersOnline,
  activeAlerts,
  citiesCovered,
  loading,
}) => {
  const stats = [
    {
      label: 'Usuárias na Rede',
      value: usersOnline,
      icon: Users,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Alertas Ativos',
      value: activeAlerts,
      icon: AlertTriangle,
      color: 'bg-warning/10 text-warning',
    },
    {
      label: 'Cidades Atendidas',
      value: citiesCovered,
      icon: MapPin,
      color: 'bg-success/10 text-success',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 px-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="p-3 flex flex-col items-center justify-center text-center bg-card border-border/50"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color} mb-2`}>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <stat.icon className="w-5 h-5" />
            )}
          </div>
          <span className="text-xl font-bold text-foreground">
            {loading ? '...' : stat.value.toLocaleString('pt-BR')}
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">
            {stat.label}
          </span>
        </Card>
      ))}
    </div>
  );
};

export default CommunityStatsCards;
