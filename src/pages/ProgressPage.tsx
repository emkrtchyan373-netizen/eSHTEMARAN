import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase } from '../supabaseClient'

interface QuizResult {
  id: string
  created_at: string
  section_name: string
  questions_count: number
  answered_count?: number
  time_spent: string
  wrongs_count: number
  wrong_questions_ids?: number[]
  student_email?: string
}

export default function ProgressPage() {
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [studentResults, setStudentResults] = useState<QuizResult[]>([])
  const [searchEmail, setSearchEmail] = useState('')
  const [searchedStudentResults, setSearchedStudentResults] = useState<QuizResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    checkUserRoleAndFetchData()
  }, [])

  const checkUserRoleAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = !dbError && dbUser ? dbUser.role : 'student'
        setUserRole(role)

        if (role === 'student') {
          fetchStudentResults(user.id)
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentResults = async (userId: string) => {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setStudentResults(data)
    }
  }

  const handleSearchStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchEmail.trim()) return

    setSearchLoading(true)
    
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('student_email', searchEmail.trim().toLowerCase())
      .order('created_at', { ascending: false })

    setSearchLoading(false)

    if (error) {
      alert('Որոնման սխալ: ' + error.message)
    } else if (data && data.length === 0) {
      alert('Այս էլ. փոստով ոչ մի աշակերտի արդյունք չգտնվեց:')
      setSearchedStudentResults([])
    } else if (data) {
      setSearchedStudentResults(data)
    }
  }

  if (loading) {
    return (
      <DashboardLayout active="progress">
        <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px', color: '#666' }}>Բեռնվում է...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout active="progress">
      <div className="dash-card" style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
        
        {userRole === 'teacher' && (
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#191919' }}>
              Ձեր աշակերտների առաջադիմությունը
            </h1>

            <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px', color: '#666' }}>
              Փնտրել աշակերտին ըստ Gmail-ի
            </h2>
            <form onSubmit={handleSearchStudent} style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
              <input 
                type="email" 
                placeholder="Աշակերտի էլ. փոստը (Gmail)" 
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e0dcd3', fontSize: '15px', outline: 'none' }}
              />
              <button 
                type="submit" 
                style={{ padding: '12px 24px', backgroundColor: '#191919', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                {searchLoading ? 'Որոնվում է...' : 'Որոնել'}
              </button>
            </form>

            {searchedStudentResults.length > 0 ? (
              <ResultsTable results={searchedStudentResults} isTeacher={true} />
            ) : (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Գրեք աշակերտի Gmail-ը՝ արդյունքները տեսնելու համար:</p>
            )}
          </div>
        )}

        {userRole === 'student' && (
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#191919' }}>
              Ձեր առաջադիմությունը
            </h1>
            
            {studentResults.length > 0 ? (
              <ResultsTable results={studentResults} isTeacher={false} />
            ) : (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Դուք դեռ ոչ մի վարժություն չեք պահպանել:</p>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}

function ResultsTable({ results, isTeacher }: { results: QuizResult[], isTeacher: boolean }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0dcd3', color: '#666' }}>
            {isTeacher && <th style={{ padding: '12px' }}>Աշակերտ</th>}
            <th style={{ padding: '12px' }}>Բաժին / Section</th>
            <th style={{ padding: '12px' }}>Կատարված հարցեր</th>
            <th style={{ padding: '12px' }}>Ծախսած ժամանակ</th>
            <th style={{ padding: '12px' }}>Սխալներ</th>
            <th style={{ padding: '12px' }}>Ամսաթիվ</th>
          </tr>
        </thead>
        <tbody>
          {results.map((res) => (
            <tr key={res.id} style={{ borderBottom: '1px solid #f0ede6', color: '#191919' }}>
              {isTeacher && <td style={{ padding: '12px', fontWeight: '500' }}>{res.student_email}</td>}
              <td style={{ padding: '12px', fontWeight: '500' }}>{res.section_name}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ fontWeight: '600' }}>{res.answered_count ?? 0}</span>
                <span style={{ color: '#888' }}> / {res.questions_count}</span>
              </td>
              <td style={{ padding: '12px' }}>{res.time_spent}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ color: res.wrongs_count > 0 ? '#ea4335' : '#34a853', fontWeight: '600' }}>
                  {res.wrongs_count} սխալ
                </span>
                {res.wrongs_count > 0 && res.wrong_questions_ids && res.wrong_questions_ids.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#ea4335', marginTop: '4px', fontWeight: '500' }}>
                    Wrong questions: {res.wrong_questions_ids.join(', ')}
                  </div>
                )}
              </td>
              <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                {new Date(res.created_at).toLocaleString('hy-AM')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}