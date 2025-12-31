import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import BottomNav from '@/components/layout/BottomNav';
import { MotivationalBanner } from '@/components/shared/MotivationalBanner';
import { CourageThermometer } from '@/components/content/CourageThermometer';
import { CourageQuestionnaire } from '@/components/content/CourageQuestionnaire';
import { CourageMessage } from '@/components/content/CourageMessage';
import { VaultToolsCard } from '@/components/content/VaultToolsCard';
import { ExportReportButton } from '@/components/content/ExportReportButton';

const Conteudo: React.FC = () => {
  const [courageLevel, setCourageLevel] = useState(50);
  const [courageMessage, setCourageMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const handleQuestionnaireComplete = (score: number, message: string) => {
    // Animate the thermometer update
    setShowMessage(false);
    
    // Small delay for animation effect
    setTimeout(() => {
      setCourageLevel(score);
      setCourageMessage(message);
      setShowMessage(true);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background safe-area-inset pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-2 px-4 h-14 max-w-lg mx-auto">
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Conteúdo de Apoio</h1>
        </div>
      </header>

      {/* Motivational Banner - Always visible at top */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur-sm pt-2">
        <MotivationalBanner />
      </div>

      {/* Scrollable Content Area */}
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {/* Section 1: Courage Message (appears after questionnaire) */}
          <CourageMessage message={courageMessage} visible={showMessage} />

          {/* Section 2: Thermometer */}
          <CourageThermometer level={courageLevel} animated />

          {/* Section 3: Questionnaire */}
          <CourageQuestionnaire onComplete={handleQuestionnaireComplete} />

          {/* Section 4: Vault Tools */}
          <VaultToolsCard />

          {/* Section 5: Export Button */}
          <ExportReportButton />

          {/* Bottom spacing for scroll */}
          <div className="h-4" />
        </main>
      </ScrollArea>

      <BottomNav />
    </div>
  );
};

export default Conteudo;
