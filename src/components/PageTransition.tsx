import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * Wraps a page in a framer-motion animated div.
 * Use inside every page component's top-level return so that
 * route changes trigger a clean fade + slide-up entrance and exit.
 */
export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier ease-out
      }}
      style={{ width: '100%', minHeight: '100%' }}
    >
      {children}
    </motion.div>
  )
}
