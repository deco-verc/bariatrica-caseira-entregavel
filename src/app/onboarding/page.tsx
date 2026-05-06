'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, Activity, Ruler, Weight, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<{ message: string; details?: string } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
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
      
      if (m?.onboarding_completed) {
        console.log('[Onboarding] Usuário já concluiu, redirecionando para dashboard...');
        router.push('/dashboard');
        return;
      }
      setMember(m);
      if (m?.name) {
        setFormData(prev => ({ ...prev, name: m.name }));
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const calculateIMC = (w: number, h: number) => {
    const hMeter = h / 100;
    return w / (hMeter * hMeter);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError(null);
    try {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const age = parseInt(formData.age);
      const imc = calculateIMC(weight, height);

      // 1. Create/Update member profile
      const { data: profile, error: profileError } = await supabase
        .from('member_profiles')
        .upsert({
          member_id: member.id,
          age,
          height_cm: height,
          current_weight_kg: weight,
          imc,
          onboarding_completed: true
        }, { onConflict: 'member_id' })
        .select()
        .single();

      if (profileError) throw profileError;

      // 2. Update member status
      await supabase
        .from('members')
        .update({ onboarding_completed: true, name: formData.name })
        .eq('id', member.id);

      // 3. Generate Formula with Gemini via API
      const response = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          profileId: profile.id,
          data: {
            name: formData.name,
            age,
            heightCm: height,
            weightKg: weight,
            imc
          }
        })
      });

      const resData = await response.json();
      
      if (!resData.ok) {
        throw new Error(resData.error || 'Falha ao gerar fórmula');
      }

      // Se usou fallback, podemos opcionalmente logar ou mostrar um toast
      if (resData.usedFallback) {
        console.warn('Nota: Usado cálculo local (IA indisponível)');
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error in onboarding submission:', error);
      setSubmitError({
        message: 'Não conseguimos gerar sua fórmula agora. Tente de novo em alguns instantes.',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !member) return null;

  const steps = [
    {
      title: "Qual o seu nome?",
      description: "Como gostaria de ser chamada na plataforma?",
      icon: <User className="w-12 h-12 text-primary" />,
      field: "name",
      placeholder: "Seu nome completo",
      type: "text"
    },
    {
      title: "Qual sua idade?",
      description: "Isso nos ajuda a entender sua fase metabólica.",
      icon: <Activity className="w-12 h-12 text-primary" />,
      field: "age",
      placeholder: "Ex: 35",
      type: "number",
      min: 18,
      max: 99
    },
    {
      title: "Qual sua altura?",
      description: "Em centímetros (ex: 165).",
      icon: <Ruler className="w-12 h-12 text-primary" />,
      field: "height",
      placeholder: "Ex: 165",
      type: "number",
      min: 120,
      max: 230
    },
    {
      title: "Qual seu peso atual?",
      description: "Seja sincera, este é o nosso ponto de partida.",
      icon: <Weight className="w-12 h-12 text-primary" />,
      field: "weight",
      placeholder: "Ex: 75.5",
      type: "number",
      min: 35,
      max: 250
    }
  ];

  const currentStepData = steps[step - 1];

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4, 5].map((s) => (
            <div 
              key={s} 
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-gray-100'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step <= 4 ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="bg-primary-very-light w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  {currentStepData.icon}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentStepData.title}</h1>
                <p className="text-gray-500 text-lg">{currentStepData.description}</p>
              </div>

              <div>
                <input
                  type={currentStepData.type}
                  value={formData[currentStepData.field as keyof typeof formData]}
                  onChange={(e) => setFormData({ ...formData, [currentStepData.field]: e.target.value })}
                  className="form-input text-center text-2xl font-semibold"
                  placeholder={currentStepData.placeholder}
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                {step > 1 && (
                  <button onClick={handleBack} className="btn-outline flex-1">
                    <ArrowLeft className="w-5 h-5" /> Voltar
                  </button>
                )}
                <button 
                  onClick={handleNext} 
                  disabled={!formData[currentStepData.field as keyof typeof formData]}
                  className="btn-primary flex-1 shadow-lg shadow-green-100"
                >
                  Continuar <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="bg-primary-very-light w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Tudo pronto, {formData.name.split(' ')[0]}!</h1>
                <p className="text-gray-500 text-lg">
                  Nossa inteligência artificial está pronta para gerar sua fórmula baseada nos seus dados.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left space-y-3">
                <p className="flex justify-between"><strong>Idade:</strong> <span>{formData.age} anos</span></p>
                <p className="flex justify-between"><strong>Altura:</strong> <span>{formData.height} cm</span></p>
                <p className="flex justify-between"><strong>Peso:</strong> <span>{formData.weight} kg</span></p>
                <p className="flex justify-between"><strong>IMC:</strong> <span>{calculateIMC(parseFloat(formData.weight), parseFloat(formData.height)).toFixed(1)}</span></p>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="btn-primary w-full shadow-xl shadow-green-200 py-4 text-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" /> Gerando sua fórmula...
                    </>
                  ) : (
                    'Gerar Minha Fórmula Personalizada'
                  )}
                </button>
                <button onClick={handleBack} disabled={loading} className="text-gray-500 hover:underline">
                  Revisar dados
                </button>
              </div>

              {submitError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-left">
                  <p className="text-red-700 font-medium text-sm">{submitError.message}</p>
                  {process.env.NODE_ENV === 'development' && submitError.details && (
                    <p className="text-[10px] text-red-400 mt-2 font-mono">Erro: {submitError.details}</p>
                  )}
                  <button 
                    onClick={handleSubmit}
                    className="mt-3 text-xs font-bold text-red-600 uppercase tracking-wider hover:underline"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
