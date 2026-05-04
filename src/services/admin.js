import { supabase } from '../lib/supabase'

/**
 * Fetch all users who are admins
 */
export async function getAdmins() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, is_admin')
    .eq('is_admin', true)
  return { data, error }
}

/**
 * Promote a user to admin by UID (primary) or Username
 */
export async function addAdmin(identifier) {
  // We prioritize checking for ID first
  const { data: profileById } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', identifier)
    .single()

  let targetId = profileById?.id

  if (!targetId) {
    // Fallback to username if ID not found
    const { data: profileByUsername } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', identifier)
      .single()
    targetId = profileByUsername?.id
  }

  if (!targetId) {
    return { error: 'User not found. Please paste the correct UID from Supabase.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', targetId)
  
  return { error }
}

/**
 * Revoke admin status
 */
export async function removeAdmin(userId) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: false })
    .eq('id', userId)
  return { error }
}
