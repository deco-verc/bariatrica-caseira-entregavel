import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateFormulaPlanWithAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { memberId, profileId, data: memberData } = await req.json();

    if (!memberId || !profileId) {
      return NextResponse.json({ error: 'Missing IDs' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Gera o plano usando a lógica híbrida (Calculadora + Tradução da IA)
    const formulaResult = await generateFormulaPlanWithAI({
      name: memberData.name,
      age: memberData.age,
      heightCm: memberData.heightCm,
      weightKg: memberData.weightKg,
      imc: memberData.imc
    });

    // 2. Salva o plano no Supabase
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

    if (planError) throw planError;

    return NextResponse.json({ 
      success: true, 
      planId: plan.id,
      plan: formulaResult 
    });

  } catch (error: any) {
    console.error('Error generating formula plan:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
