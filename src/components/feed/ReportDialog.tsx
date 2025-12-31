import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId?: string;
  commentId?: string;
  reportedUserId?: string;
  reporterId: string;
  onReportSuccess: () => void;
}

const reportReasons = [
  { value: 'agressao', label: 'Agressão ou ameaça', description: 'Conteúdo que ameaça ou intimida' },
  { value: 'odio', label: 'Discurso de ódio', description: 'Ataques baseados em identidade' },
  { value: 'impróprio', label: 'Conteúdo impróprio', description: 'Nudez, spam ou desinformação' },
  { value: 'assedio', label: 'Assédio', description: 'Comportamento abusivo direcionado' },
];

const ReportDialog: React.FC<ReportDialogProps> = ({
  open,
  onOpenChange,
  postId,
  commentId,
  reportedUserId,
  reporterId,
  onReportSuccess,
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setLoading(true);
    const reasonLabel = reportReasons.find(r => r.value === selectedReason)?.label || selectedReason;

    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        post_id: postId || null,
        comment_id: commentId || null,
        reported_user_id: reportedUserId || null,
        reason: reasonLabel,
      });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a denúncia.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Denúncia enviada',
        description: 'Obrigada por ajudar a manter nossa comunidade segura. O conteúdo foi ocultado do seu feed.',
      });
      onReportSuccess();
      onOpenChange(false);
    }
    setLoading(false);
    setSelectedReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">Denunciar Conteúdo</DialogTitle>
          <DialogDescription className="text-center">
            Selecione o motivo da denúncia. Sua identidade será mantida em sigilo.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="space-y-3 mt-4">
          {reportReasons.map((reason) => (
            <div
              key={reason.value}
              className={`flex items-start gap-3 p-3 rounded-2xl border transition-colors cursor-pointer ${
                selectedReason === reason.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-secondary/50'
              }`}
              onClick={() => setSelectedReason(reason.value)}
            >
              <RadioGroupItem value={reason.value} id={reason.value} className="mt-0.5" />
              <Label htmlFor={reason.value} className="cursor-pointer flex-1">
                <span className="font-medium text-foreground">{reason.label}</span>
                <p className="text-sm text-muted-foreground mt-0.5">{reason.description}</p>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-full"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || loading}
            className="flex-1 rounded-full bg-destructive hover:bg-destructive/90"
          >
            {loading ? 'Enviando...' : 'Enviar Denúncia'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
