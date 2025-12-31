import React from 'react';
import { Phone, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BottomNav from '@/components/layout/BottomNav';

const emergencyContacts = [
  {
    name: 'Central de Atendimento à Mulher',
    number: '180',
    description: 'Funciona 24 horas, todos os dias',
    primary: true,
  },
  {
    name: 'Polícia Militar',
    number: '190',
    description: 'Emergência policial',
    primary: false,
  },
  {
    name: 'SAMU',
    number: '192',
    description: 'Emergência médica',
    primary: false,
  },
  {
    name: 'Bombeiros',
    number: '193',
    description: 'Resgate e emergências',
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
        <div className="px-4 py-8 max-w-lg mx-auto text-center">
          <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <AlertTriangle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground mb-2">Emergência</h1>
          <p className="text-primary-foreground/80 text-sm">
            Se você está em perigo, ligue agora para um dos números abaixo
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 -mt-4">
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
          Você não está sozinha. Buscar ajuda é um ato de coragem. 💜
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default Emergencia;
