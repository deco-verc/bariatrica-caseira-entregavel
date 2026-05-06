'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { MessageSquare, Send, Bot, User, Loader2, ChevronLeft, ShieldAlert, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { format } from 'date-fns';

export default function AssistantPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: m } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setMember(m);

      const { data: msgs } = await supabase
        .from('assistant_messages')
        .select('*')
        .eq('member_id', m.id)
        .order('created_at', { ascending: true });
      
      if (msgs && msgs.length > 0) {
        setMessages(msgs);
      } else {
        // Welcome message
        setMessages([
          {
            role: 'assistant',
            content: `Olá, ${m.name.split(' ')[0]}! Eu sou sua assistente da Bariátrica Caseira. 💚\n\nEstou aqui para tirar suas dúvidas sobre o método, os bônus ou como usar sua fórmula. Como posso te ajudar hoje?`,
            created_at: new Date().toISOString()
          }
        ]);
      }
      setInitialLoading(false);
    };
    loadData();
  }, [router, supabase]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: input,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Save user message to DB
      await supabase.from('assistant_messages').insert({
        member_id: member.id,
        role: 'user',
        content: userMsg.content
      });

      // Call API
      const response = await fetch('/api/chat/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          messages: [...messages, userMsg].slice(-10) // Send context
        })
      });

      if (!response.ok) throw new Error('Falha na resposta da assistente');

      const data = await response.json();
      const assistantMsg = {
        role: 'assistant',
        content: data.content,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Save assistant message to DB
      await supabase.from('assistant_messages').insert({
        member_id: member.id,
        role: 'assistant',
        content: assistantMsg.content
      });

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, tive um probleminha técnico. Pode repetir a pergunta?',
        created_at: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return null;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        title="Assistente IA" 
        rightElement={
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">Online</span>
          </div>
        }
      />

      {/* Warning Bar */}
      <div className="bg-primary-very-light text-primary text-[10px] font-bold p-2 text-center uppercase tracking-wider flex items-center justify-center gap-2 border-b border-primary-light">
        <ShieldAlert className="w-3 h-3" />
        Conteúdo Educativo • Não substitui orientação médica
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border ${
                  msg.role === 'user' ? 'bg-white border-gray-100 text-gray-400' : 'bg-primary border-primary text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 px-1">
                    {format(new Date(msg.created_at), 'HH:mm')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[70%]">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white border border-primary">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs text-gray-400 font-medium">Assistente escrevendo...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida aqui..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-700"
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-green-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 mt-4 px-8 leading-relaxed">
            Nossa IA pode cometer erros. Sempre consulte um profissional de saúde para orientações médicas específicas.
          </p>
        </div>
      </div>
    </main>
  );
}
