# snipx — personal code snippet manager

A fast, beautiful snippet vault. Better than GitHub Gist.

## features
- VS Code-quality syntax highlighting (Shiki)
- Tags + full-text search
- Collections / folders
- Public / private visibility
- Shareable links (no login needed)
- Responsive dark UI

## tech stack
- React 18 + Vite
- Supabase (auth + database + RLS)
- Shiki (syntax highlighting)
- Tailwind CSS
- Vercel (deployment)

## setup
1. clone the repo
2. cp .env.example .env and fill in your Supabase keys
3. npm install
4. npm run dev