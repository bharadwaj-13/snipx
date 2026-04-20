import { useState, useEffect } from 'react'
import { getCommentsBySnippetId, addComment, deleteComment } from '../services/comments'
import { LuMessageSquare, LuSend, LuTrash2, LuUser } from 'react-icons/lu'

export default function CommentSection({ snippetId, user, profile, allowPublicComment }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState(localStorage.getItem('snipx_author_name') || '')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [snippetId])

  async function loadComments() {
    const { data } = await getCommentsBySnippetId(snippetId)
    setComments(data || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    if (!user && !authorName.trim()) {
      alert('Please provide a name to post as a guest.')
      return
    }

    setSubmitting(true)
    if (!user) localStorage.setItem('snipx_author_name', authorName)

    const { data, error } = await addComment({
      snippetId,
      userId: user?.id,
      authorName: profile?.username || authorName,
      content: newComment.trim()
    })

    if (!error && data) {
      // Reload comments to get profile info etc.
      loadComments()
      setNewComment('')
    }
    setSubmitting(false)
  }

  async function handleDelete(id) {
    const { error } = await deleteComment(id)
    if (!error) {
      setComments(prev => prev.filter(c => c.id !== id))
    }
  }

  if (!allowPublicComment && comments.length === 0) return null

  return (
    <div style={{ marginTop: '4rem', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <LuMessageSquare size={20} color="var(--text-muted)" />
        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Discussions ({comments.length})</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'monospace' }}>Resolving threads...</div>
        ) : comments.length === 0 ? (
          <div style={{ padding: '32px', background: 'var(--bg-secondary)', borderRadius: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', border: '1px solid var(--border)' }}>
            No contributions yet. Start the evolution?
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} style={{ display: 'flex', gap: '16px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-tertiary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                border: '1px solid var(--border)', overflow: 'hidden'
              }}>
                {comment.profiles?.avatar_url ? (
                  <img src={comment.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <LuUser size={20} color="var(--text-muted)" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {comment.profiles?.username || comment.author_name || 'Guest'}
                  </span>
                  {user?.id === comment.user_id && (
                    <button onClick={() => handleDelete(comment.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <LuTrash2 size={14} />
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '0 16px 16px 16px', border: '1px solid var(--border)' }}>
                  {comment.content}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'monospace' }}>
                   {new Date(comment.created_at).toLocaleString().toUpperCase()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {allowPublicComment && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
          {!user && (
            <input 
              value={authorName} 
              onChange={e => setAuthorName(e.target.value)} 
              placeholder="Your Name (Ghost mode)"
              style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '13px', marginBottom: '12px', outline: 'none' }}
            />
          )}
          <textarea 
            value={newComment} 
            onChange={e => setNewComment(e.target.value)} 
            placeholder={user ? "Add a directive or insight..." : "Post as guest..."}
            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', minHeight: '100px', resize: 'none', marginBottom: '16px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button disabled={submitting || !newComment.trim()} style={{ 
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--text-primary)', color: 'var(--bg-primary)', 
              padding: '10px 24px', borderRadius: '100px', fontWeight: 800, border: 'none', cursor: 'pointer',
              opacity: (submitting || !newComment.trim()) ? 0.5 : 1
            }}>
              <LuSend size={16} /> {submitting ? 'Transmitting...' : 'Post Insight'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
