import { supabase } from '../lib/supabase'

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN

/**
 * GitHub Gist API Helpers
 */
async function createGist(title, code, language) {
  if (!GITHUB_TOKEN) return { id: null, error: 'No GitHub Token' }

  const token = GITHUB_TOKEN.trim()
  const authHeader = token.startsWith('github_pat_') ? `Bearer ${token}` : `token ${token}`

  // ANTI-SPAM: Add a unique signature to the code to ensure GitHub doesn't flag it as a duplicate
  const uniqueCode = (code || 'Empty Snippet').toString() + `\n\n// Snipx Sync: ${Math.random().toString(36).substring(7)}`

  try {
    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github+json'
      },
      body: JSON.stringify({
        description: "Snipx Vault Migration",
        public: false, 
        files: {
          "snippet.txt": { 
            content: uniqueCode
          }
        }
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      // EXHAUSTIVE ERROR LOGGING
      const detailedError = JSON.stringify(data.errors || data)
      console.error('CRITICAL GITHUB ERROR:', detailedError)
      return { id: null, error: detailedError }
    }

    return { id: data.id, error: null }
  } catch (error) {
    return { id: null, error }
  }
}

async function getGistContent(gistId) {
  if (!GITHUB_TOKEN) return { code: null, error: 'No GitHub Token' }
  const token = GITHUB_TOKEN.trim()
  const authHeader = token.startsWith('github_pat_') ? `Bearer ${token}` : `token ${token}`
  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { 'Authorization': authHeader }
    })
    const data = await response.json()
    const firstFile = Object.values(data.files)[0]
    return { code: firstFile.content, error: null }
  } catch (error) {
    return { code: null, error }
  }
}

async function updateGist(gistId, title, code, language) {
  if (!GITHUB_TOKEN) return { error: 'No GitHub Token' }
  const token = GITHUB_TOKEN.trim()
  const authHeader = token.startsWith('github_pat_') ? `Bearer ${token}` : `token ${token}`
  try {
    await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: `Snipx: ${title || 'Untitled'}`,
        files: {
          "snippet.txt": { content: (code || ' ').toString() }
        }
      })
    })
    return { error: null }
  } catch (error) {
    return { error }
  }
}

async function deleteGist(gistId) {
  if (!GITHUB_TOKEN) return
  const token = GITHUB_TOKEN.trim()
  const authHeader = token.startsWith('github_pat_') ? `Bearer ${token}` : `token ${token}`
  try {
    await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'DELETE',
      headers: { 'Authorization': authHeader }
    })
  } catch (e) {}
}

export async function getSnippets(userId, { search, tag, language, collectionId } = {}) {
  let query = supabase
    .from('snippets')
    .select('id, title, description, language, tags, visibility, created_at, share_token, collection_id, gist_id, preview, profiles(username, avatar_url)')
    .order('created_at', { ascending: false })

  query = query.eq('user_id', userId)
  if (collectionId) query = query.eq('collection_id', collectionId)
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  if (tag) query = query.contains('tags', [tag])
  if (language) query = query.eq('language', language)

  const { data, error } = await query
  
  const mappedData = data?.map(s => ({
    ...s,
    code: s.preview || '' 
  }))

  return { data: mappedData, error }
}

export async function getSnippetById(id) {
  const { data, error } = await supabase
    .from('snippets').select('*, profiles(username)').eq('id', id).single()
  
  if (error || !data) return { data, error }

  if (data.gist_id) {
    const { code, error: gistError } = await getGistContent(data.gist_id)
    if (!gistError) data.code = code
  }
  
  return { data, error }
}

export async function getSnippetByToken(token) {
  const { data, error } = await supabase
    .from('snippets').select('*, profiles(username)').eq('share_token', token).single()
  
  if (error || !data) return { data, error }

  if (data.gist_id) {
    const { code, error: gistError } = await getGistContent(data.gist_id)
    if (!gistError) data.code = code
  }

  return { data, error }
}

export async function createSnippet(snippet) {
  const fullCode = (snippet.code || ' ').toString() + `\n\n// Snipx: ${Math.random().toString(36).substring(7)}`
  const preview = fullCode.substring(0, 200)

  const { id: gistId, error: gistError } = await createGist(snippet.title, fullCode, snippet.language)
  
  const { data, error } = await supabase
    .from('snippets')
    .insert({
      ...snippet,
      code: '', 
      gist_id: gistId,
      preview: preview
    })
    .select()
    .single()

  return { data: { ...data, code: fullCode }, error: error || gistError }
}

