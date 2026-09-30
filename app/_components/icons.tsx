// Inline icons (no icon library for a handful of glyphs). Decorative: callers label the button.
const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export const SendIcon = () => (
  <svg {...base} width={18} height={18}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const StopIcon = () => (
  <svg {...base} width={14} height={14}>
    <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" />
  </svg>
);

export const FileIcon = () => (
  <svg {...base} width={14} height={14}>
    <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
    <path d="M14 3v5h5" />
  </svg>
);

export const TargetIcon = () => (
  <svg {...base} width={14} height={14}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

export const InfoIcon = () => (
  <svg {...base} width={13} height={13}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);

export const EyeIcon = () => (
  <svg {...base}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const CheckCircleIcon = () => (
  <svg {...base} width={20} height={20} className="shrink-0">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.5 2.5L16 9.5" />
  </svg>
);

export const AlertCircleIcon = () => (
  <svg {...base} width={20} height={20} className="shrink-0">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5M12 16v.5" />
  </svg>
);

export const ChevronIcon = ({ up }: { up: boolean }) => (
  <svg {...base} className={up ? "rotate-180" : ""}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const Spinner = () => (
  <svg {...base} strokeWidth={2.4} className="animate-spin">
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);
