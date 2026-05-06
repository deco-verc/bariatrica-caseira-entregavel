import { createAdminClient } from './supabase/admin';

export async function grantAccess(email: string, productId: string, orderId: string, name: string) {
  const supabase = createAdminClient();

  // 1. Check if user exists in auth.users
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  const existingUser = userData?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

  let userId: string;

  if (!existingUser) {
    // Create new user
    const tempPassword = process.env.DEFAULT_TEMP_PASSWORD || '12345';
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: name, first_login_required: true }
    });

    if (createError) throw createError;
    userId = newUser.user.id;
  } else {
    userId = existingUser.id;
  }

  // 2. Ensure record exists in public.members
  let { data: member, error: memberError } = await supabase
    .from('members')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!member) {
    const { data: newMember, error: newMemberError } = await supabase
      .from('members')
      .insert({
        user_id: userId,
        email,
        name,
        first_login_required: !existingUser ? true : false,
      })
      .select()
      .single();
    
    if (newMemberError) throw newMemberError;
    member = newMember;
  }

  // 3. Ensure product exists in public.products
  let { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('kiwify_product_id', productId)
    .single();

  if (!product) {
    // Create a placeholder product if it doesn't exist
    const { data: newProduct } = await supabase
      .from('products')
      .insert({
        kiwify_product_id: productId,
        name: 'Produto Bariátrica Caseira', // Should be updated later
        slug: `product-${productId}`,
        active: true
      })
      .select()
      .single();
    product = newProduct;
  }

  // 4. Grant access
  if (member && product) {
    await supabase
      .from('member_access')
      .upsert({
        member_id: member.id,
        product_id: product.id,
        status: 'active',
        granted_at: new Date().toISOString()
      }, { onConflict: 'member_id,product_id' });
  }

  return { userId, memberId: member?.id, firstTime: !existingUser };
}

export async function revokeAccess(email: string, productId: string) {
  const supabase = createAdminClient();

  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('kiwify_product_id', productId)
    .single();

  if (member && product) {
    await supabase
      .from('member_access')
      .update({ status: 'revoked', revoked_at: new Date().toISOString() })
      .match({ member_id: member.id, product_id: product.id });
  }
}
