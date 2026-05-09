import { useState, useEffect } from 'react';

interface TypewriterMessage {
  text: string;
  link?: string;
}

export function useTypewriter(messages: TypewriterMessage[], typingSpeed = 50, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const currentText = messages[messageIndex].text;
    
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.substring(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.substring(0, displayText.length - 1));
        }, typingSpeed / 2);
      } else {
        setIsDeleting(false);
        setMessageIndex((prev) => (prev + 1) % messages.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, messageIndex, messages, typingSpeed, pauseTime]);

  return {
    text: displayText,
    currentMessage: messages[messageIndex],
    isTyping: !isDeleting && displayText.length < (messages[messageIndex]?.text.length || 0)
  };
}
