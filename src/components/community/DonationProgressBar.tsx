import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface DonationProgressBarProps {
  progress: number;
  goal: number;
}

const DonationProgressBar: React.FC<DonationProgressBarProps> = ({ progress, goal }) => {
  const percentage = Math.min((progress / goal) * 100, 100);

  const handleDonation = () => {
    // In a real app, this would open a payment modal or redirect to a payment page
    window.open('https://www.vakinha.com.br', '_blank');
  };

  return (
    <div className="mx-4 p-4 bg-card rounded-xl border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Meta de Apoio à Rede</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {percentage.toFixed(0)}%
        </span>
      </div>
      
      <Progress value={percentage} className="h-3 mb-3" />
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          R$ {progress.toLocaleString('pt-BR')} / R$ {goal.toLocaleString('pt-BR')}
        </span>
        <Button 
          size="sm" 
          className="gap-1.5 bg-primary hover:bg-primary/90"
          onClick={handleDonation}
        >
          <Heart className="w-3.5 h-3.5" />
          Fazer Doação
        </Button>
      </div>
    </div>
  );
};

export default DonationProgressBar;
