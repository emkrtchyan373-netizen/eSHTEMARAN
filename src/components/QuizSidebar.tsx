import React from 'react'

interface QuizSidebarProps {
  timeLeft: number
  isTimerActive: boolean
  onStartTimer: () => void
  wrongAnswers: number[]
  onSelectQuestion: (questionId: number) => void // 👈 Ավելացրինք նոր props
}

export default function QuizSidebar({
  timeLeft,
  isTimerActive,
  onStartTimer,
  wrongAnswers,
  onSelectQuestion // 👈 Ընդունում ենք ֆունկցիան
}: QuizSidebarProps) {

  const formatMinutesSeconds = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="quiz-sidebar" style={{
      width: '260px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      borderRight: '1px solid #e0dcd3',
      backgroundColor: '#fff',
      minHeight: '100%'
    }}>
      
      {/* ⏱️ ՎԱՅՐԿՅԱՆԱՉԱՓ */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '20px 0',
        width: '100%',
        backgroundColor: '#f9f6f0',
        padding: '15px 10px',
        borderRadius: '12px',
        border: '1px solid #e8e4dc'
      }}>
        <div style={{
          fontSize: '32px',
          fontWeight: '300',
          color: '#191919',
          fontFamily: 'monospace',
          letterSpacing: '2px',
          marginBottom: '12px'
        }}>
          {formatMinutesSeconds(timeLeft)}
        </div>

        <button
          type="button"
          onClick={onStartTimer}
          style={{
            padding: '8px 20px',
            backgroundColor: isTimerActive ? '#d9534f' : '#191919',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            width: '80%',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {isTimerActive ? 'Stop' : 'Start'}
        </button>
      </div>

      <hr style={{ width: '100%', border: '0', borderTop: '1px solid #e0dcd3', margin: '15px 0' }} />

      {/* ❌ WRONG ANSWERS (Սեղմվող հարցերի համարներ) */}
      <div style={{ width: '100%', textAlign: 'left', paddingLeft: '10px' }}>
        <h3 style={{ fontSize: '18px', color: '#191919', fontWeight: '500', marginBottom: '15px' }}>
          Wrong Answers
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {wrongAnswers.length === 0 ? (
            <span style={{ color: '#aaa', fontSize: '14px' }}>Չկան սխալներ</span>
          ) : (
            wrongAnswers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onSelectQuestion(num)} // 👈 Սեղմելիս տանում է այդ հարցին
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ffdde0',
                  color: '#d9534f',
                  border: '1px solid #ffa3a9',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease, background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffcbd1'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffdde0'}
              >
                Հարց {num}
              </button>
            ))
          )}
        </div>
      </div>

    </div>
  )
}