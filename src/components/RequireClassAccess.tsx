import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClassAccess } from '../hooks/useClassAccess'

// Փակում է շտեմարանները և թեստերը այն աշակերտների համար,
// ովքեր դեռ ոչ մի դասարանի հաստատված անդամ չեն:
export default function RequireClassAccess({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { user, hasAccess, loading } = useClassAccess()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f6f0', color: '#666', fontSize: '18px' }}>
        Բեռնվում է...
      </div>
    )
  }

  if (hasAccess) return <>{children}</>

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f6f0', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '440px', width: '100%', backgroundColor: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#191919', marginBottom: '10px' }}>
          Բաժինն արգելափակված է
        </h1>
        <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.5, marginBottom: '24px' }}>
          {user
            ? 'Շտեմարանները և թեստերը հասանելի են միայն դասարանի անդամներին: Միացեք դասարանին ձեր ուսուցչի տված կոդով:'
            : 'Շտեմարանները և թեստերը հասանելի են միայն դասարանի անդամներին: Մուտք գործեք և միացեք դասարանին ուսուցչի տված կոդով:'}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate(user ? '/dashboard/classrooms' : '/login')}
            style={{ padding: '12px 24px', backgroundColor: '#191919', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
          >
            {user ? 'Միանալ դասարանին' : 'Մուտք գործել'}
          </button>
          {user && (
            <button
              type="button"
              onClick={() => navigate('/dashboard/progress')}
              style={{ padding: '12px 24px', backgroundColor: '#fff', color: '#191919', border: '1px solid #e0dcd3', borderRadius: '12px', fontSize: '15px', fontWeight: 500, cursor: 'pointer' }}
            >
              Վահանակ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
