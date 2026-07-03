import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { BellIcon, SearchIcon } from './Icons'
import './DashboardHeader.css'

export default function DashboardHeader() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState<string>('')
  
  // Օգտագործում ենք քո նախընտրած հաստատուն լուսանկարի հասցեն (կամ ուղղակի ֆայլի անունը assets-ից)
  const avatarUrl = '/assets/avatar-small.png' 

  useEffect(() => {
    const fetchHeaderData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name
        if (fullName) {
          setUserName(fullName.split(' ')[0]) // Ցույց է տալիս միայն առաջին անունը (օր. erik)
        } else {
          setUserName(user.email?.split('@')[0] || 'User')
        }
      }
    }
    fetchHeaderData()
  }, [])

  return (
    <header className="dash-header">
      <div className="dash-header__greeting">
        <h1 className="dash-header__title">Welcome, {userName || 'Loading...'}</h1>
        <p className="dash-header__date">Tue, 07 June 2022</p>
      </div>

      <div className="dash-header__actions">
        <div className="dash-header__search">
          <SearchIcon />
          <input type="search" placeholder="Search" aria-label="Search" />
        </div>

        <button type="button" className="dash-header__bell" aria-label="Notifications">
          <BellIcon />
        </button>

        {/* Փոքր ավատարը, որին սեղմելիս բացվում է Settings-ը */}
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