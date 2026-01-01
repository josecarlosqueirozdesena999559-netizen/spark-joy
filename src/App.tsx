import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PermissionModal } from "@/components/permissions/PermissionModal";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
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

export default App;
