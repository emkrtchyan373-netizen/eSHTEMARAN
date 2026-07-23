import { useNavigate } from 'react-router-dom'
import './QuizLayout.css'

interface QuizHeaderProps {
  section: string
}

export default function QuizHeader({ section }: QuizHeaderProps) {
  const navigate = useNavigate()

  // 🎯 Եթե /mypage-ը դատարկ է, այստեղ փոխիր քո ճիշտ էջի հասցեով (օրինակ՝ '/dashboard' կամ '/profile')
  const DASHBOARD_PATH = '/dashboard/settings' 

  const handleProfileClick = () => {
    navigate(DASHBOARD_PATH)
  }

  return (
    <header className="quiz-header" style={{
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: '64px',
      padding: '0 28px',
      background: '#ffffff',
      borderBottom: '1px solid #ececec',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      gap: '0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo — full size, no clipping */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, overflow: 'visible' }}>
        <img
          src="/assets/logo.png"
          alt="Shtemaran Logo"
          style={{ height: '40px', width: 'auto', objectFit: 'contain', display: 'block' }}
        />
      </div>

      {/* Section badge */}
      <div style={{ marginLeft: '20px' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '5px 16px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, #4a3b80 0%, #6d4fad 100%)',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600',
          letterSpacing: '0.3px',
          boxShadow: '0 2px 8px rgba(74,59,128,0.3)',
          whiteSpace: 'nowrap',
        }}>
          {section}
        </span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Avatar button */}
      <button
        type="button"
        onClick={handleProfileClick}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '2px solid #e0dcd3',
          cursor: 'pointer',
          padding: 0,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          flexShrink: 0,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#4a3b80'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,59,128,0.15)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#e0dcd3'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <img
          src="/assets/avatar.png"
          alt="Profile"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="#b2ad9e" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
            }
          }}
        />
      </button>
    </header>
  )
}