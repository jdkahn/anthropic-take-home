import type { RawRound } from "@/lib/round";
import type { RoundState } from "@/lib/round-reducer";
import { isComplete, plainNotice, splitLeadIn } from "@/lib/stream-view";
import { Spinner, TargetIcon } from "./icons";
import { InlineMarkdown, Markdown } from "./markdown";

// One Claude reply. M3.4a: streaming (Loading.dc.html) and plain answers. The interactive
// cloze (Cloze.dc.html) is M3.4b; until then answering renders read-only.
export function AssistantTurn({ round }: { round: RoundState }) {
  return (
    <article aria-busy={round.status === "streaming"} className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-muted">
        <span className="size-5 rounded-full bg-claude" />
        <span>Claude</span>
        {round.status === "streaming" && (
          <span role="status" className="font-normal">
            {/* D104: Opus thinks 14–24 s before the first token; say so until text arrives. */}
            {round.raw === "" ? "Thinking…" : "Writing…"}
          </span>
        )}
      </div>
      <Body round={round} />
    </article>
  );
}

function Body({ round }: { round: RoundState }) {
  switch (round.status) {
    case "streaming":
      return <Streaming preview={round.preview} />;
    case "plain":
      return <Plain text={round.text} reason={round.reason} />;
    default: {
      const { round: r, options } = round;
      const { body, label, leadIn } = splitLeadIn(r.before);
      return (
        <>
          <GoalChip goal={r.goal} />
          <Markdown text={body} />
          <YourTurn label={label} leadIn={leadIn} rung={r.rung} closing={leadingPunctuation(r.after)}>
            {/* M3.4b: interactive options, why, Check, Reveal. Shuffled order shown read-only for now. */}
            <ol className="flex flex-col gap-1.5">
              {options.map((o) => (
                <li key={o.text} className="rounded-[10px] border border-line bg-surface px-3 py-2.5 text-sm">
                  {o.text}
                </li>
              ))}
            </ol>
          </YourTurn>
          <AfterSkeleton />
        </>
      );
    }
  }
}

// D46/D47: ghost goal chip until the goal is final; answer text streams in; the "Your turn"
// panel appears once `before` is final, with skeleton options. `blank` and `after` never
// render while streaming, and options stay skeletons so the order Claude writes them in
// can't leak the answer before the shuffle (D99).
function Streaming({ preview }: { preview: Partial<RawRound> | null }) {
  const significant = preview?.significant;
  const goalDone = isComplete(preview, "goal");
  const before = preview?.before;

  return (
    <>
      {significant !== false && (goalDone ? <GoalChip goal={preview?.goal ?? null} /> : <GhostGoalChip />)}
      {before === undefined ? (
        <LineSkeleton widths={["92%", "70%", "84%"]} />
      ) : significant && isComplete(preview, "before") ? (
        <StreamedCloze before={before} rung={preview?.rung ?? null} />
      ) : (
        <Markdown text={before} />
      )}
    </>
  );
}

function StreamedCloze({ before, rung }: { before: string; rung: 1 | 2 | 3 | null }) {
  const { body, label, leadIn } = splitLeadIn(before);
  return (
    <>
      <Markdown text={body} />
      <YourTurn label={label} leadIn={leadIn} rung={rung} closing="" status="Preparing answer choices…">
        {rung === 1 ? <OptionSkeletons /> : <div className="h-24 rounded-[10px] border border-line bg-surface" />}
      </YourTurn>
      <AfterSkeleton />
    </>
  );
}

function Plain({ text, reason }: { text: string; reason: string | null }) {
  const notice = plainNotice(reason, text.trim() !== "");
  return (
    <>
      {text.trim() !== "" && <Markdown text={text} />}
      {notice && (
        <p role="status" className="text-sm text-ink-muted">
          {notice}
        </p>
      )}
    </>
  );
}

function YourTurn({
  label,
  leadIn,
  rung,
  closing,
  status,
  children,
}: {
  label: string | null;
  leadIn: string;
  rung: 1 | 2 | 3 | null;
  closing: string;
  status?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label="Your turn"
      className="flex flex-col gap-4 rounded-[14px] border border-line-strong bg-surface-muted px-5 py-[18px]"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-[0.06em] text-ink-muted uppercase">Your turn</span>
        {status && (
          <span className="inline-flex items-center gap-2 text-[13px] text-ink-muted">
            <Spinner /> {status}
          </span>
        )}
      </div>
      {(label || rung === 1) && (
        <p className="m-0 font-serif text-[17px] leading-[1.6]">
          {label && <strong className="font-semibold">{label}:</strong>}{" "}
          {rung === 1 && (
            <>
              <InlineMarkdown text={leadIn} />{" "}
              <span
                aria-label="blank"
                className="inline-block h-[1em] w-[180px] border-b-2 border-ink-disabled align-[-0.15em]"
              />
              {closing}
            </>
          )}
        </p>
      )}
      {children}
    </section>
  );
}

function GoalChip({ goal }: { goal: string | null }) {
  if (!goal) return null;
  return (
    <div className="flex items-center gap-2 self-start rounded-full border border-goal-border bg-goal-bg py-1.5 pr-3 pl-3 text-[13px] text-goal-text">
      <TargetIcon />
      <span>
        <strong className="font-semibold">Learning goal:</strong> {goal}
      </span>
    </div>
  );
}

function GhostGoalChip() {
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

function OptionSkeletons() {
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

function AfterSkeleton() {
  return <LineSkeleton widths={["92%", "70%"]} />;
}

function LineSkeleton({ widths }: { widths: string[] }) {
  return (
    <div aria-hidden className="flex flex-col gap-2.5">
      {widths.map((w) => (
        <span key={w} className="h-3 animate-pulse rounded-md bg-skeleton" style={{ width: w }} />
      ))}
    </div>
  );
}

// Rung 1: `after` starts with the punctuation that closes the blank's sentence (M1 prompt §5).
function leadingPunctuation(after: string): string {
  return /^[.,;:!?]+/.exec(after)?.[0] ?? "";
}
