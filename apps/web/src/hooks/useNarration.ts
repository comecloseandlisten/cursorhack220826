import { useCallback, useEffect, useRef, useState } from "react";

import { phraseText } from "../lib/playlist";
import type { DayEntry } from "../types/canvas";

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!text.trim() || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export function useNarration(dayKey: string) {
  const [playing, setPlaying] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const runId = useRef(0);

  const stop = useCallback(() => {
    runId.current += 1;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlaying(false);
    setActiveId(null);
  }, []);

  useEffect(() => stop, [dayKey, stop]);

  async function playOne(entry: DayEntry) {
    stop();
    const currentRun = runId.current + 1;
    runId.current = currentRun;
    setPlaying(true);
    setActiveId(entry.id);

    await speak(phraseText(entry));

    if (runId.current === currentRun) {
      setPlaying(false);
      setActiveId(null);
    }
  }

  return { playing, activeId, stop, playOne };
}
