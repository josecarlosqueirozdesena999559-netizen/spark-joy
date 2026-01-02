import React from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeedHeaderProps {
  avatarIcon: string;
  onSignOut: () => void;
}

const FeedHeader: React.FC<FeedHeaderProps> = () => {
  const navigate = useNavigate();

  return (
    <header 
      className="sticky top-0 z-40 w-full"
      style={{ backgroundColor: '#e91e63' }}
    >
      <div className="flex items-center justify-between px-4 h-14">
        {/* App Name Only */}
        <h1 
          className="text-xl font-bold text-white"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          PorElas
        </h1>
        
        {/* Right Actions */}
        <div className="flex items-center gap-2">
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
