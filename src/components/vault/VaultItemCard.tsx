import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Image, Video, Trash2, Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { VaultItem } from '@/hooks/useVault';

interface VaultItemCardProps {
  item: VaultItem;
  onDelete: (id: string, filePath?: string | null) => void;
  decryptContent: (content: string) => string | null;
}

export const VaultItemCard = ({ item, onDelete, decryptContent }: VaultItemCardProps) => {
  const [showContent, setShowContent] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getIcon = () => {
    switch (item.item_type) {
      case 'photo':
        return <Image className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (item.item_type) {
      case 'photo':
        return 'Foto';
      case 'video':
        return 'Vídeo';
      default:
        return 'Mensagem';
    }
  };

  const decryptedContent = item.encrypted_content && showContent 
    ? decryptContent(item.encrypted_content) 
    : null;

  const decryptedFileName = item.file_name 
    ? decryptContent(item.file_name) 
    : null;

  const decryptedNotes = item.notes && showContent 
    ? decryptContent(item.notes) 
    : null;

  const formattedDate = format(new Date(item.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {getIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{getTypeLabel()}</span>
                  <Lock className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">{formattedDate}</p>
                {item.file_size && (
                  <p className="text-xs text-muted-foreground">
                    {decryptedFileName || 'Arquivo criptografado'} • {formatFileSize(item.file_size)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowContent(!showContent)}
                className="h-8 w-8"
              >
                {showContent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showContent && (
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              {decryptedContent && (
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-sm whitespace-pre-wrap">{decryptedContent}</p>
                </div>
              )}
              {decryptedNotes && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Observações:</span> {decryptedNotes}
                </div>
              )}
              {item.item_type !== 'text' && (
                <p className="text-xs text-muted-foreground italic">
                  Arquivo criptografado armazenado com segurança
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evidência?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O item será permanentemente removido do seu cofre.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(item.id, item.encrypted_file_path)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
