import React, { useState, useEffect } from 'react'

interface TransformViewProps {
  data: any
  correctAnswers: number[] // Ճիշտ պատասխանների ինդեքսները (1, 2, 3...)
  onAnswer: (isCorrect: boolean) => void
  onNext: () => void
  isLast: boolean
}

// Helper: extract items list directly from data (no useEffect needed)
const extractItems = (data: any): any[] => {
  if (!data) return []
  if (Array.isArray(data)) return data
  // Shtem 2/3 format: { q: "...", opts: ["str1", "str2", ...] } — opts is the list of statements
  if (Array.isArray(data.opts) && data.opts.length > 0) return data.opts
  // Shtem 1 format: { subQuestions: [{ number, options: { a: "text" } }] }
  if (Array.isArray(data.subQuestions) && data.subQuestions.length > 0) return data.subQuestions
  if (Array.isArray(data.questions) && data.questions.length > 0) return data.questions
  if (Array.isArray(data.sentences) && data.sentences.length > 0) return data.sentences
  if (Array.isArray(data.items) && data.items.length > 0) return data.items
  return []
}

export default function TransformView({ data, correctAnswers, onAnswer, onNext, isLast }: TransformViewProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [isChecked, setIsChecked] = useState(false)

  // Reset when question changes
  useEffect(() => {
    setSelectedIndices([])
    setIsChecked(false)
  }, [data])

  // Derive items directly — no async state, always in sync
  const items = extractItems(data)

  const handleItemClick = (index: number) => {
    if (isChecked) return
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index))
    } else {
      setSelectedIndices([...selectedIndices, index])
    }
  }

  const handleCheck = () => {
    setIsChecked(true)
    const isCorrect = 
      selectedIndices.length === correctAnswers.length &&
      selectedIndices.every(val => correctAnswers.includes(val))
    onAnswer(isCorrect)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
        Choose the correctly transformed sentences.
      </h3>


      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item: any, idx: number) => {
          const itemNum = idx + 1
          const isSelected = selectedIndices.includes(itemNum)
          const isCorrect = correctAnswers.includes(itemNum)

          // Extract text from item
          let textContent = ""
          if (typeof item === 'string') {
            textContent = item
          } else if (item && typeof item === 'object') {
            if (item.options && typeof item.options === 'object') {
              // { options: { a: "sentence text" } } — take the first value
              const vals = Object.values(item.options)
              textContent = vals.length > 0 ? String(vals[0]) : ''
            } else {
              textContent = String(item.text || item.q || item.question || item.sentence || '')
            }
          }

          // Strip leading "N. " or "N) " prefix already embedded in the text
          textContent = textContent.replace(/^\d+[\.\)]\s*/, '')

          // Color logic
          let bgColor = '#fff'
          let bColor = '#e2e8f0'

          if (isChecked) {
            if (isCorrect) {
              bgColor = '#dcfce7'
              bColor = '#22c55e'
            } else if (isSelected) {
              bgColor = '#fee2e2'
              bColor = '#ef4444'
            }
          } else if (isSelected) {
            bgColor = '#eff6ff'
            bColor = '#3b82f6'
          }

          return (
            <div
              key={idx}
              onClick={() => handleItemClick(itemNum)}
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: `2px solid ${bColor}`,
                backgroundColor: bgColor,
                cursor: isChecked ? 'default' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              {/* Checkbox */}
              <div style={{
                width: '22px', height: '22px', borderRadius: '4px', flexShrink: 0,
                border: `2px solid ${isChecked ? (isCorrect ? '#22c55e' : isSelected ? '#ef4444' : '#cbd5e1') : (isSelected ? '#3b82f6' : '#cbd5e1')}`,
                backgroundColor: isChecked ? (isCorrect ? '#22c55e' : isSelected ? '#ef4444' : 'transparent') : (isSelected ? '#3b82f6' : 'transparent'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                {isChecked
                  ? (isCorrect
                    ? <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>✓</span>
                    : isSelected ? <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>✗</span> : null)
                  : (isSelected ? <span style={{ color: '#fff', fontSize: '13px' }}>✓</span> : null)
                }
              </div>

              <span style={{
                fontSize: '15px',
                color: isChecked ? (isCorrect ? '#166534' : isSelected ? '#991b1b' : '#1e293b') : '#1e293b',
                fontWeight: isChecked && isCorrect ? '600' : 'normal'
              }}>
                <strong>{itemNum}.</strong> {textContent}
              </span>
            </div>
          )
        })}
      </div>

      <button
        onClick={isChecked ? onNext : handleCheck}
        disabled={!isChecked && items.length === 0}
        style={{
          padding: '12px 24px',
          backgroundColor: isChecked ? '#10b981' : '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        {isChecked ? (isLast ? 'Finish' : 'Next Question') : 'Check Answers'}
      </button>
    </div>
  )
}