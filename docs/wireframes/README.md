# Wireframes — Cloze (Phase 3)

Source files exported from the "Cloze Wireframes" design canvas (12 artboards). Live canvas: https://claude.ai/artifact/9Ug5YTbPuqLJK6zUgJpGQi

## How to read these files

- Each `*.dc.html` is **one artboard**: static HTML with inline styles. Treat it as a **visual and copy spec**, not as code to copy in.
- They won't render on their own: `./support.js`, `<x-dc>`, `<helmet>` and the `<script type="text/x-dc">` block belong to the design tool. Ignore them.
- **Real copy lives here.** Button labels, helper text, error messages and loading text are final unless a decision says otherwise.
- `canvas.json` lists each artboard's title, size and order.
- Decisions win over wireframes. Where they disagree, follow the decision log (see "Known drift").

## Artboards

| File | Shows | Key decisions |
|---|---|---|
| `Login.dc.html` | 00 · Sign in, with error state | D48 |
| `Main.dc.html` | 01 · Start screen, starter chips, expectation line | D36, D37, D43 |
| `Loading.dc.html` | 02 · Response streaming: ghost goal chip, skeleton options | D46, D47 |
| `Cloze.dc.html` | 03 · Cloze active, rung 1: options, locked why, Reveal, blurred after-text | D32/D54, D39 |
| `Checking.dc.html` | 04 · Grading: "Checking your reasoning…" | D46 |
| `Correct.dc.html` | 05 · Correct: green box, filled blank | D38, D45 |
| `Miss.dc.html` | 06 · Miss → corrective item, Skip | D41 |
| `GoalEdit.dc.html` | 07 · Edit learning goal | D40 (cut first if running long, D74) |
| `Rung2.dc.html` | 08 · Rung 2: single freeform box | D28, D43 |
| `Rung3.dc.html` | 09 · Rung 3: draft + critique + Compare with Claude | D28, D43 |
| `Python.dc.html` | 10 · Experimental domain chip + tooltip | D34, D42 |
| `Mobile.dc.html` | 11 · Mobile, 390 px, answer picked | D39 |

## Design tokens (pulled from the files)

| Token | Value | Used for |
|---|---|---|
| `bg` | `#FAF9F5` | Page background |
| `surface` | `#FFFFFF` | Cards, inputs, header |
| `surface-muted` | `#F5F4F0` | "Your turn" panel |
| `user-bubble` | `#EFEDE6` | User message |
| `text` | `#141413` | Body text |
| `text-muted` | `#5E5D59` | Secondary text |
| `text-disabled` | `#8A8883` | Disabled labels |
| `border` | `#E3E1DA` | Hairlines |
| `border-strong` | `#D6D3CB` | Inputs, options, chips |
| `accent` | `#B4532A` (hover `#8A3D1D`) | Primary buttons, links, radios |
| `claude-avatar` | `#D97757` | Claude avatar dot |
| `goal-bg` / `goal-border` / `goal-text` | `#E8F0EA` / `#C9DBCF` / `#2E5443` | Goal chip (D38) |
| `correct` | `#2F7A55`, `#1F5A3D` | Correct state (check exact use in `Correct.dc.html`) |
| `miss` / `error` | `#B42318`, `#8F1D14`, bg `#FDF0EE`, border `#F1C4BD` | Miss state, login error |

**Type:** IBM Plex Sans (UI) · Source Serif 4 (Claude's answer text, headings) · IBM Plex Mono (file names). Loaded from Google Fonts.
**Shape:** radius 10 px (inputs, options) · 14–16 px (panels, composer) · 999 px (chips) · touch targets 44 px · content column 760 px.

## Known drift (wireframe vs. later decisions)

- **Attached files:** the wireframes show `tasklane_metrics.csv` + `tasklane_events.csv`; the plan says the generator ships `tasklane.json` (dashboard view + detail rows, D53, D65). Decide the displayed file name(s) in M1.
- **App name:** still `[App name]` everywhere. Undecided.
- **Blurred after-text (D32 → D54):** the look stays the same, but the text is now streamed to the browser and hidden, not withheld.
