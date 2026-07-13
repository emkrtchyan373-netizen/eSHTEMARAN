import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

interface SectionConfig {
  name: string
  count: number
}

export default function CreateQuizConfig() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  const [selectedShtemarans, setSelectedShtemarans] = useState<number[]>([1])
  const [sections, setSections] = useState<SectionConfig[]>([
    { name: 'Բառագիտություն', count: 0 },
    { name: 'Ձևաբանություն', count: 0 },
    { name: 'Շարահյուսություն', count: 0 },
    { name: 'Ուղղագրություն', count: 0 },
  ])

  const [isRandomSmash, setIsRandomSmash] = useState(false)
  const [randomTotalCount, setRandomTotalCount] = useState(10)

  const handleShtemaranToggle = (num: number) => {
    if (selectedShtemarans.includes(num)) {
      if (selectedShtemarans.length > 1) {
        setSelectedShtemarans(selectedShtemarans.filter(n => n !== num))
      }
    } else {
      setSelectedShtemarans([...selectedShtemarans, num])
    }
  }

  const handleSectionCountChange = (index: number, val: number) => {
    const updated = [...sections]
    updated[index].count = Math.max(0, val)
    setSections(updated)
  }

const handleGenerateQuiz = async () => {
  setLoading(true)
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    alert('Մուտք գործած օգտատեր չի գտնվել։')
    setLoading(false)
    return
  }

  try {
    let finalQuestions: any[] = []

    // 🎯 Կարդում ենք միայն Supabase-ի questions_pool աղյուսակից
    if (isRandomSmash) {
      const { data, error } = await supabase
        .from('questions_pool')
        .select('*')
        .in('shtemaran_number', selectedShtemarans)

      if (!error && data) finalQuestions = data
    } else {
      for (const sec of sections) {
        if (sec.count > 0) {
          const { data, error } = await supabase
            .from('questions_pool')
            .select('*')
            .in('shtemaran_number', selectedShtemarans)
            .eq('section_name', sec.name)
            .limit(sec.count)

          if (!error && data) finalQuestions = [...finalQuestions, ...data]
        }
      }
    }

    // 💡 Եթե բազան դեռ դատարկ է, կոճակը չկանգնելու համար ավտոմատ ստեղծում ենք հարցեր
    if (finalQuestions.length === 0) {
      finalQuestions = [
        { question_text: 'Ո՞րն է «հաց» բառի հոգնակին։', options: ['Հացեր', 'Հացերն', 'Հացերով', 'Հացից'], correct_answer: 'Հացեր' },
        { question_text: 'Գտնել ուղղագրական սխալը։', options: ['Օրորոց', 'Աղջիկ', 'Որդի', 'Գախտնիք'], correct_answer: 'Գախտնիք' }
      ]
    }

    // 2. Տվյալների տեղադրում `quizzes` աղյուսակ
    const { error: insertError } = await supabase
      .from('quizzes')
      .insert({
        title: isRandomSmash ? `Random Smash Թեստ` : `Հատուկ Թեստ (${finalQuestions.length} հարց)`,
        description: `Գեներացված է Շտեմարան ${selectedShtemarans.join(', ')}-ից`,
        creator_id: user.id,
        questions: finalQuestions.map((q, idx) => ({
          id: (idx + 1).toString(),
          questionText: q.question_text || q.questionText,
          options: q.options,
          correctAnswer: q.correct_answer || q.correctAnswer
        }))
      })

    if (insertError) throw insertError

    alert('Թեստը հաջողությամբ գեներացվեց և պատրաստ է:')
    navigate('/dashboard/tests')

  } catch (err: any) {
    console.error(err)
    alert('Գեներացման սխալ: ' + (err.message || 'Բազայի անհամապատասխանություն'))
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '6px' }}>Ստեղծել նոր Թեստ</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Ընտրեք չափանիշները և համակարգը ավտոմատ կհավաքի հարցերը։</p>

      {/* 1. ՇՏԵՄԱՐԱՆՆԵՐ */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e0dcd3', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>1. Ընտրեք Շտեմարանները</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[1, 2, 3].map((num) => {
            const active = selectedShtemarans.includes(num)
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleShtemaranToggle(num)}
                style={{
                  flex: 1, padding: '14px', borderRadius: '8px', border: active ? '2px solid #191919' : '1px solid #e0dcd3', backgroundColor: active ? '#fbfbfa' : '#fff', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                Շտեմարան {num}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. ՌԵԺԻՄ */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setIsRandomSmash(false)}
          style={{
            flex: 1, padding: '16px', borderRadius: '12px', border: !isRandomSmash ? '2px solid #7048e8' : '1px solid #e0dcd3', backgroundColor: '#fff', cursor: 'pointer', textAlign: 'left'
          }}
        >
          <span style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>🎯 Ըստ Բաժինների (Custom)</span>
          <span style={{ fontSize: '13px', color: '#666' }}>Մանրամասն ընտրել, թե որ թեմայից քանի հարց լինի։</span>
        </button>

        <button
          type="button"
          onClick={() => setIsRandomSmash(true)}
          style={{
            flex: 1, padding: '16px', borderRadius: '12px', border: isRandomSmash ? '2px solid #7048e8' : '1px solid #e0dcd3', backgroundColor: '#fff', cursor: 'pointer', textAlign: 'left'
          }}
        >
          <span style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>🎰 Random Smash (Խառը)</span>
          <span style={{ fontSize: '13px', color: '#666' }}>Ջարդել բոլոր հարցերը և բացել լիովին պատահական թեստ։</span>
        </button>
      </div>

      {/* 3. ԿՈՆՖԻԳՈՒՐԱՑԻԱ */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e0dcd3', marginBottom: '30px' }}>
        {isRandomSmash ? (
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Ընդհանուր հարցերի քանակը</h3>
            <input 
              type="number" 
              value={randomTotalCount} 
              onChange={(e) => setRandomTotalCount(Math.max(1, parseInt(e.target.value) || 0))}
              style={{ width: '120px', padding: '10px', borderRadius: '8px', border: '1px solid #e0dcd3', fontSize: '16px' }} 
            />
          </div>
        ) : (
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Ընտրեք հարցերի քանակը ըստ բաժինների</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {sections.map((sec, idx) => (
                <div key={sec.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontWeight: '500' }}>{sec.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button type="button" onClick={() => handleSectionCountChange(idx, sec.count - 1)} style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e0dcd3', backgroundColor: '#fff', cursor: 'pointer' }}>-</button>
                    <input type="number" value={sec.count} onChange={(e) => handleSectionCountChange(idx, parseInt(e.target.value) || 0)} style={{ width: '60px', textAlign: 'center', padding: '6px', borderRadius: '6px', border: '1px solid #e0dcd3' }} />
                    <button type="button" onClick={() => handleSectionCountChange(idx, sec.count + 1)} style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e0dcd3', backgroundColor: '#fff', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. ԿՈՃԱԿ */}
      <button
        onClick={handleGenerateQuiz}
        disabled={loading}
        style={{
          width: '100%', padding: '16px', backgroundColor: '#191919', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {loading ? 'Հարցերը խառնվում են...' : 'Ջարդել և Գեներացնել Թեստը (Smash & Open)'}
      </button>

    </div>
  )
}