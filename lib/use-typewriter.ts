import { useEffect, useState } from 'react'

export function useTypewriter(text: string, speed: number = 5) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!text) {
      setDisplayedText('')
      setIsComplete(false)
      return
    }

    let currentIndex = 0
    setDisplayedText('')
    setIsComplete(false)

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        // Batch multiple characters for faster rendering
        const batchSize = Math.min(10, text.length - currentIndex)
        currentIndex += batchSize
        setDisplayedText(text.substring(0, currentIndex))
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return { displayedText, isComplete }
}
