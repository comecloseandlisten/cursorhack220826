import { useCallback, useEffect, useRef, useState } from 'react'

import { phraseText } from '../lib/playlist'
import type { DayEntry } from '../types'

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!text.trim() || typeof speechSynthesis === 'undefined') {
      resolve()
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.95
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    speechSynthesis.speak(utterance)
  })
}

export function useNarration(playlist: DayEntry[], dayKey: string) {
  const [playing, setPlaying] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const cancelRef = useRef(false)
  const runId = useRef(0)

  const stop = useCallback(() => {
    cancelRef.current = true
    runId.current += 1
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel()
    }
    setPlaying(false)
    setActiveId(null)
  }, [])

  useEffect(() => {
    return () => {
      cancelRef.current = true
      if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.cancel()
      }
    }
  }, [dayKey])

  async function play() {
    if (playlist.length === 0) {
      return
    }

    cancelRef.current = false
    const currentRun = runId.current + 1
    runId.current = currentRun
    setPlaying(true)

    for (const entry of playlist) {
      if (cancelRef.current || runId.current !== currentRun) {
        return
      }
      setActiveId(entry.id)
      await speak(phraseText(entry))
    }

    if (runId.current === currentRun) {
      setPlaying(false)
      setActiveId(null)
    }
  }

  async function playOne(entry: DayEntry) {
    stop()
    cancelRef.current = false
    const currentRun = runId.current + 1
    runId.current = currentRun
    setPlaying(true)
    setActiveId(entry.id)

    await speak(phraseText(entry))

    if (runId.current === currentRun) {
      setPlaying(false)
      setActiveId(null)
    }
  }

  function toggle() {
    if (playing) {
      stop()
      return
    }
    void play()
  }

  return { playing, activeId, toggle, stop, playOne }
}
