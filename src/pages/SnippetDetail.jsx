import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSnippetById, updateSnippet, deleteSnippet } from '../services/snippets'
import ShareModal from '../components/ShareModal'
import { LuCopy, LuTrash2, LuSave, LuCode, LuX, LuArrowLeft, LuShare2 } from 'react-icons/lu'
import * as prettier from 'prettier/standalone'
import babelPlugin from 'prettier/plugins/babel'
import estreePlugin from 'prettier/plugins/estree'
import htmlPlugin from 'prettier/plugins/html'
import postcssPlugin from 'prettier/plugins/postcss'

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'rust', 'go', 'c', 'cpp', 'csharp', 'php', 'ruby', 'swift', 'kotlin', 'dart', 'css', 'html', 'sql', 'bash', 'json', 'yaml', 'markdown', 'plaintext']

export default function SnippetDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [snippet, setSnippet] = useState(null)
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [visibility, setVisibility] = useState('private')
  const [showShareModal, setShowShareModal] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formatLoading, setFormatLoading] = useState(false)
  const [changed, setChanged] = useState(false)
  const [copying, setCopying] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [togglingVis, setTogglingVis] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await getSnippetById(id)
      if (error || !data) { navigate(-1); return }
      setSnippet(data)
      setCode(data.code)
      setTitle(data.title)
      setLanguage(data.language)
      setVisibility(data.visibility)
      setLoading(false)
    }
    load()
  }, [id, navigate])

  useEffect(() => {
    if (snippet) {
      setChanged(
        code !== snippet.code || 
        title !== snippet.title || 
        language !== snippet.language
      )
    }
  }, [code, title, language, snippet])

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (changed) handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [changed, code, title, language])

  async function handleSave() {
    if (!changed || !title.trim() || !code.trim()) return
    setSaving(true)
    const { error } = await updateSnippet(id, { 
      title, code, language
    })
    if (!error) {
      setSnippet(prev => ({ ...prev, title, code, language }))
    }
    setSaving(false)
  }

  async function handleToggleVisibility() {
    if (!isOwner) return
    setTogglingVis(true)
    const newVis = visibility === 'public' ? 'private' : 'public'
    const { error } = await updateSnippet(id, { visibility: newVis })
    if (!error) {
      setVisibility(newVis)
      setSnippet(prev => ({ ...prev, visibility: newVis }))
    }
    setTogglingVis(false)
  }

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    await deleteSnippet(snippet.id)
    navigate(-1)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopying(true)
    setTimeout(() => setCopying(false), 2000)
  }

  async function handleFormat() {
    if (!code.trim()) return
    setFormatLoading(true)
    try {
      let parser, plugins = []
      const supportedByPrettier = ['javascript', 'typescript', 'json', 'html', 'css', 'markdown', 'yaml']
      
      if (supportedByPrettier.includes(language)) {
        if (['javascript', 'typescript', 'json'].includes(language)) {
          parser = 'babel'; plugins = [babelPlugin, estreePlugin]
        } else if (language === 'html') { parser = 'html'; plugins = [htmlPlugin] }
        else if (language === 'css') { parser = 'css'; plugins = [postcssPlugin] }
        else if (language === 'markdown') { parser = 'markdown' }
        else if (language === 'yaml') { parser = 'yaml' }

        const formatted = await prettier.format(code, { 
          parser, 
          plugins, 
          semi: false, 
          singleQuote: true,
          printWidth: 80,
          tabWidth: 2
        })
        if (formatted) setCode(formatted)
      } else {
        // Universal Code Beautifier (Handles single-line code)
        let processed = code
          .replace(/([;{])/g, '$1\n') // Add newline after { and ;
          .replace(/(})/g, '\n$1\n') // Add newline before and after }
          .split('\n')
          .map(l => l.trim())
          .filter(l => l.length > 0)
          .join('\n')

        const lines = processed.split('\n')
        let indent = 0
        const formatted = lines.map(line => {
          let trimmed = line.trim()
          
          // Decrease indent before printing if line starts with }
          if (trimmed.startsWith('}')) indent = Math.max(0, indent - 1)
          
          const res = '  '.repeat(indent) + trimmed
          
          // Increase indent after printing if line ends with {
          if (trimmed.endsWith('{')) indent++
          
          return res
        }).join('\n')
        
        setCode(formatted)
      }
    } catch (err) { 
      console.error('Format error:', err)
      alert('Format failed: ' + err.message)
    } finally {
      setFormatLoading(false)
    }
  }

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'monospace' }}>Resolving definition...</div>
  }

  const isOwner = user?.id === snippet?.user_id

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box',
      background: 'var(--bg-primary)', 
      padding: '32px 40px' 
    }}>
      
      {/* MacOS Style Framed Window */}
      <div style={{
        display: 'flex', flexDirection: 'column', flex: 1,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}>
        
        {/* Window Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-tertiary)',
          flexShrink: 0
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            {/* Close Button */}
            <button 
              onClick={() => navigate(-1)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'transparent', border: 'none', color: 'var(--text-muted)', 
                cursor: 'pointer', transition: 'all 0.2s',
                fontSize: '13px', fontWeight: 600
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LuArrowLeft size={18} /> <span>Back</span>
            </button>
            
            <input 
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={!isOwner}
              style={{
                fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)',
                background: 'transparent', border: 'none', outline: 'none',
                flex: 1, minWidth: '200px', letterSpacing: '0.02em',
                fontFamily: 'monospace'
              }}
              placeholder="Filename or Title"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isOwner && (
              <select 
                value={language} 
                onChange={e => setLanguage(e.target.value)} 
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
            )}
            
    <button onClick={handleCopy} className="btn " style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', fontSize: '12px' }}>
      <LuCopy size={14} style={{ marginRight: '6px' }} /> {copying ? 'Copied' : 'Copy'}
    </button>

    <button 
      onClick={() => setShowShareModal(true)} 
      className="btn" 
      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--accent-blue)', fontSize: '12px' }}
    >
      <LuShare2 size={14} /> Share
    </button>

    {isOwner && (
              <>
                <button 
                  onClick={handleToggleVisibility}
                  disabled={togglingVis}
                  className="btn" 
                  style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', color: visibility === 'public' ? 'var(--accent-green)' : 'var(--text-muted)', fontSize: '12px' }}
                  title={visibility === 'public' ? 'Public - Click to make private' : 'Private - Click to make public'}
                >
                  {togglingVis ? '...' : visibility}
                </button>
                
                <button onClick={handleFormat} disabled={formatLoading || !code.trim()} className="btn" style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', fontSize: '12px' }} title="Format Code">
                  <LuCode size={14} className={formatLoading ? 'spin' : ''} style={{ marginRight: '6px' }} /> {formatLoading ? 'Formatting...' : 'Format'}
                </button>

                <button 
                  onClick={handleDelete} 
                  onBlur={() => setConfirming(false)} 
                  className="btn" 
                  style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', color: confirming ? 'var(--accent-red)' : 'var(--text-muted)', fontSize: '12px' }}
                >
                  <LuTrash2 size={14} style={{ marginRight: '4px' }} /> {confirming ? 'Sure?' : 'Delete'}
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!changed || saving}
                  className="btn btn-primary" 
                  style={{ padding: '6px 16px', fontSize: '12px', opacity: (!changed && !saving) ? 0.3 : 1, transition: 'all 0.2s' }}
                >
                  <LuSave size={14} style={{ marginRight: '6px' }} /> {saving ? 'Writing...' : (changed ? 'Save' : 'Saved')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Inner Window Code Editor */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={e => setCode(e.target.value)}
            disabled={!isOwner}
            spellCheck={false}
            className="mono"
            placeholder="// Write some logic..."
            style={{
              flex: 1, padding: '32px 40px', fontSize: '14px', lineHeight: 1.7,
              background: 'transparent', border: 'none', color: 'var(--text-primary)',
              resize: 'none', outline: 'none', whiteSpace: 'pre',
              tabSize: 2, height: '100%', overflowY: 'auto'
            }}
            onKeyDown={e => {
              if (e.key === 'Tab') {
                e.preventDefault()
                const s = e.target.selectionStart
                const newCode = code.substring(0, s) + '  ' + code.substring(e.target.selectionEnd)
                setCode(newCode)
                setTimeout(() => e.target.setSelectionRange(s + 2, s + 2), 0)
              }
            }}
          />
        </div>

      </div>

      {showShareModal && (
        <ShareModal 
          onClose={() => setShowShareModal(false)}
          shareToken={snippet.share_token}
        />
      )}

      <style>{`
        .spin { animation: rotate 2s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}