import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { BellIcon, SearchIcon } from './Icons'
import { useUserRole } from '../hooks/useUserRole'
import './DashboardHeader.css'

interface TeacherNotification {
  id: string
  classroom_id: string | null
  classroom_name: string | null
  student_name: string | null
  student_email: string | null
  type?: 'result' | 'join_request'
  section_name: string | null
  questions_count: number | null
  answered_count: number | null
  wrongs_count: number | null
  time_spent: string | null
  is_read: boolean
  created_at: string
}

interface DashboardHeaderProps {
  isMobile?: boolean
  onMenuClick?: () => void
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'հենց նոր'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} րոպե առաջ`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ժամ առաջ`
  const days = Math.floor(hours / 24)
  return `${days} օր առաջ`
}

export default function DashboardHeader({ isMobile = false, onMenuClick }: DashboardHeaderProps) {
  const navigate = useNavigate()
  const [userName, setUserName] = useState<string>('')
  const { user, role } = useUserRole()

  const [notifications, setNotifications] = useState<TeacherNotification[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const bellWrapRef = useRef<HTMLDivElement>(null)

  const avatarUrl = '/assets/avatar-small.png'
  const unreadCount = notifications.filter((n) => !n.is_read).length

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

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from('teacher_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error && data) setNotifications(data)
  }, [])

  // Ուսուցչի ծանուցումներ + realtime բաժանորդագրություն
  useEffect(() => {
    if (role !== 'teacher' || !user) return

    fetchNotifications()

    const channel = supabase
      .channel('teacher-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'teacher_notifications',
          filter: `teacher_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications((prev) => [payload.new as TeacherNotification, ...prev].slice(0, 20))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [role, user, fetchNotifications])

  // Փակել dropdown-ը դրսում սեղմելիս
  useEffect(() => {
    if (!dropdownOpen) return
    const handleClick = (e: MouseEvent) => {
      if (bellWrapRef.current && !bellWrapRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length === 0) return

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await supabase.from('teacher_notifications').update({ is_read: true }).in('id', unreadIds)
  }

  const handleBellClick = () => {
    if (role !== 'teacher') return
    setDropdownOpen((open) => !open)
  }

  const openNotification = (n: TeacherNotification) => {
    setDropdownOpen(false)
    if (n.classroom_id) navigate(`/dashboard/classrooms/${n.classroom_id}`)
  }

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
        <p className="dash-header__date">
          {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="dash-header__actions">
        {!isMobile && (
          <div className="dash-header__search">
            <SearchIcon />
            <input type="search" placeholder="Search" aria-label="Search" />
          </div>
        )}

        <div ref={bellWrapRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="dash-header__bell"
            aria-label="Notifications"
            onClick={handleBellClick}
            style={{ position: 'relative' }}
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                minWidth: '16px', height: '16px', padding: '0 4px',
                borderRadius: '8px', backgroundColor: '#ea4335', color: '#fff',
                fontSize: '10px', fontWeight: 700, lineHeight: '16px',
                textAlign: 'center', boxSizing: 'border-box'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 'min(360px, 90vw)', maxHeight: '420px', overflowY: 'auto',
              backgroundColor: '#fff', borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #e0dcd3',
              zIndex: 100
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f0ede6' }}>
                <span style={{ fontWeight: 600, fontSize: '15px', color: '#191919' }}>Ծանուցումներ</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    style={{ background: 'none', border: 'none', color: '#888', fontSize: '13px', cursor: 'pointer', padding: 0 }}
                  >
                    Նշել բոլորը կարդացած
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p style={{ padding: '24px 16px', textAlign: 'center', color: '#888', fontSize: '14px', margin: 0 }}>
                  Դեռ ծանուցումներ չկան
                </p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => openNotification(n)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '12px 16px', border: 'none', borderBottom: '1px solid #f0ede6',
                      backgroundColor: n.is_read ? '#fff' : '#fbf7ec',
                      cursor: 'pointer', font: 'inherit'
                    }}
                  >
                    {n.type === 'join_request' ? (
                      <>
                        <div style={{ fontSize: '14px', color: '#191919', marginBottom: '2px' }}>
                          <b>{n.student_name || n.student_email || 'Աշակերտ'}</b>
                          {' '}ցանկանում է միանալ «{n.classroom_name}» դասարանին
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          Սեղմեք՝ հայցը հաստատելու կամ մերժելու համար
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '14px', color: '#191919', marginBottom: '2px' }}>
                          <b>{n.student_name || n.student_email || 'Աշակերտ'}</b>
                          {' '}ավարտեց «{n.section_name}»
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          {n.answered_count ?? 0} / {n.questions_count ?? 0} հարց ·{' '}
                          <span style={{ color: (n.wrongs_count ?? 0) > 0 ? '#ea4335' : '#34a853', fontWeight: 600 }}>
                            {n.wrongs_count ?? 0} սխալ
                          </span>
                          {n.classroom_name ? ` · ${n.classroom_name}` : ''}
                        </div>
                      </>
                    )}
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                      {timeAgo(n.created_at)}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

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
