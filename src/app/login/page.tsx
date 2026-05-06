'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogIn, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFirstAccessInfo, setShowFirstAccessInfo] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  
  useEffect(() => {
    const updated = localStorage.getItem('bc_password_updated');
    if (updated === 'true') {
      setShowFirstAccessInfo(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      // Check if first login is required
      const { data: member } = await supabase
        .from('members')
        .select('first_login_required, onboarding_completed')
        .eq('user_id', data.user.id)
        .single();

      if (member?.first_login_required) {
        router.push('/primeiro-acesso');
      } else if (!member?.onboarding_completed) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      
      let errorMessage = 'Erro ao entrar. Verifique seus dados.';
      
      if (err.message === 'Invalid login credentials') {
        errorMessage = 'E-mail ou senha incorretos.';
      } else if (err.message === 'Email not confirmed') {
        errorMessage = 'Por favor, confirme seu e-mail antes de acessar.';
      } else if (err.message?.includes('rate limit')) {
        errorMessage = 'Muitas tentativas seguidas. Tente novamente em alguns minutos.';
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src="https://ik.imagekit.io/decoimgsfunil/Logo_Bariatrica_Caseira.webp" alt="Bariátrica Caseira" className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Acesse sua Bariátrica Caseira</h1>
          <p className="text-gray-500">Entre com o e-mail usado na compra.</p>
        </div>

        <div className="card-premium p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-11"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-11"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full shadow-lg shadow-green-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar na Plataforma'}
            </button>

            <div className="text-center">
              <button 
                type="button"
                className="text-primary font-medium hover:underline text-sm"
                onClick={() => router.push('/reset-password')}
              >
                Esqueci minha senha
              </button>
            </div>
          </form>
        </div>

        {showFirstAccessInfo && (
          <div className="mt-8 p-6 bg-primary-very-light border border-primary-light rounded-2xl text-center">
            <p className="text-sm text-green-800">
              <strong>Primeiro acesso?</strong> <br />
              Use a senha temporária enviada no seu e-mail logo após a compra.
            </p>
          </div>
        )}
      </motion.div>
    </main>
  );
}
