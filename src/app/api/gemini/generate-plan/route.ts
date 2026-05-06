import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateFormulaPlanWithAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('[API/GeneratePlan] Erro: Usuário não autenticado');
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { memberId, profileId, data: memberData } = await req.json();

    if (!memberId || !profileId) {
      console.error('[API/GeneratePlan] Erro: IDs ausentes', { memberId, profileId });
      return NextResponse.json({ error: 'IDs do membro ou perfil ausentes' }, { status: 400 });
    }

    // 1. Verificar se já existe um plano para este membro para evitar duplicação desnecessária
    const { data: existingPlan } = await supabase
      .from('formula_plans')
      .select('id, gemini_response')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPlan) {
      console.log('[API/GeneratePlan] Plano já existente encontrado, retornando...');
      return NextResponse.json({ 
        success: true, 
        planId: existingPlan.id,
        plan: existingPlan.gemini_response,
        reused: true
      });
    }

    // 2. Gera o plano usando a lógica híbrida
    console.log('[API/GeneratePlan] Iniciando geração de nova fórmula...');
    const formulaResult = await generateFormulaPlanWithAI({
      name: memberData.name,
      age: memberData.age,
      heightCm: memberData.heightCm,
      weightKg: memberData.weightKg,
      imc: memberData.imc
    });

    // 3. Salvar o plano no Supabase
    const { data: plan, error: planError } = await supabase
      .from('formula_plans')
      .insert({
        member_id: memberId,
        member_profile_id: profileId,
        gemini_response: formulaResult,
        generated_text: JSON.stringify(formulaResult)
      })
      .select()
      .single();

    if (planError) {
      console.error('[API/GeneratePlan] Erro ao salvar plano no Supabase:', planError);
      return NextResponse.json({ 
        error: 'Erro ao salvar a fórmula no banco de dados',
        details: planError.message 
      }, { status: 500 });
    }

    console.log('[API/GeneratePlan] Nova fórmula gerada e salva com sucesso!');
    return NextResponse.json({ 
      success: true, 
      planId: plan.id,
      plan: formulaResult 
    });

  } catch (error: any) {
    console.error('[API/GeneratePlan] Erro crítico inesperado:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao processar sua fórmula',
      details: error.message 
    }, { status: 500 });
  }
}
