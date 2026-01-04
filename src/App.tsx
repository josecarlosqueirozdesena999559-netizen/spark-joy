import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PermissionModal } from "@/components/permissions/PermissionModal";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { SplashScreen as WebSplashScreen } from "@/components/auth/SplashScreen";
import { SplashScreen } from "@capacitor/splash-screen";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Mapa from "./pages/Mapa";
import Cofre from "./pages/Cofre";
import Conteudo from "./pages/Conteudo";
import Emergencia from "./pages/Emergencia";
import Perfil from "./pages/Perfil";
import Notificacoes from "./pages/Notificacoes";
import Chat from "./pages/Chat";
import Termos from "./pages/Termos";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component
// Component to handle push notifications initialization
const PushNotificationsHandler = () => {
  usePushNotifications();
  return null;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [permissionsReady, setPermissionsReady] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <PushNotificationsHandler />
      <PermissionModal onPermissionGranted={() => setPermissionsReady(true)} />
      {permissionsReady && children}
    </>
  );
};

// App Routes component (inside AuthProvider)
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mapa"
        element={
          <ProtectedRoute>
            <Mapa />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cofre"
        element={
          <ProtectedRoute>
            <Cofre />
          </ProtectedRoute>
        }
      />
      <Route
        path="/conteudo"
        element={
          <ProtectedRoute>
            <Conteudo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emergencia"
        element={
          <ProtectedRoute>
            <Emergencia />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notificacoes"
        element={
          <ProtectedRoute>
            <Notificacoes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route path="/termos" element={<Termos />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      console.log("App carregado, preparando transição...");
      
      // Aguarda a animação do Lovable renderizar o 1º frame
      setTimeout(async () => {
        try {
          // Remove a tela estática do Android com fade suave
          await SplashScreen.hide({
            fadeOutDuration: 500
          });
          console.log("Splash nativo removido.");
        } catch (error) {
          // Evita erro no navegador do PC
          console.warn("SplashScreen plugin não disponível no navegador.");
        }
      }, 800);
    };

    initializeApp();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] overflow-hidden">
        <WebSplashScreen onComplete={handleSplashComplete} />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
