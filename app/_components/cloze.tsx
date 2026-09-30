import { useId, type FormEvent } from "react";
import { canCheck, type RoundAction, type RoundState } from "@/lib/round-reducer";
import { splitLeadIn } from "@/lib/stream-view";
import { EyeIcon, Spinner } from "./icons";
import { Markdown } from "./markdown";
import { GoalChip, YourTurn } from "./parts";

type ClozeState = Extract<RoundState, { status: "answering" | "grading" | "graded" | "revealed" }>;

// Actions for the live turn only; older turns render read-only (D103).
export type TurnActions = { dispatch: (action: RoundAction) => void; check: () => void };

// Cloze.dc.html (rung 1), Checking.dc.html (grading), Mobile.dc.html. The answer (`blank`) is in
// browser memory and the after-text is in the DOM, blurred: fine for the honest-learner threat
// model (Phase 4), readable in DevTools.
export function Cloze({ state, actions }: { state: ClozeState; actions?: TurnActions }) {
  const { round } = state;
  const { body, label, leadIn } = splitLeadIn(round.before);
  const closing = round.rung === 1 ? leadingPunctuation(round.after) : "";
  const shown = state.status === "revealed" || state.status === "graded";

  return (
    <>
      <GoalChip goal={round.goal} />
      <Markdown text={body} />
      {shown ? (
        // No artboard for Reveal: neutral panel, blank filled with Claude's wording (D45, D50).
        // Graded gets its own green/red panel in M3.5 (Correct, Miss artboards).
        <YourTurn heading="Revealed" label={label} leadIn={leadIn} rung={round.rung} closing={closing} fill={round.blank}>
          {round.rung !== 1 && <BlockAnswer label={label} text={round.blank} />}
        </YourTurn>
      ) : (
        <Answering state={state} label={label} leadIn={leadIn} closing={closing} actions={actions} />
      )}
      <After text={round.after.slice(closing.length)} blurred={!shown} />
    </>
  );
}

