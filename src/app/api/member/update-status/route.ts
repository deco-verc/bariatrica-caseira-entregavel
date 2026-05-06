import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos a SERVICE_ROLE_KEY aqui para garantir que a atualização funcione independente de RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json({ ok: false, error: 'Dados ausentes' }, { status: 400 });
    }

    // Permitimos apenas atualização de campos específicos de status por segurança
    const allowedUpdates: Record<string, any> = {};
    if (updates.first_login_required !== undefined) allowedUpdates.first_login_required = updates.first_login_required;
    if (updates.onboarding_completed !== undefined) allowedUpdates.onboarding_completed = updates.onboarding_completed;
    if (updates.name !== undefined) allowedUpdates.name = updates.name;
    
    allowedUpdates.updated_at = new Date().toISOString();

    console.log(`[API/UpdateStatus] Atualizando usuário ${userId}:`, allowedUpdates);

    const { data, error } = await supabaseAdmin
      .from('members')
      .update(allowedUpdates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[API/UpdateStatus] Erro no Supabase:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });

  } catch (error: any) {
    console.error('[API/UpdateStatus] Erro Crítico:', error);
    return NextResponse.json({ ok: false, error: 'Erro interno no servidor' }, { status: 500 });
  }
}
