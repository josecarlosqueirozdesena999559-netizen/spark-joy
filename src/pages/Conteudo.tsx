import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import BottomNav from '@/components/layout/BottomNav';
import { MotivationalBanner } from '@/components/shared/MotivationalBanner';
import { GlobalCourageThermometer } from '@/components/content/GlobalCourageThermometer';
import { DenunciaQuestionnaire } from '@/components/content/DenunciaQuestionnaire';
import { CourageContent } from '@/components/content/CourageContent';
import { VaultAccessCard } from '@/components/content/VaultAccessCard';
import { useQuestionnaireStatus } from '@/hooks/useDenunciaStats';
import { Skeleton } from '@/components/ui/skeleton';

const Conteudo: React.FC = () => {
  const { hasAnswered, isLoading } = useQuestionnaireStatus();
  const [showContent, setShowContent] = useState(false);

  // Quando a usuária completa o questionário, mostrar o conteúdo
  const handleQuestionnaireComplete = () => {
    setShowContent(true);
  };

  // Se já respondeu, mostrar conteúdo direto
  useEffect(() => {
    if (hasAnswered) {
      setShowContent(true);
    }
  }, [hasAnswered]);

  return (
    <div className="min-h-screen bg-background safe-area-inset pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-2 px-4 h-14 max-w-lg mx-auto">
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Jornada de Coragem</h1>
        </div>
      </header>

      {/* Motivational Banner - Always visible at top */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur-sm pt-2">
        <MotivationalBanner />
      </div>

      {/* Scrollable Content Area */}
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {isLoading ? (
            // Loading state
            <>
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </>
          ) : showContent ? (
            // Após responder: Termômetro + Conteúdos + Cofre
            <>
              <GlobalCourageThermometer />
              <CourageContent />
              <VaultAccessCard />
            </>
          ) : (
            // Antes de responder: Apenas questionário
            <DenunciaQuestionnaire onComplete={handleQuestionnaireComplete} />
          )}

          {/* Bottom spacing for scroll */}
          <div className="h-4" />
        </main>
      </ScrollArea>

      <BottomNav />
    </div>
  );
};

export default Conteudo;
