import { supabase } from '../lib/supabase'

export async function getProfileByUsername(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  return { data, error }
}

export async function getProfileById(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function getPublicSnippetsByUserId(userId) {
  const { data, error } = await supabase
    .from('snippets')
    .select('*, profiles(username, avatar_url)')
    .eq('user_id', userId)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
  return { data, error }
}
