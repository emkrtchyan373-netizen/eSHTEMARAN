import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient' // Ստուգիր հասցեն՝ ըստ քո ֆայլի դիրքի

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  // 🔐 Չհաստատված ուսուցչի սեսիան արգելափակվում է ամբողջ dashboard-ում
  const [teacherBlock, setTeacherBlock] = useState<'pending' | 'denied' | null>(null)

  useEffect(() => {
    // Ստուգում ենք՝ արդյոք օգտատերը ներկայումս մուտք գործած է
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)

      if (session?.user?.user_metadata?.role === 'teacher') {
        const { data: approval } = await supabase
          .from('teacher_approvals')
          .select('status')
          .eq('user_id', session.user.id)
          .maybeSingle()

        // Հին հաշիվները, որոնց համար գրառում չկա, համարվում են հաստատված
        if (approval?.status === 'pending' || approval?.status === 'denied') {
          setTeacherBlock(approval.status)
        } else {
          setTeacherBlock(null)
        }
      } else {
        setTeacherBlock(null)
      }
    }

    checkAuth()

    // Լսում ենք Auth-ի փոփոխությունները (օրինակ՝ եթե թոքենը հնանա կամ դուրս գա)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      if (!session) setTeacherBlock(null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Քանի դեռ Supabase-ը ստուգում է հաշիվը, ցույց ենք տալիս Loading
  if (isAuthenticated === null) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
  }

  // Եթե օգտատերը մուտք չի գործել, նրան ավտոմատ հետ ենք ուղարկում Login էջ
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Չհաստատված ուսուցիչը հաշիվ մուտք չունի մինչև ադմինի հաստատումը
  if (teacherBlock) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f6f0', padding: '20px', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '440px', width: '100%', backgroundColor: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {teacherBlock === 'pending' ? '⏳' : '⛔'}
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#191919', marginBottom: '10px' }}>
            {teacherBlock === 'pending'
              ? 'Ձեր հաշիվը սպասում է հաստատման'
              : 'Ձեր հաշվի հայցը մերժվել է'}
          </h1>
          <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.5, marginBottom: '24px' }}>
            {teacherBlock === 'pending'
              ? 'Ուսուցչի հաշիվը հասանելի կդառնա ադմինիստրատորի հաստատումից հետո:'
              : 'Հարցերի դեպքում կապվեք ադմինիստրատորի հետ:'}
          </p>
          <button
            type="button"
            onClick={async () => { await supabase.auth.signOut() }}
            style={{ padding: '12px 24px', backgroundColor: '#191919', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
          >
            Դուրս գալ
          </button>
        </div>
      </div>
    )
  }

  // Եթե ամեն ինչ կարգին է, ցույց ենք տալիս այն էջը, որը նա ուզում էր տեսնել
  return <>{children}</>
}
