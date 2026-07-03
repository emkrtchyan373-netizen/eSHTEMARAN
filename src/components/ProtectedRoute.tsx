import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient' // Ստուգիր հասցեն՝ ըստ քո ֆայլի դիրքի

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Ստուգում ենք՝ արդյոք օգտատերը ներկայումս մուտք գործած է
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session) // Եթե session-ը կա՝ true, եթե չկա՝ false
    }

    checkAuth()

    // Լսում ենք Auth-ի փոփոխությունները (օրինակ՝ եթե թոքենը հնանա կամ դուրս գա)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
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

  // Եթե ամեն ինչ կարգին է, ցույց ենք տալիս այն էջը, որը նա ուզում էր տեսնել
  return <>{children}</>
}