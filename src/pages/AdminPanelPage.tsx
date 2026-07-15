import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import { supabase } from '../supabaseClient'

interface TeacherRequest {
  user_id: string
  email: string | null
  full_name: string | null
  status: 'pending' | 'approved' | 'denied'
  created_at: string
  decided_at: string | null
}

export default function AdminPanelPage() {
  const navigate = useNavigate()

  // null = դեռ ստուգվում է
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [adminEmail, setAdminEmail] = useState('')
  const [requests, setRequests] = useState<TeacherRequest[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // 🛡️ Մուտքի ստուգում. ոչ ադմինները վերադարձվում են /admin
  useEffect(() => {
    let cancelled = false
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (!cancelled) navigate('/admin', { replace: true })
        return
      }

      const { data: isAdmin } = await supabase.rpc('is_admin')
      if (cancelled) return

      if (isAdmin !== true) {
        navigate('/admin', { replace: true })
        return
      }

      setAdminEmail(session.user.email || '')
      setAllowed(true)
    }
    checkAccess()
    return () => { cancelled = true }
  }, [navigate])

  const fetchRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from('teacher_approvals')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setRequests(data)
    setListLoading(false)
  }, [])

  // Բեռնում + realtime թարմացում նոր հայցերի դեպքում
  useEffect(() => {
    if (!allowed) return

    fetchRequests()

    const channel = supabase
      .channel('teacher-approvals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teacher_approvals' },
        () => { fetchRequests() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [allowed, fetchRequests])

  const decide = async (req: TeacherRequest, approve: boolean) => {
    if (!approve) {
      const label = req.full_name || req.email || 'այս օգտատիրոջ'
      if (!confirm(`Մերժե՞լ ${label} ուսուցչի հաշվի հայցը:`)) return
    }

    setActionLoading(req.user_id)
    try {
      const { data, error } = await supabase.rpc('decide_teacher_request', {
        p_user_id: req.user_id,
        p_approve: approve
      })
      if (error) throw error
      if (!data?.success) {
        alert(data?.code === 'not_allowed' ? 'Դուք ադմինիստրատոր չեք:' : 'Գործողությունը չհաջողվեց:')
        return
      }
      fetchRequests()
    } catch (err: any) {
      alert('Սխալ: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin', { replace: true })
  }

  if (allowed === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f6f0', color: '#666', fontSize: '18px' }}>
        Բեռնվում է...
      </div>
    )
  }

  const pending = requests.filter((r) => r.status === 'pending')
  const decided = requests.filter((r) => r.status !== 'pending')

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9f6f0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Ադմին վահանակի վերնագիծ */}
        <header style={{ backgroundColor: '#191919', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🛡️</span>
            <span style={{ fontSize: '17px', fontWeight: 600 }}>eSHTEMARAN — Ադմին վահանակ</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '13px', color: '#bbb' }}>{adminEmail}</span>
            <button
              type="button"
              onClick={handleLogout}
              style={{ padding: '8px 16px', backgroundColor: '#fff', color: '#191919', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Դուրս գալ
            </button>
          </div>
        </header>

        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#191919', marginBottom: '20px' }}>
              Ուսուցիչների հաշիվների հաստատում
            </h1>

            {listLoading ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Բեռնվում է...</p>
            ) : (
              <>
                {/* Սպասող հայցեր */}
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#191919', marginBottom: '12px' }}>
                  Սպասող հայցեր {pending.length > 0 && `(${pending.length})`}
                </h2>

                {pending.length === 0 ? (
                  <p style={{ color: '#666', padding: '10px 0 24px' }}>Նոր հայցեր չկան:</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                    {pending.map((r) => (
                      <div key={r.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', backgroundColor: '#fbf7ec', border: '1px solid #ecdfc3', borderRadius: '14px', padding: '14px 18px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#191919', fontSize: '15px' }}>
                            {r.full_name || '—'}
                          </div>
                          <div style={{ fontSize: '13px', color: '#888' }}>{r.email}</div>
                          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                            Գրանցվել է՝ {new Date(r.created_at).toLocaleString('hy-AM')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            disabled={actionLoading === r.user_id}
                            onClick={() => decide(r, true)}
                            style={{ padding: '9px 20px', backgroundColor: '#34a853', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: actionLoading === r.user_id ? 0.6 : 1 }}
                          >
                            Հաստատել
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading === r.user_id}
                            onClick={() => decide(r, false)}
                            style={{ padding: '9px 20px', backgroundColor: '#fff', color: '#ea4335', border: '1px solid #e0dcd3', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: actionLoading === r.user_id ? 0.6 : 1 }}
                          >
                            Մերժել
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Որոշված հայցեր */}
                {decided.length > 0 && (
                  <>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#191919', marginBottom: '12px' }}>Որոշված հայցեր</h2>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e0dcd3', color: '#666' }}>
                            <th style={{ padding: '10px' }}>Ուսուցիչ</th>
                            <th style={{ padding: '10px' }}>Էլ. փոստ</th>
                            <th style={{ padding: '10px' }}>Կարգավիճակ</th>
                            <th style={{ padding: '10px' }}>Որոշման ամսաթիվ</th>
                            <th style={{ padding: '10px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {decided.map((r) => (
                            <tr key={r.user_id} style={{ borderBottom: '1px solid #f0ede6', color: '#191919' }}>
                              <td style={{ padding: '10px', fontWeight: 500 }}>{r.full_name || '—'}</td>
                              <td style={{ padding: '10px', color: '#666' }}>{r.email}</td>
                              <td style={{ padding: '10px' }}>
                                <span style={{
                                  padding: '3px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                                  backgroundColor: r.status === 'approved' ? '#e9f5ec' : '#fdecea',
                                  color: r.status === 'approved' ? '#34a853' : '#ea4335'
                                }}>
                                  {r.status === 'approved' ? 'Հաստատված' : 'Մերժված'}
                                </span>
                              </td>
                              <td style={{ padding: '10px', color: '#666', fontSize: '13px' }}>
                                {r.decided_at ? new Date(r.decided_at).toLocaleString('hy-AM') : '—'}
                              </td>
                              <td style={{ padding: '10px', textAlign: 'right' }}>
                                <button
                                  type="button"
                                  disabled={actionLoading === r.user_id}
                                  onClick={() => decide(r, r.status !== 'approved')}
                                  style={{ background: 'none', border: '1px solid #e0dcd3', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', color: '#444' }}
                                >
                                  {r.status === 'approved' ? 'Չեղարկել հաստատումը' : 'Հաստատել'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  )
}
