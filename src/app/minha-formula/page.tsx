'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Info, 
  CheckCircle2, 
  ChevronRight, 
  Beaker, 
  ShieldAlert, 
  MapPin, 
  Store,
  RefreshCw,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { LocalPlanChatbot } from '@/components/chat/LocalPlanChatbot';

export default function MyFormulaPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const loadData = async () => {
    setLoading(true);
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

    if (m?.first_login_required) {
      router.push('/primeiro-acesso');
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

    if (plan) {
      setData(plan.gemini_response);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [router, supabase]);

  const handleGenerateNow = async () => {
    setGenerating(true);
    try {
      console.log('[MyFormula] Iniciando geração manual de fórmula...');
      
      // Buscar o perfil da pessoa
      const { data: profile } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('member_id', member.id)
        .single();
      
      if (!profile) {
        console.warn('[MyFormula] Perfil não encontrado, enviando para onboarding');
        router.push('/onboarding');
        return;
      }

      const response = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          profileId: profile.id,
          data: {
            name: member.name,
            age: profile.age,
            heightCm: profile.height_cm,
            weightKg: profile.current_weight_kg,
            imc: profile.imc
          }
        })
      });

      const resData = await response.json();
      if (!resData.ok) {
        throw new Error(resData.error || 'Falha ao gerar fórmula');
      }

      console.log('[MyFormula] Geração concluída com sucesso!');
      
      // DEFINIR DADOS DIRETAMENTE PARA ATUALIZAÇÃO INSTANTÂNEA NA UI
      if (resData.plan) {
        setData(resData.plan);
      } else {
        // Fallback: recarregar do banco se o objeto não vier completo
        await loadData();
      }

    } catch (err: any) {
      console.error('[MyFormula] Erro ao gerar agora:', err);
      alert('Erro ao calcular sua dose: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Beaker className="w-12 h-12 text-green-600 animate-bounce mx-auto mb-4" />
          <p className="text-green-800 font-medium tracking-wide">Buscando sua fórmula exclusiva...</p>
        </div>
      </div>
    );
  }

  // Estado: Usuário concluiu onboarding mas não tem fórmula gerada
  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center space-y-6 border border-slate-100">
          <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto text-green-600">
            <Beaker className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Fórmula Pendente</h1>
            <p className="text-slate-500">Seus dados foram salvos, mas sua fórmula personalizada ainda não foi gerada.</p>
          </div>
          <button 
            onClick={handleGenerateNow}
            disabled={generating}
            className="btn-primary w-full shadow-xl shadow-green-100 flex items-center justify-center gap-3"
          >
            {generating ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {generating ? 'Gerando Fórmula...' : 'Gerar Minha Fórmula Agora'}
          </button>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 text-sm font-bold hover:text-slate-600"
          >
            Voltar para o Início
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      <div className="bg-white border-b border-slate-100 p-6 sticky top-0 z-30 flex items-center justify-between">
        <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-400" />
        </button>
        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">O Seu Mapa da Dose</h1>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-12 mt-4">
        {/* Headline Card Premium */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-600 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-green-100 relative overflow-hidden"
        >
          <div className="relative z-10 space-y-4">
            <div className="inline-flex bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Protocolo Exclusivo</div>
            <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">{data.headline}</h2>
            <p className="opacity-90 leading-relaxed text-lg font-medium">{data.profileSummary}</p>
          </div>
          <Sparkles className="absolute -bottom-4 -right-4 w-40 h-40 text-white opacity-10" />
        </motion.div>

        {/* Warning Alert Refined */}
        <div className="bg-amber-50 border border-amber-100 p-5 rounded-[1.5rem] flex gap-4 items-start shadow-sm">
          <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <p className="text-sm text-amber-800 font-medium leading-relaxed">
            Esta é uma orientação educativa baseada em ativos naturais. <span className="font-bold underline">Não substitui orientação médica</span>. A manipulação deve ser feita apenas por profissionais habilitados.
          </p>
        </div>

        {/* Ingredients Revealed Grid */}
        <section className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
             <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                <FileText className="w-6 h-6" />
             </div>
             Ingredientes Revelados
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {data.ingredients.map((ing: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-6"
              >
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 text-2xl font-black">
                    {ing.name[0]}
                  </div>
                  <span className="bg-slate-50 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{ing.focus}</span>
                </div>
                
                <div>
                  <h4 className="text-2xl font-black text-slate-900 mb-4">{ing.name}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                      <Beaker className="w-5 h-5 text-green-600" />
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dosagem Sugerida</p>
                         <p className="text-slate-900 font-bold">{ing.dose || ing.amount} {ing.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                      <Store className="w-5 h-5 text-green-600" />
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Melhor Horário</p>
                         <p className="text-slate-900 font-bold">{ing.timing || ing.howToUse}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {(ing.reason || ing.simpleExplanation) && (
                  <div className="pt-6 border-t border-slate-50">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Por que foi indicado?</p>
                    <p className="text-slate-500 text-sm leading-relaxed italic">"{ing.reason || ing.simpleExplanation}"</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- NOVO: MAPA DAS FARMÁCIAS --- */}
        <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
           <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                 <h3 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <MapPin className="w-8 h-8 text-green-400" />
                    Onde Manipular?
                 </h3>
                 <p className="text-slate-400 leading-relaxed font-medium">Preparamos uma lista de farmácias de manipulação recomendadas que atendem todo o Brasil e garantem a pureza dos ingredientes revelados no seu protocolo.</p>
              </div>

              <div className="grid gap-4">
                 <PharmacyCard 
                    name="Farmácia BioFórmulas (Recomendada)"
                    location="Atendimento Nacional via WhatsApp"
                    benefit="Desconto de 10% para alunas da Bariátrica Caseira"
                 />
                 <PharmacyCard 
                    name="Naturale Manipulação"
                    location="Envio SEDEX para todo o Brasil"
                    benefit="Frete grátis na primeira manipulação da fórmula"
                 />
                 <PharmacyCard 
                    name="Sua Farmácia Local"
                    location="Procure farmácias com selo de qualidade ANVISA"
                    benefit="Apresente sua fórmula ao farmacêutico responsável"
                 />
              </div>

              <div className="bg-green-600/20 border border-green-400/30 p-6 rounded-3xl text-center">
                 <p className="text-sm font-bold text-green-100 mb-4">Deseja receber sua fórmula pronta em casa?</p>
                 <button className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-green-900/50 hover:bg-green-700 transition-all flex items-center gap-2 mx-auto">
                    Chamar Farmácia no WhatsApp <ChevronRight className="w-5 h-5" />
                 </button>
              </div>
           </div>
           <MapPin className="absolute -top-10 -right-10 w-60 h-60 text-white/5" />
        </section>

        {/* Usage Plan Refined */}
        <section className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <Info className="w-6 h-6" />
             </div>
             Instruções de Uso
          </h3>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap font-medium">
              {data.howToUse || data.usagePlan || data.dailyPlan || "Siga as orientações de dosagem para cada ingrediente acima."}
            </p>
          </div>
        </section>

        {/* Footer Note */}
        <footer className="text-center pt-8 text-sm text-slate-400 italic">
          <p>{(data.warnings || []).join(' • ')}</p>
        </footer>

        {/* Chatbot Local Sem API */}
        <LocalPlanChatbot planData={data} />
      </div>
    </main>
  );
}

function PharmacyCard({ name, location, benefit }: { name: string, location: string, benefit: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
       <div className="space-y-1">
          <h4 className="font-bold text-green-400">{name}</h4>
          <p className="text-xs text-slate-300 flex items-center gap-1">
             <MapPin className="w-3 h-3" /> {location}
          </p>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-tighter group-hover:text-white/60">{benefit}</p>
       </div>
       <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-green-400 transition-colors" />
    </div>
  );
}
