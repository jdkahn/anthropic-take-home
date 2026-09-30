import type { ReactNode } from "react";
import { Spinner, TargetIcon } from "./icons";
import { InlineMarkdown } from "./markdown";

// Shared pieces of an assistant turn (Loading, Cloze, Checking artboards).

export function GoalChip({ goal }: { goal: string | null }) {
  if (!goal) return null;
  return (
    <div className="flex items-center gap-2 self-start rounded-full border border-goal-border bg-goal-bg px-3 py-1.5 text-[13px] text-goal-text">
      <TargetIcon />
      <span>
        <strong className="font-semibold">Learning goal:</strong> {goal}
      </span>
    </div>
  );
}

export function GhostGoalChip() {
  return (
    <div
      aria-hidden
      className="flex h-[42px] w-[340px] max-w-full items-center gap-2.5 self-start rounded-full border border-ghost-border bg-ghost-bg px-3.5"
    >
      <span className="size-4 shrink-0 animate-pulse rounded-full bg-ghost-fill" />
      <span className="h-2.5 w-[250px] max-w-[70%] animate-pulse rounded-[5px] bg-ghost-fill" />
    </div>
  );
}

// The "Your turn" panel. At rung 1 it shows the sentence the blank completes; `fill` replaces the
// empty blank line once the answer may be shown (revealed or graded, D45).
export function YourTurn({
  heading = "Your turn",
  label,
  leadIn,
  rung,
  closing,
  fill,
  status,
  children,
}: {
  heading?: string;
  label: string | null;
  leadIn: string;
  rung: 1 | 2 | 3 | null;
  closing: string;
  fill?: string;
  status?: string;
  children?: ReactNode;
}) {
  return (
    <section
      aria-label={heading}
      className="flex flex-col gap-4 rounded-[14px] border border-line-strong bg-surface-muted px-5 py-[18px]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold tracking-[0.06em] text-ink-muted uppercase">{heading}</span>
        {status && (
          <span className="inline-flex items-center gap-2 text-[13px] text-ink-muted">
            <Spinner /> {status}
          </span>
        )}
      </div>
      {rung === 1 && (
        <p className="m-0 font-serif text-[17px] leading-[1.8]">
          {label && <strong className="font-semibold">{label}:</strong>} <InlineMarkdown text={leadIn} />{" "}
          {fill ? (
            <span className="rounded-lg border-[1.5px] border-ink-muted bg-surface px-2.5 py-[3px] font-sans text-sm [box-decoration-break:clone]">
              {fill}
            </span>
          ) : (
            <span aria-label="blank" className="inline-block h-[1em] w-[180px] border-b-2 border-ink-disabled align-[-0.15em]" />
          )}
          {closing}
        </p>
      )}
      {children}
    </section>
  );
}

export function OptionSkeletons() {
  return (
    <div aria-hidden className="flex flex-col gap-1.5">
      {["62%", "54%", "30%", "44%"].map((w) => (
        <div key={w} className="flex h-11 items-center gap-2.5 rounded-[10px] border border-line bg-surface px-3">
          <span className="size-[18px] rounded-full bg-skeleton" />
          <span className="h-2.5 animate-pulse rounded-[5px] bg-skeleton" style={{ width: w }} />
        </div>
      ))}
    </div>
  );
}

export function LineSkeleton({ widths }: { widths: string[] }) {
  return (
    <div aria-hidden className="flex flex-col gap-2.5">
      {widths.map((w) => (
        <span key={w} className="h-3 animate-pulse rounded-md bg-skeleton" style={{ width: w }} />
      ))}
    </div>
  );
}
