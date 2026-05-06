import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processLocalFormula } from '@/lib/formula';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { memberId, profileId, data: memberData } = body;

    if (!memberId || !profileId) {
      return NextResponse.json({ ok: false, error: 'IDs ausentes' }, { status: 400 });
    }

    // 1. Processamento Local (Determinístico e 100% Confiável)
    console.log('[FormulaEngine] Processando cálculo local para:', memberData.name);
    
    // Adaptar dados do quiz para o motor local
    const localResult = processLocalFormula({
      name: memberData.name,
      age: memberData.age,
      gender: memberData.gender || 'Feminino',
      weight: memberData.weightKg,
      height: memberData.heightCm,
      goal: memberData.goal || 'Emagrecimento',
      hungerLevel: memberData.hungerLevel || 'media',
      bloatingLevel: memberData.bloatingLevel || 'media',
      fatigueLevel: memberData.fatigueLevel || 'media',
      cravingsLevel: memberData.cravingsLevel || 'media',
      sleepQuality: memberData.sleepQuality || 'regular',
      routine: memberData.routine || 'ativa',
      healthConditions: memberData.healthConditions || []
    });

    // 2. Salvar no Supabase
    // Note: Mantendo 'gemini_response' no banco por compatibilidade, mas os dados vêm do motor local.
    const { data: plan, error: dbError } = await supabase
      .from('formula_plans')
      .upsert({
        member_id: memberId,
        profile_id: profileId,
        gemini_response: localResult,
        generated_text: localResult.explanation,
        input_data: memberData,
        source: 'local_formula_engine'
      }, { onConflict: 'member_id' })
      .select()
      .single();

    if (dbError) {
      console.error('[API/GeneratePlan] Erro de Banco:', dbError);
    }

    return NextResponse.json({ 
      ok: true, 
      planId: plan?.id,
      plan: localResult,
      source: "local_formula_engine",
      usedExternalAI: false,
      message: "Plano calculado localmente com base nas suas respostas"
    });

  } catch (error: any) {
    console.error('[API/GeneratePlan] Erro Crítico:', error);
    return NextResponse.json({ ok: false, error: 'Ocorreu um erro ao processar sua fórmula localmente.' }, { status: 500 });
  }
}
