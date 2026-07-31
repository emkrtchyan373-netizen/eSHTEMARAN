import { useState, useEffect, useCallback } from 'react'

interface UpdateState {
  showPrompt: boolean
  updateSW: () => void
}

/**
 * useServiceWorker — detects when a new Service Worker version is waiting
 * and exposes a function to activate it and reload the page.
 */
export function useServiceWorker(): UpdateState {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handleUpdate = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting)
        setShowPrompt(true)
      }
    }

    navigator.serviceWorker.ready.then((registration) => {
      // New SW found on first check
      if (registration.waiting) {
        setWaitingWorker(registration.waiting)
        setShowPrompt(true)
      }

      // Listen for future updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            handleUpdate(registration)
          }
        })
      })
    })

    // Poll for updates every 60 seconds while tab is open
    const interval = setInterval(() => {
      navigator.serviceWorker.ready.then((reg) => reg.update())
    }, 60_000)

    return () => clearInterval(interval)
  }, [])

  const updateSW = useCallback(() => {
    if (!waitingWorker) return
    // Tell the waiting SW to take over
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    // Reload once the new SW activates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
    setShowPrompt(false)
  }, [waitingWorker])

  return { showPrompt, updateSW }
}
