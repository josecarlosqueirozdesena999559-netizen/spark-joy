import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { SignInForm } from '@/components/auth/SignInForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { useAuth } from '@/contexts/AuthContext';
import { Capacitor } from '@capacitor/core';
import { SplashScreen as CapacitorSplash } from '@capacitor/splash-screen';
import { SplashScreen } from '@/components/auth/SplashScreen';
import porelasLogo from '@/assets/porelas-logo.png';

type AuthView = 'splash' | 'login' | 'signup' | 'forgot-password';

const Auth: React.FC = () => {
  // No nativo, splash é gerenciado pelo Capacitor; na web, usamos o componente React
  const isNative = Capacitor.isNativePlatform();
  const [view, setView] = useState<AuthView>(isNative ? 'login' : 'splash');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Esconde o splash nativo quando o app estiver pronto
    if (isNative) {
      CapacitorSplash.hide({ fadeOutDuration: 500 });
    }
  }, [isNative]);

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

  // Na web, mostra o splash React; no nativo, pula direto para login
  if (view === 'splash' && !isNative) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 gradient-soft safe-area-inset">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <img 
              src={porelasLogo} 
              alt="PorElas" 
              className="w-24 h-24 object-cover rounded-full"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {view === 'login' && 'Bem-vinda de volta'}
            {view === 'signup' && 'Crie sua conta'}
            {view === 'forgot-password' && 'Recuperar senha'}
          </p>
        </div>

        <div className="space-y-4">
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
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2025 PorElas. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Auth;