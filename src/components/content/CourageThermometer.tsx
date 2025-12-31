import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Thermometer, Flame, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CourageThermometerProps {
  level: number; // 0-100
  animated?: boolean;
}

const getLevelInfo = (level: number) => {
  if (level >= 80) return { label: 'Força Total', color: 'text-success', emoji: '💪' };
  if (level >= 60) return { label: 'Confiante', color: 'text-primary', emoji: '✨' };
  if (level >= 40) return { label: 'Crescendo', color: 'text-warning', emoji: '🌱' };
  if (level >= 20) return { label: 'Despertando', color: 'text-muted-foreground', emoji: '🌸' };
  return { label: 'Iniciando', color: 'text-muted-foreground', emoji: '💗' };
};

export const CourageThermometer: React.FC<CourageThermometerProps> = ({ 
  level, 
  animated = false 
}) => {
  const info = getLevelInfo(level);

  return (
    <Card className="bg-gradient-to-br from-accent/50 to-secondary/50 border-primary/10 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Thermometer className="w-5 h-5 text-primary" />
          Termômetro da Coragem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Progress 
              value={level} 
              className={`h-4 bg-secondary ${animated ? 'transition-all duration-1000 ease-out' : ''}`}
            />
          </div>
          <span className="text-2xl">{info.emoji}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={`w-4 h-4 ${info.color}`} />
            <span className={`text-sm font-medium ${info.color}`}>{info.label}</span>
          </div>
          <span className="text-sm font-bold text-primary">{level}%</span>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Iniciando</span>
          <span>Crescendo</span>
          <span>Força Total</span>
        </div>
      </CardContent>
    </Card>
  );
};
