import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ClipboardList, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: { value: string; label: string; points: number }[];
}

const questions: Question[] = [
  {
    id: 'q1',
    text: 'Hoje, como você se sente em relação à sua segurança?',
    options: [
      { value: 'a', label: 'Me sinto segura e protegida', points: 25 },
      { value: 'b', label: 'Tenho alguns receios, mas estou bem', points: 18 },
      { value: 'c', label: 'Me sinto um pouco insegura', points: 10 },
      { value: 'd', label: 'Preciso de apoio agora', points: 5 },
    ],
  },
  {
    id: 'q2',
    text: 'Você conseguiu fazer algo por você hoje?',
    options: [
      { value: 'a', label: 'Sim, cuidei de mim!', points: 25 },
      { value: 'b', label: 'Um pouco, mas poderia ser melhor', points: 18 },
      { value: 'c', label: 'Não consegui hoje', points: 10 },
      { value: 'd', label: 'Estou focando apenas em sobreviver', points: 5 },
    ],
  },
  {
    id: 'q3',
    text: 'Como está seu nível de energia emocional?',
    options: [
      { value: 'a', label: 'Forte e determinada', points: 25 },
      { value: 'b', label: 'Estável, seguindo em frente', points: 18 },
      { value: 'c', label: 'Cansada, mas resistindo', points: 10 },
      { value: 'd', label: 'Esgotada', points: 5 },
    ],
  },
  {
    id: 'q4',
    text: 'Você se sentiu ouvida e respeitada hoje?',
    options: [
      { value: 'a', label: 'Sim, completamente', points: 25 },
      { value: 'b', label: 'Na maioria das vezes', points: 18 },
      { value: 'c', label: 'Raramente', points: 10 },
      { value: 'd', label: 'Não me senti ouvida', points: 5 },
    ],
  },
];

interface CourageQuestionnaireProps {
  onComplete: (score: number, message: string) => void;
}

const courageMessages = {
  high: [
    'Você é uma guerreira! Sua força inspira outras mulheres ao seu redor.',
    'Sua coragem brilha intensamente. Continue nutrindo essa chama interior!',
    'Você está no caminho certo. Sua determinação é admirável!',
    'Mulher incrível! Cada passo seu é uma vitória.',
  ],
  medium: [
    'Você está crescendo a cada dia. Permita-se celebrar as pequenas vitórias.',
    'Sua jornada é única e valiosa. Continue se movendo, no seu ritmo.',
    'Você é mais forte do que imagina. Confie no seu processo.',
    'Dias difíceis passam, sua coragem permanece. Você consegue!',
  ],
  low: [
    'Está tudo bem não estar bem. Você não está sozinha nessa jornada.',
    'Cada respiração é um ato de coragem. Estamos aqui por você.',
    'Pequenos passos também são passos. Você merece cuidado e amor.',
    'Sua vulnerabilidade é força. Busque apoio quando precisar.',
  ],
};

const getRandomMessage = (score: number): string => {
  let messages: string[];
  if (score >= 70) {
    messages = courageMessages.high;
  } else if (score >= 40) {
    messages = courageMessages.medium;
  } else {
    messages = courageMessages.low;
  }
  return messages[Math.floor(Math.random() * messages.length)];
};

export const CourageQuestionnaire: React.FC<CourageQuestionnaireProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);

  const handleNext = () => {
    if (!selectedOption) return;

    const newAnswers = { ...answers, [questions[currentQuestion].id]: selectedOption };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption('');
    } else {
      // Calculate score
      let totalScore = 0;
      questions.forEach((q) => {
        const answer = newAnswers[q.id];
        const option = q.options.find((o) => o.value === answer);
        if (option) totalScore += option.points;
      });

      const message = getRandomMessage(totalScore);
      setIsCompleted(true);
      onComplete(totalScore, message);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedOption('');
    setIsCompleted(false);
  };

  if (isCompleted) {
    return (
      <Card className="bg-gradient-to-br from-secondary/60 to-accent/40 border-primary/10 shadow-md">
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Questionário Concluído!</h3>
          <p className="text-sm text-muted-foreground">
            Sua mensagem de coragem foi gerada. Veja acima no termômetro!
          </p>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Refazer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="bg-gradient-to-br from-secondary/60 to-accent/40 border-primary/10 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <ClipboardList className="w-5 h-5 text-primary" />
          Como Você Está?
        </CardTitle>
        <div className="flex gap-1 mt-2">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                idx <= currentQuestion ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground font-medium">{question.text}</p>

        <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-2">
          {question.options.map((option) => (
            <div
              key={option.value}
              className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                selectedOption === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-accent/30'
              }`}
              onClick={() => setSelectedOption(option.value)}
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="flex-1 cursor-pointer text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Button
          onClick={handleNext}
          disabled={!selectedOption}
          className="w-full gap-2"
        >
          {currentQuestion < questions.length - 1 ? 'Próxima' : 'Finalizar'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
