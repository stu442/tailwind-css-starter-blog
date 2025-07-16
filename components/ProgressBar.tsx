'use client'

import { useEffect, useState } from 'react'

const ProgressBar = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const scrollTop = window.scrollY

      if (documentHeight > 0) {
        const scrollProgress = (scrollTop / documentHeight) * 100
        setProgress(Math.min(scrollProgress, 100))
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 z-50 h-1 w-full bg-gray-200 dark:bg-gray-800"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="from-primary-500 to-primary-600 h-full bg-gradient-to-r shadow-sm transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default ProgressBar
