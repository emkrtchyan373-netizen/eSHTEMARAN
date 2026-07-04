import { useState, useEffect, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import DashboardHeader from './DashboardHeader'
import { useIsMobile } from '../hooks/useIsMobile'
import './DashboardLayout.css'

type ActiveItem = 'shtemaran-1' | 'shtemaran-2' | 'shtemaran-3' | 'progress' | 'tests' | 'settings'

interface DashboardLayoutProps {
  active: ActiveItem
  children: ReactNode
}

export default function DashboardLayout({ active, children }: DashboardLayoutProps) {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false)
    }
  }, [isMobile])

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', isMobile && sidebarOpen)
    return () => document.body.classList.remove('sidebar-open')
  }, [isMobile, sidebarOpen])

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className={`dashboard${isMobile ? ' dashboard--mobile' : ''}`}>
      {isMobile && (
        <button
          type="button"
          className={`sidebar-overlay${sidebarOpen ? ' sidebar-overlay--visible' : ''}`}
          aria-label="Close menu"
          onClick={closeSidebar}
        />
      )}

      <Sidebar
        active={active}
        isOpen={isMobile && sidebarOpen}
        onNavigate={isMobile ? closeSidebar : undefined}
      />

      <main className="dashboard__main">
        <DashboardHeader
          isMobile={isMobile}
          onMenuClick={() => setSidebarOpen(true)}
        />
        {children}
      </main>
    </div>
  )
}
