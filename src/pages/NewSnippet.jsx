import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createSnippet } from '../services/snippets'
import { createCollection, getCollections } from '../services/collections'
import { LuCopy, LuSave, LuCode, LuX, LuTags, LuPlus, LuCheck, LuArrowLeft } from 'react-icons/lu'
import * as prettier from 'prettier/standalone'
import babelPlugin from 'prettier/plugins/babel'
import estreePlugin from 'prettier/plugins/estree'
import htmlPlugin from 'prettier/plugins/html'
import postcssPlugin from 'prettier/plugins/postcss'
import TagInput from '../components/TagInput'

const LANGUAGES = ['javascript', 'typescript', 'python', 'rust', 'go', 'css', 'html', 'sql', 'bash', 'json', 'plaintext']

export default function NewSnippet() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [visibility, setVisibility] = useState('private')
  const [tags, setTags] = useState([])
  const [collectionId, setCollectionId] = useState(new URLSearchParams(window.location.search).get('collection') || '')
  
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(false)
  const [formatLoading, setFormatLoading] = useState(false)
  const [copying, setCopying] = useState(false)
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    getCollections(user.id).then(({ data }) => setCollections(data ?? []))
  }, [user.id])

  // Ctrl+S to save
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleCreate()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [code, title, language, tags, visibility, collectionId])

  async function handleCreate() {
    if (!title.trim() || !code.trim()) return
    setLoading(true)
    const { data, error } = await createSnippet({
      title, description, code, language, tags, visibility,
      collection_id: collectionId || null,
      user_id: user.id
    })
    if (!error) navigate(`/snippet/${data.id}`)
    else setLoading(false)
  }

  async function handleFormat() {
    if (!code.trim()) return
    setFormatLoading(true)
    try {
      let parser, plugins = []
      const supportedByPrettier = ['javascript', 'typescript', 'json', 'html', 'css']
      
      if (supportedByPrettier.includes(language)) {
        if (['javascript', 'typescript', 'json'].includes(language)) {
          parser = 'babel'; plugins = [babelPlugin, estreePlugin]
        } else if (language === 'html') { parser = 'html'; plugins = [htmlPlugin] }
        else if (language === 'css') { parser = 'css'; plugins = [postcssPlugin] }

        const formatted = await prettier.format(code, { parser, plugins, semi: false, singleQuote: true })
        setCode(formatted)
      }
    } catch (err) { 
      console.error(err)
    } finally {
      setFormatLoading(false)
    }
  }

  async function handleCreateCollection() {
    if (!newCollectionName.trim()) { setIsCreatingCollection(false); return }
    const { data, error } = await createCollection({
      user_id: user.id,
      name: newCollectionName.trim(),
      color: '#ffffff'
    })
    if (!error) {
      setCollections(prev => [...prev, data])
      setCollectionId(data.id)
      setIsCreatingCollection(false)
      setNewCollectionName('')
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopying(true)
    setTimeout(() => setCopying(false), 2000)
  }

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box',
      background: 'var(--bg-primary)', 
      padding: '32px 40px' 
    }}>
      
      <div style={{
        display: 'flex', flexDirection: 'column', flex: 1,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-tertiary)',
          flexShrink: 0
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <button 
              onClick={() => navigate(-1)} 
              style={{ 
                background: 'transparent', border: 'none', color: 'var(--text-muted)', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '13px', fontWeight: 600, transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LuArrowLeft size={18} /> <span>Back</span>
            </button>
            
            <input 
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)',
                background: 'transparent', border: 'none', outline: 'none',
                flex: 1, letterSpacing: '0.02em', fontFamily: 'monospace'
              }}
              placeholder="Snippet Title..."
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select 
              value={language} 
              onChange={e => setLanguage(e.target.value)} 
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
            
            <button onClick={handleFormat} disabled={formatLoading || !code.trim()} className="btn" style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', fontSize: '12px' }}>
              <LuCode size={14} className={formatLoading ? 'spin' : ''} style={{ marginRight: '6px' }} /> {formatLoading ? 'Formatting...' : 'Format'}
            </button>

            <button onClick={handleCopy} className="btn" style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', fontSize: '12px' }}>
              <LuCopy size={14} style={{ marginRight: '6px' }} /> {copying ? 'Copied' : 'Copy'}
            </button>

            <button onClick={handleCreate} disabled={loading || !title || !code} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '12px' }}>
              <LuSave size={14} style={{ marginRight: '6px' }} /> {loading ? 'Saving...' : 'Save Snippet'}
            </button>
          </div>
        </div>

        {/* Editor & Sidebar */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={e => setCode(e.target.value)}
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

          <aside style={{ 
            width: '280px', background: 'var(--bg-primary)', 
            borderLeft: '1px solid var(--border)', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '24px'
          }}>
            <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Vault Configuration</label>
               <select 
                 value={visibility} 
                 onChange={e => setVisibility(e.target.value)} 
                 style={{ width: '100%', marginBottom: '12px' }}
               >
                 <option value="private">Private Vault</option>
                 <option value="public">Public Access</option>
               </select>

               <div style={{ position: 'relative' }}>
                 <select 
                   value={collectionId} 
                   onChange={e => setCollectionId(e.target.value)}
                   style={{ width: '100%', marginBottom: '12px' }}
                 >
                   <option value="">Global Directory</option>
                   {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>

                 {!isCreatingCollection ? (
                   <button 
                     onClick={() => setIsCreatingCollection(true)}
                     style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px dashed var(--border)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                   >
                     <LuPlus size={12} /> New Directory
                   </button>
                 ) : (
                   <div style={{ display: 'flex', gap: '4px' }}>
                     <input 
                       autoFocus
                       value={newCollectionName}
                       onChange={e => setNewCollectionName(e.target.value)}
                       onKeyDown={e => {
                         if (e.key === 'Enter') handleCreateCollection()
                         if (e.key === 'Escape') setIsCreatingCollection(false)
                       }}
                       placeholder="Folder Name..."
                       style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '6px 10px', fontSize: '12px', outline: 'none' }}
                     />
                     <button 
                       type="button"
                       onClick={handleCreateCollection}
                       style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 8px', cursor: 'pointer' }}
                     >
                       <LuCheck size={14} />
                     </button>
                   </div>
                 )}
               </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Metadata Tags
              </label>
              <TagInput tags={tags} onChange={setTags} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Directives / Notes</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Context for your snippet..."
                style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'var(--text-secondary)', fontSize: '13px', outline: 'none', resize: 'none' }}
                rows={4}
              />
            </div>
          </aside>
        </div>

      </div>
      <style>{`
        .spin { animation: rotate 2s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}