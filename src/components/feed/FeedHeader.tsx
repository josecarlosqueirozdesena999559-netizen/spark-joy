import React from 'react';
import { Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import logoImg from '@/assets/porelas-logo.png';

interface FeedHeaderProps {
  avatarIcon: string;
  onSignOut: () => void;
}

const FeedHeader: React.FC<FeedHeaderProps> = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <header 
      className="sticky top-0 z-40 w-full"
      style={{ backgroundColor: '#e91e63' }}
    >
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="PorElas" className="h-8 w-auto" />
          <h1 
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            PorElas
          </h1>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Notification Icon */}
          <button 
            onClick={() => navigate('/notificacoes')}
            className="relative w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Profile Icon */}
          <button 
            onClick={() => navigate('/perfil')}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
            aria-label="Perfil"
          >
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default FeedHeader;
