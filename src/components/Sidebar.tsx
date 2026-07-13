import { type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { GridIcon, MedalIcon, ClockIcon, GearIcon } from './Icons'
import './Sidebar.css'

type ActiveItem = 'shtemaran-1' | 'shtemaran-2' | 'shtemaran-3' | 'progress' | 'tests' | 'settings'

interface SidebarProps {
  active: ActiveItem
  isOpen?: boolean
  isTeacher?: boolean // 
  onNavigate?: () => void
}

export default function Sidebar({ active, isOpen = false, isTeacher = false, onNavigate }: SidebarProps) {
  

  const navItems: { id: ActiveItem; label: string; to: string; icon: ReactNode }[] = [
    { id: 'shtemaran-1', label: 'Շտեմարան 1', to: '/dashboard/shtemaran/1', icon: <GridIcon /> },
    { id: 'shtemaran-2', label: 'Շտեմարան 2', to: '/dashboard/shtemaran/2', icon: <GridIcon /> },
    { id: 'shtemaran-3', label: 'Շտեմարան 3', to: '/dashboard/shtemaran/3', icon: <GridIcon /> },
    { 
      id: 'progress', 
      label: isTeacher ? 'Աշակերտների առաջադիմություն' : 'Ձեր առաջադիմությունը', // 
      to: '/dashboard/progress', 
      icon: <MedalIcon /> 
    },
    { id: 'tests', label: 'Թեստեր', to: '/dashboard/tests', icon: <ClockIcon /> },
    { id: 'settings', label: 'Կարգավորումներ', to: '/dashboard/settings', icon: <GearIcon /> },
  ]

  return (
    <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
      <div className="sidebar__logo">
        <img src="/assets/logo.png" alt="eSHTEMARAN" />
      </div>

      <nav className="sidebar__nav armenian">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            className={`sidebar__link ${active === item.id ? 'sidebar__link--active' : ''}`}
            onClick={onNavigate}
          >
            <span className="sidebar__icon">{item.icon}</span>
            <span className="sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}