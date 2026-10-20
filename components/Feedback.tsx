/**
 * Feedback.tsx: The feedback button in the bottom-right corner of every page, a glass
 * square like Gleck's on the left. It opens a popup: an "About" drop-down (set to the
 * page you're on), a message, and Mail it, which opens the visitor's own mail app with
 * the message filled in. Nothing is sent from the site itself. Some visitors have no mail
 * app set up, so the popup stays open after Mail it, with Gmail and Copy address as
 * fallbacks. The settings are in content/site.md (`feedback`).
 *
 * Any link to #mail (the home page's Mail Me! tile) opens the same popup, headed "Mail
 * me" and set to the fallback topic.
 *
 * The popup is a native <dialog>, so focus stays inside it and Esc closes it.
 */
'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';

import type { Feedback as FeedbackContent } from '@/types';

const OPEN_MS = 280;
const CLOSE_MS = 200;

/** The topic for a page: the one whose `page` matches it most closely, or the fallback */
function topicFor(pathname: string, topics: FeedbackContent['topics']): string {
  const matches = topics.filter(({ page }) =>
    page !== undefined && (pathname === page || (page !== '/' && pathname.startsWith(`${page}/`))));
  matches.sort((a, b) => b.page!.length - a.page!.length);
  return (matches[0] ?? topics.find(({ page }) => page === undefined) ?? topics[0]).label;
}

/** How the popup was opened: the corner button, or a #mail link */
type Opened = { mail: boolean } | null;

export default function Feedback({ feedback }: { feedback: FeedbackContent }) {
  const [open, setOpen] = useState<Opened>(null);

  // Links to #mail open the popup instead of jumping to an anchor
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest('a[href="#mail"]')) return;
      e.preventDefault();
      setOpen({ mail: true });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <>
      <button type="button" className="feedback-button glass" onClick={() => setOpen({ mail: false })}
        aria-haspopup="dialog" aria-label={feedback.title}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" />
          <path d="M8 9h8M8 12h5" />
        </svg>
      </button>
      {open && createPortal(<FeedbackDialog feedback={feedback} mail={open.mail} onClosed={() => setOpen(null)} />, document.body)}
    </>
  );
}

function FeedbackDialog({ feedback, mail, onClosed }: { feedback: FeedbackContent; mail: boolean; onClosed: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);
  const pathname = usePathname();
  const [topic, setTopic] = useState(() => topicFor(mail ? '' : pathname, feedback.topics));
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const dialog = ref.current!;
    if (!dialog.open) dialog.showModal();
    dialog.animate(
      reducedMotion()
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, transform: 'translateY(16px) scale(0.97)' }, { opacity: 1, transform: 'none' }],
      { duration: OPEN_MS, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    );
  }, []);

  const close = () => {
    const dialog = ref.current;
    if (!dialog || closing.current) return;
    closing.current = true;
    dialog.classList.add('is-closing');
    dialog.animate(
      reducedMotion()
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(12px) scale(0.98)' }],
      { duration: CLOSE_MS, easing: 'ease-in', fill: 'forwards' },
    ).onfinish = () => { dialog.close(); onClosed(); };
  };

  // Esc runs the closing animation (as in TileDialog); a close by the browser still cleans up
  useEffect(() => {
    const dialog = ref.current!;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
    const onCancel = (e: Event) => { e.preventDefault(); close(); };
    const onClose = () => { if (!closing.current) onClosed(); };
    dialog.addEventListener('keydown', onKeyDown);
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('close', onClose);
    return () => {
      dialog.removeEventListener('keydown', onKeyDown);
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('close', onClose);
    };
  });

  const subject = `${mail ? 'Message' : 'Feedback'}: ${topic}`;
  const body = () => (message.trim() ? `${message.trim()}\n\n(Sent from ${window.location.href})` : '');
  const ready = mail || message.trim() !== '';

  const send = (e: FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${feedback.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body())}`;
    setStatus('Your mail app should open with the message. If nothing happened, use Gmail or copy the address.');
  };

  const gmail = () => {
    const query = new URLSearchParams({ view: 'cm', fs: '1', to: feedback.email, su: subject, body: body() });
    window.open(`https://mail.google.com/mail/?${query}`, '_blank', 'noopener,noreferrer');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(feedback.email);
      setStatus(`Copied ${feedback.email}.`);
    } catch {
      setStatus(`Couldn't copy it. The address is ${feedback.email}.`);
    }
  };

  return (
    <dialog ref={ref} className="tile-dialog feedback-dialog" aria-labelledby="feedback-title"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <form className="dialog-content" onSubmit={send}>
        <button type="button" className="dialog-close" onClick={close} aria-label="Close">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
        <h2 id="feedback-title" className="dialog-title">{mail ? 'Mail me' : feedback.title}</h2>

        <label className="feedback-field">
          <span>About</span>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {feedback.topics.map(({ label }) => <option key={label} value={label}>{label}</option>)}
          </select>
        </label>

        <label className="feedback-field">
          <span>Message</span>
          <textarea value={message} onChange={(e) => { setMessage(e.target.value); setStatus(''); }} rows={6} required={!mail}
            placeholder={mail ? 'Say hello, or ask me anything.' : "What's wrong, or what would you change?"} />
        </label>

        <div className="dialog-links">
          <button type="submit" className="hex-button" disabled={!ready}>Mail it</button>
          <button type="button" className="hex-button feedback-secondary" onClick={gmail} disabled={!ready}>Gmail</button>
          <button type="button" className="hex-button feedback-secondary" onClick={copy}>Copy address</button>
        </div>
        <p className="feedback-hint" aria-live="polite">
          {status || `Mail it opens your mail app with the message filled in, addressed to ${feedback.email}.`}
        </p>
      </form>
    </dialog>
  );
}
