import { useState, useEffect } from 'react'

interface MatchingQuestionData {
  id: number
  words: string[]
  explanations: string[]
}

interface MatchingViewProps {
  data: MatchingQuestionData
  correctAnswersObj?: any
  onAnswer?: (isCorrect: boolean) => void
  onNext?: () => void
  isLast?: boolean
}

export default function MatchingView({ data, correctAnswersObj, onAnswer, onNext, isLast }: MatchingViewProps) {
  // Պահում ենք, թե որ ընդհանուր տառին (A, B, C, D) որ բացատրության ինդեքսն է ընտրված
  const [selections, setSelections] = useState<Record<string, number>>({
    A: -1,
    B: -1,
    C: -1,
    D: -1,
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCorrectResult, setIsCorrectResult] = useState(false)

  useEffect(() => {
    setSelections({ A: -1, B: -1, C: -1, D: -1 })
    setIsSubmitted(false)
    setIsCorrectResult(false)
  }, [data])

  // Բառերի տառերը՝ ըստ հերթականության (0 -> A, 1 -> B, 2 -> C, 3 -> D)
  const letterKeys = ['A', 'B', 'C', 'D']

  const handleSelectChange = (letter: string, expIndex: number) => {
    if (isSubmitted) return
    setSelections((prev) => ({
      ...prev,
      [letter]: expIndex,
    }))
  }

  const handleCheck = () => {
    // 🎯 ՃԻՇՏ ՊԱՏԱՍԽԱՆՆԵՐԸ
    const correctAnswers: Record<string, number> = correctAnswersObj || { A: 3, B: 1, C: 4, D: 0 }

    let allCorrect = true
    letterKeys.forEach((letter) => {
      if (selections[letter] !== correctAnswers[letter]) {
        allCorrect = false
      }
    })

    setIsCorrectResult(allCorrect)
    setIsSubmitted(true)

    if (onAnswer) {
      onAnswer(allCorrect)
    }
  }

  const isAllSelected = letterKeys.every((letter) => selections[letter] !== -1)

  // Ճիշտ պատասխանների տեքստային քարտեզ՝ հուշման համար
  const correctAnswersMap: Record<string, number> = correctAnswersObj || { A: 3, B: 1, C: 4, D: 0 }

  return (
    <div className="matching-view" style={{ padding: '20px', width: '100%', textAlign: 'left' }}>
      
      {/* 📝 Բացատրությունների ցուցակ (Դեպի ձախ) */}
      <div style={{ marginBottom: '25px', backgroundColor: '#fcfcfc', padding: '15px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
        <h4 style={{ color: '#7f8c8d', marginBottom: '12px', fontSize: '16px' }}>Definitions / Explanations:</h4>
        <div style={{ paddingLeft: '4px', margin: 0, lineHeight: '2' }}>
          {data?.explanations?.map((exp, idx) => (
            <div key={idx} style={{ fontSize: '16px', color: '#34495e', marginBottom: '6px' }}>
              <strong>{idx + 1}.</strong> {exp}
            </div>
          ))}
        </div>
      </div>

      {/* 🔀 Համապատասխանեցման հատված */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '16px' }}>Select the correct definition index for each word:</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
          {data?.words?.map((word, index) => {
            const letter = letterKeys[index]
            const currentSelection = selections[letter]
            const isCorrect = currentSelection === correctAnswersMap[letter]

            return (
              <div 
                key={word} 
                style={{
                  padding: '12px 15px',
                  borderRadius: '8px',
                  border: '1px solid #d5dbdb',
                  backgroundColor: isSubmitted 
                    ? (isCorrect ? '#e8f8f5' : '#fce4d6') 
                    : '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
                  {letter}. {word}
                </span>

                <select
                  disabled={isSubmitted}
                  value={currentSelection}
                  onChange={(e) => handleSelectChange(letter, parseInt(e.target.value, 10))}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    backgroundColor: '#fff',
                    fontSize: '14px',
                    color: '#34495e',
                    cursor: isSubmitted ? 'default' : 'pointer'
                  }}
                >
                  <option value={-1}>-- Select --</option>
                  {data?.explanations?.map((_exp, idx) => (
                    <option key={idx} value={idx}>
                      Sentence {idx + 1}
                    </option>
                  ))}
                </select>

                {/* 💡 Հուշում սխալ ընտրության դեպքում */}
                {isSubmitted && !isCorrect && (
                  <span style={{ color: '#e74c3c', fontSize: '13px', fontWeight: 'bold', marginTop: '4px' }}>
                    ❌ Incorrect (Correct is Sentence {Number(correctAnswersMap[letter]) + 1})
                  </span>
                )}
                {isSubmitted && isCorrect && (
                  <span style={{ color: '#2ecc71', fontSize: '13px', fontWeight: 'bold', marginTop: '4px' }}>
                    ✓ Correct
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 🎛️ Կոճակների Հատված */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleCheck}
          disabled={!isAllSelected || isSubmitted}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: isSubmitted ? '#bdc3c7' : (isAllSelected ? '#3498db' : '#95a5a6'),
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: !isAllSelected || isSubmitted ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitted ? 'Checked' : 'Check Match'}
        </button>

        {isSubmitted && onNext && !isLast && (
          <button
            onClick={onNext}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#2ecc71',
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

    </div>
  )
}