'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChatbotResponse } from '@/lib/chatbot/getChatbotResponse';
import { SUGGESTED_QUESTIONS } from '@/lib/chatbot/chatbotRules';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function LocalPlanChatbot({ planData }: { planData: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou seu guia local. Posso te ajudar com dúvidas sobre seus horários, como usar os ingredientes ou resultados. Como posso te apoiar hoje? 💚' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Resposta simulada (instantânea pois é local)
    setTimeout(() => {
      const response = getChatbotResponse(text, planData);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center gap-2"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="hidden md:inline font-bold">Dúvidas Rápidas</span>
      </button>

      {/* Janela do Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 max-w-[90vw] h-[500px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">Guia Bariátrica</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Assistente Local • Sem IA</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggested Tags */}
            <div className="p-3 bg-white border-t border-gray-50 flex gap-2 overflow-x-auto no-scrollbar">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(q)}
                  className="whitespace-nowrap px-3 py-1.5 bg-gray-100 rounded-full text-[11px] text-gray-600 hover:bg-primary-very-light hover:text-primary transition-colors font-medium border border-gray-200"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text" 
                value={input}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua dúvida..."
                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <button 
                onClick={() => handleSend(input)}
                className="bg-primary text-white p-2 rounded-xl"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
