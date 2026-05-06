export type KiwifyStatus = 
  | 'paid'
  | 'refunded'
  | 'charged_back'
  | 'refused'
  | 'pending_approval'
  | 'canceled';

export interface KiwifyPayload {
  order_status: KiwifyStatus;
  customer: {
    full_name: string;
    email: string;
    mobile?: string;
  };
  product: {
    product_id: string;
    product_name: string;
  };
  order_id: string;
  payment_method: string;
  tracking_parameters?: {
    src?: string;
  };
  webhook_event_type: string;
  [key: string]: any;
}

export function parseKiwifyPayload(payload: any): KiwifyPayload {
  return payload as KiwifyPayload;
}

export function isApprovedPurchase(payload: KiwifyPayload): boolean {
  // Kiwify paid events: order_status === 'paid'
  return payload.order_status === 'paid';
}

export function isRefundedPurchase(payload: KiwifyPayload): boolean {
  return payload.order_status === 'refunded';
}

export function isChargeback(payload: KiwifyPayload): boolean {
  return payload.order_status === 'charged_back';
}

export function getBuyerEmail(payload: KiwifyPayload): string {
  return payload.customer?.email?.toLowerCase() || '';
}

export function getBuyerName(payload: KiwifyPayload): string {
  return payload.customer?.full_name || '';
}

export function getBuyerPhone(payload: KiwifyPayload): string | undefined {
  return payload.customer?.mobile;
}

export function getProductId(payload: KiwifyPayload): string {
  return payload.product?.product_id || '';
}

export function getProductName(payload: KiwifyPayload): string {
  return payload.product?.product_name || '';
}

export function getOrderId(payload: KiwifyPayload): string {
  return payload.order_id || '';
}

export function getPurchaseStatus(payload: KiwifyPayload): KiwifyStatus {
  return payload.order_status;
}
