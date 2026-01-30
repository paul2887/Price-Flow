import { supabase } from './supabaseClient';

// Verify and accept an invitation
export async function acceptInvitation(token, userName, userEmail, passwordHash) {
  try {
    // Find the invitation by token
    const { data: invitation, error: findError } = await supabase
      .from('store_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (findError || !invitation) {
      throw new Error('Invalid or expired invitation');
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Create staff record with email and password hash (no user_id for invited members)
    const { error: staffError } = await supabase
      .from('staff')
      .insert({
        store_id: invitation.store_id,
        email: userEmail,
        password_hash: passwordHash,
        full_name: userName,
        role: 'Sales Person', // Default role
        status: 'active', // Set status to active
      });

    if (staffError) {
      throw new Error('Failed to create staff record: ' + staffError.message);
    }

    // Update invitation status to accepted
    const { error: updateError } = await supabase
      .from('store_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    if (updateError) {
      throw new Error('Failed to update invitation: ' + updateError.message);
    }

    return {
      success: true,
      message: 'Invitation accepted! You are now a member of the store.',
      storeId: invitation.store_id,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
}
