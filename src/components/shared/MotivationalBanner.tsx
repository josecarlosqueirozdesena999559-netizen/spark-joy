import { useState, useEffect } from 'react';
import { Heart, Sparkles, Star, Sun, Shield } from 'lucide-react';

const motivationalPhrases = [
  { text: 'Você é forte', icon: Shield },
  { text: 'Não está sozinha', icon: Heart },
  { text: 'Sua coragem salva vidas', icon: Star },
  { text: 'Você merece respeito', icon: Sparkles },
  { text: 'Sua voz importa', icon: Sun },
  { text: 'Acredite em você', icon: Heart },
  { text: 'Você é mais forte do que imagina', icon: Shield },
  { text: 'Cada passo conta', icon: Star },
];

export const MotivationalBanner = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    // Randomize initial phrase
    setCurrentPhrase(Math.floor(Math.random() * motivationalPhrases.length));
    
    // Change phrase every 10 seconds
    const interval = setInterval(() => {
      setCurrentPhrase(Math.floor(Math.random() * motivationalPhrases.length));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const phrase = motivationalPhrases[currentPhrase];
  const Icon = phrase.icon;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 mx-4 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 justify-center">
        <Icon className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium text-primary">{phrase.text}</p>
        <Icon className="w-4 h-4 text-primary" />
      </div>
    </div>
  );
};
