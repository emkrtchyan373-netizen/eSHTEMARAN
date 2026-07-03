import { useState, useEffect } from 'react'

interface WordBankQuestion {
  id: number
  passage: string
  words: string[]
  answers: Record<string, string>
}

interface WordBankViewProps {
  data: WordBankQuestion
  onAnswer?: (isCorrect: boolean) => void
  onNext?: () => void
  isLast?: boolean
}

export default function WordBankView({ data, onAnswer, onNext, isLast }: WordBankViewProps) {
  const [activeBlank, setActiveBlank] = useState<number | null>(null)
  const [filledBlanks, setFilledBlanks] = useState<Record<number, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    setActiveBlank(null)
    setFilledBlanks({})
    setIsSubmitted(false)
  }, [data])

  const handleWordSelect = (word: string) => {
    if (activeBlank === null || isSubmitted) return

    setFilledBlanks((prev) => ({
      ...prev,
      [activeBlank]: word,
    }))
    setActiveBlank(null)
  }

  const handleRemoveWord = (blankNum: number) => {
    if (isSubmitted) return
    setFilledBlanks((prev) => {
      const next = { ...prev }
      delete next[blankNum]
      return next
    })
    setActiveBlank(blankNum)
  }

  const handleCheck = () => {
    setIsSubmitted(true)
    let allCorrect = true
    const totalBlanks = Object.keys(data.answers || {}).length

    for (let i = 1; i <= totalBlanks; i++) {
      if (filledBlanks[i] !== data.answers[i.toString()]) {
        allCorrect = false
        break
      }
    }

    if (onAnswer) {
      onAnswer(allCorrect)
    }
  }

  const parts = data && data.passage ? data.passage.split(/_{2,}/) : []
  const totalBlanksCount = parts.length - 1
  const isAllFilled = Object.keys(filledBlanks).length === totalBlanksCount

  return (
    <div className="word-bank-view" style={{ padding: '20px', width: '100%', textAlign: 'left' }}>
      
      {/* 📖 Հիմնական Տեքստ */}
      <div style={{ fontSize: '18px', lineHeight: '2.5', marginBottom: '30px', color: '#2c3e50', textAlign: 'justify' }}>
        {parts.length === 0 ? (
          <p style={{ color: 'orange' }}>Տեքստը բեռնված չէ կամ սխալ ձևաչափ ունի:</p>
        ) : (
          parts.map((part, index) => {
            const blankNum = index + 1
            const hasWord = filledBlanks[blankNum]
            const isCurrentActive = activeBlank === blankNum
            const correctAnswer = data.answers?.[blankNum.toString()]
            const isCorrect = hasWord === correctAnswer

            return (
              <span key={index} style={{ display: 'inline', alignItems: 'center', flexWrap: 'wrap' }}>
                {part}
                {index < parts.length - 1 && (
                  <span style={{ display: 'inline-block', position: 'relative', verticalAlign: 'middle' }}>
                    <button
                      type="button"
                      onClick={() => !isSubmitted && (hasWord ? handleRemoveWord(blankNum) : setActiveBlank(blankNum))}
                      disabled={isSubmitted}
                      style={{
                        padding: '2px 12px',
                        margin: '0 6px',
                        borderRadius: '6px',
                        border: isCurrentActive ? '2px solid #3498db' : '1px dashed #7f8c8d',
                        backgroundColor: isSubmitted 
                          ? (isCorrect ? '#2ecc71' : '#e74c3c') 
                          : (hasWord ? '#ebf5fb' : '#f8f9f9'),
                        color: isSubmitted && (isCorrect || !isCorrect) ? '#fff' : '#2c3e50',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: isSubmitted ? 'default' : 'pointer',
                        minWidth: '80px',
                        lineHeight: '1.4',
                        transition: 'all 0.15s'
                      }}
                    >
                      {hasWord ? hasWord : `(${blankNum})`}
                    </button>

                    {/* 💡 ՃԻՇՏ ՊԱՏԱՍԽԱՆԻ ՑՈՒՑԱԴՐՈՒՄ. Եթե սխալ է լրացրել, ներքևից փոքրիկ կանաչ հուշում է հայտնվում */}
                    {isSubmitted && !isCorrect && (
                      <span style={{
                        display: 'block',
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#2ecc71',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                        zIndex: 10,
                        marginTop: '2px'
                      }}>
                        ✓ {correctAnswer}
                      </span>
                    )}
                  </span>
                )}
              </span>
            )
          })
        )}
      </div>

      {/* 🔤 Բառերի Բանկ */}
      <div style={{ marginBottom: '30px', backgroundColor: '#fcfcfc', padding: '15px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
        <h4 style={{ marginBottom: '12px', color: '#7f8c8d', fontSize: '15px' }}>Available Words:</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {data && data.words?.map((word) => {
            const isUsed = Object.values(filledBlanks).includes(word)

            return (
              <button
                key={word}
                type="button"
                onClick={() => handleWordSelect(word)}
                disabled={isUsed || activeBlank === null || isSubmitted}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: '1px solid #d5dbdb',
                  backgroundColor: isUsed ? '#eaeded' : '#fff',
                  color: isUsed ? '#a6acaf' : '#34495e',
                  cursor: isUsed || activeBlank === null ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                {word}
              </button>
            )
          })}
        </div>
        {activeBlank !== null && (
          <p style={{ color: '#3498db', marginTop: '12px', fontSize: '14px', fontWeight: '500' }}>
            💡 Select a word from above for slot <strong>({activeBlank})</strong>.
          </p>
        )}
      </div>

      {/* 🎛️ Կոճակներ */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <button
          type="button"
          onClick={handleCheck}
          disabled={!isAllFilled || isSubmitted}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: isSubmitted ? '#bdc3c7' : (isAllFilled ? '#2ecc71' : '#95a5a6'),
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: !isAllFilled || isSubmitted ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitted ? 'Checked' : 'Submit Answers'}
        </button>

        {isSubmitted && onNext && !isLast && (
          <button
            onClick={onNext}
            style={{
              padding: '12px 32px',
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

    </div>
  )
}