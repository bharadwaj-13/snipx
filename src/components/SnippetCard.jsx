import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { deleteSnippet, forkSnippet } from '../services/snippets'
import { getCollections, createCollection } from '../services/collections'
import { useAuth } from '../context/AuthContext'
import { 
  SiJavascript, SiTypescript, SiPython, SiRust, 
  SiGo, SiCss, SiHtml5, SiGnubash, SiJson, SiPostgresql 
} from 'react-icons/si'
import { VscFileCode } from 'react-icons/vsc'
import { LuCopy, LuTrash2, LuGitFork, LuCheck, LuFolderPlus, LuPlus } from 'react-icons/lu'

const LANG_COLORS = {
  javascript: '#888888', typescript: '#666666', python: '#777777',
  rust: '#555555', go: '#999999', css: '#444444', html: '#aaaaaa',
  sql: '#333333', bash: '#bbbbbb', json: '#222222', plaintext: '#8b949e',
}

const LANG_ICONS = {
  javascript: SiJavascript,
  typescript: SiTypescript,
  python: SiPython,
  rust: SiRust,
  go: SiGo,
  css: SiCss,
  html: SiHtml5,
  sql: SiPostgresql,
  bash: SiGnubash,
  json: SiJson,
}

export default function SnippetCard({ snippet, onDelete, showAuthor = false, listMode = false, allowDelete = true, allowFork = false }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [copying, setCopying] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [forking, setForking] = useState(false)
  const [forked, setForked] = useState(false)
  const [collections, setCollections] = useState([])
  const [showForkMenu, setShowForkMenu] = useState(false)
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  useEffect(() => {
    if (allowFork && user) {
      getCollections(user.id).then(({ data }) => setCollections(data || []))
    }
  }, [allowFork, user])

  async function handleCopy(e) {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(snippet.code)
    setCopying(true)
    setTimeout(() => setCopying(false), 1500)
  }

  async function handleDelete(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirming) { setConfirming(true); return }
    await deleteSnippet(snippet.id)
    onDelete?.(snippet.id)
  }

  async function handleFork(collectionId = null) {
    if (!user) return
    setForking(true)
    setShowForkMenu(false)
    const { error } = await forkSnippet(snippet, user.id, collectionId)
    if (!error) {
      setForked(true)
      setTimeout(() => setForked(false), 2000)
    }
    setForking(false)
  }

  async function handleCreateAndFork() {
    if (!newCollectionName.trim() || !user) return
    setForking(true)
    const { data, error } = await createCollection({
      user_id: user.id,
      name: newCollectionName.trim()
    })
    if (!error && data) {
      setCollections(prev => [...prev, data])
      await handleFork(data.id)
      setNewCollectionName('')
      setIsCreatingCollection(false)
    }
    setForking(false)
  }

  const langColor = LANG_COLORS[snippet.language] ?? '#8b949e'
  const lineCount = snippet.code.split('\n').length
  const codeLines = snippet.code.split('\n').slice(0, 5)

  const IconComponent = LANG_ICONS[snippet.language] || VscFileCode

  const CardAction = ({ onClick, icon: Icon, title, color = 'var(--text-muted)', activeColor = 'var(--text-primary)', isActive }) => (
    <button 
      onClick={onClick}
      style={{ 
        background: 'transparent', border: 'none', 
        color: isActive ? activeColor : color, 
        cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      onMouseOver={e => !isActive && (e.currentTarget.style.color = activeColor)}
      onMouseOut={e => !isActive && (e.currentTarget.style.color = color)}
      title={title}
    >
      <Icon size={16} />
    </button>
  )

  if (listMode) {
    return (
      <div 
        onClick={() => navigate(`/snippet/${snippet.id}`)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-secondary)', padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          textDecoration: 'none'
        }}
        onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-tertiary)' }}
        onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-secondary)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <IconComponent size={20} color="var(--text-primary)" style={{ opacity: 0.9 }} />
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px', marginBottom: '4px' }}>{snippet.title}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: langColor, textTransform: 'capitalize' }}>{snippet.language}</span>
              <span>&bull;</span>
              <span>{lineCount} lines</span>
              {showAuthor && snippet.profiles && (
                <Link 
                  to={`/profile/${snippet.profiles.username}`}
                  onClick={e => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'inherit' }}
                >
                  <span style={{ opacity: 0.5 }}>&bull;</span>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden' }}>
                    {snippet.profiles.avatar_url ? (
                      <img src={snippet.profiles.avatar_url} alt="A" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      snippet.profiles.username?.[0]?.toUpperCase() || '?'
                    )}
                  </div>
                  <span>{snippet.profiles.username}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CardAction icon={copying ? LuCheck : LuCopy} onClick={handleCopy} title="Copy" isActive={copying} activeColor="var(--accent-green)" />
          {allowFork && <CardAction icon={forked ? LuCheck : LuGitFork} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowForkMenu(!showForkMenu); setIsCreatingCollection(false) }} title="Fork" isActive={forked} activeColor="var(--accent-blue)" />}
          {allowDelete && <CardAction icon={LuTrash2} onClick={handleDelete} title="Delete" isActive={confirming} activeColor="var(--accent-red)" />}
        </div>
      </div>
    )
  }

  return (
    <div 
      onClick={() => navigate(`/snippet/${snippet.id}`)}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '20px', padding: '24px',
        cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden', height: '100%'
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-6px)'
        e.currentTarget.style.borderColor = `var(--text-muted)`
        e.currentTarget.style.boxShadow = `0 24px 48px rgba(0,0,0,0.1)`
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: `linear-gradient(180deg, ${langColor}10 0%, transparent 100%)`, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IconComponent size={24} color="var(--text-primary)" style={{ opacity: 0.9 }} />
            {showAuthor && (
              <Link 
                to={`/profile/${snippet.profiles?.username}`}
                onClick={e => e.stopPropagation()}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border)', paddingLeft: '12px', textDecoration: 'none' }}
              >
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden' }}>
                  {snippet.profiles?.avatar_url ? (
                    <img src={snippet.profiles.avatar_url} alt="A" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (snippet.profiles?.username || 'U')[0].toUpperCase()
                  )}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '-0.2px' }}>
                  {snippet.profiles?.username || 'User'}
                </span>
              </Link>
            )}
          </div>
          <span style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', textTransform: 'capitalize', fontWeight: 500 }}>
            {snippet.visibility}
          </span>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {snippet.title}
        </h3>

        {snippet.description && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
            {snippet.description}
          </p>
        )}

        <div className="mono" style={{ 
          background: 'var(--bg-primary)', borderRadius: '12px', padding: '16px',
          color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.6,
          marginBottom: '20px', overflow: 'hidden', maxHeight: '100px',
          border: '1px solid var(--border)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
        }}>
           {codeLines.map((line, i) => (
             <div key={i} style={{ whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 1 - (i * 0.18) }}>
               {line || ' '}
             </div>
           ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px', overflow: 'hidden' }}>
            {snippet.tags?.slice(0, 2).map(tag => (
              <span key={tag} style={{ color: 'var(--text-muted)', fontSize: '12px' }}>#{tag}</span>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
             <CardAction icon={copying ? LuCheck : LuCopy} onClick={handleCopy} title="Copy" isActive={copying} activeColor="var(--accent-green)" />
             
             {allowFork && (
               <div style={{ position: 'relative' }}>
                 <CardAction 
                   icon={forked ? LuCheck : LuGitFork} 
                   onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowForkMenu(!showForkMenu); setIsCreatingCollection(false) }} 
                   title="Fork to Vault" 
                   isActive={forked} 
                   activeColor="var(--accent-blue)" 
                 />
                 
                 {showForkMenu && (
                   <div style={{ 
                     position: 'absolute', bottom: '100%', right: 0, marginBottom: '12px',
                     width: '240px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                     borderRadius: '12px', overflow: 'hidden', zIndex: 100,
                     boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                     display: 'flex', flexDirection: 'column'
                   }}
                   onClick={e => e.stopPropagation()}
                   >
                     <div style={{ padding: '10px 14px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' }}>Fork to...</div>
                     <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                       <button 
                         onClick={() => handleFork(null)}
                         style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '13px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                         onMouseOver={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                         onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                       >
                         <LuFolderPlus size={14} /> Global Vault
                       </button>
                       {collections.map(c => (
                         <button 
                           key={c.id}
                           onClick={() => handleFork(c.id)}
                           style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '13px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                           onMouseOver={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                           onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                         >
                           <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color || 'var(--text-primary)' }} />
                           {c.name}
                         </button>
                       ))}
                     </div>

                     <div style={{ borderTop: '1px solid var(--border)', padding: '8px' }}>
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
                                if (e.key === 'Enter') handleCreateAndFork()
                                if (e.key === 'Escape') setIsCreatingCollection(false)
                              }}
                              placeholder="Folder Name..."
                              style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '6px 10px', fontSize: '12px', outline: 'none' }}
                            />
                            <button 
                              onClick={handleCreateAndFork}
                              disabled={forking || !newCollectionName.trim()}
                              style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 8px', cursor: 'pointer' }}
                            >
                              {forking ? '...' : <LuCheck size={14} />}
                            </button>
                          </div>
                        )}
                     </div>
                   </div>
                 )}
               </div>
             )}
             
             {allowDelete && <CardAction icon={LuTrash2} onClick={handleDelete} title="Delete" isActive={confirming} activeColor="var(--accent-red)" />}
          </div>
        </div>
      </div>
    </div>
  )
}