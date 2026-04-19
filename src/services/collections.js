import { supabase } from '../lib/supabase'

export async function getCollections(userId) {
  const { data, error } = await supabase
    .from('collections').select('*')
    .eq('user_id', userId).order('created_at', { ascending: true })
  return { data, error }
}

export async function createCollection(collection) {
  const { data, error } = await supabase
    .from('collections').insert(collection).select().single()
  return { data, error }
}

export async function deleteCollection(id) {
  const { error } = await supabase.from('collections').delete().eq('id', id)
  return { error }
}