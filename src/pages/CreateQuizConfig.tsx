import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

import { SHTEM1_SECTION_2_DATA as s1_s2 } from '../data/shtem1/questions2.js'
import { SHTEM1_SECTION_3_DATA as s1_s3 } from '../data/shtem1/questions3.js'
import { SHTEM1_SECTION_4_DATA as s1_s4 } from '../data/shtem1/questions4.js'
import { SHTEM1_SECTION_5_DATA as s1_s5 } from '../data/shtem1/questions5.js'
import { SHTEM1_SECTION_6_DATA as s1_s6 } from '../data/shtem1/questions6.js'
import { SHTEM1_SECTION_8_DATA as s1_s8 } from '../data/shtem1/questions8.js'
import { SHTEM1_SECTION_10_DATA as s1_s10 } from '../data/shtem1/questions10.js'
import { SHTEM1_SECTION_11_DATA as s1_s11 } from '../data/shtem1/questions11.js'
import { SHTEM1_SECTION_12_DATA as s1_s12 } from '../data/shtem1/questions12.js'
import { SHTEM1_SECTION_13_DATA as s1_s13 } from '../data/shtem1/questions13.js'
import { SHTEM1_SECTION_7_DATA as s1_s7, SHTEM1_SECTION_9_DATA as s1_s9 } from '../data/shtem1/dragdrop_data.js'

import { SHTEM2_SECTION_2_DATA as s2_s2 } from '../data/shtem2/questions2.js'
import { SHTEM2_SECTION_3_DATA as s2_s3 } from '../data/shtem2/questions3.js'
import { SHTEM2_SECTION_4_DATA as s2_s4 } from '../data/shtem2/questions4.js'
import { SHTEM2_SECTION_5_DATA as s2_s5 } from '../data/shtem2/questions5.js'
import { SHTEM2_SECTION_6_DATA as s2_s6 } from '../data/shtem2/questions6.js'
import { SHTEM2_SECTION_8_DATA as s2_s8 } from '../data/shtem2/questions8.js'
import { SHTEM2_SECTION_10_DATA as s2_s10 } from '../data/shtem2/questions10.js'
import { SHTEM2_SECTION_11_DATA as s2_s11 } from '../data/shtem2/questions11.js'
import { SHTEM2_SECTION_12_DATA as s2_s12 } from '../data/shtem2/questions12.js'
import { SHTEM2_SECTION_13_DATA as s2_s13 } from '../data/shtem2/questions13.js'
import { SHTEM2_SECTION_7_DATA as s2_s7, SHTEM2_SECTION_9_DATA as s2_s9 } from '../data/shtem2/dragdrop_data.js'

import { SHTEM3_SECTION_2_DATA as s3_s2 } from '../data/shtem3/questions2.js'
import { SHTEM3_SECTION_3_DATA as s3_s3 } from '../data/shtem3/questions3.js'
import { SHTEM3_SECTION_4_DATA as s3_s4 } from '../data/shtem3/questions4.js'
import { SHTEM3_SECTION_5_DATA as s3_s5 } from '../data/shtem3/questions5.js'
import { SHTEM3_SECTION_6_DATA as s3_s6 } from '../data/shtem3/questions6.js'
import { SHTEM3_SECTION_8_DATA as s3_s8 } from '../data/shtem3/questions8.js'
import { SHTEM3_SECTION_10_DATA as s3_s10 } from '../data/shtem3/questions10.js'
import { SHTEM3_SECTION_11_DATA as s3_s11 } from '../data/shtem3/questions11.js'
import { SHTEM3_SECTION_12_DATA as s3_s12 } from '../data/shtem3/questions12.js'
import { SHTEM3_SECTION_13_DATA as s3_s13 } from '../data/shtem3/questions13.js'
import { SHTEM3_SECTION_7_DATA as s3_s7, SHTEM3_SECTION_9_DATA as s3_s9 } from '../data/shtem3/dragdrop_data.js'

