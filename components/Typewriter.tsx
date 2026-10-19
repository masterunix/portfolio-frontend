/**
 * Typewriter.tsx — The line typing itself out at the top of the home page: types each
 * message, pauses, deletes it, and moves on. A message with a link opens it when
 * clicked (other sites in a new tab). It's decoration, so it isn't the page's heading:
 * the home page has its own (hidden) h1 for search engines and screen readers.
 */
'use client';

import { useTypewriter } from '@/hooks/useTypewriter';
import type { Home } from '@/types';

export default function Typewriter({ messages, className = '' }: { messages: Home['messages']; className?: string }) {
  const { text, message } = useTypewriter(messages);
  return (
    <p className={`typewriter ${className}`} aria-hidden="true">
      {message?.link
        ? <a href={message.link} {...(/^https?:/.test(message.link) && { target: '_blank', rel: 'noopener noreferrer' })} tabIndex={-1}>{text}</a>
        : text}
    </p>
  );
}
