import React from 'react';
import { Home, MapPin, BookOpen, Phone, Lock, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';

const navItems = [
  { icon: Home, label: 'Feed', path: '/' },
  { icon: MapPin, label: 'Radar', path: '/mapa' },
  { icon: Lock, label: 'Cofre', path: '/cofre' },
  { icon: Bell, label: 'Alertas', path: '/notificacoes', showBadge: true },
  { icon: Phone, label: 'S.O.S', path: '/emergencia', isEmergency: true },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-lg border-t border-border safe-area-inset">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-200',
                item.isEmergency && 'relative'
              )}
            >
              {item.isEmergency ? (
                <div className="w-12 h-12 -mt-6 gradient-primary rounded-full flex items-center justify-center shadow-glow">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <div
                  className={cn(
                    'relative w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-secondary'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {/* Notification Badge */}
                  {item.showBadge && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 flex items-center justify-center text-[0.625rem] font-bold bg-primary text-primary-foreground rounded-full shadow-md">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  item.isEmergency 
                    ? 'text-primary mt-1' 
                    : isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
