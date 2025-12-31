import React from 'react';
import { Heart, Shield, Star, Flower2, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

const avatarOptions = [
  { id: 'heart', icon: Heart, label: 'Coração' },
  { id: 'shield', icon: Shield, label: 'Escudo' },
  { id: 'star', icon: Star, label: 'Estrela' },
  { id: 'flower', icon: Flower2, label: 'Flor' },
  { id: 'sun', icon: Sun, label: 'Sol' },
  { id: 'moon', icon: Moon, label: 'Lua' },
];

interface AvatarSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Escolha seu avatar
      </label>
      <div className="grid grid-cols-3 gap-3">
        {avatarOptions.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
              selected === id
                ? 'border-primary bg-primary/10 shadow-glow'
                : 'border-border bg-card hover:border-primary/50 hover:bg-accent'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                selected === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};