import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Check, X, Loader2, ArrowLeft, ArrowRight, User, Mail, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AvatarSelector } from './AvatarSelector';
import { TermsCheckbox } from './TermsCheckbox';
import { useUsernameCheck } from '@/hooks/useUsernameCheck';
import { signUpSchema, SignUpFormData, getPasswordStrength } from '@/lib/validation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface SignUpFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

type Step = 1 | 2 | 3 | 4;

const AVATAR_LABELS: Record<string, string> = {
  heart: '❤️ Coração',
  star: '⭐ Estrela',
  flower: '🌸 Flor',
  butterfly: '🦋 Borboleta',
  sun: '☀️ Sol',
  moon: '🌙 Lua',
};

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      avatarIcon: 'heart',
      termsAccepted: false as unknown as true,
    },
  });

  const username = form.watch('username');
  const email = form.watch('email');
  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');
  const avatarIcon = form.watch('avatarIcon');
  const termsAccepted = form.watch('termsAccepted');
  
  const { isAvailable, isChecking, suggestions } = useUsernameCheck(username);
  const passwordStrength = getPasswordStrength(password);

  const canProceedStep1 = username.length >= 3 && isAvailable && !isChecking;
  const canProceedStep2 = email.length > 0 && !form.formState.errors.email;
  const canProceedStep3 = password.length >= 8 && confirmPassword === password && !form.formState.errors.password && !form.formState.errors.confirmPassword;
  const canSubmit = termsAccepted && canProceedStep1 && canProceedStep2 && canProceedStep3;

  const nextStep = () => {
    if (step < 4) setStep((s) => (s + 1) as Step);
  };

  const prevStep = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const onSubmit = async (data: SignUpFormData) => {
    if (!isAvailable) {
      toast({
        title: 'Nome de usuário indisponível',
        description: 'Por favor, escolha outro nome de usuário.',
        variant: 'destructive',
      });
      return;
    }

    setIsRegistering(true);
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.username, data.avatarIcon);
    setIsLoading(false);

    if (error) {
      setIsRegistering(false);
      let message = 'Ocorreu um erro ao criar sua conta.';
      if (error.message?.includes('already registered')) {
        message = 'Este e-mail já está cadastrado.';
      }
      toast({
        title: 'Erro no cadastro',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Verifique seu e-mail para confirmar o cadastro.',
      });
      onSuccess();
    }
  };

  const progress = (step / 4) * 100;

  // Registration Animation Screen
  if (isRegistering) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-fade-in">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-soft">
            <Sparkles className="w-12 h-12 text-primary animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Criando sua conta...</h3>
          <p className="text-sm text-muted-foreground">
            Estamos preparando tudo para você
          </p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Etapa {step} de 4</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Username & Avatar */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-4">
              <User className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">Identidade</h3>
              <p className="text-xs text-muted-foreground">Escolha seu nome e avatar</p>
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de usuário</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="seu_usuario"
                        className="rounded-xl pr-10"
                        autoComplete="username"
                      />
                      {username.length >= 3 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isChecking ? (
                            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                          ) : isAvailable ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  {username.length >= 3 && !isChecking && (
                    <p className={`text-xs ${isAvailable ? 'text-green-500' : 'text-destructive'}`}>
                      {isAvailable ? 'Nome disponível ✓' : 'Nome já em uso'}
                    </p>
                  )}
                  {/* Username suggestions when taken */}
                  {!isChecking && isAvailable === false && suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground">Sugestões disponíveis:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => field.onChange(suggestion)}
                            className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                          >
                            @{suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatarIcon"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AvatarSelector selected={field.value} onSelect={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 2: Email */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-4">
              <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">E-mail</h3>
              <p className="text-xs text-muted-foreground">Para recuperação de conta</p>
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="seu@email.com"
                      className="rounded-xl"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 3: Password */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-4">
              <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">Senha</h3>
              <p className="text-xs text-muted-foreground">Crie uma senha segura</p>
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="rounded-xl pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  {password.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i < passwordStrength.score ? passwordStrength.color : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${passwordStrength.color.replace('bg-', 'text-')}`}>
                        Força: {passwordStrength.label}
                      </p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="rounded-xl pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 4: Review & Terms */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-4">
              <Check className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">Revisão</h3>
              <p className="text-xs text-muted-foreground">Confirme seus dados</p>
            </div>

            {/* Data Preview */}
            <div className="bg-accent/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Usuário</span>
                <span className="text-sm font-medium text-foreground">@{username}</span>
              </div>
              <div className="border-t border-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">E-mail</span>
                <span className="text-sm font-medium text-foreground">{email}</span>
              </div>
              <div className="border-t border-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avatar</span>
                <span className="text-sm font-medium text-foreground">{AVATAR_LABELS[avatarIcon] || avatarIcon}</span>
              </div>
              <div className="border-t border-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Senha</span>
                <span className="text-sm font-medium text-foreground">••••••••</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TermsCheckbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="flex-1 rounded-full h-12"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          
          {step < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3)
              }
              className="flex-1 rounded-full h-12"
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1 rounded-full h-12 text-base font-semibold"
              disabled={isLoading || !canSubmit}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary font-medium hover:underline"
          >
            Entrar
          </button>
        </p>
      </form>
    </Form>
  );
};
