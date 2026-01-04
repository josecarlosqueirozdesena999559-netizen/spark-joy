import React, { useEffect, useState } from 'react';
import { Shield, Heart, Sparkles } from 'lucide-react';
import porelasLogo from '@/assets/porelas-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'logo' | 'text' | 'fadeOut'>('logo');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('text'), 800);
    const timer2 = setTimeout(() => setPhase('fadeOut'), 2500);
    const timer3 = setTimeout(onComplete, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center gradient-primary transition-opacity duration-500 overflow-hidden ${
        phase === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 animate-float"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      {/* Radial glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-white/20 via-transparent to-transparent" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo container with animations */}
        <div className="relative">
          {/* Outer ring pulse */}
          <div 
            className={`absolute inset-[-20px] rounded-full border-4 border-white/30 transition-all duration-1000 ${
              phase !== 'logo' ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
            }`}
          />
          
          {/* Middle ring */}
          <div 
            className={`absolute inset-[-10px] rounded-full bg-white/10 transition-all duration-700 delay-100 ${
              phase !== 'logo' ? 'scale-125 opacity-0' : 'scale-100 opacity-100'
            }`}
          />

          {/* Logo with bounce animation */}
          <div 
            className={`relative transition-all duration-700 ${
              phase === 'logo' ? 'scale-100 animate-bounce-gentle' : 'scale-90'
            }`}
          >
            <img 
              src={porelasLogo} 
              alt="PorElas" 
              className="w-32 h-32 object-cover rounded-full shadow-2xl ring-4 ring-white/50"
            />
            
            {/* Sparkle effects */}
            <Sparkles 
              className={`absolute -top-2 -right-2 w-6 h-6 text-white transition-all duration-500 ${
                phase !== 'logo' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}
            />
            <Heart 
              className={`absolute -bottom-1 -left-1 w-5 h-5 text-white fill-white transition-all duration-500 delay-100 ${
                phase !== 'logo' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}
            />
          </div>
        </div>

        {/* App name with typewriter effect */}
        <div 
          className={`flex flex-col items-center gap-2 transition-all duration-700 ${
            phase !== 'logo' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-4xl font-bold text-white tracking-wider">
            PorElas
          </h1>
          <div className="h-0.5 w-20 bg-white/60 rounded-full" />
        </div>

        {/* Tagline */}
        <p 
          className={`flex items-center gap-2 text-white/90 text-sm font-medium transition-all duration-700 delay-200 ${
            phase !== 'logo' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Shield className="w-4 h-4" />
          Proteção e apoio para mulheres
        </p>
      </div>

      {/* Bottom loading indicator */}
      <div className="absolute bottom-16 flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 bg-white rounded-full"
              style={{
                animation: 'bounce 1s infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
        <p className="text-white/70 text-xs font-light tracking-wide">Carregando...</p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-8px); opacity: 0.7; }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-float { animation: float ease-in-out infinite; }
        .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
        .bg-gradient-radial { background: radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to)); }
      `}</style>
    </div>
  );
};