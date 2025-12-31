import React from 'react';
import { Phone, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BottomNav from '@/components/layout/BottomNav';
import { MotivationalBanner } from '@/components/shared/MotivationalBanner';
import porelasLogo from '@/assets/porelas-logo.png';

const emergencyContacts = [
  {
    name: 'Central de Atendimento à Mulher',
    number: '180',
    description: 'Atendimento 24h, gratuito e confidencial',
    primary: true,
  },
  {
    name: 'Polícia Militar',
    number: '190',
    description: 'Emergências policiais imediatas',
    primary: false,
  },
  {
    name: 'SAMU',
    number: '192',
    description: 'Atendimento médico de urgência',
    primary: false,
  },
  {
    name: 'Corpo de Bombeiros',
    number: '193',
    description: 'Resgate e situações de emergência',
    primary: false,
  },
];

const Emergencia: React.FC = () => {
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-background safe-area-inset pb-20">
      <header className="gradient-primary">
        <div className="px-4 py-6 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={porelasLogo} 
              alt="PorElas" 
              className="w-10 h-10 object-cover rounded-full"
            />
            <div>
              <h1 className="text-lg font-bold text-primary-foreground">Emergência</h1>
              <p className="text-primary-foreground/70 text-xs">Ajuda imediata quando você precisar</p>
            </div>
          </div>
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 border border-primary-foreground/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary-foreground" />
              <p className="text-primary-foreground/90 text-sm">
                Se você está em situação de risco, ligue imediatamente
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 -mt-4">
        <MotivationalBanner />
        
        <div className="space-y-3">
          {emergencyContacts.map((contact) => (
            <Card 
              key={contact.number} 
              className={contact.primary ? 'border-primary shadow-glow' : ''}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.description}</p>
                  </div>
                  <Button
                    onClick={() => handleCall(contact.number)}
                    className={`rounded-full gap-2 ${contact.primary ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                    variant={contact.primary ? 'default' : 'outline'}
                  >
                    <Phone className="w-4 h-4" />
                    {contact.number}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-secondary/50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-primary" />
              Recursos Online
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Casa da Mulher Brasileira</li>
              <li>• Delegacias Especializadas (DEAMs)</li>
              <li>• Centros de Referência da Mulher</li>
            </ul>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 px-4">
          Você não está sozinha. Pedir ajuda é um ato de força e coragem.
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default Emergencia;
