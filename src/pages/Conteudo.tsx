import React from 'react';
import { BookOpen, Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import BottomNav from '@/components/layout/BottomNav';

const Conteudo: React.FC = () => {
  return (
    <div className="min-h-screen bg-background safe-area-inset pb-20">
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-2 px-4 h-16 max-w-lg mx-auto">
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Conteúdo Educativo</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Construction className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h2 className="font-semibold text-foreground mb-2">Em breve</h2>
            <p className="text-muted-foreground text-sm">
              Artigos e recursos educativos estão sendo preparados para você.
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default Conteudo;