const shtemaranDataMap: { [shtemNum: number]: { [secNum: number]: any } } = {
  1: { 2: s1_s2, 3: s1_s3, 4: s1_s4, 5: s1_s5, 6: s1_s6, 7: s1_s7, 8: s1_s8, 9: s1_s9, 10: s1_s10, 11: s1_s11, 12: s1_s12, 13: s1_s13 },
  2: { 2: s2_s2, 3: s2_s3, 4: s2_s4, 5: s2_s5, 6: s2_s6, 7: s2_s7, 8: s2_s8, 9: s2_s9, 10: s2_s10, 11: s2_s11, 12: s2_s12, 13: s2_s13 },
  3: { 2: s3_s2, 3: s3_s3, 4: s3_s4, 5: s3_s5, 6: s3_s6, 7: s3_s7, 8: s3_s8, 9: s3_s9, 10: s3_s10, 11: s3_s11, 12: s3_s12, 13: s3_s13 }
}

interface SectionConfig {
  id: number
  name: string
  count: number
}

export default function CreateQuizConfig() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedShtemarans, setSelectedShtemarans] = useState<number[]>([1])
  
  const [sections, setSections] = useState<SectionConfig[]>([
    { id: 2, name: 'Section 2', count: 0 },
    { id: 3, name: 'Section 3', count: 0 },
    { id: 4, name: 'Section 4', count: 0 },
    { id: 5, name: 'Section 5', count: 0 },
    { id: 6, name: 'Section 6', count: 0 },
    { id: 7, name: 'Section 7', count: 0 },
    { id: 8, name: 'Section 8', count: 0 },
    { id: 9, name: 'Section 9', count: 0 },
    { id: 10, name: 'Section 10', count: 0 },
    { id: 11, name: 'Section 11', count: 0 },
    { id: 12, name: 'Section 12', count: 0 },
    { id: 13, name: 'Section 13', count: 0 },
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
      let pool: { questionBlock: any, ansBlock: any, type: 'subQuestions' | 'textFill' | 'matrix', shNum: number, secId: number }[] = []

      selectedShtemarans.forEach(shNum => {
        const shData = shtemaranDataMap[shNum]
        if (!shData) return

        sections.forEach(sec => {
          if (!isRandomSmash && sec.count === 0) return

          const secData = shData[sec.id]
          if (!secData) return

          if (shNum === 2 && sec.id === 13) {
            const list = secData.questions || []
            list.forEach((q: any) => {
              pool.push({ questionBlock: q, ansBlock: q.answers, type: 'matrix', shNum, secId: sec.id })
            })
          } 
          else if (secData.texts && Array.isArray(secData.texts)) {
            secData.texts.forEach((t: any) => {
              pool.push({ questionBlock: t, ansBlock: t.answers, type: 'textFill', shNum, secId: sec.id })
            })
          } 
          else if (secData.questions && Array.isArray(secData.questions)) {
            secData.questions.forEach((q: any) => {
              const associatedAns = secData.answers ? secData.answers.find((a: any) => a.id === q.id) : null
              pool.push({ questionBlock: q, ansBlock: associatedAns, type: 'subQuestions', shNum, secId: sec.id })
            })
          }
        })
      })

      let rawSelectedBlocks: any[] = []
      if (isRandomSmash) {
        rawSelectedBlocks = pool.sort(() => 0.5 - Math.random()).slice(0, randomTotalCount)
      } else {
        sections.forEach(sec => {
          if (sec.count > 0) {
            const sectionSpecificPool = pool.filter(p => p.secId === sec.id)
            const shuffled = sectionSpecificPool.sort(() => 0.5 - Math.random()).slice(0, sec.count)
            rawSelectedBlocks = [...rawSelectedBlocks, ...shuffled]
          }
        })
      }

      if (rawSelectedBlocks.length === 0) {
        alert('Խնդրում ենք ընտրել գոնե մեկ հարց:')
        setLoading(false)
        return
      }

      let finalQuestions: any[] = []
      let globalIdx = 1

      rawSelectedBlocks.forEach((block) => {
        const { questionBlock, ansBlock, type, shNum, secId } = block

        if (type === 'matrix') {
          const explanationsText = questionBlock.explanations ? questionBlock.explanations.join('\n') : ''
          const correctMapping = ansBlock ? Object.entries(ansBlock).map(([k, v]) => `${k}-${v}`).join(', ') : ''

          finalQuestions.push({
            id: globalIdx.toString(),
            questionText: `[Շտեմարան ${shNum}, Բաժին ${secId} - №${questionBlock.id}]\n\nՏեքստեր:\n${explanationsText}`,
            options: ["Ընտրեք ճիշտ տարբերակը"],
            correctAnswer: correctMapping
          })
          globalIdx++

        } else if (type === 'textFill') {
          const availableWords = questionBlock.words ? `Բառերի ցանկ: ${questionBlock.words.join(', ')}` : ''
          const correctMapping = ansBlock ? Object.entries(ansBlock).map(([k, v]) => `(${k}) ${v}`).join(', ') : ''

          finalQuestions.push({
            id: globalIdx.toString(),
            questionText: `[Շտեմարան ${shNum}, Բաժին ${secId} - №${questionBlock.id}]\n\n${questionBlock.passage}\n\n${availableWords}`,
            options: ["Տեղադրեք բառերը համապատասխանաբար"],
            correctAnswer: correctMapping
          })
          globalIdx++

        } else if (type === 'subQuestions') {
          if (questionBlock.subQuestions && questionBlock.subQuestions.length > 0) {
            questionBlock.subQuestions.forEach((subQ: any) => {
              const ansKey = `q${subQ.number}`
              const correctLetter = ansBlock ? ansBlock[ansKey] : 'a'
              
              const optionsArray = Object.entries(subQ.options).map(([letter, text]) => `${letter.toUpperCase()}) ${text}`)
              const correctText = subQ.options[correctLetter] ? `${correctLetter.toUpperCase()}) ${subQ.options[correctLetter]}` : optionsArray[0]

              finalQuestions.push({
                id: globalIdx.toString(),
                questionText: `[Շտեմարան ${shNum}, Բաժին ${secId} - №${questionBlock.id}, Բացթողում (${subQ.number})]\n\n${questionBlock.passage}`,
                options: optionsArray,
                correctAnswer: correctText
              })
              globalIdx++
            })
          } else {
            finalQuestions.push({
              id: globalIdx.toString(),
              questionText: questionBlock.q || "Հարց",
              options: questionBlock.opts || [],
              correctAnswer: questionBlock.opts ? questionBlock.opts[0] : ""
            })
            globalIdx++
          }
        }
      })

      // 🎯 ՃՇԳՐՏՎԱԾ ՀԱՏՎԱԾ. Ավելացվել է .select().single()՝ ID-ն հետ ստանալու համար
      const { data: insertedQuiz, error: insertError } = await supabase
        .from('quizzes')
        .insert({
          title: isRandomSmash ? `Random Smash Թեստ` : `Հատուկ Թեստ (${finalQuestions.length} հարց)`,
          description: `Գեներացված է Շտեմարան ${selectedShtemarans.join(', ')}-ից`,
          creator_id: user.id,
          questions: finalQuestions
        })
        .select()
        .single()

      if (insertError) throw insertError

      alert('Թեստը հաջողությամբ գեներացվեց:')
      
      // 🎯 ՃՇԳՐՏՎԱԾ ՆԱՎԻԳԱՑԻԱ. Տանում ենք դեպի ID-ով ռաութը և փոխանցում quizData-ն
      if (insertedQuiz && insertedQuiz.id) {
        navigate(`/dashboard/tests/run/${insertedQuiz.id}`, { state: { quizData: insertedQuiz } })
      } else {
        navigate('/dashboard/tests/run', { state: { questions: finalQuestions } })
      }

    } catch (err: any) {
      console.error(err)
      alert('Գեներացման սխալ: ' + (err.message || 'Խնդիր տվյալների կառուցվածքի հետ'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '6px' }}>Ստեղծել նոր Թեստ</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Ընտրեք չափանիշները և համակարգը ավտոմատ կհավաքի հարցերը լոկալ JS ֆայլերից։</p>

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

      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e0dcd3', marginBottom: '30px' }}>
        {isRandomSmash ? (
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Ընդհանուր տեքստերի քանակը</h3>
            <input 
              type="number" 
              value={randomTotalCount} 
              onChange={(e) => setRandomTotalCount(Math.max(1, parseInt(e.target.value) || 0))}
              style={{ width: '120px', padding: '10px', borderRadius: '8px', border: '1px solid #e0dcd3', fontSize: '16px' }} 
            />
          </div>
        ) : (
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Ընտրեք տեքստերի քանակը ըստ բաժինների</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '350px', overflowY: 'auto', paddingRight: '10px' }}>
              {sections.map((sec, idx) => (
                <div key={sec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
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