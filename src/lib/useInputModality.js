import { useEffect } from 'react';

// Tells the stylesheet how the page is being driven: html[data-input] is 'pointer' (touch,
// mouse, pen) or 'keyboard' (Tab, arrows, Enter, Space). The focus ring (globals.scss) is
// drawn only for the keyboard. Without this, iOS Safari matches :focus-visible on the
// elements we focus from script (the team modal, the opened menu), so a tap leaves an
// orange ring behind — a ring that only keyboard users need.
const NAV_KEYS = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' ']);

export default function useInputModality() {
  useEffect(() => {
    const root = document.documentElement;
    const set = (v) => { if (root.dataset.input !== v) root.dataset.input = v; };
    const onPointer = () => set('pointer');
    const onKey = (e) => { if (NAV_KEYS.has(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) set('keyboard'); };
    document.addEventListener('pointerdown', onPointer, { capture: true, passive: true });
    document.addEventListener('keydown', onKey, { capture: true });
    return () => {
      document.removeEventListener('pointerdown', onPointer, { capture: true });
      document.removeEventListener('keydown', onKey, { capture: true });
    };
  }, []);
}
