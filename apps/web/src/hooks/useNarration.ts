import { useCallback, useEffect, useRef, useState } from "react";

import { phraseText } from "../lib/playlist";
import type { DayEntry } from "../types/canvas";

function voiceScore(voice: SpeechSynthesisVoice, language: string): number {
  const name = voice.name.toLowerCase();
  const locale = voice.lang.toLowerCase();
  const target = language.toLowerCase();
  let score = 0;

  if (locale === target) score += 20;
  else if (locale.startsWith(target.slice(0, 2))) score += 10;
  if (/premium|enhanced|natural|neural/.test(name)) score += 12;
  if (/ava|samantha|allison|google us english/.test(name)) score += 6;
  if (voice.localService) score += 2;

  return score;
}

function bestVoice(language: string): SpeechSynthesisVoice | undefined {
  return [...window.speechSynthesis.getVoices()].sort(
    (left, right) => voiceScore(right, language) - voiceScore(left, language),
  )[0];
}

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!text.trim() || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    const language = /[А-Яа-яЁё]/.test(text) ? "ru-RU" : "en-US";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.voice = bestVoice(language) ?? null;
    utterance.rate = 0.88;
    utterance.pitch = 0.96;
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