function Answering({
  state,
  label,
  leadIn,
  closing,
  actions,
}: {
  state: Extract<ClozeState, { status: "answering" | "grading" }>;
  label: string | null;
  leadIn: string;
  closing: string;
  actions?: TurnActions;
}) {
  const { round, options, draft } = state;
  const grading = state.status === "grading";
  const locked = grading || !actions; // read-only while grading, and on older turns
  const whyOpen = round.rung !== 1 || draft.pick !== null; // D39: why unlocks after a pick
  const name = useId();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (actions && canCheck(state)) actions.check();
  }

  return (
    <form onSubmit={submit}>
      <YourTurn label={label} leadIn={leadIn} rung={round.rung} closing={closing}>
        {round.rung === 1 ? (
          <fieldset disabled={locked} className="m-0 min-w-0 border-none p-0">
            <legend className="mb-2 p-0 text-[13px] font-semibold">Pick the best fit</legend>
            <div className="flex flex-col gap-1.5">
              {options.map((o, i) => (
                <Choice
                  key={o.text}
                  name={name}
                  checked={draft.pick === i}
                  onChange={() => actions?.dispatch({ type: "pick", pick: i })}
                >
                  {o.text}
                </Choice>
              ))}
              <Choice
                name={name}
                dashed
                checked={draft.pick === "own"}
                onChange={() => actions?.dispatch({ type: "pick", pick: "own" })}
              >
                Something else: I’ll answer in my own words
              </Choice>
            </div>
            {draft.pick === "own" && (
              // No artboard for the own-words box (D39, D44).
              <input
                aria-label="Your answer"
                type="text"
                value={draft.answer}
                onChange={(e) => actions?.dispatch({ type: "editAnswer", text: e.target.value })}
                placeholder="Finish the sentence in your own words"
                className="mt-2 h-11 w-full rounded-[10px] border-[1.5px] border-ink-disabled bg-surface px-3 text-sm"
              />
            )}
          </fieldset>
        ) : (
          // Rungs 2–3 share the Rung2 box for now; rung 3's draft + critique is M3.5.
          <label className="flex flex-col gap-1.5">
            <span className="font-serif text-[17px] font-semibold">{label ?? "Your answer"}:</span>
            <textarea
              rows={3}
              disabled={locked}
              value={draft.answer}
              onChange={(e) => actions?.dispatch({ type: "editAnswer", text: e.target.value })}
              placeholder="Write the conclusion and your reasoning in a sentence or two"
              className="resize-y rounded-[10px] border-[1.5px] border-ink-disabled bg-surface px-3 py-2.5 text-sm leading-normal disabled:border-line"
            />
          </label>
        )}

        {round.rung === 1 && (
          <label className="flex flex-col gap-1.5">
            <span className={`text-[13px] font-semibold ${whyOpen ? "" : "text-ink-disabled"}`}>
              Why?{" "}
              <span className={`font-normal ${whyOpen ? "text-ink-muted" : ""}`}>
                {whyOpen ? "One line is enough" : "Pick an answer first"}
              </span>
            </span>
            <input
              type="text"
              disabled={!whyOpen || locked}
              value={draft.why}
              onChange={(e) => actions?.dispatch({ type: "editWhy", text: e.target.value })}
              placeholder="What in the numbers points to your pick?"
              className="h-11 rounded-[10px] border-[1.5px] border-ink-disabled bg-surface px-3 text-sm disabled:cursor-not-allowed disabled:border-line disabled:bg-[#EFEDE8] disabled:text-ink-disabled"
            />
          </label>
        )}

        {actions && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
            <button
              type="submit"
              disabled={grading || !canCheck(state)}
              className={`inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[10px] px-[18px] text-sm font-semibold ${
                grading
                  ? "cursor-progress bg-accent-hover text-white"
                  : "bg-accent text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-disabled"
              }`}
            >
              {grading ? (
                <>
                  <Spinner /> Checking your reasoning…
                </>
              ) : (
                "Check my answer"
              )}
            </button>
            <button
              type="button"
              disabled={grading} // D101: no Reveal while grading
              onClick={() => actions.dispatch({ type: "reveal" })}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-line-strong bg-surface px-4 text-sm disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-ink-disabled"
            >
              <EyeIcon /> Reveal answer
            </button>
          </div>
        )}
        {grading && (
          <span role="status" className="text-[13px] text-ink-muted">
            Claude is reading your why. This usually takes a few seconds.
          </span>
        )}
        {state.status === "answering" && state.error && (
          <p role="alert" className="m-0 text-[13px] text-[#8F1D14]">
            {state.error}
          </p>
        )}
      </YourTurn>
    </form>
  );
}

function Choice({
  name,
  checked,
  dashed,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  dashed?: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  const border = checked ? "border-[1.5px] border-ink-muted" : dashed ? "border border-dashed border-[#BDB9AE]" : "border border-line-strong";
  return (
    <label
      className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[10px] bg-surface px-3 py-2 text-sm leading-[1.4] has-[:disabled]:cursor-default ${border} ${dashed && !checked ? "text-ink-muted" : ""}`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="size-[18px] shrink-0 accent-accent" />
      <span>{children}</span>
    </label>
  );
}

function BlockAnswer({ label, text }: { label: string | null; text: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="font-serif text-[17px] font-semibold">{label}:</span>}
      <p className="m-0 rounded-[10px] border-[1.5px] border-ink-muted bg-surface px-3 py-2.5 text-sm leading-normal">{text}</p>
    </div>
  );
}

// D32/D54: everything after the blank stays blurred until answered or revealed. Capped in height
// so a long after-text doesn't turn into a wall of blur.
function After({ text, blurred }: { text: string; blurred: boolean }) {
  if (text.trim() === "") return null;
  if (!blurred) return <Markdown text={text} />;
  return (
    <div className="relative max-h-48 overflow-hidden">
      <div aria-hidden inert className="blur-[5px] select-none">
        <Markdown text={text} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-ink-muted">
          Answer or reveal to see the rest
        </span>
      </div>
    </div>
  );
}

// Rung 1: `after` starts with the punctuation that closes the blank's sentence (M1 prompt §5).
function leadingPunctuation(after: string): string {
  return /^[.,;:!?]+/.exec(after)?.[0] ?? "";
}
