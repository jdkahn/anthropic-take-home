"use client";

import { useRouter } from "next/navigation";
import { useEffect, useReducer, useRef } from "react";
import { AssistantTurn } from "./_components/assistant-turn";
import { Brand } from "./_components/brand";
import type { TurnActions } from "./_components/cloze";
import { Composer } from "./_components/composer";
import { FileIcon } from "./_components/icons";
import { StartScreen } from "./_components/start-screen";
import { conversationReducer, emptyConversation, isBusy, type Turn } from "@/lib/conversation";
import { parseGrade } from "@/lib/grade";
import { gradeFailureMessage, gradeInput } from "@/lib/grading";
import { canCheck, type RoundAction } from "@/lib/round-reducer";
import { shuffledOrder } from "@/lib/shuffle";

// D84: the UI shows the two CSV exports; the app sends Claude tasklane.json.
const ATTACHED_FILES = ["tasklane_metrics.csv", "tasklane_events.csv"];
const GRADE_TIMEOUT_MS = 20_000; // D103: ~4× Sonnet's p90

export default function Chat() {
  const router = useRouter();
  const [state, dispatch] = useReducer(conversationReducer, emptyConversation);
  const streamRef = useRef<AbortController | null>(null);
  const gradeRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const last = state.turns.at(-1);
  const streaming = last?.round.status === "streaming";
  const busy = isBusy(state);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [state.turns.length]);

  // D76: plain fetch + ReadableStream; the reducer parses (D57). A stream that "New chat"
  // replaced drops its own late events instead of landing on the new conversation.
  async function send(question: string, attached: boolean) {
    if (busy) return;
    const controller = new AbortController();
    streamRef.current = controller;
    const round = (action: RoundAction) => {
      if (streamRef.current === controller) dispatch({ type: "round", action });
    };
    dispatch({ type: "send", question, attached });

    let res: Response;
    try {
      res = await fetch("/api/round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
        signal: controller.signal,
      });
    } catch {
      if (controller.signal.aborted) round({ type: "streamEnd", order: shuffledOrder(4), stopped: true });
      else round({ type: "requestFailed", reason: "network" });
      return;
    }
    if (res.status === 401) return router.replace("/login");
    if (!res.ok || !res.body) {
      const reason = res.status === 429 ? "rate_limited" : res.status === 503 ? "busy" : "upstream";
      return round({ type: "requestFailed", reason });
    }

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let stopped = false;
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        round({ type: "chunk", text: value });
      }
    } catch {
      stopped = controller.signal.aborted; // otherwise the stream broke: parseRound() decides (D57)
    }
    round({ type: "streamEnd", order: shuffledOrder(4), stopped }); // D100: shuffle at the dispatch site
  }

  // D56: the browser sends the round (answer included) with the learner's response.
  // D103: 20 s timeout → gradeFailed, so a hung request can't keep Send blocked.
  async function check() {
    const round = last?.round;
    if (round?.status !== "answering" || !canCheck(round)) return;
    const controller = new AbortController();
    gradeRef.current = controller;
    const settle = (action: RoundAction) => {
      if (gradeRef.current === controller) dispatch({ type: "round", action });
    };
    dispatch({ type: "round", action: { type: "check" } });
    const input = gradeInput(round);

    const failed = (reason: Parameters<typeof gradeFailureMessage>[0]) =>
      settle({ type: "gradeFailed", message: gradeFailureMessage(reason) });
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(GRADE_TIMEOUT_MS)]),
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) return failed(res.status);
      const parsed = parseGrade(await res.text(), input.round.rung); // D107: own words go as rung 2
      if (parsed.kind === "invalid") return failed("invalid"); // moves no rung (lib/grade.ts)
      settle({ type: "gradeDone", grade: parsed.grade });
    } catch (err) {
      failed(err instanceof DOMException && err.name === "TimeoutError" ? "timeout" : "network");
    }
  }

  function stop() {
    streamRef.current?.abort();
  }

  function newChat() {
    streamRef.current?.abort();
    streamRef.current = null;
    gradeRef.current?.abort();
    gradeRef.current = null;
    dispatch({ type: "reset" });
  }

  const composer = (variant: "start" | "docked") => (
    <Composer variant={variant} streaming={streaming} busy={busy} onSend={(q) => send(q, false)} onStop={stop} />
  );

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4 sm:px-6">
        <Brand />
        <button
          type="button"
          onClick={newChat}
          className="min-h-9 rounded-[10px] border border-line-strong px-3.5 text-sm hover:border-ink-disabled"
        >
          New chat
        </button>
      </header>

      {state.turns.length === 0 ? (
        <StartScreen composer={composer("start")} onStarter={(q) => send(q, true)} />
      ) : (
        <>
          <main className="flex-grow overflow-y-auto px-4 pt-8 sm:px-6">
            <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 pb-6">
              {state.turns.map((turn) => (
                <TurnView
                  key={turn.id}
                  turn={turn}
                  actions={turn === last ? { dispatch: (action) => dispatch({ type: "round", action }), check } : undefined}
                />
              ))}
              <div ref={endRef} />
            </div>
          </main>
          <div className="flex shrink-0 justify-center bg-page px-4 pt-4 pb-6 sm:px-6">
            <div className="w-full max-w-[760px]">{composer("docked")}</div>
          </div>
        </>
      )}
    </div>
  );
}

function TurnView({ turn, actions }: { turn: Turn; actions?: TurnActions }) {
  return (
    <>
      <div className="flex max-w-[560px] flex-col items-end gap-2 self-end">
        {turn.attached && (
          <div className="flex flex-wrap justify-end gap-2">
            {ATTACHED_FILES.map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13px]">
                <FileIcon />
                <span className="font-mono">{f}</span>
              </span>
            ))}
          </div>
        )}
        <div className="rounded-2xl bg-user-bubble px-4 py-3 text-[15px] leading-normal whitespace-pre-wrap">{turn.question}</div>
      </div>
      <AssistantTurn round={turn.round} actions={actions} />
    </>
  );
}
