'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, Activity, Ruler, Weight, ArrowRight, ArrowLeft, Loader2, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HOURS = [
  "05:00", "06:00", "07:00", "08:00", "09:00", "10:00",
  "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    preferred_time: ''
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
      
      if (m?.first_login_required) {
        console.log('[Onboarding] Primeiro acesso pendente, redirecionando para troca de senha...');
        router.push('/primeiro-acesso');
        return;
      }

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
    if (step < 6) setStep(step + 1);
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
          preferred_time: formData.preferred_time,
          onboarding_completed: true
        }, { onConflict: 'member_id' })
        .select()
        .single();

      if (profileError) throw profileError;

      // 2. Update member status via secure API
      const statusRes = await fetch('/api/member/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          updates: { 
            onboarding_completed: true, 
            name: formData.name 
          }
        })
      });

      const statusResData = await statusRes.json();
      if (!statusResData.ok) {
        throw new Error('Falha ao salvar progresso do onboarding.');
      }

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
            imc,
            preferredTime: formData.preferred_time
          }
        })
      });

      const resData = await response.json();
      
      if (!resData.ok) {
        throw new Error(resData.error || 'Falha ao gerar fórmula');
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
      icon: <User className="w-12 h-12 text-green-600" />,
      field: "name",
      placeholder: "Seu nome completo",
      type: "text"
    },
    {
      title: "Qual sua idade?",
      description: "Isso nos ajuda a entender sua fase metabólica.",
      icon: <Activity className="w-12 h-12 text-green-600" />,
      field: "age",
      placeholder: "Ex: 35",
      type: "number",
      min: 18,
      max: 99
    },
    {
      title: "Qual sua altura?",
      description: "Em centímetros (ex: 165).",
      icon: <Ruler className="w-12 h-12 text-green-600" />,
      field: "height",
      placeholder: "Ex: 165",
      type: "number",
      min: 120,
      max: 230
    },
    {
      title: "Qual seu peso atual?",
      description: "Seja sincera, este é o nosso ponto de partida.",
      icon: <Weight className="w-12 h-12 text-green-600" />,
      field: "weight",
      placeholder: "Ex: 75.5",
      type: "number",
      min: 35,
      max: 250
    },
    {
      title: "Qual o melhor horário para você?",
      description: "Escolha o horário que funciona melhor na sua rotina.",
      icon: <Clock className="w-12 h-12 text-green-600" />,
      field: "preferred_time",
      type: "time_selection"
    }
  ];

  const currentStepData = steps[step - 1];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Bar Premium */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div 
              key={s} 
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-green-600' : 'bg-slate-200'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step <= 5 ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              <div className="text-center mb-10">
                <div className="bg-green-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  {currentStepData.icon}
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{currentStepData.title}</h1>
                <p className="text-slate-500 text-lg leading-relaxed">{currentStepData.description ?? ''}</p>
              </div>

              <div className="mb-10">
                {currentStepData.type === 'time_selection' ? (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {HOURS.map((hour) => (
                      <button
                        key={hour}
                        onClick={() => {
                          setFormData({ ...formData, preferred_time: hour });
                          setTimeout(handleNext, 300);
                        }}
                        className={`py-3 px-2 rounded-2xl font-bold text-sm transition-all border-2 ${
                          formData.preferred_time === hour 
                            ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-100' 
                            : 'bg-slate-50 text-slate-500 border-transparent hover:border-green-200'
                        }`}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type={currentStepData.type}
                    value={(formData as any)[currentStepData.field]}
                    onChange={(e) => setFormData({ ...formData, [currentStepData.field as string]: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-center text-3xl font-black text-slate-900 focus:ring-4 focus:ring-green-100 transition-all placeholder:text-slate-200"
                    placeholder={currentStepData.placeholder}
                    autoFocus
                  />
                )}
              </div>

              <div className="flex gap-4">
                {step > 1 && (
                  <button onClick={handleBack} className="flex-1 flex items-center justify-center gap-2 py-4 text-slate-400 font-bold hover:text-slate-600">
                    <ArrowLeft className="w-5 h-5" /> Voltar
                  </button>
                )}
                {currentStepData.type !== 'time_selection' && (
                  <button 
                    onClick={handleNext} 
                    disabled={!(formData as any)[currentStepData.field]}
                    className="btn-primary flex-[2] shadow-xl shadow-green-100 py-5 text-xl"
                  >
                    Continuar <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center space-y-8"
            >
              <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl shadow-green-100">
                <Sparkles className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Tudo pronto, {formData.name.split(' ')[0]}!</h1>
                <p className="text-slate-500 text-lg leading-relaxed">
                  Nossa inteligência artificial está pronta para gerar sua fórmula baseada nos seus dados.
                </p>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-left grid grid-cols-2 gap-4">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Idade</p>
                   <p className="font-bold text-slate-900">{formData.age} anos</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Altura</p>
                   <p className="font-bold text-slate-900">{formData.height} cm</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso</p>
                   <p className="font-bold text-slate-900">{formData.weight} kg</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Melhor Horário</p>
                   <p className="font-bold text-slate-900">{formData.preferred_time}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="btn-primary w-full shadow-2xl shadow-green-200 py-6 text-xl rounded-3xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-white" /> Gerando sua fórmula...
                    </div>
                  ) : (
                    'Gerar Minha Fórmula Personalizada'
                  )}
                </button>
                <button onClick={() => setStep(1)} disabled={loading} className="text-slate-400 font-bold hover:underline py-2">
                  Revisar meus dados
                </button>
              </div>

              {submitError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-left">
                  <p className="text-red-700 font-medium text-sm">{submitError.message}</p>
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
