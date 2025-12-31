import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditAvatarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar: string;
  userId: string;
  onAvatarUpdated: () => void;
}

const avatarIcons: Record<string, string> = {
  heart: '❤️',
  star: '⭐',
  flower: '🌸',
  butterfly: '🦋',
  rainbow: '🌈',
  moon: '🌙',
  sun: '☀️',
  leaf: '🍃',
};

const EditAvatarDialog: React.FC<EditAvatarDialogProps> = ({
  open,
  onOpenChange,
  currentAvatar,
  userId,
  onAvatarUpdated,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (selectedAvatar === currentAvatar) {
      onOpenChange(false);
      return;
    }

    setLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_icon: selectedAvatar })
      .eq('id', userId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o avatar.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Atualizado!',
        description: 'Seu avatar foi alterado com sucesso.',
      });
      onOpenChange(false);
      onAvatarUpdated();
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Escolha seu avatar</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-4 gap-3 py-4">
          {Object.entries(avatarIcons).map(([key, icon]) => (
            <button
              key={key}
              onClick={() => setSelectedAvatar(key)}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${
                selectedAvatar === key
                  ? 'bg-primary/20 ring-2 ring-primary scale-110'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
        
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="rounded-full"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAvatarDialog;
