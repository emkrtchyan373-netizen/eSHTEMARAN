import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './LoadingScreen.css'

interface LoadingScreenProps {
  isVisible: boolean
  onFinished?: () => void
}

/**
 * Full-screen animated logo loading overlay.
 * Fades in softly on mount, plays the logo animation,
 * then fades out smoothly when the video ends.
 */
export default function LoadingScreen({ isVisible, onFinished }: LoadingScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isVisible) {
      video.currentTime = 0
      video.play().catch(() => {
        // Auto-play blocked — fallback dismiss after 2.5s
        const t = setTimeout(() => onFinished?.(), 2500)
        return () => clearTimeout(t)
      })
    }

    const handleEnded = () => onFinished?.()
    video.addEventListener('ended', handleEnded)
    return () => video.removeEventListener('ended', handleEnded)
  }, [isVisible, onFinished])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="loading-screen"
          /* ✅ Soft fade IN on mount */
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          /* ✅ Soft fade OUT on unmount */
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Logo wrapper fades + scales in with a slight delay */}
          <motion.div
            className="loading-screen__logo-wrapper"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 }}
          >
            {/* Soft ambient glow behind the logo */}
            <div className="loading-screen__glow" aria-hidden="true" />

            {/* Circular clip removes white MP4 background */}
            <div className="loading-screen__clip">
              <video
                ref={videoRef}
                className="loading-screen__video"
                src="/assets/logoanimated.mp4"
                muted
                playsInline
                preload="auto"
              />
            </div>

            <span className="loading-screen__label">Loading…</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
