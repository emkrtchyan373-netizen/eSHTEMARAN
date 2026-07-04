import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { BellIcon, SearchIcon } from './Icons'
import './DashboardHeader.css'

interface DashboardHeaderProps {
  isMobile?: boolean
  onMenuClick?: () => void
}

export default function DashboardHeader({ isMobile = false, onMenuClick }: DashboardHeaderProps) {
  const navigate = useNavigate()
  const [userName, setUserName] = useState<string>('')

  const avatarUrl = '/assets/avatar-small.png'

  useEffect(() => {
    const fetchHeaderData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name
        if (fullName) {
          setUserName(fullName.split(' ')[0])
        } else {
          setUserName(user.email?.split('@')[0] || 'User')
        }
      }
    }
    fetchHeaderData()
  }, [])

  return (
    <header className={`dash-header${isMobile ? ' dash-header--mobile' : ''}`}>
      {isMobile && (
        <button
          type="button"
          className="dash-header__menu"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <span className="dash-header__menu-line" />
          <span className="dash-header__menu-line" />
          <span className="dash-header__menu-line" />
        </button>
      )}

      <div className="dash-header__greeting">
        <h1 className="dash-header__title">Welcome, {userName || 'Loading...'}</h1>
        <p className="dash-header__date">Tue, 07 June 2022</p>
      </div>

      <div className="dash-header__actions">
        {!isMobile && (
          <div className="dash-header__search">
            <SearchIcon />
            <input type="search" placeholder="Search" aria-label="Search" />
          </div>
        )}

        <button type="button" className="dash-header__bell" aria-label="Notifications">
          <BellIcon />
        </button>

        <img
          src={avatarUrl}
          alt="User avatar"
          className="dash-header__avatar"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/dashboard/settings')}
        />
      </div>
    </header>
  )
}
