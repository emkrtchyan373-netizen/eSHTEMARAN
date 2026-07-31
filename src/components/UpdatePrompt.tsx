import { useEffect, useRef } from 'react'
import { useServiceWorker } from '../hooks/useServiceWorker'
import './UpdatePrompt.css'

/**
 * UpdatePrompt — slides in from the bottom when a new PWA version is available.
 * Clicking "Update" activates the waiting service worker and reloads the page.
 */
export default function UpdatePrompt() {
  const { showPrompt, updateSW } = useServiceWorker()
  const bannerRef = useRef<HTMLDivElement>(null)

  // Animate in/out
  useEffect(() => {
    if (!bannerRef.current) return
    if (showPrompt) {
      bannerRef.current.classList.add('update-prompt--visible')
    } else {
      bannerRef.current.classList.remove('update-prompt--visible')
    }
  }, [showPrompt])

  if (!showPrompt) return null

  return (
    <div ref={bannerRef} className="update-prompt" role="alert" aria-live="polite">
      <div className="update-prompt__icon">
        {/* Refresh SVG */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </div>

      <div className="update-prompt__text">
        <span className="update-prompt__title">Նոր թարմացում պատրաստ է</span>
        <span className="update-prompt__sub">New version available</span>
      </div>

      <button
        className="update-prompt__btn"
        onClick={updateSW}
        aria-label="Update to new version"
      >
        Թարմացնել
      </button>

      <button
        className="update-prompt__dismiss"
        onClick={() => bannerRef.current?.classList.remove('update-prompt--visible')}
        aria-label="Dismiss update notification"
      >
        ✕
      </button>
    </div>
  )
}
