import { useLayoutEffect, type RefObject } from "react";

// Sizes a textarea to its content on every change, so multi-line text never needs a scrollbar.
// `rows` still sets the minimum height; past `maxVh` of the viewport it scrolls.
export function useAutoGrow(ref: RefObject<HTMLTextAreaElement | null>, value: string, maxVh = 0.4) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    // scrollHeight excludes borders, and the height is border-box (Tailwind preflight).
    const needed = el.scrollHeight + (el.offsetHeight - el.clientHeight);
    const max = window.innerHeight * maxVh;
    el.style.height = `${Math.min(needed, max)}px`;
    el.style.overflowY = needed > max ? "auto" : "hidden";
  }, [ref, value, maxVh]);
}
