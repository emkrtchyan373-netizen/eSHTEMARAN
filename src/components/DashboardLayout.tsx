import { type ReactNode } from 'react'
import Sidebar from './Sidebar'
import DashboardHeader from './DashboardHeader'
import './DashboardLayout.css'

type ActiveItem = 'shtemaran-1' | 'shtemaran-2' | 'shtemaran-3' | 'progress' | 'tests' | 'settings'

interface DashboardLayoutProps {
  active: ActiveItem
  children: ReactNode
}

export default function DashboardLayout({ active, children }: DashboardLayoutProps) {
  return (
    <div className="dashboard">
      <Sidebar active={active} />
      <main className="dashboard__main">
        <DashboardHeader />
        {children}
      </main>
    </div>
  )
}
