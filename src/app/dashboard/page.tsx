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
  FileText,
  User,
  Heart,
  ArrowRight,
  Gift
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
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
      
      if (m?.first_login_required) {
        router.push('/primeiro-acesso');
        return;
      }

      if (!m?.onboarding_completed) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative">
            <Beaker className="w-12 h-12 text-green-600 animate-pulse mx-auto mb-4" />
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-green-400 animate-bounce" />
          </div>
          <p className="text-green-800 font-medium tracking-wide">Preparando seu espaço...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar Desktop - Ultra Clean */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col sticky top-0 h-screen z-30">
        <div className="p-8">
          <div className="flex items-center mb-12">
            <img src="https://ik.imagekit.io/decoimgsfunil/Logo_Bariatrica_Caseira.webp" alt="Bariátrica Caseira" className="h-9 w-auto" />
          </div>

          <nav className="space-y-1.5">
            <NavItem icon={<LayoutDashboard />} label="Início" active href="/dashboard" />
            <NavItem icon={<Beaker />} label="Minha Fórmula" href="/minha-formula" />
            <NavItem icon={<BookOpen />} label="Biblioteca de Materiais" href="/bonus" />
            <NavItem icon={<TrendingUp />} label="Meu Acompanhamento" href="/medidas" />
            <NavItem icon={<MessageSquare />} label="Falar com a Carol" href="/assistente" />
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-6">
          <div className="p-5 bg-green-50 rounded-3xl border border-green-100 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Assinatura Ativa</p>
              <p className="text-sm text-green-900 font-bold">Premium Vitalício</p>
            </div>
            <Heart className="absolute -bottom-2 -right-2 w-16 h-16 text-green-200/50 group-hover:scale-110 transition-transform" />
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition-all w-full px-4 py-2 text-sm font-semibold group"
          >
            <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-5 lg:hidden sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <img src="https://ik.imagekit.io/decoimgsfunil/Logo_Bariatrica_Caseira.webp" alt="Bariátrica Caseira" className="h-7 w-auto" />
            <button onClick={handleLogout} className="bg-slate-50 p-2 rounded-xl text-slate-400">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <section className="p-6 lg:p-12 max-w-6xl mx-auto w-full space-y-12">
          {/* Welcome Section - Refined */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">Área de Membros</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Olá, {member.name.split(' ')[0]} 💚
              </h1>
              <p className="text-slate-500 text-lg max-w-lg leading-relaxed">
                Bom te ver por aqui. Seu espaço de autocuidado está pronto para continuarmos sua jornada.
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/medidas')}
              className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-green-100 hover:bg-green-700 transition-all"
            >
              <Plus className="w-5 h-5" /> Novo Registro
            </motion.button>
          </div>

          {/* Main Action Cards - The Journey */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/minha-formula" className="outline-none group">
              <motion.div 
                whileHover={{ y: -8 }}
                className="bg-green-600 h-full p-8 rounded-[2rem] shadow-2xl shadow-green-100 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                    <Beaker className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 underline decoration-white/20 underline-offset-4">Minha Fórmula</h3>
                  <p className="text-green-50 text-sm leading-relaxed opacity-90">Sua combinação exclusiva de ingredientes revelados e orientações de uso.</p>
                </div>
                <div className="relative z-10 mt-6 flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                  Ver detalhes <ArrowRight className="w-4 h-4" />
                </div>
                {/* Visual Polish */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <Sparkles className="absolute top-8 right-8 w-12 h-12 text-white/10 animate-pulse" />
              </motion.div>
            </Link>

            <Link href="/bonus" className="outline-none group">
              <motion.div 
                whileHover={{ y: -8 }}
                className="bg-white h-full p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-orange-500">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Materiais</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Acesse seus guias, receitas e conteúdos complementares liberados para você.</p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-orange-500 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                  Explorar conteúdo <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>

            <Link href="/medidas" className="outline-none group">
              <motion.div 
                whileHover={{ y: -8 }}
                className="bg-white h-full p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Meus Resultados</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Registre suas medidas e acompanhe sua evolução física ao longo das semanas.</p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                  Ver progresso <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Secondary Grid */}
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Library / Content Column */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  Biblioteca do Protocolo
                </h3>
                <Link href="/bonus" className="text-green-600 text-xs font-black uppercase tracking-widest hover:underline px-4 py-2 bg-green-50 rounded-xl">Ver Tudo</Link>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <ContentCard 
                  title="100 Receitas Seca-Barriga" 
                  desc="Sugestões práticas para facilitar sua rotina alimentar."
                  tag="E-book"
                />
                <ContentCard 
                  title="Guia Saúde Intestinal" 
                  desc="Orientações simples para apoiar seu fluxo diário."
                  tag="Guia"
                />
                <ContentCard 
                  title="Protocolo Anti-Compulsão" 
                  desc="Estratégias mentais para dominar a saciedade."
                  tag="Estratégia"
                />
                <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-6 text-center opacity-60">
                   <Plus className="w-8 h-8 text-slate-300 mb-2" />
                   <p className="text-xs font-bold text-slate-400 uppercase">Novos materiais em breve</p>
                </div>
              </div>

              {/* Support CTA - More Human */}
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                <div className="bg-green-50 p-6 rounded-3xl text-green-600 shrink-0">
                  <MessageSquare className="w-12 h-12" />
                </div>
                <div className="flex-1 text-center md:text-left space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Precisa de auxílio agora?</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    A Carol, nossa guia virtual, entende tudo sobre seu plano e materiais. Ela está pronta para te orientar sobre sua rotina e próximos passos.
                  </p>
                  <button 
                    onClick={() => router.push('/assistente')}
                    className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-green-100 inline-flex items-center gap-2"
                  >
                    Falar com a Carol <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/50 rounded-full blur-3xl -mr-10 -mt-10" />
              </div>
            </div>

            {/* Sidebar Column - Account & Next Step */}
            <div className="space-y-8">
              {/* Next Step / Upsell Refined */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 space-y-6">
                  <div className="inline-flex bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-green-400">
                    Etapa Avançada
                  </div>
                  <h3 className="text-xl font-bold leading-tight">Deseja acelerar ainda mais sua jornada?</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">Conheça o Protocolo de Aceleração Intensa para otimizar seus resultados biológicos.</p>
                  <button className="w-full bg-white text-slate-900 py-3 rounded-2xl font-black text-xs uppercase tracking-widest group-hover:scale-105 transition-transform">
                    Saiba mais
                  </button>
                </div>
                <Gift className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5" />
              </div>

              {/* Account Management */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-600" />
                  Minha Conta
                </h3>
                <div className="space-y-1">
                  <AccountLink label="Alterar minha senha" />
                  <AccountLink label="Meus dados do perfil" />
                  <AccountLink label="Configurações de Privacidade" />
                  <AccountLink label="Termos de Uso" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Nav Mobile - Premium Style */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 flex justify-around p-4 z-50 rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <MobileNavItem icon={<LayoutDashboard />} label="Início" active />
          <MobileNavItem icon={<Beaker />} label="Fórmula" href="/minha-formula" />
          <MobileNavItem icon={<BookOpen />} label="Materiais" href="/bonus" />
          <MobileNavItem icon={<TrendingUp />} label="Evolução" href="/medidas" />
        </nav>

        {/* Chatbot Local Sem API */}
        <LocalPlanChatbot planData={member} />
      </div>
    </main>
  );
}

function NavItem({ icon, label, active, href }: { icon: React.ReactElement, label: string, active?: boolean, href: string }) {
  return (
    <Link 
      href={href}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all text-sm group ${
        active 
          ? 'bg-green-600 text-white shadow-xl shadow-green-100' 
          : 'text-slate-400 hover:bg-slate-50 hover:text-green-600'
      }`}
    >
      {cloneElement(icon as React.ReactElement<any>, { className: `w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-green-600'}` })}
      <span>{label}</span>
    </Link>
  );
}

function MobileNavItem({ icon, label, active, href = '#' }: { icon: React.ReactElement, label: string, active?: boolean, href?: string }) {
  return (
    <Link 
      href={href}
      className={`flex flex-col items-center gap-1.5 px-4 py-1 transition-all ${active ? 'text-green-600' : 'text-slate-300'}`}
    >
      <div className={`${active ? 'bg-green-50 p-2 rounded-xl' : ''}`}>
        {cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </Link>
  );
}

function ContentCard({ title, desc, tag }: { title: string, desc: string, tag: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md hover:border-green-100 transition-all group cursor-pointer flex flex-col justify-between min-h-[140px]">
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">{tag}</span>
          <FileText className="w-4 h-4 text-slate-200 group-hover:text-green-500 transition-colors" />
        </div>
        <h4 className="text-sm font-black text-slate-900 group-hover:text-green-600 transition-colors mb-2">{title}</h4>
        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}

function AccountLink({ label }: { label: string }) {
  return (
    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-[13px] font-bold text-slate-600 hover:text-green-600 flex items-center justify-between group transition-all">
      {label}
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
    </button>
  );
}
