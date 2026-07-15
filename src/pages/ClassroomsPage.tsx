import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import PageTransition from '../components/PageTransition'
import { supabase } from '../supabaseClient'
import { useUserRole } from '../hooks/useUserRole'

interface Classroom {
  id: string
  name: string
  student_limit: number
  code: string
  created_at: string
  classroom_members?: { status: string }[]
}

interface JoinedClassroom {
  id: string
  joined_at: string
  status: 'pending' | 'approved'
  classrooms: {
    id: string
    name: string
    code: string
  } | null
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: '12px',
  border: '1px solid #e0dcd3', fontSize: '15px',
  backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none'
}

const buttonStyle: React.CSSProperties = {
  padding: '12px 24px', backgroundColor: '#191919', color: '#fff',
  border: 'none', borderRadius: '12px', fontSize: '15px',
  fontWeight: 600, cursor: 'pointer'
}

export default function ClassroomsPage() {
  const { user, role, loading } = useUserRole()

  return (
    <PageTransition>
      <DashboardLayout active="classrooms">
        <div className="dash-card" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px', color: '#666' }}>Բեռնվում է...</div>
          ) : role === 'teacher' ? (
            <TeacherClassrooms userId={user?.id || ''} />
          ) : (
            <StudentClassrooms />
          )}
        </div>
      </DashboardLayout>
    </PageTransition>
  )
}

/* ============ ՈՒՍՈՒՑՉԻ ՏԵՍՔ ============ */

