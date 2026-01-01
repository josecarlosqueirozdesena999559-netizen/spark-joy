import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { encryptData, decryptData } from '@/lib/encryption';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const CHAT_ENCRYPTION_KEY = 'porelas-chat-secure-2024';

export const useSupportChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load existing messages on mount
  useEffect(() => {
    if (!user) {
      setIsInitializing(false);
      return;
    }

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
          const decryptedMessages: ChatMessage[] = data.map((msg: any) => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            content: decryptData(msg.encrypted_content, CHAT_ENCRYPTION_KEY) || '[Mensagem não disponível]',
            created_at: msg.created_at,
          }));
          setMessages(decryptedMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    loadMessages();
  }, [user]);

  // Get initial greeting if no messages
  useEffect(() => {
    if (!isInitializing && messages.length === 0 && user && !isLoading) {
      getInitialGreeting();
    }
  }, [isInitializing, messages.length, user]);

  const getInitialGreeting = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://mmgaqfddxoliltgjpfzk.supabase.co/functions/v1/support-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZ2FxZmRkeG9saWx0Z2pwZnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTM1MTgsImV4cCI6MjA4Mjc2OTUxOH0.lF2elnUw_xI_ZBrYcvNpFH89wETZzyI1vpP-W1L6AxE`,
          },
          body: JSON.stringify({ messages: [], isFirstMessage: true }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to get greeting');
      }

      let assistantContent = '';
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) assistantContent += content;
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      if (assistantContent) {
        const newMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: assistantContent,
          created_at: new Date().toISOString(),
        };

        setMessages([newMessage]);
        await saveMessage(newMessage);
      }
    } catch (error) {
      console.error('Error getting greeting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessage = async (message: ChatMessage) => {
    if (!user) return;

    const encryptedContent = encryptData(message.content, CHAT_ENCRYPTION_KEY);

    await supabase.from('chat_messages').insert({
      id: message.id,
      user_id: user.id,
      encrypted_content: encryptedContent,
      role: message.role,
    });
  };

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);
    setIsLoading(true);

    try {
      const messagesForAPI = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(
        `https://mmgaqfddxoliltgjpfzk.supabase.co/functions/v1/support-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZ2FxZmRkeG9saWx0Z2pwZnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTM1MTgsImV4cCI6MjA4Mjc2OTUxOH0.lF2elnUw_xI_ZBrYcvNpFH89wETZzyI1vpP-W1L6AxE`,
          },
          body: JSON.stringify({ messages: messagesForAPI, isFirstMessage: false }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to send message');
      }

      let assistantContent = '';
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      // Create placeholder for streaming
      const assistantId = crypto.randomUUID();
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            if (deltaContent) {
              assistantContent += deltaContent;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantId 
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      if (assistantContent) {
        await saveMessage({
          id: assistantId,
          role: 'assistant',
          content: assistantContent,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;

    await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', user.id);

    setMessages([]);
  };

  return {
    messages,
    isLoading,
    isInitializing,
    sendMessage,
    clearHistory,
  };
};
