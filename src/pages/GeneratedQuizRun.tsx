import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'

// Ներմուծում ենք լոկալ տվյալները, որպեսզի էջը կարողանա random հարցեր հավաքել
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

export default function GeneratedQuizRun() {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  
  const config = location.state as { shtemarans: number[], sections: any[] }

  useEffect(() => {
    // Եթե TestsPage-ից ոչ մի state չի եկել, հետ ենք գնում
    if (!config || !config.sections) {
      navigate('/dashboard/tests')
      return
    }
    loadRandomQuestions()
  }, [config])

  const loadRandomQuestions = () => {
    setLoading(true)
    try {
      let pool: { questionBlock: any, type: 'subQuestions' | 'textFill' | 'matrix', shNum: number, secId: number }[] = []

      config.shtemarans.forEach(shNum => {
        const shData = shtemaranDataMap[shNum]
        if (!shData) return

        config.sections.forEach(sec => {
          if (sec.count === 0) return

          const secData = shData[sec.id]
          if (!secData) return

          if (shNum === 2 && sec.id === 13) {
            const list = secData.questions || []
            list.forEach((q: any) => {
              pool.push({ questionBlock: q, type: 'matrix', shNum, secId: sec.id })
            })
          } 
          else if (secData.texts && Array.isArray(secData.texts)) {
            secData.texts.forEach((t: any) => {
              pool.push({ questionBlock: t, type: 'textFill', shNum, secId: sec.id })
            })
          } 
          else if (secData.questions && Array.isArray(secData.questions)) {
            secData.questions.forEach((q: any) => {
              pool.push({ questionBlock: q, type: 'subQuestions', shNum, secId: sec.id })
            })
          }
        })
      })

      let selectedBlocks: any[] = []
      config.sections.forEach(sec => {
        if (sec.count > 0) {
          const secPool = pool.filter(p => p.secId === sec.id)
          const shuffled = secPool.sort(() => 0.5 - Math.random()).slice(0, sec.count)
          selectedBlocks = [...selectedBlocks, ...shuffled]
        }
      })

      let finalQuestions: any[] = []
      let globalIdx = 1

      selectedBlocks.forEach((block) => {
        const { questionBlock, type, shNum, secId } = block

        if (type === 'matrix') {
          const explanationsText = questionBlock.explanations ? questionBlock.explanations.join('\n') : ''
          finalQuestions.push({
            id: globalIdx,
            question_text: `[Շտեմարան ${shNum}, Բաժին ${secId} - №${questionBlock.id}]\n\nՏեքստեր:\n${explanationsText}`,
            options: ["Ընտրեք ճիշտ տարբերակը"]
          })
          globalIdx++
        } 
        else if (type === 'textFill') {
          const availableWords = questionBlock.words ? `Բառերի ցանկ: ${questionBlock.words.join(', ')}` : ''
          finalQuestions.push({
            id: globalIdx,
            question_text: `[Շտեմարան ${shNum}, Բաժին ${secId} - №${questionBlock.id}]\n\n${questionBlock.passage}\n\n${availableWords}`,
            options: ["Տեղադրեք բառերը համապատասխանաբար"]
          })
          globalIdx++
        } 
        else if (type === 'subQuestions') {
          if (questionBlock.subQuestions && questionBlock.subQuestions.length > 0) {
            questionBlock.subQuestions.forEach((subQ: any) => {
              const optionsArray = Object.entries(subQ.options).map(([letter, text]) => `${letter.toUpperCase()}) ${text}`)
              finalQuestions.push({
                id: globalIdx,
                question_text: `[Շտեմարան ${shNum}, Բաժին ${secId} - №${questionBlock.id}, Բացթողում (${subQ.number})]\n\n${questionBlock.passage}`,
                options: optionsArray
              })
              globalIdx++
            })
          } else {
            finalQuestions.push({
              id: globalIdx,
              question_text: questionBlock.q || "Հարց",
              options: questionBlock.opts || []
            })
            globalIdx++
          }
        }
      })

      setQuestions(finalQuestions)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px' }}>Հարցերը պատահական ընտրվում են...</div>

  return (
    <PageTransition>
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto', fontFamily: 'sans-serif', color: '#333' }}>
      <button 
        onClick={() => navigate('/dashboard/tests')} 
        style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #e0dcd3', backgroundColor: '#fff' }}
      >
        ← Եդ դեպի թեստեր
      </button>
      
      <h2 style={{ marginBottom: '24px' }}>Գեներացված Թեստ ({questions.length} հարց)</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {questions.map((q, index) => (
          <div key={index} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e0dcd3' }}>
            <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>{index + 1}. {q.question_text}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {q.options?.map((opt: string, oIdx: number) => (
                <label key={oIdx} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee', display: 'flex', gap: '10px', cursor: 'pointer' }}>
                  <input type="radio" name={`question-${index}`} value={opt} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    </PageTransition>
  )
}