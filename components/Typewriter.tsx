/**
 * Typewriter.tsx — The home page heading: types out each message, pauses, deletes it,
 * and moves on. A message with a link opens it when clicked.
 */
'use client';

import { useTypewriter } from '@/hooks/useTypewriter';
import type { HomeMessage } from '@/types';

export default function Typewriter({ messages, className = '' }: { messages: HomeMessage[]; className?: string }) {
  const { text, message } = useTypewriter(messages);
  return (
    <h1 className={`typewriter ${className}`}>
      {message?.link
        ? <a href={message.link} target="_blank" rel="noopener noreferrer">{text}</a>
        : text}
    </h1>
  );
}
