import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'

export type UserRole = 'student' | 'teacher'

// Դերը նախ վերցնում ենք auth metadata-ից, իսկ եթե չկա (օր.՝ Google մուտք)՝ users աղյուսակից
export function useUserRole() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const resolve = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (cancelled) return
        setUser(user)

        if (!user) {
          setRole(null)
          return
        }

        const metaRole = user.user_metadata?.role
        if (metaRole === 'teacher' || metaRole === 'student') {
          setRole(metaRole)
          return
        }

        const { data: dbUser, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (cancelled) return
        setRole(!error && dbUser?.role === 'teacher' ? 'teacher' : 'student')
      } catch (err) {
        console.error('Error resolving user role:', err)
        if (!cancelled) setRole('student')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    resolve()
    return () => { cancelled = true }
  }, [])

  return { user, role, loading }
}
