import { supabase } from '../lib/supabase'

export async function getCommentsBySnippetId(snippetId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(username, avatar_url)')
    .eq('snippet_id', snippetId)
    .order('created_at', { ascending: true })
  return { data, error }
}

export async function addComment({ snippetId, userId, authorName, content }) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      snippet_id: snippetId,
      user_id: userId || null,
      author_name: authorName || 'Guest',
      content
    })
    .select()
    .single()
  return { data, error }
}

export async function deleteComment(id) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)
  return { error }
}
