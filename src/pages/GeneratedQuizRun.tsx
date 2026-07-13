import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function GeneratedQuizRun() {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  
  // Ստանում ենք մոդալից ուղարկված տվյալները
  const config = location.state as { shtemarans: number[], sections: any[] }

  useEffect(() => {
    if (!config) {
      navigate('/dashboard/tests')
      return
    }
    loadRandomQuestions()
  }, [config])

  const loadRandomQuestions = async () => {
    setLoading(true)
    try {
      let loadedQuestions: any[] = []

      for (const sec of config.sections) {
        const { data, error } = await supabase
          .from('questions_pool')
          .select('*')
          .in('shtemaran_number', config.shtemarans)
          .eq('section_name', sec.name)

        if (!error && data) {
          // Խառնում ենք հարցերը և վերցնում միայն օգտատիրոջ ուզած քանակը
          const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, sec.count)
          loadedQuestions = [...loadedQuestions, ...shuffled]
        }
      }

      setQuestions(loadedQuestions)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Հարցերը պատահական ընտրվում են...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => navigate('/dashboard/tests')} style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}>← Եդ դեպի թեստեր</button>
      
      <h2 style={{ marginBottom: '24px' }}>Գեներացված Թեստ ({questions.length} հարց)</h2>

      {/* 🎨 ՔՈ ՍԵԿՑԻԱՆԵՐԻ ԴԻԶԱՅՆԸ ԱՅՍՏԵՂ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {questions.map((q, index) => (
          <div key={index} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e0dcd3' }}>
            <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '12px' }}>{index + 1}. {q.question_text}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {q.options?.map((opt: string, oIdx: number) => (
                <label key={oIdx} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #eee', display: 'flex', gap: '10px', cursor: 'pointer' }}>
                  <input type="radio" name={`question-${index}`} value={opt} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}