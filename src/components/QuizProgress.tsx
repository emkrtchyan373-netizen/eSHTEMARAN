import React from 'react'

interface QuizProgressProps {
  current: number
  total: number
  onSliderChange?: (newIndex: number) => void
}

export default function QuizProgress({ current, total, onSliderChange }: QuizProgressProps) {
  const progress = total > 1 ? ((current - 1) / (total - 1)) * 100 : 100

  return (
    <div style={{
      background: 'linear-gradient(135deg, #2d1f6e 0%, #4a3b80 50%, #6d4fad 100%)',
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    }}>

      {/* Question label */}
      <span style={{
        fontSize: '12px',
        fontWeight: '600',
        color: 'rgba(255,255,255,0.55)',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        whiteSpace: 'nowrap' as const,
        flexShrink: 0,
      }}>
        Question
      </span>

      {/* Slider + visual track */}
      <div style={{ flex: 1, position: 'relative' as const, height: '28px', display: 'flex', alignItems: 'center' }}>

        {/* Track background */}
        <div style={{
          position: 'absolute' as const,
          left: 0,
          right: 0,
          height: '6px',
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.2)',
        }}>
          {/* Filled bar */}
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'rgba(255,255,255,0.85)',
            borderRadius: '999px',
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Thumb dot (visual only) */}
        <div style={{
          position: 'absolute' as const,
          left: `clamp(8px, calc(${progress}% - 8px), calc(100% - 8px))`,
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 0 0 3px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.35)',
          transition: 'left 0.3s ease',
          pointerEvents: 'none' as const,
          zIndex: 1,
        }} />

        {/* Invisible native range input — on top for click/drag */}
        <input
          type="range"
          min="0"
          max={total - 1}
          value={current - 1}
          onChange={(e) => onSliderChange && onSliderChange(Number(e.target.value))}
          style={{
            position: 'absolute' as const,
            left: 0,
            top: 0,
            width: '100%',
            height: '28px',
            opacity: 0,
            cursor: 'pointer',
            zIndex: 2,
            margin: 0,
            padding: 0,
          }}
        />
      </div>

      {/* Counter pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        padding: '4px 14px',
        borderRadius: '999px',
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.25)',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>{current}</span>
        <span style={{ fontWeight: '400', fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '0 3px' }}>/</span>
        <span style={{ fontWeight: '400', fontSize: '15px', color: 'rgba(255,255,255,0.7)' }}>{total}</span>
      </div>
    </div>
  )
}