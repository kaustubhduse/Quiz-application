"use client"
import { useEffect, useState } from "react"

export default function Timer({ onEnd, initialTime = 1800 }: { onEnd: () => void, initialTime?: number }) {
  const [time, setTime] = useState(initialTime)

  useEffect(() => {
    setTime(initialTime)
  }, [initialTime])

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onEnd()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onEnd])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return <div>{formatTime(time)}</div>
}
