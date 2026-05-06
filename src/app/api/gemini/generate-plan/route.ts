import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateFormulaPlan } from '@/lib/gemini';
import { logAction } from '@/lib/logs';

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();

  try {
    const { memberId, profileId, data } = await req.json();

    if (!memberId || !profileId || !data) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // 1. Generate plan with Gemini
    const geminiResponse = await generateFormulaPlan(data);

    // 2. Save plan to DB
    const { data: plan, error: planError } = await supabase
      .from('formula_plans')
      .insert({
        member_id: memberId,
        profile_id: profileId,
        input_data: data,
        gemini_response: geminiResponse,
        generated_text: JSON.stringify(geminiResponse)
      })
      .select()
      .single();

    if (planError) throw planError;

    await logAction({
      memberId,
      action: 'FORMULA_GENERATED',
      entityType: 'formula_plan',
      entityId: plan.id,
      metadata: { version: plan.version }
    });

    return NextResponse.json({ success: true, planId: plan.id });

  } catch (error: any) {
    console.error('Error generating plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
