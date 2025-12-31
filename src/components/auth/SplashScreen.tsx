import React, { useEffect, useState } from 'react';
import { Heart, Shield } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center gradient-primary transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-foreground/20 rounded-full blur-2xl scale-150" />
          <div className="relative flex items-center justify-center w-24 h-24 bg-primary-foreground/10 rounded-full backdrop-blur-sm border border-primary-foreground/20">
            <Heart className="w-12 h-12 text-primary-foreground animate-pulse-soft" fill="currentColor" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary-foreground tracking-tight">
            PorElas
          </h1>
          <p className="text-primary-foreground/80 text-sm font-medium flex items-center gap-2 justify-center">
            <Shield className="w-4 h-4" />
            Proteção e apoio
          </p>
        </div>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className="text-primary-foreground/60 text-xs">Carregando...</p>
      </div>
    </div>
  );
};