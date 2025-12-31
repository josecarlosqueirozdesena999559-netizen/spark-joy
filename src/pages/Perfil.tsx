import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, User, Shield, Bell, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/layout/BottomNav';

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

const Perfil: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile(user?.id || '');
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Até logo!',
      description: 'Você saiu da sua conta.',
    });
    navigate('/auth');
  };

  const menuItems = [
    { icon: User, label: 'Editar Perfil', onClick: () => {} },
    { icon: Shield, label: 'Privacidade', onClick: () => {} },
    { icon: Bell, label: 'Notificações', onClick: () => {} },
    { icon: HelpCircle, label: 'Ajuda', onClick: () => {} },
  ];

  return (
    <div className="min-h-screen bg-background safe-area-inset pb-20">
      {/* Header */}
      <header className="gradient-primary pb-16 pt-4">
        <div className="flex items-center gap-3 px-4 max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary-foreground">Perfil</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 -mt-12">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-4xl mx-auto mb-4 ring-4 ring-background -mt-14">
              {avatarIcons[profile?.avatar_icon || 'heart']}
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              @{profile?.username || 'usuária'}
            </h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="mb-6">
          <CardContent className="p-2">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
              >
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-secondary-foreground" />
                </div>
                <span className="font-medium text-foreground">{item.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full rounded-xl h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair da conta
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Perfil;
