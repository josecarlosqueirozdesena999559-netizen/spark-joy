import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Phone, MapPin, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const quickActions = [
  {
    icon: Phone,
    title: 'Emergência',
    description: 'Ligue 180 ou 190',
    color: 'bg-destructive',
  },
  {
    icon: MapPin,
    title: 'Locais Seguros',
    description: 'Encontre apoio perto de você',
    color: 'bg-primary',
  },
  {
    icon: Users,
    title: 'Comunidade',
    description: 'Conecte-se com outras mulheres',
    color: 'bg-secondary',
  },
  {
    icon: Shield,
    title: 'Informações',
    description: 'Conheça seus direitos',
    color: 'bg-accent',
  },
];

const Home: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Até logo!',
      description: 'Você saiu da sua conta.',
    });
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      {/* Header */}
      <header className="gradient-primary p-6 pb-12 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-foreground">PorElas</h1>
              <p className="text-xs text-primary-foreground/80">Olá, {user?.user_metadata?.username || 'usuária'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <p className="text-primary-foreground font-medium">
              Você não está sozinha. Estamos aqui por você.
            </p>
          </CardContent>
        </Card>
      </header>

      {/* Main Content */}
      <main className="p-4 -mt-6">
        {/* Emergency Banner */}
        <Card className="bg-destructive/10 border-destructive/20 mb-6">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6 text-destructive-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Em perigo imediato?</h3>
              <p className="text-sm text-muted-foreground">
                Ligue agora: <span className="font-bold text-destructive">180</span> (Central da Mulher)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <action.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-medium text-foreground text-sm">{action.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Seus dados estão protegidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              O PorElas não armazena fotos pessoais e utiliza criptografia avançada para proteger suas informações. Sua privacidade é nossa prioridade.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-xs text-muted-foreground">
          © 2024 PorElas. Feito com ❤️ para proteger vidas.
        </p>
      </footer>
    </div>
  );
};

export default Home;