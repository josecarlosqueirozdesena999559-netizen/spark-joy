import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { hashPassword, verifyPassword } from '@/lib/encryption';

interface VaultAuthProps {
  onAuthenticated: (password: string) => void;
}

export const VaultAuth = ({ onAuthenticated }: VaultAuthProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has a vault password set
    const storedHash = localStorage.getItem('vault_password_hash');
    setIsNewUser(!storedHash);
    setLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (isNewUser) {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }
      // Store password hash locally
      const hash = hashPassword(password);
      localStorage.setItem('vault_password_hash', hash);
      onAuthenticated(password);
    } else {
      // Verify password
      const storedHash = localStorage.getItem('vault_password_hash');
      if (storedHash && verifyPassword(password, storedHash)) {
        onAuthenticated(password);
      } else {
        setError('Senha incorreta');
      }
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            {isNewUser ? 'Configure seu Cofre' : 'Acesse seu Cofre'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isNewUser 
              ? 'Crie uma senha exclusiva para proteger suas evidências. Esta senha criptografa seus dados.'
              : 'Digite sua senha do cofre para acessar suas evidências.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="vault-password">Senha do Cofre</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="vault-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="pl-10 pr-10"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isNewUser && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirme a Senha</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  className="pl-10"
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg">
            <Shield className="w-4 h-4 mr-2" />
            {isNewUser ? 'Criar Cofre Seguro' : 'Desbloquear'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {isNewUser 
              ? 'Guarde bem esta senha. Sem ela, não será possível recuperar seus dados.'
              : 'Seus dados estão criptografados e seguros.'
            }
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
