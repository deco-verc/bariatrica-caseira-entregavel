import { createAdminClient } from './supabase/admin';

export async function logAction({
  memberId,
  action,
  entityType,
  entityId,
  metadata
}: {
  memberId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: any;
}) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('app_logs')
    .insert({
      member_id: memberId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata
    });

  if (error) {
    console.error('Error saving log:', error);
  }
}
