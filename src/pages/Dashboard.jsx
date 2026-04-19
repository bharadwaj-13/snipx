import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSnippets } from '../services/snippets'
import { getCollections } from '../services/collections'
import Navbar from '../components/Navbar'
import SnippetCard from '../components/SnippetCard'

const LANGUAGES = ['javascript', 'typescript', 'python', 'rust', 'go', 'css', 'html', 'sql', 'bash', 'json']

export default function Dashboard() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [snippets, setSnippets] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [filterLang, setFilterLang] = useState('')
  const [filterCollection, setFilterCollection] = useState('')
  const [filterVisibility, setFilterVisibility] = useState('')

  useEffect(() => {
    const colFromUrl = searchParams.get('collection')
    if (colFromUrl) setFilterCollection(colFromUrl)

    async function load() {
      const [{ data: s }, { data: c }] = await Promise.all([
        getSnippets(user.id),
        getCollections(user.id),
      ])
      setSnippets(s ?? [])
      setCollections(c ?? [])
      setLoading(false)
    }
    load()
  }, [user.id])

  const allTags = useMemo(() => {
    const set = new Set()
    snippets.forEach(s => s.tags?.forEach(t => set.add(t)))
    return [...set]
  }, [snippets])

  const filtered = useMemo(() => {
    return snippets.filter(s => {
      if (search && !s.title.toLowerCase().includes(search.toLowerCase()) &&
        !s.description?.toLowerCase().includes(search.toLowerCase()) &&
        !s.code.toLowerCase().includes(search.toLowerCase())) return false
      if (filterTag && !s.tags?.includes(filterTag)) return false
      if (filterLang && s.language !== filterLang) return false
      if (filterCollection && s.collection_id !== filterCollection) return false
      if (filterVisibility && s.visibility !== filterVisibility) return false
      return true
    })
  }, [snippets, search, filterTag, filterLang, filterCollection, filterVisibility])

  const inputStyle = {
    background: '#21262d', border: '1px solid #30363d', borderRadius: '8px',
    padding: '0.5rem 0.75rem', color: '#e6edf3', fontSize: '13px', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#e6edf3', fontWeight: '500', fontSize: '1.1rem' }}>
            my snippets
            <span style={{ color: '#484f58', fontWeight: '400', marginLeft: '8px', fontSize: '0.95rem' }}>
              {filtered.length} of {snippets.length}
            </span>
          </h2>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1.5rem' }}>
          <input
            type="text" placeholder="search snippets..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, minWidth: '220px', flex: 1 }}
          />
          <select value={filterLang} onChange={e => setFilterLang(e.target.value)} style={inputStyle}>
            <option value="">all languages</option>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={inputStyle}>
            <option value="">all tags</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterCollection} onChange={e => setFilterCollection(e.target.value)} style={inputStyle}>
            <option value="">all collections</option>
            {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterVisibility} onChange={e => setFilterVisibility(e.target.value)} style={inputStyle}>
            <option value="">all</option>
            <option value="private">private</option>
            <option value="public">public</option>
          </select>
        </div>

        {loading ? (
          <div style={{ color: '#484f58', fontFamily: 'monospace', padding: '3rem 0' }}>loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#484f58', fontFamily: 'monospace' }}>
            {snippets.length === 0 ? 'no snippets yet — create your first one' : 'no snippets match your filters'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {filtered.map(s => <SnippetCard key={s.id} snippet={s} onDelete={id => setSnippets(prev => prev.filter(s => s.id !== id))} />)}
          </div>
        )}
      </div>
    </div>
  )
}