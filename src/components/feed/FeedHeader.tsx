import React from 'react';
import { Heart, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';

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
  const { unreadCount } = useNotifications();

  return (
    <header 
      className="sticky top-0 z-40 w-full"
      style={{ backgroundColor: '#e91e63' }}
    >
      <div className="flex items-center justify-center px-4 h-14 relative">
        {/* Logo - Centralizado */}
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-white" fill="currentColor" />
          <h1 
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            PorElas
          </h1>
        </div>
        
        {/* Notification Icon */}
        <button 
          onClick={() => navigate('/notificacoes')}
          className="absolute right-16 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center ring-2 ring-white/40 hover:ring-white/60 transition-all focus:outline-none focus:ring-white/60"
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        
        {/* Avatar - Posição absoluta à direita */}
        <button 
          onClick={() => navigate('/perfil')}
          className="absolute right-4 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-base ring-2 ring-white/40 hover:ring-white/60 transition-all focus:outline-none focus:ring-white/60"
        >
          {avatarIcons[avatarIcon] || '❤️'}
        </button>
      </div>
    </header>
  );
};

export default FeedHeader;
