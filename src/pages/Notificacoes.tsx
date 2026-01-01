import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, Check, CheckCheck, Trash2, Heart, MessageCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

const notificationIcons: Record<string, React.ReactNode> = {
  support: <Heart className="w-5 h-5 text-primary" />,
  comment: <MessageCircle className="w-5 h-5 text-blue-500" />,
  report_analyzed: <AlertCircle className="w-5 h-5 text-warning" />,
};

const Notificacoes: React.FC = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    loading, 
    unreadCount,
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <header 
        className="sticky top-0 z-40 w-full"
        style={{ backgroundColor: '#e91e63' }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center ring-2 ring-white/40 hover:ring-white/60 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          <h1 className="text-lg font-semibold text-white">
            Notificações
          </h1>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-white hover:bg-white/20"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Ler todas
            </Button>
          )}
          
          {unreadCount === 0 && <div className="w-20" />}
        </div>
      </header>

      {/* Content */}
      <main className="w-full max-w-md mx-auto px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground mt-4">Carregando...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <BellOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Sem notificações</h3>
            <p className="text-muted-foreground text-sm text-center">
              Quando você receber apoios ou comentários, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'relative flex items-start gap-3 p-4 rounded-2xl transition-colors',
                  notification.read_at 
                    ? 'bg-card' 
                    : 'bg-primary/5 border border-primary/20'
                )}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  {notificationIcons[notification.type] || <Bell className="w-5 h-5 text-muted-foreground" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-foreground text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-muted-foreground text-sm mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                    
                    {/* Unread indicator */}
                    {!notification.read_at && (
                      <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      {!notification.read_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-7 px-2 text-xs"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Marcar lida
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notificacoes;
