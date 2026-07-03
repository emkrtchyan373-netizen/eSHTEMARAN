import React from 'react'

interface QuizProgressProps {
  current: number
  total: number
  onSliderChange?: (newIndex: number) => void // 👈 Ընդունում ենք փոփոխության ֆունկցիան
}

export default function QuizProgress({ current, total, onSliderChange }: QuizProgressProps) {
  return (
    <div className="quiz-progress" style={{
      backgroundColor: '#4a3b80', // Մանուշակագույն ֆոն
      padding: '12px 30px',
      display: 'flex',
      alignItems: 'center',
      gap: '25px',
      color: '#fff',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      
      {/* 🎚️ Քո նախնական բարակ գիծը վերածված աշխատող սլայդերի */}
      <input 
        type="range"
        min="0"
        max={total - 1}
        value={current - 1}
        onChange={(e) => onSliderChange && onSliderChange(Number(e.target.value))}
        style={{
          flex: 1,
          cursor: 'pointer',
          accentColor: '#fff', // Սպիտակ կուրսոր (Thumb)
          height: '4px',       // Բարակ գիծ
          background: 'rgba(255, 255, 255, 0.3)',
          border: 'none',
          outline: 'none'
        }}
      />
      
      {/* Աջ կողմի հարցերի համարը (օրինակ՝ 1/20) */}
      <span style={{ 
        fontWeight: '400', 
        fontSize: '18px', 
        fontFamily: 'sans-serif',
        minWidth: '50px', 
        textAlign: 'right' 
      }}>
        {current}/{total}
      </span>

    </div>
  )
}