function TeacherClassrooms({ userId }: { userId: string }) {
  const navigate = useNavigate()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'pending' | 'denied'>('approved')
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [studentLimit, setStudentLimit] = useState(30)
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchClassrooms = useCallback(async () => {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*, classroom_members(status)')
      .order('created_at', { ascending: false })

    if (!error && data) setClassrooms(data)
    setListLoading(false)
  }, [])

  useEffect(() => { fetchClassrooms() }, [fetchClassrooms])

  // Ուսուցչի հաշվի հաստատման կարգավիճակը (ադմինի որոշումը)
  useEffect(() => {
    if (!userId) return
    supabase
      .from('teacher_approvals')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        // Հին հաշիվները, որոնց համար գրառում չկա, համարվում են հաստատված
        if (data?.status === 'pending' || data?.status === 'denied') {
          setApprovalStatus(data.status)
        }
      })
  }, [userId])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Խնդրում ենք նշել դասարանի անունը:')
      return
    }
    if (studentLimit < 1 || studentLimit > 200) {
      alert('Աշակերտների քանակը պետք է լինի 1-ից 200:')
      return
    }

    setCreating(true)
    try {
      const { error } = await supabase
        .from('classrooms')
        .insert({ teacher_id: userId, name: name.trim(), student_limit: studentLimit })
        .select()
        .single()

      if (error) throw error

      setName('')
      setStudentLimit(30)
      setShowCreate(false)
      fetchClassrooms()
    } catch (err: any) {
      alert('Դասարանի ստեղծման սխալ: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (approvalStatus !== 'approved') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {approvalStatus === 'pending' ? '⏳' : '⛔'}
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#191919', marginBottom: '10px' }}>
          {approvalStatus === 'pending'
            ? 'Ձեր ուսուցչի հաշիվը սպասում է հաստատման'
            : 'Ձեր ուսուցչի հաշվի հայցը մերժվել է'}
        </h1>
        <p style={{ color: '#666', fontSize: '15px', maxWidth: '420px', margin: '0 auto' }}>
          {approvalStatus === 'pending'
            ? 'Ադմինիստրատորը պետք է հաստատի ձեր հաշիվը, որից հետո կկարողանաք ստեղծել դասարաններ:'
            : 'Դասարաններ ստեղծելու հնարավորությունն արգելափակված է: Հարցերի դեպքում կապվեք ադմինիստրատորի հետ:'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#191919', margin: 0 }}>Ձեր դասարանները</h1>
        <button style={buttonStyle} onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Փակել' : '+ Ստեղծել դասարան'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} style={{ backgroundColor: '#fbfbfa', border: '1px solid #e0dcd3', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 220px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#444', marginBottom: '6px' }}>Դասարանի անունը</label>
              <input
                type="text"
                placeholder="Օր.՝ 12Ա դասարան"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: '1 1 140px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#444', marginBottom: '6px' }}>Աշակերտների քանակ</label>
              <input
                type="number"
                min={1}
                max={200}
                value={studentLimit}
                onChange={(e) => setStudentLimit(parseInt(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>
          </div>
          <button type="submit" disabled={creating} style={{ ...buttonStyle, marginTop: '16px', opacity: creating ? 0.7 : 1 }}>
            {creating ? 'Ստեղծվում է...' : 'Ստեղծել'}
          </button>
        </form>
      )}

      {listLoading ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Բեռնվում է...</p>
      ) : classrooms.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
          Դուք դեռ դասարան չունեք: Ստեղծեք առաջինը՝ վերևի կոճակով:
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {classrooms.map((c) => {
            const memberCount = c.classroom_members?.filter((m) => m.status === 'approved').length ?? 0
            const pendingCount = c.classroom_members?.filter((m) => m.status === 'pending').length ?? 0
            return (
              <div
                key={c.id}
                style={{ border: '1px solid #e0dcd3', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#191919', margin: '0 0 4px' }}>{c.name}</h2>
                  <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                    Ստեղծվել է՝ {new Date(c.created_at).toLocaleDateString('hy-AM')}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>Միանալու կոդ՝</span>
                  <code style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '2px', backgroundColor: '#f9f6f0', padding: '4px 10px', borderRadius: '8px', color: '#191919' }}>
                    {c.code}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyCode(c.id, c.code)}
                    style={{ background: 'none', border: '1px solid #e0dcd3', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', color: '#444' }}
                  >
                    {copiedId === c.id ? '✓ Պատճենված է' : 'Պատճենել'}
                  </button>
                </div>

                <div style={{ fontSize: '14px', color: '#444' }}>
                  Աշակերտներ՝ <b>{memberCount}</b> / {c.student_limit}
                  {pendingCount > 0 && (
                    <span style={{ marginLeft: '10px', backgroundColor: '#fbf7ec', color: '#b8860b', padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>
                      {pendingCount} նոր հայց
                    </span>
                  )}
                </div>

                <button
                  style={{ ...buttonStyle, padding: '10px 20px', marginTop: 'auto' }}
                  onClick={() => navigate(`/dashboard/classrooms/${c.id}`)}
                >
                  Բացել վահանակը
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ============ ԱՇԱԿԵՐՏԻ ՏԵՍՔ ============ */

function StudentClassrooms() {
  const navigate = useNavigate()
  const [joined, setJoined] = useState<JoinedClassroom[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)

  const fetchJoined = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setListLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('classroom_members')
      .select('id, joined_at, status, classrooms(id, name, code)')
      .eq('student_id', user.id)
      .order('joined_at', { ascending: false })

    if (!error && data) setJoined(data as unknown as JoinedClassroom[])
    setListLoading(false)
  }, [])

  useEffect(() => { fetchJoined() }, [fetchJoined])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) {
      alert('Խնդրում ենք մուտքագրել դասարանի կոդը:')
      return
    }

    setJoining(true)
    try {
      const { data, error } = await supabase.rpc('join_classroom', { p_code: trimmed })
      if (error) throw error

      if (data?.success) {
        alert(`Հայցն ուղարկվեց «${data.classroom_name}» դասարանի ուսուցչին: Կմիանաք հաստատումից հետո:`)
        setCode('')
        fetchJoined()
      } else {
        const messages: Record<string, string> = {
          not_found: 'Այս կոդով դասարան չգտնվեց: Ստուգեք կոդը և փորձեք նորից:',
          already_member: `Դուք արդեն «${data?.classroom_name}» դասարանի անդամ եք:`,
          already_pending: `Դուք արդեն հայց եք ուղարկել «${data?.classroom_name}» դասարանին: Սպասեք ուսուցչի հաստատմանը:`,
          full: `«${data?.classroom_name}» դասարանը լցված է. դիմեք ձեր ուսուցչին:`,
          own_classroom: 'Դուք չեք կարող միանալ ձեր սեփական դասարանին:',
          not_authenticated: 'Մուտք գործեք՝ դասարանին միանալու համար:'
        }
        alert(messages[data?.code] || 'Միանալ չհաջողվեց: Փորձեք նորից:')
      }
    } catch (err: any) {
      alert('Միանալու սխալ: ' + err.message)
    } finally {
      setJoining(false)
    }
  }

  const handleLeave = async (m: JoinedClassroom) => {
    const className = m.classrooms?.name || ''
    const question = m.status === 'pending'
      ? `Չեղարկե՞լ «${className}» դասարանին միանալու հայցը:`
      : `Դուրս գա՞լ «${className}» դասարանից:`
    if (!confirm(question)) return

    const { error } = await supabase.from('classroom_members').delete().eq('id', m.id)
    if (error) {
      alert('Սխալ: ' + error.message)
    } else {
      fetchJoined()
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#191919', marginBottom: '20px' }}>Իմ դասարանները</h1>

      <div style={{ backgroundColor: '#fbfbfa', border: '1px solid #e0dcd3', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#666', margin: '0 0 12px' }}>
          Միացեք դասարանին ուսուցչի տված կոդով
        </h2>
        <form onSubmit={handleJoin} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Օր.՝ A3F7K2"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            style={{ ...inputStyle, flex: '1 1 180px', width: 'auto', letterSpacing: '3px', fontWeight: 600, textTransform: 'uppercase' }}
          />
          <button type="submit" disabled={joining} style={{ ...buttonStyle, opacity: joining ? 0.7 : 1 }}>
            {joining ? 'Միանում է...' : 'Միանալ'}
          </button>
        </form>
      </div>

      {listLoading ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Բեռնվում է...</p>
      ) : joined.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
          Դուք դեռ ոչ մի դասարանի անդամ չեք: Մուտքագրեք կոդը վերևում՝ միանալու համար:
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {joined.map((m) => (
            <div
              key={m.id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e0dcd3', borderRadius: '16px', padding: '16px 20px', flexWrap: 'wrap', gap: '10px' }}
            >
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#191919', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {m.classrooms?.name || 'Դասարան'}
                  {m.status === 'pending' && (
                    <span style={{ backgroundColor: '#fbf7ec', color: '#b8860b', padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>
                      Սպասում է հաստատման
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: '#888' }}>
                  {m.status === 'pending' ? 'Հայցն ուղարկվել է՝ ' : 'Միացել եք՝ '}
                  {new Date(m.joined_at).toLocaleDateString('hy-AM')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {m.status === 'approved' && m.classrooms?.id && (
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/classrooms/${m.classrooms!.id}`)}
                    style={{ padding: '8px 16px', backgroundColor: '#191919', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Դիտել վահանակը
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleLeave(m)}
                  style={{ background: 'none', border: '1px solid #e0dcd3', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', color: '#ea4335', fontWeight: 500 }}
                >
                  {m.status === 'pending' ? 'Չեղարկել հայցը' : 'Դուրս գալ'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
