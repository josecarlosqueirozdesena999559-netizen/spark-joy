import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Shield, Phone, BookOpen, Sparkles } from 'lucide-react';

const courageContents = [
  {
    icon: Heart,
    title: 'Você Não Está Sozinha',
    content: 'Milhares de mulheres passaram pelo mesmo caminho e encontraram força para recomeçar. Sua coragem de buscar informação já é o primeiro passo de uma jornada de libertação.',
  },
  {
    icon: Shield,
    title: 'Seu Silêncio Protege Quem Te Machuca',
    content: 'Denunciar não é fraqueza, é um ato de amor próprio. A cada denúncia, você não apenas se protege, mas também ajuda a quebrar o ciclo de violência para outras mulheres.',
  },
  {
    icon: Phone,
    title: 'Apoio 24 Horas',
    content: 'Ligue 180 (Central de Atendimento à Mulher) ou 190 (Polícia). Você também pode ir diretamente a uma Delegacia da Mulher ou ao Ministério Público. Existem pessoas prontas para te ouvir.',
  },
  {
    icon: BookOpen,
    title: 'Documente Tudo',
    content: 'Guarde mensagens, fotos de machucados, áudios ameaçadores. Nosso Cofre de Provas pode te ajudar a manter tudo seguro e organizado para quando você decidir dar o próximo passo.',
  },
];

export const CourageContent: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">Conteúdos de Coragem</h2>
      </div>

      {courageContents.map((item, idx) => (
        <Card 
          key={idx} 
          className="bg-card/80 border-border/50 shadow-sm hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
