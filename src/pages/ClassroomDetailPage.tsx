import { Fragment, useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import PageTransition from '../components/PageTransition'
import { supabase } from '../supabaseClient'
import { useUserRole } from '../hooks/useUserRole'

interface Classroom {
  id: string
  teacher_id: string
  name: string
  student_limit: number
  code: string
  created_at: string
}

interface Member {
  id: string
  student_id: string
  student_email: string | null
  student_name: string | null
  status: 'pending' | 'approved'
  joined_at: string
}

interface QuizResult {
  id: string
  created_at: string
  user_id: string
  section_name: string
  questions_count: number
  answered_count?: number
  time_spent: string
  wrongs_count: number
  wrong_questions_ids?: number[]
}

export default function ClassroomDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, loading: roleLoading } = useUserRole()

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    if (!id) return
    try {
      const { data: cls, error: clsError } = await supabase
        .from('classrooms')
        .select('*')
        .eq('id', id)
        .single()

      if (clsError || !cls) {
        setClassroom(null)
        return
      }
      setClassroom(cls)

      const { data: mem } = await supabase
        .from('classroom_members')
        .select('*')
        .eq('classroom_id', id)
        .order('joined_at', { ascending: true })

      const memberList: Member[] = mem || []
      setMembers(memberList)

      const approvedIds = memberList
        .filter((m) => m.status === 'approved')
        .map((m) => m.student_id)

      if (approvedIds.length > 0) {
        const { data: res } = await supabase
          .from('quiz_results')
          .select('*')
          .in('user_id', approvedIds)
          .order('created_at', { ascending: false })

        setResults(res || [])
      } else {
        setResults([])
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchAll() }, [fetchAll])

  const isTeacher = !!classroom && !!user && classroom.teacher_id === user.id
  const viewerMembership = members.find((m) => m.student_id === user?.id)

  const copyCode = () => {
    if (!classroom) return
    navigator.clipboard.writeText(classroom.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const approveRequest = async (member: Member) => {
    setActionLoading(member.id)
    try {
      const { data, error } = await supabase.rpc('approve_join_request', { p_member_id: member.id })
      if (error) throw error

      if (data?.success) {
        fetchAll()
      } else if (data?.code === 'full') {
        alert('Դասարանը լցված է. մեծացրեք աշակերտների սահմանաչափը կամ հեռացրեք մեկին:')
      } else {
        alert('Հաստատումը չհաջողվեց: Փորձեք նորից:')
      }
    } catch (err: any) {
      alert('Սխալ: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const rejectRequest = async (member: Member) => {
    const label = member.student_name || member.student_email || 'աշակերտի'
    if (!confirm(`Մերժե՞լ ${label} հայցը:`)) return

    setActionLoading(member.id)
    const { error } = await supabase.from('classroom_members').delete().eq('id', member.id)
    setActionLoading(null)

    if (error) {
      alert('Սխալ: ' + error.message)
    } else {
      fetchAll()
    }
  }

  const deleteClassroom = async () => {
    if (!classroom) return
    const memberCount = members.filter((m) => m.status === 'approved').length
    const memberNote = memberCount > 0
      ? ` Դասարանն ունի ${memberCount} աշակերտ, նրանք կհեռացվեն դասարանից:`
      : ''
    if (!confirm(`Ջնջե՞լ «${classroom.name}» դասարանը:${memberNote} Այս գործողությունը հնարավոր չէ հետարկել:`)) return

    setActionLoading('delete-classroom')
    const { error } = await supabase.from('classrooms').delete().eq('id', classroom.id)
    setActionLoading(null)

    if (error) {
      alert('Ջնջման սխալ: ' + error.message)
    } else {
      navigate('/dashboard/classrooms', { replace: true })
    }
  }

  const removeStudent = async (member: Member) => {
    const label = member.student_name || member.student_email || 'աշակերտին'
    if (!confirm(`Հեռացնե՞լ ${label} դասարանից:`)) return

    const { error } = await supabase.from('classroom_members').delete().eq('id', member.id)
    if (error) {
      alert('Սխալ: ' + error.message)
    } else {
      fetchAll()
    }
  }

  if (loading || roleLoading) {
    return (
      <PageTransition>
        <DashboardLayout active="classrooms">
          <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px', color: '#666' }}>Բեռնվում է...</div>
        </DashboardLayout>
      </PageTransition>
    )
  }

  if (!classroom) {
    return (
      <PageTransition>
        <DashboardLayout active="classrooms">
          <div className="dash-card" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#666', marginBottom: '16px' }}>Դասարանը չգտնվեց կամ դուք դրա անդամ չեք:</p>
            <button
              onClick={() => navigate('/dashboard/classrooms')}
              style={{ padding: '12px 24px', backgroundColor: '#191919', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              ← Վերադառնալ դասարաններ
            </button>
          </div>
        </DashboardLayout>
      </PageTransition>
    )
  }

  // Աշակերտը, ում հայցը դեռ հաստատված չէ, վահանակ չի տեսնում
  if (!isTeacher && viewerMembership?.status !== 'approved') {
    return (
      <PageTransition>
        <DashboardLayout active="classrooms">
          <div className="dash-card" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#191919', marginBottom: '8px' }}>{classroom.name}</h1>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              Ձեր հայցը դեռ սպասում է ուսուցչի հաստատմանը:
            </p>
            <button
              onClick={() => navigate('/dashboard/classrooms')}
              style={{ padding: '12px 24px', backgroundColor: '#191919', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              ← Վերադառնալ դասարաններ
            </button>
          </div>
        </DashboardLayout>
      </PageTransition>
    )
  }

  const approvedMembers = members.filter((m) => m.status === 'approved')
  const pendingMembers = members.filter((m) => m.status === 'pending')

  const resultsByStudent = new Map<string, QuizResult[]>()
  for (const r of results) {
    const list = resultsByStudent.get(r.user_id) || []
    list.push(r)
    resultsByStudent.set(r.user_id, list)
  }

  const recentResults = results.slice(0, 8)
  const memberById = new Map(members.map((m) => [m.student_id, m]))

  return (
    <PageTransition>
      <DashboardLayout active="classrooms">
        <div className="dash-card" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>

          {/* Վերնագիր */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <button
                onClick={() => navigate('/dashboard/classrooms')}
                style={{ background: 'none', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer', padding: 0, marginBottom: '8px' }}
              >
                ← Բոլոր դասարանները
              </button>
              <h1 style={{ fontSize: '26px', fontWeight: 600, color: '#191919', margin: 0 }}>{classroom.name}</h1>
              <p style={{ fontSize: '14px', color: '#888', margin: '4px 0 0' }}>
                Աշակերտներ՝ {approvedMembers.length} / {classroom.student_limit}
                {!isTeacher && ' · Դիտման ռեժիմ'}
              </p>
            </div>

            {isTeacher && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                <div style={{ backgroundColor: '#f9f6f0', borderRadius: '16px', padding: '16px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Միանալու կոդ
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '5px', color: '#191919', marginBottom: '8px' }}>
                    {classroom.code}
                  </div>
                  <button
                    onClick={copyCode}
                    style={{ background: '#fff', border: '1px solid #e0dcd3', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer', color: '#444' }}
                  >
                    {copied ? '✓ Պատճենված է' : 'Պատճենել կոդը'}
                  </button>
                </div>
                <button
                  type="button"
                  disabled={actionLoading === 'delete-classroom'}
                  onClick={deleteClassroom}
                  style={{ background: 'none', border: '1px solid #f0c9c4', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: '#ea4335', opacity: actionLoading === 'delete-classroom' ? 0.6 : 1 }}
                >
                  {actionLoading === 'delete-classroom' ? 'Ջնջվում է...' : 'Ջնջել դասարանը'}
                </button>
              </div>
            )}
          </div>

          {/* Միանալու հայցեր (միայն ուսուցչի համար) */}
          {isTeacher && pendingMembers.length > 0 && (
            <div style={{ marginBottom: '28px', backgroundColor: '#fbf7ec', border: '1px solid #ecdfc3', borderRadius: '16px', padding: '16px 20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#191919', margin: '0 0 12px' }}>
                Միանալու հայցեր ({pendingMembers.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingMembers.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', backgroundColor: '#fff', borderRadius: '12px', padding: '12px 16px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#191919', fontSize: '15px' }}>
                        {m.student_name || '—'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#888' }}>{m.student_email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        disabled={actionLoading === m.id}
                        onClick={() => approveRequest(m)}
                        style={{ padding: '8px 18px', backgroundColor: '#34a853', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: actionLoading === m.id ? 0.6 : 1 }}
                      >
                        Հաստատել
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === m.id}
                        onClick={() => rejectRequest(m)}
                        style={{ padding: '8px 18px', backgroundColor: '#fff', color: '#ea4335', border: '1px solid #e0dcd3', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: actionLoading === m.id ? 0.6 : 1 }}
                      >
                        Մերժել
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Վերջին արդյունքներ */}
          {recentResults.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#191919', marginBottom: '12px' }}>Վերջին արդյունքները</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentResults.map((r) => {
                  const member = memberById.get(r.user_id)
                  return (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fbfbfa', borderRadius: '12px', padding: '10px 16px', flexWrap: 'wrap', gap: '8px', fontSize: '14px' }}>
                      <span style={{ fontWeight: 600, color: '#191919' }}>
                        {member?.student_name || member?.student_email || 'Աշակերտ'}
                      </span>
                      <span style={{ color: '#666' }}>{r.section_name}</span>
                      <span>
                        <b>{r.answered_count ?? 0}</b><span style={{ color: '#888' }}> / {r.questions_count} հարց</span>
                      </span>
                      <span style={{ color: r.wrongs_count > 0 ? '#ea4335' : '#34a853', fontWeight: 600 }}>
                        {r.wrongs_count} սխալ
                      </span>
                      <span style={{ color: '#888', fontSize: '12px' }}>
                        {new Date(r.created_at).toLocaleString('hy-AM')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Աշակերտների ցուցակ */}
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#191919', marginBottom: '12px' }}>Աշակերտներ</h2>

          {approvedMembers.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              {isTeacher ? (
                <>Դեռ հաստատված աշակերտներ չկան: Կիսվեք <b>{classroom.code}</b> կոդով ձեր աշակերտների հետ:</>
              ) : (
                'Դեռ հաստատված աշակերտներ չկան:'
              )}
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0dcd3', color: '#666' }}>
                    <th style={{ padding: '12px' }}>Աշակերտ</th>
                    <th style={{ padding: '12px' }}>Էլ. փոստ</th>
                    <th style={{ padding: '12px' }}>Թեստեր</th>
                    <th style={{ padding: '12px' }}>Ընդհանուր սխալներ</th>
                    <th style={{ padding: '12px' }}>Վերջին ակտիվություն</th>
                    {isTeacher && <th style={{ padding: '12px' }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {approvedMembers.map((m) => {
                    const studentResults = resultsByStudent.get(m.student_id) || []
                    const totalWrongs = studentResults.reduce((sum, r) => sum + (r.wrongs_count || 0), 0)
                    const lastActivity = studentResults[0]?.created_at
                    const isExpanded = expandedStudent === m.student_id

                    return (
                      <Fragment key={m.id}>
                        <tr
                          onClick={() => setExpandedStudent(isExpanded ? null : m.student_id)}
                          style={{ borderBottom: '1px solid #f0ede6', color: '#191919', cursor: studentResults.length > 0 ? 'pointer' : 'default', backgroundColor: isExpanded ? '#fbfbfa' : 'transparent' }}
                        >
                          <td style={{ padding: '12px', fontWeight: 500 }}>
                            {studentResults.length > 0 && (
                              <span style={{ marginRight: '8px', fontSize: '11px', color: '#888' }}>{isExpanded ? '▼' : '▶'}</span>
                            )}
                            {m.student_name || '—'}
                            {m.student_id === user?.id && <span style={{ color: '#888', fontWeight: 400 }}> (դուք)</span>}
                          </td>
                          <td style={{ padding: '12px', color: '#666' }}>{m.student_email}</td>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{studentResults.length}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ color: totalWrongs > 0 ? '#ea4335' : '#34a853', fontWeight: 600 }}>{totalWrongs}</span>
                          </td>
                          <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                            {lastActivity ? new Date(lastActivity).toLocaleString('hy-AM') : 'Դեռ ակտիվություն չկա'}
                          </td>
                          {isTeacher && (
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeStudent(m) }}
                                style={{ background: 'none', border: '1px solid #e0dcd3', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', color: '#ea4335' }}
                              >
                                Հեռացնել
                              </button>
                            </td>
                          )}
                        </tr>

                        {isExpanded && studentResults.length > 0 && (
                          <tr>
                            <td colSpan={isTeacher ? 6 : 5} style={{ padding: '0 12px 16px', backgroundColor: '#fbfbfa' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '4px' }}>
                                <thead>
                                  <tr style={{ color: '#888', borderBottom: '1px solid #e0dcd3' }}>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>Բաժին</th>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>Հարցեր</th>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>Ժամանակ</th>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>Սխալներ</th>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>Ամսաթիվ</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {studentResults.map((r) => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #f0ede6' }}>
                                      <td style={{ padding: '8px', fontWeight: 500 }}>{r.section_name}</td>
                                      <td style={{ padding: '8px' }}>{r.answered_count ?? 0} / {r.questions_count}</td>
                                      <td style={{ padding: '8px' }}>{r.time_spent}</td>
                                      <td style={{ padding: '8px' }}>
                                        <span style={{ color: r.wrongs_count > 0 ? '#ea4335' : '#34a853', fontWeight: 600 }}>{r.wrongs_count}</span>
                                        {r.wrongs_count > 0 && r.wrong_questions_ids && r.wrong_questions_ids.length > 0 && (
                                          <span style={{ color: '#888' }}> (հարցեր՝ {r.wrong_questions_ids.join(', ')})</span>
                                        )}
                                      </td>
                                      <td style={{ padding: '8px', color: '#888' }}>{new Date(r.created_at).toLocaleString('hy-AM')}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </PageTransition>
  )
}
