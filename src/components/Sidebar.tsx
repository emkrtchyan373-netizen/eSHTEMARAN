import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { GridIcon, MedalIcon, ClockIcon, GearIcon, UsersIcon, LogoutIcon, LockIcon } from './Icons'
import { useClassAccess } from '../hooks/useClassAccess'
import './Sidebar.css'

type ActiveItem = 'shtemaran-1' | 'shtemaran-2' | 'shtemaran-3' | 'progress' | 'tests' | 'classrooms' | 'settings'

interface SidebarProps {
  active: ActiveItem
  isOpen?: boolean
  isTeacher?: boolean // 
  onNavigate?: () => void
}

const LOCKED_WITHOUT_CLASS: ActiveItem[] = ['shtemaran-1', 'shtemaran-2', 'shtemaran-3', 'tests']

export default function Sidebar({ active, isOpen = false, isTeacher = false, onNavigate }: SidebarProps) {
  const navigate = useNavigate()
  const { hasAccess, loading: accessLoading } = useClassAccess()

  const handleLogout = async () => {
    if (!confirm('Դո՞ւրս գալ հաշվից:')) return
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Error signing out:', err)
    }
    onNavigate?.()
    navigate('/login', { replace: true })
  }


  const navItems: { id: ActiveItem; label: string; to: string; icon: ReactNode }[] = [
    { id: 'shtemaran-1', label: 'Շտեմարան 1', to: '/dashboard/shtemaran/1', icon: <GridIcon /> },
    { id: 'shtemaran-2', label: 'Շտեմարան 2', to: '/dashboard/shtemaran/2', icon: <GridIcon /> },
    { id: 'shtemaran-3', label: 'Շտեմարան 3', to: '/dashboard/shtemaran/3', icon: <GridIcon /> },
    { 
      id: 'progress', 
      label: isTeacher ? 'Աշակերտների \nառաջադիմություն' : 'Ձեր \n առաջադիմությունը', // 
      to: '/dashboard/progress', 
      icon: <MedalIcon /> 
    },
    { id: 'tests', label: 'Թեստեր', to: '/dashboard/tests', icon: <ClockIcon /> },
    {
      id: 'classrooms',
      label: isTeacher ? 'Իմ դասարանները' : 'Դասարաններ',
      to: '/dashboard/classrooms',
      icon: <UsersIcon />
    },
    { id: 'settings', label: 'Կարգավորումներ', to: '/dashboard/settings', icon: <GearIcon /> },
  ]

  return (
    <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
      <div className="sidebar__logo">
        <img src="/assets/logo.png" alt="eSHTEMARAN" />
      </div>

      <nav className="sidebar__nav armenian">
        {navItems.map((item) => {
          const isLocked = !accessLoading && !hasAccess && LOCKED_WITHOUT_CLASS.includes(item.id)
          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={`sidebar__link ${active === item.id ? 'sidebar__link--active' : ''}${isLocked ? ' sidebar__link--locked' : ''}`}
              onClick={onNavigate}
            >
              <span className="sidebar__icon">{isLocked ? <LockIcon /> : item.icon}</span>
              <span className="sidebar__label">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar__footer armenian">
        <button type="button" className="sidebar__link sidebar__logout" onClick={handleLogout}>
          <span className="sidebar__icon"><LogoutIcon /></span>
          <span className="sidebar__label">Դուրս գալ</span>
        </button>
      </div>
    </aside>
  )
}