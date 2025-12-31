import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, TrendingUp } from 'lucide-react';
import { useDenunciaStats } from '@/hooks/useDenunciaStats';
import { Skeleton } from '@/components/ui/skeleton';

export const GlobalCourageThermometer: React.FC = () => {
  const { stats, isLoading } = useDenunciaStats();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-accent/20 to-secondary/30 border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  const percentual = stats?.percentual || 0;
  const total = stats?.total || 0;

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-accent/20 to-secondary/30 border-primary/20 shadow-lg overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Heart className="w-5 h-5 text-primary fill-primary/30" />
          Termômetro da Coragem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de progresso principal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Denunciaram</span>
            <span className="font-bold text-primary text-lg">{percentual}%</span>
          </div>
          <Progress 
            value={percentual} 
            className="h-5 bg-secondary/50 transition-all duration-1000 ease-out"
          />
        </div>

        {/* Mensagem inspiradora */}
        <div className="bg-card/60 rounded-xl p-4 border border-primary/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-semibold text-primary">{percentual}%</span> das mulheres da nossa comunidade já romperam o silêncio.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Você faz parte desta rede de coragem.
              </p>
            </div>
          </div>
        </div>

        {/* Contador de participantes */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <Users className="w-4 h-4" />
          <span>{total} mulheres compartilharam suas histórias</span>
        </div>
      </CardContent>
    </Card>
  );
};
