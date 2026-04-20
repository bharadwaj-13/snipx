import { supabase } from '../lib/supabase'

export async function getSnippets(userId, { search, tag, language, collectionId } = {}) {
  let targetCollectionId = collectionId

  // Detect if this is a live-synchronized fork
  if (collectionId) {
    const { data: col } = await supabase
      .from('collections')
      .select('forked_from_id')
      .eq('id', collectionId)
      .single()
    
    if (col?.forked_from_id) {
      targetCollectionId = col.forked_from_id
    }
  }

  let query = supabase
    .from('snippets')
    .select('*')
    .order('created_at', { ascending: false })

  // If it's a fork, we fetch the owner's snippets, not the current user's
  if (targetCollectionId && targetCollectionId !== collectionId) {
    query = query.eq('collection_id', targetCollectionId)
  } else {
    query = query.eq('user_id', userId)
    if (collectionId) query = query.eq('collection_id', collectionId)
  }

  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  if (tag) query = query.contains('tags', [tag])
  if (language) query = query.eq('language', language)

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

export async function getSnippetVersions(snippetId) {
  const { data, error } = await supabase
    .from('snippet_versions')
    .select('*')
    .eq('snippet_id', snippetId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function forkSnippet(snippet, userId, collectionId = null) {
  const forkedData = {
    title: snippet.title,
    description: snippet.description,
    code: snippet.code,
    language: snippet.language,
    tags: snippet.tags || [],
    user_id: userId,
    collection_id: collectionId,
    visibility: 'private', // Forked snippets are private by default
  }

  const { data, error } = await supabase
    .from('snippets')
    .insert(forkedData)
    .select()
    .single()
  
  return { data, error }
}