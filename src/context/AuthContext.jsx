import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('Supabase Session Fetch Error:', error)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        else { setProfile(null); setLoading(false) }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId, retryCount = 0) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116' && retryCount < 3) {
        console.log('Profile not found, retrying in 1s...')
        setTimeout(() => fetchProfile(userId, retryCount + 1), 1000)
        return
      }

      if (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
      } else {
        const metadata = (await supabase.auth.getUser()).data.user?.user_metadata || {}
        
        // Sanitize synced data
        let oauthName = typeof metadata.full_name === 'string' ? metadata.full_name : 
                         typeof metadata.name === 'string' ? metadata.name : null
        
        if (oauthName) {
          oauthName = oauthName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')
        }

        const oauthAvatar = typeof metadata.avatar_url === 'string' ? metadata.avatar_url : 
                           typeof metadata.picture === 'string' ? metadata.picture : null

        // Sync if:
        // 1. Missing avatar
        // 2. Missing username OR current username is a default placeholder (user_...)
        const isPlaceholder = data.username?.startsWith('user_')
        const needsSync = (!data.avatar_url && oauthAvatar) || (!data.username && oauthName) || (isPlaceholder && oauthName)
        
        if (needsSync) {
          const syncUpdates = {
            avatar_url: data.avatar_url || oauthAvatar,
            username: (isPlaceholder && oauthName) ? oauthName : (data.username || oauthName)
          }
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .update(syncUpdates)
            .eq('id', userId)
            .select()
            .single()
          
          setProfile(updatedProfile || data)
        } else {
          setProfile(data)
        }
      }
    } catch (error) {

      console.error('Error in fetchProfile:', error)
      setProfile(null)
    } finally {
      if (retryCount === 0 || profile) setLoading(false)
    }
  }
  
    async function signUp(email, password) {
      return await supabase.auth.signUp({ email, password })
    }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function updateProfile(updates) {
    if (!user) throw new Error('No user logged in')

    const payload = { ...updates, id: user.id }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error("Profile Upsert Error:", error)
      throw error
    }
    setProfile(data)
    return data
  }

  async function signInWithOAuth(provider, redirectTo = '/dashboard') {
    console.log('signInWithOAuth called for:', provider, 'with redirect:', redirectTo)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo.startsWith('http') ? redirectTo : `${window.location.origin}${redirectTo}`
      }
    })
    return { data, error }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile, signInWithOAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)