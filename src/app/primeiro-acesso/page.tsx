'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrimeiroAcessoPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Verificar se realmente precisa de primeiro acesso
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (member && !member.first_login_required) {
        console.log('[PrimeiroAcesso] Senha já alterada, redirecionando...');
        router.push(member.onboarding_completed ? '/dashboard' : '/onboarding');
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      // 1. Atualizar senha no Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: password
      });

      if (authError) throw authError;

      // 2. OBRIGATÓRIO: Atualizar status via API segura (contorna RLS)
      console.log('[PrimeiroAcesso] Solicitando liberação de acesso via API...');
      const response = await fetch('/api/member/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          updates: { first_login_required: false }
        })
      });

      const resData = await response.json();

      if (!resData.ok) {
        console.error('[PrimeiroAcesso] Erro na API:', resData.error);
        throw new Error('Senha alterada, mas não conseguimos liberar seu acesso automático. Tente fazer login novamente.');
      }

      console.log('[PrimeiroAcesso] Sucesso total! Redirecionando...');
      
      // 3. Persistência local adicional para controle de UI rápida
      localStorage.setItem('bc_first_login_done', 'true');
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/onboarding');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao processar troca de senha:', error);
      setError(error.message || 'Ocorreu um erro ao atualizar sua senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-primary-very-light flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="bg-white rounded-3xl shadow-2xl p-8 border border-green-50"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-100">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Segurança em Primeiro Lugar</h1>
                <p className="text-gray-500 mt-2">Crie uma nova senha pessoal para acessar sua área de membros.</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha secreta"
                      className="w-full bg-gray-50 border-none rounded-2xl px-12 py-4 text-gray-900 focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Confirme a Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-gray-50 border-none rounded-2xl px-12 py-4 text-gray-900 focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full shadow-xl shadow-green-100"
                >
                  {loading ? 'Atualizando...' : 'Definir Nova Senha'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-10 text-center border border-green-50"
            >
              <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Tudo Pronto!</h2>
              <p className="text-gray-500 mt-2 mb-8">Sua senha foi atualizada com sucesso. Vamos configurar seu perfil agora.</p>
              
              <div className="inline-flex items-center gap-2 text-primary font-bold animate-pulse">
                Iniciando Onboarding <ChevronRight className="w-5 h-5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
