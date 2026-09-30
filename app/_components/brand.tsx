// App mark + name + Prototype badge (Login, Main). App name is still open (Phase 4 Q9).
export function Brand({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={size === "lg" ? "size-7 rounded-[7px] bg-ink" : "size-6 rounded-md bg-ink"} />
      <span className={`font-semibold ${size === "lg" ? "text-[17px]" : "text-[15px]"}`}>Goal-driven Cloze</span>
      <span className="rounded-full border border-line px-2 py-0.5 text-xs text-ink-muted">Prototype</span>
    </div>
  );
}
