import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import PageTransition from '../components/PageTransition'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student') // 🎯 Դերի state
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      alert('Խնդրում ենք լրացնել բոլոր դաշտերը:')
      return
    }

    setLoading(true)

    const { data: loginResult, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      setLoading(false)
      alert('Մուտքի սխալ: ' + error.message)
      return
    }

    // 🔐 Դերի ստուգում. հաշիվը կապված է մեկ դերի հետ:
    // Աշակերտի էլ. փոստով հնարավոր չէ մուտք գործել որպես ուսուցիչ և հակառակը:
    const user = loginResult.user
    let accountRole = user?.user_metadata?.role as string | undefined

    if (accountRole !== 'student' && accountRole !== 'teacher') {
      const { data: dbUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', user!.id)
        .single()
      accountRole = dbUser?.role === 'teacher' ? 'teacher' : 'student'
    }

    if (accountRole !== role) {
      await supabase.auth.signOut()
      setLoading(false)
      alert(
        accountRole === 'student'
          ? 'Այս էլ. փոստը գրանցված է որպես ԱՇԱԿԵՐՏԻ հաշիվ: Նույն էլ. փոստով ուսուցչի հաշիվ մուտք գործել հնարավոր չէ: Ընտրեք «Student / Աշակերտ» դերը:'
          : 'Այս էլ. փոստը գրանցված է որպես ՈՒՍՈՒՑՉԻ հաշիվ: Նույն էլ. փոստով աշակերտի հաշիվ մուտք գործել հնարավոր չէ: Ընտրեք «Teacher / Ուսուցիչ» դերը:'
      )
      return
    }

    // 🔐 Ուսուցչի հաշիվը հասանելի է միայն ադմինի հաստատումից հետո
    if (accountRole === 'teacher') {
      const { data: approval } = await supabase
        .from('teacher_approvals')
        .select('status')
        .eq('user_id', user!.id)
        .maybeSingle()

      // Հին հաշիվները, որոնց համար գրառում չկա, համարվում են հաստատված
      if (approval?.status === 'pending' || approval?.status === 'denied') {
        await supabase.auth.signOut()
        setLoading(false)
        alert(
          approval.status === 'pending'
            ? 'Ձեր ուսուցչի հաշիվը դեռ սպասում է ադմինիստրատորի հաստատմանը: Փորձեք ավելի ուշ:'
            : 'Ձեր ուսուցչի հաշվի հայցը մերժվել է: Հարցերի դեպքում կապվեք ադմինիստրատորի հետ:'
        )
        return
      }
    }

    setLoading(false)
    alert('Դուք հաջողությամբ մուտք գործեցիք:')
    navigate('/dashboard/settings')
  }

  return (
    <PageTransition>
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100vw',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f9f6f0',
      margin: 0,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      
      <div style={{ 
        width: '100%', 
        maxWidth: '440px', 
        textAlign: 'center',
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)'
      }}>
        
        <h1 style={{ fontSize: '36px', fontWeight: '500', color: '#191919', marginBottom: '8px', letterSpacing: '-0.5px' }}>Sign-in</h1>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px' }}>Log in to your Shtemaran account</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 🎯 Role Selection Block */}
          <div style={{ textAlign: 'left', marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '8px' }}>
              Ընտրեք ձեր դերը / Select your role
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {/* Student Card */}
              <label style={{
                flex: 1,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px',
                borderRadius: '12px',
                border: role === 'student' ? '2px solid #191919' : '1px solid #e0dcd3',
                backgroundColor: role === 'student' ? '#fbfbfa' : '#fff',
                transition: 'all 0.2s'
              }}>
                <input 
                  type="radio" 
                  name="loginRole" 
                  checked={role === 'student'} 
                  onChange={() => setRole('student')} 
                  style={{ display: 'none' }} 
                />
                <span style={{ fontSize: '20px', marginBottom: '4px' }}>🎓</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#191919' }}>Student / Աշակերտ</span>
              </label>

              {/* Teacher Card */}
              <label style={{
                flex: 1,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px',
                borderRadius: '12px',
                border: role === 'teacher' ? '2px solid #191919' : '1px solid #e0dcd3',
                backgroundColor: role === 'teacher' ? '#fbfbfa' : '#fff',
                transition: 'all 0.2s'
              }}>
                <input 
                  type="radio" 
                  name="loginRole" 
                  checked={role === 'teacher'} 
                  onChange={() => setRole('teacher')} 
                  style={{ display: 'none' }} 
                />
                <span style={{ fontSize: '20px', marginBottom: '4px' }}>👨‍🏫</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#191919' }}>Teacher / Ուսուցիչ</span>
              </label>
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '6px' }}>Email</label>
            <input 
              id="email" 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e0dcd3', fontSize: '15px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }} 
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '6px' }}>Password</label>
            <input 
              id="password" 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e0dcd3', fontSize: '15px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none' }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', backgroundColor: '#191919', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'opacity 0.2s' }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.opacity = '1')}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: '25px', fontSize: '14px', color: '#666' }}>
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={() => navigate('/signup')}
            style={{ background: 'none', border: 'none', color: '#191919', fontWeight: '600', padding: 0, font: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Signup Here
          </button>
        </p>

      </div>
    </div>
    </PageTransition>
  )
}