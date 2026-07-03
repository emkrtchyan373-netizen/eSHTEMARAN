import { useState, useEffect } from 'react'

export default function Timer() {
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(true) // Ավտոմատ միանում է էջը բացվելիս

  useEffect(() => {
    let interval: any = null

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [isActive])

  // Սեկունդները ձևափոխում ենք 00:00:00 ֆորմատի
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(':')
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px',
      margin: '10px 0 20px 0',
      backgroundColor: '#f5f2eb',
      borderRadius: '12px',
      border: '1px solid #e0dcd3',
      width: '85%'
    }}>
      {/* Ժամանակի Ցուցադրում */}
      <div style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#191919',
        fontFamily: 'monospace',
        marginBottom: '10px',
        letterSpacing: '1px'
      }}>
        {formatTime(seconds)}
      </div>

      {/* Start / Stop Կոճակ */}
      <button
        type="button"
        onClick={() => setIsActive(!isActive)}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: isActive ? '#d9534f' : '#191919', // Կարմիր՝ երբ ակտիվ է, Սև՝ երբ կանգնած է
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'background-color 0.2s, opacity 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
      >
        {isActive ? 'Stop' : 'Start'}
      </button>
    </div>
  )
}