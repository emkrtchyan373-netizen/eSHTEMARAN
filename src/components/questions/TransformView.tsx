import { useState, useEffect } from 'react'

interface TransformQuestion { q: string; opts: string[] }
interface TransformViewProps {
  data: TransformQuestion
  onAnswer?: (isCorrect: boolean) => void
  correctAnswers?: boolean[]
  onNext?: () => void
  isLast?: boolean
}

export default function TransformView({ data, onAnswer, correctAnswers = [], onNext, isLast }: TransformViewProps) {
  const [selectedStates, setSelectedStates] = useState<boolean[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (data && data.opts) {
      setSelectedStates(new Array(data.opts.length).fill(false))
      setIsSubmitted(false)
    }
  }, [data])

  const handleCheckboxChange = (index: number) => {
    if (isSubmitted) return
    setSelectedStates((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const checkAnswers = () => {
    setIsSubmitted(true)
    let allCorrect = true
    for (let i = 0; i < data.opts.length; i++) {
      if (selectedStates[i] !== (correctAnswers[i] || false)) {
        allCorrect = false
        break
      }
    }
    if (onAnswer) onAnswer(allCorrect)
  }

  return (
    <div className="transform-view" style={{ padding: '20px', width: '100%' }}>
      <h3 style={{ fontSize: '18px', marginBottom: '20px', whiteSpace: 'pre-line', lineHeight: '1.6' }}>{data.q}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        {data.opts?.map((option, index) => {
          let itemStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            backgroundColor: '#f9f9f9',
            fontSize: '15px'
          }

          if (isSubmitted) {
            if (correctAnswers[index]) {
              itemStyle.borderColor = '#2ecc71'
              itemStyle.backgroundColor = '#e8f8f0'
            } else if (selectedStates[index]) {
              itemStyle.borderColor = '#e74c3c'
              itemStyle.backgroundColor = '#fdedec'
            }
          }

          return (
            <label key={index} style={itemStyle}>
              <input
                type="checkbox"
                checked={selectedStates[index] || false}
                onChange={() => handleCheckboxChange(index)}
                disabled={isSubmitted}
                style={{ marginTop: '4px', width: '18px', height: '18px' }}
              />
              <span>{option}</span>
            </label>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
        <button
          type="button"
          onClick={checkAnswers}
          disabled={isSubmitted}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: isSubmitted ? '#bdc3c7' : '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: isSubmitted ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitted ? 'Checked' : 'Check Answers'}
        </button>

        {/* 🚀 Next Question Կոճակը */}
        {isSubmitted && onNext && !isLast && (
          <button
            onClick={onNext}
            style={{
              padding: '12px 30px',
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