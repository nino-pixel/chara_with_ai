import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

const transition = {
  duration: 0.35,
  ease: [0.4, 0, 0.2, 1] as const,
}

type Props = {
  children: ReactNode
  className?: string
}

/**
 * Lightweight route enter/exit for use inside AnimatePresence (mode="wait").
 */
export default function PageTransition({ children, className }: Props) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <div className={className} style={{ width: '100%' }}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={transition}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  )
}
