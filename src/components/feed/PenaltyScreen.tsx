import React from 'react';
import { ShieldX, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface PenaltyScreenProps {
  level: 1 | 2 | 3;
  daysRemaining?: number;
}

const PenaltyScreen: React.FC<PenaltyScreenProps> = ({ level, daysRemaining = 15 }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  if (level === 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Conta Encerrada
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Sua conta foi permanentemente encerrada por violações graves das normas da comunidade.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Se você acredita que isso foi um erro, entre em contato com nosso suporte.
          </p>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="rounded-full gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-warning" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Acesso Bloqueado
        </h1>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Sua conta está bloqueada por {daysRemaining} dias devido a violações das normas da comunidade.
        </p>
        <div className="bg-secondary rounded-2xl p-4 mb-6">
          <p className="text-sm text-foreground font-medium">
            Penalidade Nível {level}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Bloqueio de {daysRemaining} dias - aguarde para voltar a acessar.
          </p>
        </div>
        <Button 
          onClick={handleLogout}
          variant="ghost"
          className="rounded-full gap-2 text-muted-foreground"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </Button>
      </div>
    </div>
  );
};

export default PenaltyScreen;
