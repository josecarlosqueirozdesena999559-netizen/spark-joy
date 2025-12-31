import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ClipboardList, ChevronRight, Shield, AlertTriangle } from 'lucide-react';
import { useSubmitQuestionnaire } from '@/hooks/useDenunciaStats';
import { toast } from 'sonner';

const tiposAgressao = [
  { value: 'psicologica', label: 'Violência Psicológica', description: 'Humilhação, controle, ameaças' },
  { value: 'fisica', label: 'Violência Física', description: 'Agressões corporais' },
  { value: 'sexual', label: 'Violência Sexual', description: 'Abuso ou assédio sexual' },
  { value: 'patrimonial', label: 'Violência Patrimonial', description: 'Controle financeiro, destruição de bens' },
  { value: 'moral', label: 'Violência Moral', description: 'Calúnia, difamação, injúria' },
  { value: 'outra', label: 'Outro tipo', description: 'Outra forma de violência' },
];

interface DenunciaQuestionnaireProps {
  onComplete: () => void;
}

export const DenunciaQuestionnaire: React.FC<DenunciaQuestionnaireProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [tipoAgressao, setTipoAgressao] = useState<string>('');
  const [denunciou, setDenunciou] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitMutation = useSubmitQuestionnaire();

  const handleNext = () => {
    if (step === 1 && tipoAgressao) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (tipoAgressao && denunciou !== null) {
      setIsSubmitting(true);
      try {
        await submitMutation.mutateAsync({ tipoAgressao, denunciou });
        toast.success('Obrigada por compartilhar sua história. Sua coragem inspira outras mulheres.');
        onComplete();
      } catch (error) {
        console.error('Error submitting questionnaire:', error);
        toast.error('Erro ao enviar. Tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card className="bg-gradient-to-br from-secondary/60 to-accent/40 border-primary/10 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <ClipboardList className="w-5 h-5 text-primary" />
          Sua Voz Importa
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Suas respostas são anônimas e ajudam outras mulheres
        </p>
        {/* Progress indicator */}
        <div className="flex gap-1 mt-3">
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 1 && (
          <>
            <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
              <p className="text-xs text-foreground">
                Se você está em perigo agora, ligue <span className="font-bold">180</span> (Central de Atendimento à Mulher)
              </p>
            </div>

            <p className="text-sm text-foreground font-medium">
              Qual tipo de violência você vivenciou ou está vivenciando?
            </p>

            <RadioGroup value={tipoAgressao} onValueChange={setTipoAgressao} className="space-y-2">
              {tiposAgressao.map((tipo) => (
                <div
                  key={tipo.value}
                  className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    tipoAgressao === tipo.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-accent/30'
                  }`}
                  onClick={() => setTipoAgressao(tipo.value)}
                >
                  <RadioGroupItem value={tipo.value} id={tipo.value} />
                  <Label htmlFor={tipo.value} className="flex-1 cursor-pointer">
                    <span className="text-sm font-medium">{tipo.label}</span>
                    <span className="text-xs text-muted-foreground block">{tipo.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button onClick={handleNext} disabled={!tipoAgressao} className="w-full gap-2">
              Próximo
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-foreground font-medium">
              Você já fez alguma denúncia formal (delegacia, Ministério Público, etc.)?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDenunciou(true)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  denunciou === true
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <span className="text-sm font-medium">Sim, denunciei</span>
              </button>

              <button
                onClick={() => setDenunciou(false)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  denunciou === false
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <span className="text-sm font-medium">Ainda não</span>
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Não há resposta certa. Cada jornada é única e válida.
            </p>

            <Button 
              onClick={handleSubmit} 
              disabled={denunciou === null || isSubmitting} 
              className="w-full gap-2"
            >
              {isSubmitting ? 'Enviando...' : 'Compartilhar Minha Voz'}
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => setStep(1)} 
              className="w-full text-xs"
            >
              Voltar
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
