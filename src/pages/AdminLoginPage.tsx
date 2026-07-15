import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import PageTransition from '../components/PageTransition'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Եթե ադմինն արդեն մուտք գործած է, ուղիղ վահանակ
  useEffect(() => {
    let cancelled = false
    const checkExisting = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || cancelled) return
      const { data: isAdmin } = await supabase.rpc('is_admin')
      if (!cancelled && isAdmin === true) navigate('/admin/panel', { replace: true })
    }
    checkExisting()
    return () => { cancelled = true }
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      alert('Խնդրում ենք լրացնել բոլոր դաշտերը:')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (error) {
        alert('Մուտքի սխալ: ' + error.message)
        return
      }

      // 🛡️ Միայն ադմինիստրատորի էլ. փոստով հաշիվները կարող են մտնել
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')

      if (adminError || isAdmin !== true) {
        await supabase.auth.signOut()
        alert('Այս հաշիվը ադմինիստրատորի հասանելիություն չունի:')
        return
      }

      navigate('/admin/panel', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: '12px',
    border: '1px solid #3a3a3a', fontSize: '15px',
    backgroundColor: '#262626', color: '#fff',
    boxSizing: 'border-box', outline: 'none'
  }

  return (
    <PageTransition>
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', width: '100vw',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#191919', margin: 0, padding: '20px', boxSizing: 'border-box'
      }}>
        <div style={{
          width: '100%', maxWidth: '420px', textAlign: 'center',
          backgroundColor: '#1f1f1f', border: '1px solid #333',
          padding: '40px', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.4)'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛡️</div>
          <h1 style={{ fontSize: '26px', fontWeight: 600, color: '#fff', marginBottom: '6px', letterSpacing: '-0.5px' }}>
            Admin Panel
          </h1>
          <p style={{ color: '#999', marginBottom: '30px', fontSize: '14px' }}>
            eSHTEMARAN ադմինիստրատորի մուտք
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'left' }}>
              <label htmlFor="adminEmail" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#bbb', marginBottom: '6px' }}>Email</label>
              <input
                id="adminEmail"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label htmlFor="adminPassword" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#bbb', marginBottom: '6px' }}>Password</label>
              <input
                id="adminPassword"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', backgroundColor: '#fff', color: '#191919',
                border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Ստուգվում է...' : 'Մուտք գործել'}
            </button>
          </form>

          <p style={{ marginTop: '25px', fontSize: '13px', color: '#777' }}>
            Մուտքը թույլատրված է միայն ադմինիստրատորներին
          </p>
        </div>
      </div>
    </PageTransition>
  )
}
