import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { 
  parseKiwifyPayload, 
  isApprovedPurchase, 
  isRefundedPurchase, 
  isChargeback,
  getBuyerEmail,
  getBuyerName,
  getProductId,
  getProductName,
  getOrderId,
  getPurchaseStatus
} from '@/lib/kiwify';
import { grantAccess, revokeAccess } from '@/lib/access';
import { sendAccessEmail } from '@/lib/email';
import { logAction } from '@/lib/logs';

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get('token');

  // Basic security check
  if (process.env.KIWIFY_WEBHOOK_SECRET && token !== process.env.KIWIFY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rawPayload = await req.json();
    const payload = parseKiwifyPayload(rawPayload);
    
    const email = getBuyerEmail(payload);
    const orderId = getOrderId(payload);
    const productId = getProductId(payload);
    const productName = getProductName(payload);
    const name = getBuyerName(payload);
    const status = getPurchaseStatus(payload);

    // Save event for audit
    const { data: eventRecord, error: eventError } = await supabase
      .from('webhook_events')
      .insert({
        provider: 'kiwify',
        event_type: payload.webhook_event_type,
        order_id: orderId,
        email: email,
        status: status,
        raw_payload: rawPayload
      })
      .select()
      .single();

    if (eventError) throw eventError;

    // Handle Paid / Approved Purchase
    if (isApprovedPurchase(payload)) {
      // Check if purchase already processed to avoid duplication
      const { data: existingPurchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('kiwify_order_id', orderId)
        .single();

      if (existingPurchase) {
        return NextResponse.json({ message: 'Purchase already processed' }, { status: 200 });
      }

      // Grant access and create user if needed
      const { userId, memberId, firstTime } = await grantAccess(email, productId, orderId, name);

      // Record purchase
      await supabase
        .from('purchases')
        .insert({
          user_id: userId,
          email,
          kiwify_order_id: orderId,
          kiwify_product_id: productId,
          product_name: productName,
          status: status,
          amount: payload.order_bump ? payload.order_bump_amount : payload.order_amount,
          raw_payload: rawPayload
        });

      // Send email for first access
      if (firstTime) {
        const tempPassword = process.env.DEFAULT_TEMP_PASSWORD || '12345';
        const APP_URL = process.env.APP_URL || 'https://plataforma.bariatricacaseira.com';
        
        await sendAccessEmail({
          name,
          email,
          temporaryPassword: tempPassword,
          loginUrl: `${APP_URL}/login`
        });

        await logAction({
          memberId,
          action: 'ACCESS_EMAIL_SENT',
          entityType: 'purchase',
          entityId: orderId,
          metadata: { email }
        });
      }

      await logAction({
        memberId,
        action: 'PURCHASE_APPROVED',
        entityType: 'purchase',
        entityId: orderId,
        metadata: { productId, productName }
      });
    } 
    // Handle Refunds / Chargebacks
    else if (isRefundedPurchase(payload) || isChargeback(payload)) {
      await revokeAccess(email, productId);
      
      await logAction({
        action: 'ACCESS_REVOKED',
        entityType: 'purchase',
        entityId: orderId,
        metadata: { email, productId, status }
      });
    }

    // Mark event as processed
    await supabase
      .from('webhook_events')
      .update({ processed: true })
      .eq('id', eventRecord.id);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    
    // Log error if eventRecord exists
    // (Actual error logging into DB could be added here)

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
