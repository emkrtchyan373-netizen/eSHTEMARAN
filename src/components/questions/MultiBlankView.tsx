import { useState, useEffect } from 'react'

interface OptionObj { a: string; b: string; c: string; d: string }
interface SubQuestion { number: number; options: OptionObj | string[] } // 👈 Թույլ ենք տալիս նաև string[]
interface MultiBlankQuestion { id: number; passage: string; subQuestions: SubQuestion[] }

interface MultiBlankViewProps {
  data: MultiBlankQuestion
  onAnswer?: (isCorrect: boolean) => void
  correctAnswersObj?: { q1: string; q2: string; q3: string; q4: string; q5?: string }
  onNext?: () => void
  isLast?: boolean
}

export default function MultiBlankView({ data, onAnswer, correctAnswersObj, onNext, isLast }: MultiBlankViewProps) {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})

  useEffect(() => {
    setUserAnswers({})
  }, [data])

  const handleSelect = (blankNum: number, letter: string) => {
    if (userAnswers[blankNum]) return
    const nextAnswers = { ...userAnswers, [blankNum]: letter }
    setUserAnswers(nextAnswers)

    const correctLetter = correctAnswersObj?.[`q${blankNum}` as keyof typeof correctAnswersObj]
    if (onAnswer) {
      onAnswer(letter === correctLetter)
    }
  }

  const isAllAnswered = Object.keys(userAnswers).length === (data.subQuestions?.length || 4)

  return (
    <div className="multi-blank-view" style={{ padding: '20px', width: '100%' }}>
      <p style={{ fontSize: '17px', lineHeight: '1.8', marginBottom: '30px', color: '#333', textAlign: 'justify' }}>
        {data.passage || (data as any).q}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
        {data.subQuestions?.map((subQ) => {
          const blankNum = subQ.number
          const selectedLetter = userAnswers[blankNum]
          const correctLetter = correctAnswersObj?.[`q${blankNum}` as keyof typeof correctAnswersObj]

          return (
            <div key={blankNum} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', width: '25px' }}>{blankNum}</span>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                {(['a', 'b', 'c', 'd'] as const).map((letter, index) => {
                  
                  // 🛠️ ԱՎԵԼԱՑՎԱԾ Է ՍՏՈՒԳՈՒՄ. Եթե options-ը զանգված է, վերցնում ենք ըստ ինդեքսի (0, 1, 2, 3), հակառակ դեպքում՝ ըստ տառի
                  let optionText = '';
                  if (Array.isArray(subQ.options)) {
                    optionText = subQ.options[index] || '';
                  } else if (subQ.options && typeof subQ.options === 'object') {
                    optionText = (subQ.options as any)[letter] || '';
                  }

                  const isCurrentSelected = selectedLetter === letter

                  let btnStyle: React.CSSProperties = {
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontSize: '15px',
                    minWidth: '160px',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }

                  if (selectedLetter) {
                    if (letter === correctLetter) {
                      btnStyle.backgroundColor = '#2ecc71'
                      btnStyle.color = '#fff'
                      btnStyle.borderColor = '#2ecc71'
                    } else if (isCurrentSelected) {
                      btnStyle.backgroundColor = '#e74c3c'
                      btnStyle.color = '#fff'
                      btnStyle.borderColor = '#e74c3c'
                    } else {
                      btnStyle.opacity = 0.5
                    }
                  }

                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => handleSelect(blankNum, letter)}
                      disabled={!!selectedLetter}
                      style={btnStyle}
                    >
                      <strong style={{ marginRight: '6px' }}>{letter.toUpperCase()}:</strong> {optionText}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* 🚀 Next Question Կոճակը */}
      {isAllAnswered && onNext && !isLast && (
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
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Next Question →
        </button>
      )}
    </div>
  )
}