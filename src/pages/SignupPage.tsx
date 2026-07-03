import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Քո Supabase էլ.փոստով գրանցման ֆունկցիան՝ անփոփոխ
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !fullName) {
      alert('Խնդրում ենք լրացնել բոլոր դաշտերը:')
      return
    }

    setLoading(true)

    const { data: signUpResult, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    setLoading(false)

    if (error) {
      alert('Գրանցման սխալ: ' + error.message)
    } else {
      console.log('Գրանցված օգտատեր:', signUpResult)
      alert('Գրանցումը հաջողվեց: Խնդրում ենք ստուգել էլ. փոստը հաստատման հղման համար:')
      setFullName('')
      setEmail('')
      setPassword('')
    }
  }

  // Քո Supabase Google OAuth ֆունկցիան՝ անփոփոխ
  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173/dashboard',
      }
    })
    if (error) {
      alert('Google մուտքի սխալ: ' + error.message)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center', // 🎯 Բերում է ֆորման հորիզոնական մեջտեղ
      alignItems: 'center',     // 🎯 Բերում է ֆորման ուղղահայաց մեջտեղ
      minHeight: '100vh',
      width: '100vw',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f9f6f0',
      margin: 0,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      
      {/* ✍️ ԳՐԱՆՑՄԱՆ ԲԼՈԿԸ՝ ՀԻՄԱ ԷԿՐԱՆԻ ՃԻՇՏ ԿԵՆՏՐՈՆՈՒՄ */}
      <div style={{ 
        width: '100%', 
        maxWidth: '440px', 
        textAlign: 'center',
        backgroundColor: '#fff', // Սպիտակ սիրուն ֆոն ֆորմայի համար
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)' // Թեթև ստվեր
      }}>
        
        <h1 style={{ fontSize: '36px', fontWeight: '500', color: '#191919', marginBottom: '8px', letterSpacing: '-0.5px' }}>Create Account</h1>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px' }}>Join Shtemaran to start practicing</p>

        {/* 🎯 Google-ի Աշխատող Կոճակը */}
        <button 
          type="button" 
          onClick={handleGoogleSignUp}
          style={{
            width: '100%', padding: '12px', border: '1px solid #e0dcd3', borderRadius: '12px', backgroundColor: '#fff', color: '#191919', fontSize: '16px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fbfbfa'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.61z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.87-3.04.87-2.34 0-4.33-1.58-5.03-3.71H.95v2.33C2.43 15.89 5.47 18 9 18z"/>
            <path fill="#FBBC05" d="M3.97 10.72c-.18-.54-.28-1.12-.28-1.72s.1-1.18.28-1.72V4.95H.95C.35 6.16 0 7.54 0 9s.35 2.84.95 4.05l3.02-2.33z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.42C13.46.97 11.43 0 9 0 5.47 0 2.43 2.11.95 5.18l3.02 2.33c.7-2.13 2.69-3.71 5.03-3.71z"/>
          </svg>
          Sign up with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: '#b2ad9e' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0dcd3' }} />
          <span style={{ padding: '0 12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0dcd3' }} />
        </div>

        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ textAlign: 'left' }}>
            <label htmlFor="fullname" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '6px' }}>Full Name</label>
            <input id="fullname" type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e0dcd3', fontSize: '15px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '6px' }}>Email</label>
            <input id="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e0dcd3', fontSize: '15px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '6px' }}>Password</label>
            <input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e0dcd3', fontSize: '15px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', backgroundColor: '#191919', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'opacity 0.2s' }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.opacity = '1')}
          >
            {loading ? 'Loading...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '25px', fontSize: '14px', color: '#666' }}>
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: '#191919', fontWeight: '600', padding: 0, font: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Login
          </button>
        </p>

      </div>
    </div>
  )
}