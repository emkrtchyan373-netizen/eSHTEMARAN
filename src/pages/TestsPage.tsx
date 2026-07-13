import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { PlusIcon } from '../components/Icons'
import { quizRegistry } from '../data/quizRegistry' // 🎯 Ներմուծում ենք registry-ն հարցերը վերցնելու համար

export default function TestsPage() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedShtemarans, setSelectedShtemarans] = useState<number[]>([1])
  
  const [sections, setSections] = useState([
    { id: 2, name: 'Section 2', label: 'Section 2' },
    { id: 3, name: 'Section 3', label: 'Section 3' },
    { id: 4, name: 'Section 4', label: 'Section 4' },
    { id: 5, name: 'Section 5', label: 'Section 5' },
    { id: 6, name: 'Section 6', label: 'Section 6' },
    { id: 7, name: 'Section 7', label: 'Section 7' },
    { id: 8, name: 'Section 8', label: 'Section 8' },
    { id: 9, name: 'Section 9', label: 'Section 9' },
    { id: 10, name: 'Section 10', label: 'Section 10' },
    { id: 11, name: 'Section 11', label: 'Section 11' },
    { id: 12, name: 'Section 12', label: 'Section 12' },
    { id: 13, name: 'Section 13', label: 'Section 13' },
  ].map(s => ({ ...s, count: 0 })))

  const toggleShtemaran = (num: number) => {
    if (selectedShtemarans.includes(num)) {
      if (selectedShtemarans.length > 1) {
        setSelectedShtemarans(selectedShtemarans.filter(n => n !== num))
      }
    } else {
      setSelectedShtemarans([...selectedShtemarans, num])
    }
  }

  const changeCount = (id: number, delta: number) => {
    setSections(sections.map(sec => 
      sec.id === id ? { ...sec, count: Math.max(0, sec.count + delta) } : sec
    ))
  }

 const handleCreateTest = () => {
    const totalQuestionsCount = sections.reduce((sum, sec) => sum + sec.count, 0)
    if (totalQuestionsCount === 0) {
      alert('Խնդրում ենք ընտրել գոնե 1 հարց։')
      return
    }

    try {
      let pool: any[] = []

      selectedShtemarans.forEach(shNum => {
        sections.forEach(sec => {
          if (sec.count === 0) return
          
          const registryKey = `${shNum}_${sec.id}`
          const secData = quizRegistry[registryKey] as any
          if (!secData) return

          // Տեքստային բաժիններ (Section 2, 4 և այլն)
          if (!secData.questions && secData.texts && Array.isArray(secData.texts)) {
            secData.texts.forEach((t: any) => {
              const availableWords = t.words ? `\n\nWords: ${t.words.join(', ')}` : ''
              pool.push({
                ...t,
                id: t.id,
                passage: `${t.passage}${availableWords}`,
                subQuestions: [
                  {
                    number: 1,
                    options: { a: "Տեղադրեք բառերը համապատասխանաբար" }
                  }
                ],
                options: t.words || [],
                answers: t.answers,
                sectionId: sec.id
              })
            })
          } 
          // Սովորական հարցերով բաժիններ (Section 1, 3, 5, 6, 8, 10, 11, 12, 13)
          else if (secData.questions && Array.isArray(secData.questions)) {
            secData.questions.forEach((q: any, qIdx: number) => {
              // 🎯 Ճիշտ վերցնենք պատասխանը՝ անկախ նրանից մասիվ է, թե սովորական դաշտ
              const registryAnswer = secData.answers?.[qIdx]
              const finalAnswer = registryAnswer !== undefined ? registryAnswer : (q.answer || q.correctAnswer)

              pool.push({
                ...q,
                answer: finalAnswer,
                sectionId: sec.id
              })
            })
          }
        })
      })

      let selectedQuestions: any[] = []
      sections.forEach(sec => {
        if (sec.count > 0) {
          const secPool = pool.filter(p => p.sectionId === sec.id)
          const shuffled = secPool.sort(() => 0.5 - Math.random()).slice(0, sec.count)
          selectedQuestions = [...selectedQuestions, ...shuffled]
        }
      })

      if (selectedQuestions.length === 0) {
        alert('Ընտրված բաժիններում հարցեր չեն գտնվել։')
        return
      }

      // 🎯 Պահում ենք ամբողջական հարցերի ցուցակը և պատասխանները առանձին մասիվով
      const finalQuizPayload = {
        questions: selectedQuestions,
        answers: selectedQuestions.map(q => q.answer)
      }

      navigate('/quiz/generated/run', {
        state: {
          isGeneratedQuiz: true,
          quizData: finalQuizPayload
        }
      })

      setIsModalOpen(false)

    } catch (error) {
      console.error("Error generating quiz:", error)
      alert("Թեստի գեներացման սխալ:")
    }
  }

  return (
    <DashboardLayout active="tests">
      <div className="dash-card">
        <div className="dash-card__banner" />
        <div className="dash-card__body--gray">
          <div 
            className="create-test" 
            onClick={() => setIsModalOpen(true)} 
            style={{ cursor: 'pointer' }}
          >
            <div className="create-test__circle">
              <PlusIcon />
            </div>
            <p className="create-test__label armenian">Ստեղծել Նոր Թեստ</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', color: '#333' }}>
            
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', textAlign: 'center', fontWeight: '600' }}>Կարգավորել Թեստը</h3>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[1, 2, 3].map(num => {
                const isSelected = selectedShtemarans.includes(num)
                return (
                  <button 
                    key={num}
                    onClick={() => toggleShtemaran(num)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: isSelected ? '2px solid #7048e8' : '1px solid #e0dcd3', backgroundColor: isSelected ? '#f6f0ff' : '#fff', fontWeight: '600', cursor: 'pointer', color: isSelected ? '#7048e8' : '#333'
                    }}
                  >
                    Շտեմարան {num}
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', maxHeight: '280px', overflowY: 'auto', paddingRight: '5px' }}>
              {sections.map(sec => (
                <div key={sec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '15px', fontWeight: '500' }}>{sec.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => changeCount(sec.id, -1)} style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}>-</button>
                    <span style={{ width: '20px', textAlign: 'center', fontWeight: '600' }}>{sec.count}</span>
                    <button onClick={() => changeCount(sec.id, 1)} style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#eee', fontWeight: '500', cursor: 'pointer' }}>Չեղարկել</button>
              <button onClick={handleCreateTest} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#7048e8', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Ստեղծել թեստ</button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  )
}