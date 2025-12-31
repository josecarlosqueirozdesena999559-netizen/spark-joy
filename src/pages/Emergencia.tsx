import React from 'react';
import { Phone, Siren, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BottomNav from '@/components/layout/BottomNav';
import { MotivationalBanner } from '@/components/shared/MotivationalBanner';

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
      {/* Header estilo nativo */}
      <header 
        className="sticky top-0 z-40 w-full"
        style={{ backgroundColor: '#e91e63' }}
      >
        <div className="flex items-center justify-center px-4 h-14 relative">
          <div className="flex items-center gap-2">
            <Siren className="w-5 h-5 text-white" />
            <h1 
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              SOS Emergência
            </h1>
          </div>
        </div>
      </header>

      {/* Alerta de emergência */}
      <div className="bg-red-50 border-b border-red-200 px-4 py-3">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-red-800 text-sm font-medium">
            Se você está em situação de risco, ligue imediatamente para um dos números abaixo
          </p>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4">
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
