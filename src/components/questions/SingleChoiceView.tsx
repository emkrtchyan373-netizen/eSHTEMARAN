import { useState, useEffect } from 'react'

interface SingleChoiceQuestion {
  q: string
  opts: string[]
}

interface SingleChoiceViewProps {
  data: SingleChoiceQuestion
  correctAnswerIndex: number
  onAnswer?: (isCorrect: boolean) => void // Ուղղված տիպը
  onNext?: () => void
  isLast?: boolean
}

export default function SingleChoiceView({ data, correctAnswerIndex, onAnswer, onNext, isLast }: SingleChoiceViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    setSelectedIndex(null)
  }, [data])

  const handleSelect = (index: number) => {
    if (selectedIndex !== null) return
    setSelectedIndex(index)
    
    // Ուղարկում ենք true, եթե ինդեքսը համընկնում է ճիշտ պատասխանի հետ
    if (onAnswer) {
      onAnswer(index === correctAnswerIndex)
    }
  }

  return (
    <div className="single-choice-view" style={{ padding: '20px', width: '100%' }}>
      <h3 style={{ fontSize: '18px', marginBottom: '20px', lineHeight: '1.6' }}>{data.q}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {data.opts?.map((opt, index) => {
          let btnStyle: React.CSSProperties = {
            padding: '14px 20px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: '15px',
            textAlign: 'left'
          }

          if (selectedIndex !== null) {
            if (index === correctAnswerIndex) {
              btnStyle.backgroundColor = '#2ecc71'
              btnStyle.color = '#fff'
              btnStyle.borderColor = '#2ecc71'
            } else if (index === selectedIndex) {
              btnStyle.backgroundColor = '#e74c3c'
              btnStyle.color = '#fff'
              btnStyle.borderColor = '#e74c3c'
            } else {
              btnStyle.opacity = 0.5
            }
          }

          return (
            <button key={index} onClick={() => handleSelect(index)} disabled={selectedIndex !== null} style={btnStyle}>
              {opt}
            </button>
          )
        })}
      </div>

      {/* 🚀 Next Question Կոճակը */}
      {selectedIndex !== null && onNext && !isLast && (
        <button
          onClick={onNext}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Next Question →
        </button>
      )}
    </div>
  )
}