import { supabase } from '../lib/supabase'

export async function getSnippets(userId, { search, tag, language, collectionId } = {}) {
  let query = supabase
    .from('snippets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  if (tag) query = query.contains('tags', [tag])
  if (language) query = query.eq('language', language)
  if (collectionId) query = query.eq('collection_id', collectionId)

  const { data, error } = await query
  return { data, error }
}

export async function getSnippetById(id) {
  const { data, error } = await supabase
    .from('snippets').select('*').eq('id', id).single()
  return { data, error }
}

export async function getSnippetByToken(token) {
  const { data, error } = await supabase
    .from('snippets')
    .select('*, profiles(username)')
    .eq('share_token', token)
    .single()
  return { data, error }
}

export async function createSnippet(snippet) {
  const { data, error } = await supabase
    .from('snippets').insert(snippet).select().single()
  return { data, error }
}

export async function updateSnippet(id, updates) {
  const { data, error } = await supabase
    .from('snippets').update(updates).eq('id', id).select().single()
  return { data, error }
}

export async function deleteSnippet(id) {
  const { error } = await supabase.from('snippets').delete().eq('id', id)
  return { error }
}