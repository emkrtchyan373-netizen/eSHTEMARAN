import { useEffect, useState } from 'react'

export const MOBILE_BREAKPOINT = 768

export function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= breakpoint,
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint)
    }

    window.addEventListener('resize', handleResize)
    // Run once on mount to handle initial load/redirect
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return isMobile
}
