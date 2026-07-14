import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useUserRole } from './useUserRole'

// Ուսուցիչներն ունեն լիարժեք հասանելիություն.
// աշակերտները՝ միայն եթե առնվազն մեկ դասարանի հաստատված անդամ են:
export function useClassAccess() {
  const { user, role, loading: roleLoading } = useUserRole()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (roleLoading) return
    let cancelled = false

    const check = async () => {
      if (!user) {
        setHasAccess(false)
        setLoading(false)
        return
      }
      if (role === 'teacher') {
        setHasAccess(true)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('classroom_members')
        .select('id')
        .eq('student_id', user.id)
        .eq('status', 'approved')
        .limit(1)

      if (!cancelled) {
        setHasAccess(!error && !!data && data.length > 0)
        setLoading(false)
      }
    }

    check()
    return () => { cancelled = true }
  }, [user, role, roleLoading])

  return { user, role, hasAccess, loading: loading || roleLoading }
}
