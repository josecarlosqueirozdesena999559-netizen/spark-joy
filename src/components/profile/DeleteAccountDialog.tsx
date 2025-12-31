import React, { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountDeleted: () => void;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  open,
  onOpenChange,
  onAccountDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.rpc('soft_delete_account');
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Conta desativada',
        description: 'Sua conta foi desativada com sucesso.',
      });
      
      onOpenChange(false);
      onAccountDeleted();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desativar sua conta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <DialogTitle className="text-xl">Excluir minha conta</DialogTitle>
          <DialogDescription className="text-left mt-4 text-muted-foreground leading-relaxed">
            Ao confirmar, seus dados serão desativados e não estarão mais visíveis para outras usuárias.
            {'\n\n'}
            Conforme a regulamentação vigente (LGPD), manteremos as informações arquivadas por um período de segurança antes da exclusão definitiva.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col gap-2 sm:flex-col mt-4">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="w-full rounded-full"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sim, excluir minha conta
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full rounded-full"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
