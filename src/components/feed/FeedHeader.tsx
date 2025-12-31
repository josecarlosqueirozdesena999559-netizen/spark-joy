import React from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeedHeaderProps {
  avatarIcon: string;
  onSignOut: () => void;
}

const avatarIcons: Record<string, string> = {
  heart: '❤️',
  star: '⭐',
  flower: '🌸',
  butterfly: '🦋',
  rainbow: '🌈',
  moon: '🌙',
  sun: '☀️',
  leaf: '🍃',
};

const FeedHeader: React.FC<FeedHeaderProps> = ({ avatarIcon }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between px-4 h-14 max-w-md mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" fill="currentColor" />
          <h1 
            className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            PorElas
          </h1>
        </div>
        
        {/* Avatar - Direct to profile */}
        <button 
          onClick={() => navigate('/perfil')}
          className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center text-base ring-2 ring-primary/30 hover:ring-primary/50 transition-all focus:outline-none focus:ring-primary/50"
        >
          {avatarIcons[avatarIcon] || '❤️'}
        </button>
      </div>
    </header>
  );
};

export default FeedHeader;
