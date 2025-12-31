import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { SignInForm } from '@/components/auth/SignInForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { SplashScreen } from '@/components/auth/SplashScreen';
import { useAuth } from '@/contexts/AuthContext';

type AuthView = 'splash' | 'login' | 'signup' | 'forgot-password';

const Auth: React.FC = () => {
  const [view, setView] = useState<AuthView>('splash');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSplashComplete = () => {
    setView('login');
  };

  const handleAuthSuccess = () => {
    navigate('/');
  };

  if (view === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gradient-soft safe-area-inset">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">PorElas</h1>
            <p className="text-sm text-muted-foreground">
              {view === 'login' && 'Bem-vinda de volta'}
              {view === 'signup' && 'Crie sua conta'}
              {view === 'forgot-password' && 'Recuperar senha'}
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            {view === 'login' && (
              <SignInForm
                onSuccess={handleAuthSuccess}
                onSwitchToSignUp={() => setView('signup')}
                onForgotPassword={() => setView('forgot-password')}
              />
            )}
            {view === 'signup' && (
              <SignUpForm
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setView('login')}
              />
            )}
            {view === 'forgot-password' && (
              <ForgotPasswordForm onBack={() => setView('login')} />
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2024 PorElas. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Auth;