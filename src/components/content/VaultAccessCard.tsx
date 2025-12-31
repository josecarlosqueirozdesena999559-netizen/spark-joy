import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VaultAccessCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-accent/10 border-primary/15 shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm">Cofre de Provas</h3>
            <p className="text-xs text-muted-foreground">
              Guarde documentos e evidências de forma segura e criptografada
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/cofre')}
            className="flex-shrink-0"
          >
            <ChevronRight className="w-5 h-5 text-primary" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
