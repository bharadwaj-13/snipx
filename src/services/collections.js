import { supabase } from '../lib/supabase'

export async function getCollections(userId) {
  const { data, error } = await supabase
    .from('collections').select('*')
    .eq('user_id', userId).order('created_at', { ascending: true })
  return { data, error }
}

export async function createCollection(collection) {
  const { data, error } = await supabase
    .from('collections').insert(collection).select()
  return { data: data?.[0], error }
}

export async function deleteCollection(id) {
  const { error } = await supabase.from('collections').delete().eq('id', id)
  return { error }
}

export async function updateCollection(id, updates) {
  const { data, error } = await supabase
    .from('collections').update(updates).eq('id', id).select().single()
  return { data, error }
}

export async function getCollectionByToken(token) {
  const { data, error } = await supabase
    .from('collections')
    .select('*, profiles(username)')
    .eq('share_token', token)
    .single()
  return { data, error }
}

export async function getSnippetsByCollectionId(collectionId) {
  const { data, error } = await supabase
    .from('snippets')
    .select('*, profiles(username)')
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: false })
  return { data, error }
}