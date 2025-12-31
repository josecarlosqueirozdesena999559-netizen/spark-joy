import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { encryptData, decryptData, encryptFile } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';

export interface VaultItem {
  id: string;
  item_type: string;
  encrypted_content: string | null;
  encrypted_file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  notes: string | null;
  created_at: string;
}

export const useVault = (userId: string, password: string) => {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching vault items:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus itens',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  const addTextItem = async (content: string, notes?: string) => {
    try {
      const encryptedContent = encryptData(content, password);
      const encryptedNotes = notes ? encryptData(notes, password) : null;

      const { error } = await supabase
        .from('vault_items')
        .insert({
          user_id: userId,
          item_type: 'text',
          encrypted_content: encryptedContent,
          notes: encryptedNotes,
        });

      if (error) throw error;

      toast({
        title: 'Salvo!',
        description: 'Mensagem adicionada ao cofre',
      });

      fetchItems();
    } catch (error) {
      console.error('Error adding text item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a mensagem',
        variant: 'destructive',
      });
    }
  };

  const addFileItem = async (file: File, type: 'photo' | 'video', notes?: string) => {
    try {
      // Encrypt file content
      const encryptedContent = await encryptFile(file, password);
      const fileName = `${userId}/${Date.now()}_${file.name}.encrypted`;

      // Upload encrypted content as text file
      const { error: uploadError } = await supabase.storage
        .from('vault-files')
        .upload(fileName, new Blob([encryptedContent], { type: 'text/plain' }));

      if (uploadError) throw uploadError;

      const encryptedNotes = notes ? encryptData(notes, password) : null;
      const encryptedFileName = encryptData(file.name, password);

      const { error: dbError } = await supabase
        .from('vault_items')
        .insert({
          user_id: userId,
          item_type: type,
          encrypted_file_path: fileName,
          file_name: encryptedFileName,
          file_size: file.size,
          notes: encryptedNotes,
        });

      if (dbError) throw dbError;

      toast({
        title: 'Salvo!',
        description: `${type === 'photo' ? 'Foto' : 'Vídeo'} adicionado ao cofre`,
      });

      fetchItems();
    } catch (error) {
      console.error('Error adding file item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o arquivo',
        variant: 'destructive',
      });
    }
  };

  const deleteItem = async (id: string, filePath?: string | null) => {
    try {
      // Delete file from storage if exists
      if (filePath) {
        await supabase.storage.from('vault-files').remove([filePath]);
      }

      const { error } = await supabase
        .from('vault_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Removido',
        description: 'Item excluído do cofre',
      });

      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o item',
        variant: 'destructive',
      });
    }
  };

  const decryptContent = (encryptedContent: string): string | null => {
    return decryptData(encryptedContent, password);
  };

  return {
    items,
    loading,
    fetchItems,
    addTextItem,
    addFileItem,
    deleteItem,
    decryptContent,
  };
};
