import { type ReactNode, useEffect } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'

export default function MobileLayoutProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile()

  useEffect(() => {
    document.body.classList.toggle('layout--mobile', isMobile)
    return () => document.body.classList.remove('layout--mobile')
  }, [isMobile])

  return <>{children}</>
}
