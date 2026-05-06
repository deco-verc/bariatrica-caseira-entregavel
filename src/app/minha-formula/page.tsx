'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Sparkles, Info, Lock, CheckCircle2, ChevronRight, Beaker, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { LocalPlanChatbot } from '@/components/chat/LocalPlanChatbot';

export default function MyFormulaPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
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
      
      if (m?.first_login_required) {
        router.push('/primeiro-acesso');
        return;
      }
      
      if (!m?.onboarding_completed) {
        router.push('/onboarding');
        return;
      }

      // Get latest formula plan
      const { data: plan } = await supabase
        .from('formula_plans')
        .select('*')
        .eq('member_id', m.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!plan) {
        router.push('/onboarding');
        return;
      }

      setData(plan.gemini_response);
      setLoading(false);
    };
    loadData();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-very-light">
        <div className="text-center">
          <Beaker className="w-12 h-12 text-primary animate-bounce mx-auto mb-4" />
          <p className="text-primary font-medium">Carregando sua fórmula personalizada...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Header title="Minha Fórmula" />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Headline Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary text-white p-8 rounded-3xl shadow-xl shadow-green-100 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{data.headline}</h2>
            <p className="opacity-90 leading-relaxed text-lg">{data.profileSummary}</p>
          </div>
          <Sparkles className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10" />
        </motion.div>

        {/* Warning Alert */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl flex gap-3">
          <ShieldAlert className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800 italic">
            Esta é uma orientação educativa baseada em ingredientes naturais. Consulte sempre um profissional de saúde antes de iniciar qualquer suplementação.
          </p>
        </div>

        {/* Ingredients Section */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            Ingredientes Revelados
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.ingredients.map((ing: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="card-premium p-6"
              >
                <div className="w-12 h-12 bg-primary-very-light rounded-xl flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">{ing.name[0]}</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">{ing.name}</h4>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{ing.focus}</p>
                <div className="text-xs bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2 mt-auto">
                  <p><strong>Dose Sugerida:</strong> {ing.dose || ing.amount} {ing.unit}</p>
                  <p><strong>Melhor Horário:</strong> {ing.timing || ing.howToUse}</p>
                  {(ing.reason || ing.simpleExplanation) && (
                    <p className="pt-2 text-primary font-medium border-t border-gray-200 mt-2">
                      <strong>Por que foi indicado:</strong> {ing.reason || ing.simpleExplanation}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Todos os ingredientes agora são renderizados dinamicamente pelo array data.ingredients */}
          </div>
        </section>

        {/* Usage Plan */}
        <section className="card-premium p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-6 h-6 text-primary" />
            Seu Plano de Uso
          </h3>
          <div className="prose prose-green max-w-none text-gray-600">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">
              {data.howToUse || data.usagePlan || data.dailyPlan || "Siga as orientações de dosagem para cada ingrediente acima."}
            </p>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Seus Primeiros Passos</h3>
          <div className="grid gap-3">
            {data.nextSteps.map((step: string, i: number) => (
              <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 items-start">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-bold">
                  {i + 1}
                </div>
                <p className="text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <footer className="text-center pt-8 text-sm text-gray-400">
          <p>{(data.warnings || []).join(' • ')}</p>
        </footer>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 left-6 right-6">
          <button 
            onClick={() => router.push('/dashboard')}
            className="btn-primary w-full max-w-md mx-auto flex shadow-2xl"
          >
            Ir para o Dashboard <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Chatbot Local Sem API */}
        <LocalPlanChatbot planData={data} />
      </div>
    </main>
  );
}
