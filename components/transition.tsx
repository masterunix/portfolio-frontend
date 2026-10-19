/**
 * transition.tsx: Leaving a hex page plays its outro first.
 *
 * HexPage provides the context: `leave(href)` starts the outro and navigates when
 * the grid's exit wave (reported with useExitDuration) has finished. Hexagons, the
 * header and the footer read `isExiting` to animate out.
 *
 * SmartLink is the one link component: pages on this site go through `leave` (when
 * there is a hex page to leave), other sites open in a new tab, files open or
 * download, and mailto:/tel: links work as usual. Modified clicks (⌘/Ctrl-click,
 * middle-click) behave like any link.
 */
'use client';

import { createContext, useContext, useEffect, type ComponentProps } from 'react';
import Link from 'next/link';

import { isExternal } from '@/lib/format';

interface PageTransition {
  isExiting: boolean;
  leave: (href: string) => void;
  setExitMs: (ms: number) => void;
}

export const PageTransitionContext = createContext<PageTransition | null>(null);

export function usePageTransition(): PageTransition | null {
  return useContext(PageTransitionContext);
}

/** True while the page's outro plays */
export function useIsExiting(): boolean {
  return usePageTransition()?.isExiting ?? false;
}

/** Tells the page how long its exit wave takes, so it navigates once the wave is done */
export function useExitDuration(ms: number): void {
  const transition = usePageTransition();
  useEffect(() => transition?.setExitMs(ms), [transition, ms]);
}

interface SmartLinkProps extends Omit<ComponentProps<'a'>, 'href'> {
  href: string;
  /** Save the file under this name */
  download?: string;
  /** Open in a new tab even though it's on this site (files) */
  newTab?: boolean;
}

export function SmartLink({ href, download, newTab, onClick, children, ...props }: SmartLinkProps) {
  const transition = usePageTransition();

  if (download !== undefined) return <a href={href} download={download} {...props}>{children}</a>;
  if (newTab || isExternal(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} {...props}>{children}</a>;
  }
  if (!href.startsWith('/')) return <a href={href} onClick={onClick} {...props}>{children}</a>;

  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (!transition || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        transition.leave(href);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
