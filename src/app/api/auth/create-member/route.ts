import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { grantAccess } from '@/lib/access';

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  const searchParams = req.nextUrl.searchParams;
  const secret = searchParams.get('secret');

  // Simple secret check for internal manual use
  if (process.env.KIWIFY_WEBHOOK_SECRET && secret !== process.env.KIWIFY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, name, productId, orderId } = await req.json();

    if (!email || !productId) {
      return NextResponse.json({ error: 'Email and Product ID are required' }, { status: 400 });
    }

    const result = await grantAccess(email, productId, orderId || `manual-${Date.now()}`, name || 'Membro');

    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
