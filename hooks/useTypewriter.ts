/**
 * useTypewriter.ts — Typewriter animation effect for cycling messages.
 *
 * Implements a state machine with two phases:
 * 1. Typing:   Characters are added one-by-one at `typingSpeed` ms
 * 2. Deleting: Characters are removed at half speed, then advances to next message
 *
 * After fully typing a message, pauses for `pauseTime` ms before deleting.
 * Loops infinitely through all messages.
 *
 * Used on the home page header to cycle through CMS-managed messages.
 */

import { useState, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TypewriterMessage {
  text: string;
  link?: string;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTypewriter(messages: TypewriterMessage[], typingSpeed = 50, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const currentText = messages[messageIndex].text;
    
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      // Phase 1: Typing — add one character per tick
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.substring(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // Fully typed — pause before starting to delete
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    } else {
      // Phase 2: Deleting — remove one character per tick (2x speed)
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.substring(0, displayText.length - 1));
        }, typingSpeed / 2);
      } else {
        // Fully deleted — advance to next message (wraps around)
        setIsDeleting(false);
        setMessageIndex((prev) => (prev + 1) % messages.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, messageIndex, messages, typingSpeed, pauseTime]);

  return {
    /** The currently visible text (partial during typing/deleting) */
    text: displayText,
    /** The full message object currently being typed */
    currentMessage: messages[messageIndex],
    /** True while characters are being added (not during pause or delete) */
    isTyping: !isDeleting && displayText.length < (messages[messageIndex]?.text.length || 0)
  };
}
