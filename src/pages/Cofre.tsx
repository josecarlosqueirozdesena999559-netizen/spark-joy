import React, { useState, useEffect } from 'react';
import { Lock, Plus, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useVault } from '@/hooks/useVault';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/layout/BottomNav';
import { MotivationalBanner } from '@/components/shared/MotivationalBanner';
import { VaultAuth } from '@/components/vault/VaultAuth';
import { VaultItemCard } from '@/components/vault/VaultItemCard';
import { AddVaultItemDialog } from '@/components/vault/AddVaultItemDialog';
import { GenerateReportButton } from '@/components/vault/GenerateReportButton';

const Cofre: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || '';
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vaultPassword, setVaultPassword] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { items, loading, fetchItems, addTextItem, addFileItem, deleteItem, decryptContent } = useVault(userId, vaultPassword);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchItems();
    }
  }, [isAuthenticated, userId, fetchItems]);

  // Show vault authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <VaultAuth 
          onAuthenticated={(password) => {
            setVaultPassword(password);
            setIsAuthenticated(true);
          }} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-area-inset pb-20">
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-2 px-4 h-14 max-w-lg mx-auto">
          <Lock className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Meu Cofre</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <MotivationalBanner />

        {/* Info card */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground text-sm">Cofre Seguro</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Seus arquivos são criptografados antes de serem enviados. Apenas você, com sua senha, pode visualizá-los.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-4">
          <Button onClick={() => setShowAddDialog(true)} className="flex-1 gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Evidência
          </Button>
          <GenerateReportButton items={items} decryptContent={decryptContent} />
        </div>

        {/* Items list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Cofre vazio</h3>
            <p className="text-muted-foreground text-sm">
              Adicione fotos, vídeos ou mensagens para guardar com segurança.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <VaultItemCard
                key={item.id}
                item={item}
                onDelete={deleteItem}
                decryptContent={decryptContent}
              />
            ))}
          </div>
        )}
      </main>

      <AddVaultItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddText={addTextItem}
        onAddFile={addFileItem}
      />

      <BottomNav />
    </div>
  );
};

export default Cofre;
