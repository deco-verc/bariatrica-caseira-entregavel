'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Settings, User, Lock, Bell, ChevronLeft, Save, Loader2, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
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
      setLoading(false);
    };
    loadData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return null;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-100 p-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-500 font-medium hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Voltar
          </button>
          <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
          <div className="w-10 lg:w-20"></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Minha Conta</h2>
          
          <div className="card-premium divide-y divide-gray-50">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary-very-light rounded-full flex items-center justify-center text-primary border border-primary-light">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nome Completo</label>
                  <input type="text" defaultValue={member.name} className="form-input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">E-mail</label>
                  <input type="email" defaultValue={member.email} disabled className="form-input text-sm bg-gray-50 cursor-not-allowed" />
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-400" />
                Senha e Segurança
              </h3>
              <button 
                onClick={() => router.push('/reset-password')}
                className="btn-outline py-2 text-sm"
              >
                Solicitar alteração de senha
              </button>
            </div>

            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-red-500">
                <LogOut className="w-5 h-5" />
                Sair
              </h3>
              <p className="text-sm text-gray-500 mb-4">Deseja encerrar sua sessão atual neste dispositivo?</p>
              <button 
                onClick={handleLogout}
                className="text-red-500 font-bold hover:underline py-2 text-sm"
              >
                Encerrar sessão
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Suporte e Legal</h2>
          <div className="card-premium p-2">
            <button className="w-full text-left p-4 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 flex justify-between items-center group">
              Termos de Uso
              <span className="text-gray-300 group-hover:text-primary transition-colors">→</span>
            </button>
            <button className="w-full text-left p-4 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 flex justify-between items-center group">
              Políticas de Privacidade
              <span className="text-gray-300 group-hover:text-primary transition-colors">→</span>
            </button>
            <button className="w-full text-left p-4 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700 flex justify-between items-center group text-red-500">
              Excluir minha conta
              <span className="text-red-300 group-hover:text-red-500 transition-colors">→</span>
            </button>
          </div>
        </section>

        <div className="text-center pt-8">
          <p className="text-xs text-gray-400 tracking-widest font-bold uppercase">Bariátrica Caseira v1.0.0</p>
        </div>
      </div>
    </main>
  );
}
