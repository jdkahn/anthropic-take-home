"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { SendIcon, StopIcon } from "./icons";

// Two layouts from the wireframes: "start" (Main.dc.html) and "docked" (every chat artboard).
// While streaming, Send becomes Stop (Loading.dc.html). While grading, Send is disabled but
// the textarea stays usable (D103). The attach button is left out: no milestone ships uploads.
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
  const canSend = !busy && text.trim() !== "";

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend) return;
    onSend(text.trim());
    setText("");
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
      aria-label="Message"
      rows={variant === "start" ? 2 : 1}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={variant === "start" ? "Ask anything, or paste in your data or code…" : "Reply, or ask something new…"}
      className="min-w-0 flex-grow resize-none bg-transparent text-[15px] leading-normal outline-none"
    />
  );

  return variant === "start" ? (
    <form onSubmit={submit} className="flex flex-col gap-1.5 rounded-2xl border border-line-strong bg-surface pt-3.5 pr-2 pb-2 pl-4">
      {textarea}
      <div className="flex justify-end">{button}</div>
    </form>
  ) : (
    <form onSubmit={submit} className="flex items-center gap-2 rounded-2xl border border-line-strong bg-surface py-1.5 pr-1.5 pl-4">
      {textarea}
      {button}
    </form>
  );
}
