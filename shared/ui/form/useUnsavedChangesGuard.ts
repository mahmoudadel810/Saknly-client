"use client";

import { useEffect, useRef } from "react";

/**
 * Warns before leaving a form with unsaved input.
 * - Reload, tab close and typed URLs: the browser's own beforeunload prompt.
 * - In-app links (Next.js <Link> and plain anchors): a capture-phase click listener on the document stops the
 *   navigation before Next.js sees it and calls `onBlockedNavigation(href)`, so the page can ask with its own
 *   dialog and navigate on confirm.
 * Not covered: the browser's back and forward buttons (Next.js gives no way to cancel a popstate).
 */
export function useUnsavedChangesGuard(when: boolean, onBlockedNavigation: (href: string) => void) {
  const callbackRef = useRef(onBlockedNavigation);
  callbackRef.current = onBlockedNavigation;

  useEffect(() => {
    if (!when) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Required by some browsers to show the prompt.
      e.returnValue = "";
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      e.preventDefault();
      e.stopPropagation();
      callbackRef.current(url.pathname + url.search + url.hash);
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [when]);
}
