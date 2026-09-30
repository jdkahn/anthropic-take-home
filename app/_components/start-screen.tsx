import type { ReactNode } from "react";

// Starter questions match the M1 harness exactly, so stub mode maps each to its fixture.
export const STARTERS = [
  "Summarize August for the leadership update",
  "How does this summer compare to last summer?",
  "We're setting Q4 targets. What should we expect for December?",
];

// Main.dc.html: heading, expectation line (D43), composer, starter chips (D36, D37).
export function StartScreen({ composer, onStarter }: { composer: ReactNode; onStarter: (q: string) => void }) {
  return (
    <main className="flex flex-grow flex-col items-center justify-center gap-7 px-4 py-10 sm:px-6">
      <div className="flex w-full max-w-[760px] flex-col gap-2.5">
        <h1 className="m-0 font-serif text-[32px] leading-[1.15] font-semibold sm:text-[40px]">What are you working on?</h1>
        <p className="m-0 text-base leading-[1.55] text-ink-muted">
          Paste or attach your work and ask anything. Claude answers in full, and may leave one key step for you to work
          out. You can reveal it any time.
        </p>
      </div>
      <div className="w-full max-w-[760px]">{composer}</div>
      <div className="flex w-full max-w-[760px] flex-col gap-2.5">
        <div className="flex flex-col gap-0.5 text-[13px]">
          <span className="font-semibold">Try a starter question</span>
          <span className="text-ink-muted">Uses sample data from Tasklane, a fictional team task app. We’ll attach it for you.</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {STARTERS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onStarter(q)}
              className="min-h-11 rounded-full border border-line-strong bg-surface px-4 text-left text-sm hover:border-ink-disabled"
            >
              {q.replace("We're", "We’re")}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
