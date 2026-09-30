import type { RawRound } from "@/lib/round";
import type { RoundState } from "@/lib/round-reducer";
import { isComplete, plainNotice, splitLeadIn } from "@/lib/stream-view";
import { Cloze, type TurnActions } from "./cloze";
import { Markdown } from "./markdown";
import { GhostGoalChip, GoalChip, LineSkeleton, OptionSkeletons, YourTurn } from "./parts";

// One Claude reply, rendered by round status. `actions` is set only on the live (latest) turn.
// `note`: the rung-change note (D33), shown once the round is final and its rung is known.
export function AssistantTurn({ round, actions, note }: { round: RoundState; actions?: TurnActions; note?: string | null }) {
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
      {round.status === "streaming" ? (
        <Streaming preview={round.preview} />
      ) : round.status === "plain" ? (
        <Plain text={round.text} reason={round.reason} />
      ) : (
        <Cloze state={round} actions={actions} note={note} />
      )}
    </article>
  );
}

// D46/D47: ghost goal chip until the goal is final; answer text streams in; the "Your turn"
// panel appears once `before` is final, with skeleton options. `blank` and `after` never
// render while streaming, and options stay skeletons so the order Claude writes them in
// can't leak the answer before the shuffle (D99).
function Streaming({ preview }: { preview: Partial<RawRound> | null }) {
  const significant = preview?.significant;
  const before = preview?.before;

  return (
    <>
      {significant !== false && (isComplete(preview, "goal") ? (
          <GoalChip goal={preview?.goal ?? null} experimental={isComplete(preview, "domain") && preview?.domain === "other"} />
        ) : (
          <GhostGoalChip />
        ))}
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
      <LineSkeleton widths={["92%", "70%"]} />
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
