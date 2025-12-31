import React from 'react';
import { Heart, Users, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeedOnboardingProps {
  onClose: () => void;
}

const FeedOnboarding: React.FC<FeedOnboardingProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-3xl p-8 max-w-sm w-full shadow-lg animate-slide-up">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 rounded-full"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Icon */}
        <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
          <Heart className="w-10 h-10 text-primary-foreground" fill="currentColor" />
        </div>

        <h2 className="text-2xl font-bold text-foreground text-center mb-4">
          Bem-vinda ao Feed
        </h2>

        <p className="text-muted-foreground text-center mb-6 leading-relaxed">
          Este é o seu espaço seguro para compartilhar histórias, encontrar força e apoiar outras mulheres.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-secondary-foreground" />
            </div>
            <p className="text-sm text-foreground">
              Conecte-se com outras mulheres em uma comunidade acolhedora
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-secondary-foreground" />
            </div>
            <p className="text-sm text-foreground">
              Suas publicações são protegidas e você controla quem pode ver
            </p>
          </div>
        </div>

        <Button 
          onClick={onClose}
          className="w-full rounded-full h-12 text-base font-semibold"
        >
          Começar a Explorar
        </Button>
      </div>
    </div>
  );
};

export default FeedOnboarding;
