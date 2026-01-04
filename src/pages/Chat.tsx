import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Shield, Clock, Trash2, MapPin, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useSupportChat, ChatMessage } from '@/hooks/useSupportChat';
import BottomNav from '@/components/layout/BottomNav';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, isLoading, isInitializing, sendMessage, clearHistory } = useSupportChat();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle virtual keyboard on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const newKeyboardHeight = windowHeight - viewportHeight;
        setKeyboardHeight(newKeyboardHeight > 0 ? newKeyboardHeight : 0);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const message = inputMessage;
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    await clearHistory();
    toast.success('Histórico limpo com sucesso');
  };

  const navigateToRadar = () => {
    navigate('/mapa');
  };

  if (!user) return null;

  return (
    <div 
      className="fixed inset-0 bg-background flex flex-col"
      style={{ 
        paddingBottom: keyboardHeight > 0 ? keyboardHeight : 80 
      }}
    >
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-3 py-3 flex items-center gap-3 flex-shrink-0 safe-area-top">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-primary-foreground hover:bg-white/20 h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
          <Heart className="h-5 w-5 text-white" fill="currentColor" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-base truncate">Elas</h1>
          <p className="text-xs text-primary-foreground/80">Acolhimento • Online</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/20 h-9 w-9"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Limpar histórico?</AlertDialogTitle>
              <AlertDialogDescription>
                Todas as mensagens serão excluídas permanentemente. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearHistory}>
                Limpar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      {/* Info Banners - Collapsible on scroll */}
      <div className="px-3 py-2 space-y-1.5 flex-shrink-0 bg-background">
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-2.5 flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-[11px] text-green-700 dark:text-green-300 leading-tight">
            Conversas criptografadas e privadas
          </p>
        </div>
        <div className="flex gap-1.5">
          <div className="flex-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-2 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-tight">
              Histórico expira em 24h
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={navigateToRadar}
            className="border-primary/30 text-primary hover:bg-primary/5 rounded-xl h-auto py-2 px-3"
          >
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span className="text-[11px]">Delegacias</span>
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="py-3 space-y-3 min-h-full flex flex-col">
          {isInitializing ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom, above keyboard */}
      <div className="flex-shrink-0 p-3 pt-2 bg-background border-t border-border/50 safe-area-bottom">
        <div className="flex gap-2 items-center bg-muted/50 rounded-full pl-4 pr-1.5 py-1.5">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            autoComplete="off"
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
            className="h-9 w-9 rounded-full flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Nav - Only show when keyboard is hidden */}
      {keyboardHeight === 0 && <BottomNav />}
    </div>
  );
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
            : 'bg-muted text-foreground rounded-2xl rounded-bl-sm'
        } px-4 py-2.5 shadow-sm`}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <p
          className={`text-[10px] mt-1 text-right ${
            isUser ? 'text-primary-foreground/60' : 'text-muted-foreground'
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};

export default Chat;
