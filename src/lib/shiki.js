import { createHighlighter } from 'shiki'

let highlighter = null

export async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark'],
      langs: [
        'javascript', 'typescript', 'python', 'rust', 'go',
        'css', 'html', 'sql', 'bash', 'json', 'plaintext'
      ]
    })
  }
  return highlighter
}

export async function highlight(code, language) {
  const hl = await getHighlighter()
  const validLangs = [
    'javascript', 'typescript', 'python', 'rust', 'go',
    'css', 'html', 'sql', 'bash', 'json'
  ]
  const lang = validLangs.includes(language) ? language : 'plaintext'
  return hl.codeToHtml(code, { lang, theme: 'github-dark' })
}