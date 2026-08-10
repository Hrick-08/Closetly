'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/Button';
import { Send, Sparkles, User as UserIcon } from 'lucide-react';

export default function ChatPage() {
  const { messages, sendMessage, loading } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput('');
  };

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  const suggestions = [
    "What should I wear for a casual date night?",
    "Help me style my black denim jacket.",
    "What staple items am I missing in my closet?",
    "Suggest a professional outfit for an interview."
  ];

  return (
    <div className="h-[calc(100vh-6rem)] max-w-4xl mx-auto flex flex-col bg-surface border border-border rounded-xl overflow-hidden shadow-sm animate-fadeIn">
      <div className="p-4 border-b border-border bg-background/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg leading-none">AI Stylist</h2>
          <p className="text-xs text-text-secondary mt-1">Powered by your closet data</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Hello! I'm your personal stylist.</h3>
            <p className="text-text-secondary mb-8">
              I can help you put together outfits, identify missing pieces, or give fashion advice based on the items in your closet.
            </p>
            <div className="grid gap-3 w-full">
              {suggestions.map((text, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(text)}
                  className="px-4 py-3 text-sm text-left bg-background border border-border rounded-lg hover:border-accent hover:text-accent transition-colors shadow-sm"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-accent text-white rounded-tr-sm' 
                  : 'bg-background border border-border text-text-primary rounded-tl-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'system' && (
                  <p className="text-xs mt-2 text-error font-medium">{msg.content}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-highlight/20 text-highlight flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-background border border-border rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-text-secondary/50 animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-text-secondary/50 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-text-secondary/50 animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your stylist..."
            disabled={loading}
            className="flex-1 bg-surface border border-border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent disabled:opacity-50 transition-colors"
          />
          <Button 
            type="submit" 
            disabled={loading || !input.trim()} 
            className="w-12 h-12 rounded-full p-0 shrink-0 shadow-sm"
          >
            <Send className="w-5 h-5 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
}
