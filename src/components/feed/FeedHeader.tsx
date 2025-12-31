import React from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';

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

const FeedHeader: React.FC<FeedHeaderProps> = ({ avatarIcon, onSignOut }) => {
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
        
        {/* Avatar with Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center text-base ring-2 ring-primary/30 hover:ring-primary/50 transition-all focus:outline-none focus:ring-primary/50">
              {avatarIcons[avatarIcon] || '❤️'}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem onClick={() => navigate('/perfil')} className="gap-2 rounded-lg">
              <User className="w-4 h-4" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/perfil')} className="gap-2 rounded-lg">
              <Settings className="w-4 h-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onSignOut}
              className="text-destructive focus:text-destructive gap-2 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default FeedHeader;
