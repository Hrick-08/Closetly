'use client';

import { useState } from 'react';
import { ChatMessage } from '@/types';
import { api } from '@/lib/api';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const sendMessage = async (text: string) => {
    setLoading(true);
    const userMsg: ChatMessage = { role: 'user', content: text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      const data = await api.chat.sendMessage(text, sessionId);
      if (data.sessionId && !sessionId) setSessionId(data.sessionId);
      
      const assistantMsg: ChatMessage = { 
        role: 'assistant', 
        content: data.reply, 
        createdAt: new Date().toISOString() 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = { 
        role: 'system', 
        content: 'Failed to get response. Please try again.', 
        createdAt: new Date().toISOString() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (id: string) => {
    setLoading(true);
    try {
      const session = await api.chat.getSession(id);
      setMessages(session.messages || []);
      setSessionId(id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sessionId, sendMessage, loadSession };
};
