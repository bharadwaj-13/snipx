import { useEffect, useState } from 'react'
import { highlight } from '../lib/shiki'

export default function CodeBlock({ code, language }) {
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!code) return
    setLoading(true)
    highlight(code, language).then(result => {
      setHtml(result)
      setLoading(false)
    })
  }, [code, language])

  if (loading) return (
    <div style={{
      background: '#0d1117', borderRadius: '10px', padding: '1.25rem',
      fontFamily: 'monospace', fontSize: '13px', color: '#484f58', lineHeight: '1.6',
    }}>
      {code}
    </div>
  )

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ borderRadius: '10px', overflow: 'hidden', fontSize: '13px' }}
    />
  )
}