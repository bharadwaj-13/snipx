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

  async function fetchProfile(userId) {
    console.log('fetchProfile called for userId:', userId)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('fetchProfile result:', { data, error, code: error?.code, message: error?.message })

      if (error && error.code === 'PGRST116') {
        const metadata = user?.user_metadata || {}
        // Profile doesn't exist, create a default one with OAuth data if available
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: metadata.full_name || metadata.name || null,
            bio: null,
            avatar_url: metadata.avatar_url || metadata.picture || null,
            website: null,
            twitter: null,
            github: null
          })
          .select()
          .single()

        console.log('Profile creation result:', { newProfile, createError })

        if (createError) {
          console.error('Error creating profile:', createError)
          setProfile(null)
        } else {
          setProfile(newProfile)
        }
      } else if (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
      } else {
        // Profile found, check if we need to backfill OAuth data (e.g. avatar)
        const metadata = user?.user_metadata || {}
        const needsSync = !data.avatar_url && (metadata.avatar_url || metadata.picture)
        
        if (needsSync) {
          const syncUpdates = {
            avatar_url: metadata.avatar_url || metadata.picture,
            username: data.username || metadata.full_name || metadata.name
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
      setLoading(false)
    }
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })

    // If signup successful and user exists, create profile
    if (data?.user && !error) {
      try {
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: null,
            bio: null,
            avatar_url: null,
            website: null,
            twitter: null,
            github: null
          })
      } catch (profileError) {
        console.error('Error creating profile on signup:', profileError)
        // Don't fail signup if profile creation fails
      }
    }

    return { data, error }
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
      .upsert(payload, { onConflict: 'id', returning: 'representation' })
      .select()
      .single()

    if (error) {
      console.error("Profile Upsert Error:", error)
      throw error
    }
    setProfile(data)
    return data
  }

  async function signInWithOAuth(provider) {
    console.log('signInWithOAuth called for:', provider)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
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