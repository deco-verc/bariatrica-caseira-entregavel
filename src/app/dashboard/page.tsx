'use client';

import React, { useState, useEffect, cloneElement } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronRight,
  Plus,
  Beaker,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LocalPlanChatbot } from '@/components/chat/LocalPlanChatbot';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
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
      
      // 1. Prioridade máxima: Primeiro Acesso (Troca de senha)
      if (m?.first_login_required) {
        console.log('[Dashboard] Primeiro acesso pendente, redirecionando...');
        router.push('/primeiro-acesso');
        return;
      }

      // 2. Segunda prioridade: Onboarding (Quiz)
      if (!m?.onboarding_completed) {
        console.log('[Dashboard] Onboarding pendente, redirecionando...');
        router.push('/onboarding');
        return;
      }

      setMember(m);
      setLoading(false);
    };
    loadUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return null;

  return (
    <main className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center mb-10">
            <img src="https://ik.imagekit.io/decoimgsfunil/Logo_Bariatrica_Caseira.webp" alt="Bariátrica Caseira" className="h-10 w-auto" />
          </div>

          <nav className="space-y-2">
            <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active onClick={() => {}} />
            <NavItem icon={<Beaker className="w-5 h-5" />} label="Minha Fórmula" onClick={() => router.push('/minha-formula')} />
            <NavItem icon={<BookOpen className="w-5 h-5" />} label="Bônus e PDFs" onClick={() => router.push('/bonus')} />
            <NavItem icon={<TrendingUp className="w-5 h-5" />} label="Medidas" onClick={() => router.push('/medidas')} />
            <NavItem icon={<MessageSquare className="w-5 h-5" />} label="Assistente IA" onClick={() => router.push('/assistente')} />
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-4">
          <div className="p-4 bg-primary-very-light rounded-2xl">
            <p className="text-xs font-bold text-primary uppercase mb-1">Status do Acesso</p>
            <p className="text-sm text-green-800 font-semibold">Plano Bariátrica Premium</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors w-full px-4 py-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 p-6 lg:hidden sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="https://ik.imagekit.io/decoimgsfunil/Logo_Bariatrica_Caseira.webp" alt="Bariátrica Caseira" className="h-8 w-auto" />
            </div>
            <button onClick={handleLogout} className="text-gray-400">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </header>

        <section className="p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-8">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Olá, {member.name.split(' ')[0]}! 💚</h1>
              <p className="text-gray-500 mt-1">Bem-vinda de volta ao seu protocolo personalizado.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => router.push('/medidas')}
                className="btn-primary"
              >
                <Plus className="w-5 h-5" /> Nova Medida
              </button>
            </div>
          </div>

          {/* Quick Stats / Highlights */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => router.push('/minha-formula')}
              className="card-premium p-6 bg-primary cursor-pointer text-white border-none shadow-xl shadow-green-100 relative overflow-hidden"
            >
              <div className="relative z-10">
                <Sparkles className="w-8 h-8 opacity-40 mb-4" />
                <h3 className="text-xl font-bold mb-1">Sua Fórmula IA</h3>
                <p className="text-white/80 text-sm mb-6">Acesse seu plano personalizado de ingredientes revelados.</p>
                <div className="flex items-center font-bold text-sm">
                  Ver agora <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => router.push('/bonus')}
              className="card-premium p-6 cursor-pointer"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 text-orange-500">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Bônus Exclusivos</h3>
              <p className="text-gray-500 text-sm mb-6">Acesse seus guias, cardápios e protocolos extras.</p>
              <div className="flex items-center text-orange-500 font-bold text-sm">
                Explorar bônus <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => router.push('/medidas')}
              className="card-premium p-6 cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Minha Evolução</h3>
              <p className="text-gray-500 text-sm mb-6">Acompanhe seu peso e medidas corporais por 8 semanas.</p>
              <div className="flex items-center text-blue-500 font-bold text-sm">
                Ver resultados <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          </div>

          {/* Main Grid Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Col: Activity & Recent */}
            <div className="lg:col-span-2 space-y-8">
              <div className="card-premium p-0">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    Biblioteca de PDFs Rápidos
                  </h3>
                  <button onClick={() => router.push('/bonus')} className="text-primary text-sm font-bold">Ver todos</button>
                </div>
                <div className="divide-y divide-gray-50">
                  <PDFBriefItem 
                    title="100 Receitas Seca-Barriga" 
                    desc="Café, Almoço e Jantar" 
                    type="E-book"
                  />
                  <PDFBriefItem 
                    title="Guia Saúde Intestinal" 
                    desc="Protocolo de 7 dias" 
                    type="Guia Prático"
                  />
                  <PDFBriefItem 
                    title="Protocolo Anti-Compulsão" 
                    desc="Estratégias de mentalidade" 
                    type="Treinamento"
                  />
                </div>
              </div>

              <div className="bg-primary-very-light p-8 rounded-3xl border border-primary-light flex items-center gap-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm text-primary">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900 mb-1">Dúvida sobre o protocolo?</h3>
                  <p className="text-green-800 text-sm opacity-80 mb-4">Nossa IA Assistente está pronta para te ajudar 24h por dia.</p>
                  <button 
                    onClick={() => router.push('/assistente')}
                    className="bg-primary text-white px-6 py-2 rounded-xl font-bold text-sm"
                  >
                    Falar com Assistente
                  </button>
                </div>
              </div>
            </div>

            {/* Right Col: Upsell & Progress */}
            <div className="space-y-8">
              <div className="card-premium p-6 bg-white border-2 border-primary-light shadow-green-50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-yellow-400 p-1.5 rounded-lg">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-gray-900">Upsell Liberado?</span>
                </div>
                <p className="text-sm text-gray-600 mb-6">Aumente seus resultados com o Protocolo Avançado.</p>
                <button className="btn-outline w-full text-sm">Saiba Mais</button>
              </div>

              <div className="card-premium p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-400" />
                  Configurações
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-600">Alterar minha senha</button>
                  <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-600">Dados do perfil</button>
                  <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-600">Acordo de uso</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Nav Mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex p-3 z-30">
          <MobileNavItem icon={<LayoutDashboard />} label="Início" active />
          <MobileNavItem icon={<Beaker />} label="Fórmula" onClick={() => router.push('/minha-formula')} />
          <MobileNavItem icon={<BookOpen />} label="Bônus" onClick={() => router.push('/bonus')} />
          <MobileNavItem icon={<TrendingUp />} label="Medidas" onClick={() => router.push('/medidas')} />
        </nav>

        {/* Chatbot Local Sem API */}
        <LocalPlanChatbot planData={member} />
      </div>
    </main>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all ${
        active 
          ? 'bg-primary text-white shadow-lg shadow-green-100' 
          : 'text-gray-500 hover:bg-primary-very-light hover:text-primary'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MobileNavItem({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-1 ${active ? 'text-primary' : 'text-gray-400'}`}
    >
      {cloneElement(icon, { className: 'w-6 h-6' })}
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function PDFBriefItem({ title, desc, type }: { title: string, desc: string, type: string }) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-primary-very-light transition-colors">
          <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <span className="text-[10px] h-fit bg-primary-very-light text-primary px-2 py-1 rounded-full font-bold uppercase tracking-wider">{type}</span>
    </div>
  );
}
