'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, ChevronLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/primeiro-acesso`,
      });

      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao solicitar recuperação.');
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
        <button 
          onClick={() => router.push('/login')}
          className="flex items-center gap-2 text-gray-500 font-medium hover:text-primary transition-colors mb-8"
        >
          <ChevronLeft className="w-5 h-5" /> Voltar para o login
        </button>

        <div className="card-premium p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-primary-very-light rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">E-mail enviado!</h1>
              <p className="text-gray-500 mb-8">
                Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada e spam.
              </p>
              <button 
                onClick={() => setSuccess(false)}
                className="text-primary font-bold hover:underline"
              >
                Tentar outro e-mail
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar Senha</h1>
                <p className="text-gray-500 text-sm">Digite seu e-mail para receber um link de acesso.</p>
              </div>

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
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Link de Recuperação'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </main>
  );
}
