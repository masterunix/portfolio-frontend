/**
 * useTypewriter.ts — Types each message a character at a time, pauses, deletes it at
 * twice the speed, then moves to the next, looping forever.
 */
import { useEffect, useState } from 'react';

const TYPE_MS = 50;
const PAUSE_MS = 2000;

export function useTypewriter<T extends { text: string }>(messages: T[]) {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const message = messages[index % Math.max(messages.length, 1)] as T | undefined;

  useEffect(() => {
    if (!message) return;
    const full = message.text.length;
    const timer = !deleting
      ? length < full
        ? setTimeout(() => setLength(length + 1), TYPE_MS)
        : setTimeout(() => setDeleting(true), PAUSE_MS)
      : length > 0
        ? setTimeout(() => setLength(length - 1), TYPE_MS / 2)
        : setTimeout(() => { setDeleting(false); setIndex((i) => (i + 1) % messages.length); }, TYPE_MS);
    return () => clearTimeout(timer);
  }, [message, length, deleting, messages.length]);

  return { text: message?.text.slice(0, length) ?? '', message };
}
