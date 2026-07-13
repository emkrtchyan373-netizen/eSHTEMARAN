import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { PlusIcon } from '../components/Icons'

export default function TestsPage() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedShtemarans, setSelectedShtemarans] = useState<number[]>([1])
  
  // 🎯 Ավելացվեցին բոլոր բացակայող բաժինները (2-ից մինչև 13)
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
    const totalQuestions = sections.reduce((sum, sec) => sum + sec.count, 0)
    if (totalQuestions === 0) {
      alert('Խնդրում ենք ընտրել գոնե 1 հարց։')
      return
    }

    const firstShtemId = selectedShtemarans[0] || 1

    // 🎯 Ուղղվեց երթուղին համապատասխան QuizPage-ի սպասված /quiz/:shtemId/:sectionNum կառուցվածքին
    navigate(`/quiz/${firstShtemId}/generated`, {
      state: {
        isGenerated: true,
        shtemarans: selectedShtemarans,
        sections: sections.filter(sec => sec.count > 0)
      }
    })
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
            
            {/* Շտեմարաններ */}
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

            {/* Բաժիններ - Սքրոլով ցուցակ */}
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