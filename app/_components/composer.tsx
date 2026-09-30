"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from "react";
import { useAutoGrow } from "./auto-grow";
import { SendIcon, StopIcon } from "./icons";

// Two layouts from the wireframes: "start" (Main.dc.html) and "docked" (every chat artboard).
// While streaming, Send becomes Stop (Loading.dc.html). While grading, Send is disabled but
// the textarea stays usable (D103). No attach button: starters bring the data (D122).
// The textarea carries the box's padding, so its hit area is the whole white box, and it grows
// with its content (useAutoGrow).
export function Composer({
  variant,
  streaming,
  busy,
  onSend,
  onStop,
}: {
  variant: "start" | "docked";
  streaming: boolean;
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !busy && text.trim() !== "";

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend) return;
    onSend(text.trim());
    setText("");
  }

  useAutoGrow(inputRef, text); // also shrinks back after Send clears it

  // The start layout's button row is outside the textarea: a click there focuses it too.
  function focusInput(event: MouseEvent<HTMLFormElement>) {
    if (event.target === inputRef.current || (event.target as HTMLElement).closest("button")) return;
    event.preventDefault(); // keep focus from flickering to the form
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) submit(event);
  }

  const button = streaming ? (
    <button
      type="button"
      aria-label="Stop generating"
      onClick={onStop}
      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white"
    >
      <StopIcon />
    </button>
  ) : (
    <button
      type="submit"
      aria-label="Send"
      disabled={!canSend}
      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
    >
      <SendIcon />
    </button>
  );

  const textarea = (
    <textarea
      ref={inputRef}
      aria-label="Message"
      rows={variant === "start" ? 2 : 1}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={variant === "start" ? "Ask anything, or paste in your data or code…" : "Reply, or ask something new…"}
      className={`min-w-0 flex-grow resize-none bg-transparent text-[15px] leading-normal outline-none ${
        variant === "start" ? "px-4 pt-3.5 pb-1" : "min-h-14 py-4 pr-2 pl-4"
      }`}
    />
  );

  return variant === "start" ? (
    <form onSubmit={submit} onMouseDown={focusInput} className="flex cursor-text flex-col rounded-2xl border border-line-strong bg-surface">
      {textarea}
      <div className="flex justify-end pr-2 pb-2">{button}</div>
    </form>
  ) : (
    <form onSubmit={submit} className="flex items-end rounded-2xl border border-line-strong bg-surface">
      {textarea}
      <div className="shrink-0 p-1.5">{button}</div>
    </form>
  );
}
