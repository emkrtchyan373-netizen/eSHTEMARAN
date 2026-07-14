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
    <header className="quiz-header" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <img src="/assets/logo.png" alt="Logo" className="quiz-header__logo" />
      <h1 className="quiz-header__section" style={{ marginLeft: '15px' }}>{section}</h1>

      {/* 🎯 Որոնումը և Զանգակը ամբողջությամբ ջնջված են */}

      {/* 🎯 margin-left: 'auto'-ն հրում է մարդուկին դեպի ամենաաջ անկյունը */}
      <button 
        type="button"
        onClick={handleProfileClick}
        className="quiz-header__avatar-container" 
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid #e0dcd3',
          cursor: 'pointer',
          padding: 0,
          marginLeft: 'auto' // 🔥 Աջ տեղափոխելու համար
        }}
      >
        <img 
          src="/assets/avatar.png" 
          alt="Profile" 
          className="quiz-header__avatar" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="#b2ad9e" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
            }
          }}
        />
      </button>
    </header>
  )
}