export async function updateSnippet(id, updates) {
  if (updates.code !== undefined) {
    const fullCode = (updates.code || ' ').toString() + `\n\n// Snipx: ${Math.random().toString(36).substring(7)}`
    updates.preview = fullCode.substring(0, 200)
    
    const { data: existing } = await supabase.from('snippets').select('gist_id, title, language').eq('id', id).single()
    
    if (existing?.gist_id) {
      await updateGist(existing.gist_id, updates.title || existing.title, fullCode, updates.language || existing.language)
    } else {
      const { id: newGistId } = await createGist(updates.title || existing.title, fullCode, updates.language || existing.language)
      updates.gist_id = newGistId
    }

    delete updates.code
    const { data, error } = await supabase.from('snippets').update(updates).eq('id', id).select().single()
    return { data: { ...data, code: fullCode }, error }
  }

  const { data, error } = await supabase.from('snippets').update(updates).eq('id', id).select().single()
  return { data, error }
}

export async function deleteSnippet(id) {
  const { data: existing } = await supabase.from('snippets').select('gist_id').eq('id', id).single()
  if (existing?.gist_id) await deleteGist(existing.gist_id)
  
  const { error } = await supabase.from('snippets').delete().eq('id', id)
  return { error }
}

export async function forkSnippet(snippet, userId, collectionId = null) {
  const { data, error } = await createSnippet({
    title: snippet.title,
    description: snippet.description,
    code: snippet.code,
    language: snippet.language,
    tags: snippet.tags || [],
    user_id: userId,
    collection_id: collectionId,
    visibility: 'private',
  })
  
  return { data, error }
}

export async function migrateAllToGitHub(userId, onProgress) {
  const { data: snippets } = await supabase.from('snippets').select('*').eq('user_id', userId).is('gist_id', null)
  if (!snippets || snippets.length === 0) return { message: 'Already migrated.', count: 0 }

  let count = 0
  const total = snippets.length
  
  for (const [index, s] of snippets.entries()) {
    if (onProgress) onProgress(index + 1, total, s.title)
    const codeToMigrate = s.code || s.preview || ' ' 
    
    const { id: gistId } = await createGist(s.title, codeToMigrate, s.language)
    if (gistId) {
      await supabase.from('snippets').update({
        gist_id: gistId,
        preview: codeToMigrate.substring(0, 200),
        code: ''
      }).eq('id', s.id)
      count++
    }
  }
  return { count }
}

export async function migrateGlobalVault(onProgress) {
  const { data: snippets, error } = await supabase
    .from('snippets')
    .select('*')
    .is('gist_id', null)
  
  if (error) return { error, count: 0 }
  if (!snippets || snippets.length === 0) return { message: 'Vault is already fully optimized.', count: 0 }

  let count = 0
  let failed = 0
  const total = snippets.length

  for (const [index, s] of snippets.entries()) {
    if (onProgress) onProgress(index + 1, total, s.title)
    const codeToMigrate = s.code || s.preview || ' ' 

    const { id: gistId, error: gistError } = await createGist(s.title, codeToMigrate, s.language)
    if (gistId) {
      await supabase.from('snippets').update({
        gist_id: gistId,
        preview: codeToMigrate.substring(0, 200),
        code: '' 
      }).eq('id', s.id)
      count++
    } else {
      console.error(`Migration failed for [${s.title}]:`, gistError)
      failed++
    }
  }
  
  return { 
    count, 
    failed, 
    message: failed > 0 ? `Migrated ${count} snippets, but ${failed} failed. Try one more time!` : null 
  }
}

export async function downloadAllSnippets(userId) {
  const { data, error } = await supabase
    .from('snippets')
    .select('*, profiles(username)')
    .eq('user_id', userId)

  if (error) return { error }

  const fullSnippets = await Promise.all(data.map(async s => {
    if (s.gist_id) {
      const { code } = await getGistContent(s.gist_id)
      return { ...s, code: code || s.preview }
    }
    return s
  }))

  const blob = new Blob([JSON.stringify(fullSnippets, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `snipx_vault_export_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  return { success: true }
}

export async function purgeAllSnippets(userId) {
  const { data: snippets } = await supabase.from('snippets').select('gist_id').eq('user_id', userId)
  if (snippets) {
    for (const s of snippets) {
      if (s.gist_id) await deleteGist(s.gist_id)
    }
  }

  const { error } = await supabase.from('snippets').delete().eq('user_id', userId)
  return { error }
}