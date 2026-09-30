# D105 re-verification: single box at rungs 2–3 · 2026-09-30T01:52:53.280Z

Rule (D105, fixed before the run): rung 2–3 items with answer + why in both fields, Sonnet 5.5 (D97 config) × 3, agreement as D92. Pass = ≥ 6/8.

## Result: **PASS**: 7/8 combined vs 7/8 separate (M2 run, same items)

| Model | **Agreement** (majority of 3) | Single-run mean | Flipped items | **Warm p50** | Warm p90 | Invalid | ≠ end_turn | Out tokens p50 | Cost |
|---|---|---|---|---|---|---|---|---|---|
| claude-sonnet-5-5 | **7/8** | 7.0/8 | none | **4.8 s** | 5.9 s | 0 | 0 | 432 | $0.27 |

**Total cost:** $0.27. Latency is a diagnostic here, not part of the rule.

## Per item (y = sound, n = unsound, ✗ = invalid)

| Item | Rung | Label | claude-sonnet-5-5 (runs 1·2·3) |
|---|---|---|---|
| g05 | 2 | A:y W:n | ✅ A:y W:n · A:y W:n · A:y W:n |
| g06 | 2 | A:y W:y | ✅ A:y W:y · A:y W:y · A:y W:y |
| g07 | 2 | A:n W:n | ✅ A:n W:n · A:n W:n · A:n W:n |
| g08 | 2 | A:y W:y | ✅ A:y W:y · A:y W:y · A:y W:y |
| g09 | 3 | A:y W:n | ✅ A:y W:n · A:y W:n · A:y W:n |
| g10 | 3 | A:n W:n | ❌ A:y W:y · A:y W:y · A:y W:y |
| g11 | 3 | A:n W:n | ✅ A:n W:n · A:n W:n · A:n W:n |
| g12 | 3 | A:y W:y | ✅ A:y W:y · A:y W:y · A:y W:y |

## Disagreements (read these; tag each: grader error or label doesn't fit the single box)

### g10 · claude-sonnet-5-5
**Label:** A:n W:n · **Why:** Don't give December its own target. Set one Q4 total for active users at about 1.3x last Q4, and report the monthly numbers only as a check against the same month last year. December fell -15.7% and -14.0% vs November in the last two years and rebounded 22-27% in January, so a quarterly total absorbs the dip instead of flagging it as a miss. YoY has held at 31-37% since Sep 2025, which is where the 1.3x comes from.
- **Run 1** (A:y W:y): The learner cites December MoM drops of -15.7% and -14.0%, January rebounds of 22-27%, and YoY growth of 31-37% since Sep 2025; all match the visible text and data. Their recommendation applies ~1.3x YoY growth to last Q4 and uses same-month-last-year comparisons for monthly checks, which acts on the seasonal-pattern interpretation and doesn't misread the December dip as a miss. It differs from the hidden month-by-month targets but is defensible, since YoY-against-same-month controls for seasonality just as well. The evidence (recurring dip plus stable YoY) supports the conclusion through the seasonality-vs-trend concept. Weaknesses: it covers only active users, and a quarterly total could let a December shortfall hide behind strong October and November.
  - *Feedback:* You used the repeated December drop (-15.7%, -14.0%) and the steady 31-37% YoY band to justify a growth-adjusted Q4 total with same-month YoY checks, which keeps the holiday dip from reading as a miss. That reasoning holds up against the data.
- **Run 2** (A:y W:y): The learner cites the December MoM drops (-15.7%, -14.0%), the January rebounds (22-27%), and the 31-37% YoY band. All are accurate against the visible text. Their recommendation, a 1.3x quarterly total with monthly numbers checked YoY, acts on the seasonality interpretation: the YoY band supplies the growth rate, the dip is treated as recurring, and the same-month YoY comparison strips seasonality out. It differs from the hidden month-by-month target but is defensible, though a Q4 total could hide a slowdown until it is too late to react. The evidence supports the conclusion through the seasonality-vs-trend concept, so both verdicts are sound.
  - *Feedback:* You used the repeated December drops (-15.7%, -14.0%) and the steady 31-37% YoY band to justify a 1.3x Q4 target, and comparing each month to the same month last year is exactly how to avoid mistaking the holiday dip for a miss.
- **Run 3** (A:y W:y): The learner cites the December MoM drops (-15.7%, -14.0%), the January rebound (22-27%), and steady 31-37% YoY since Sep 2025. All of these match the visible text. Their recommendation is a Q4 total of about 1.3x last Q4, with monthly YoY comparisons as a check. That acts on the seasonal interpretation: growth is applied YoY, the December dip is treated as recurring, and the May-June launch spike is not baked in. It is a defensible variant of the hidden recommendation, and comparing to the same month last year keeps the seasonal shape visible. One weakness is that a quarterly total can mask an early shortfall in Oct/Nov, and the learner doesn't address the mobile web erosion. The evidence cited separates seasonality from trend, so both verdicts are sound.
  - *Feedback:* Your YoY band (31-37%) and the December drop of about 14-16% both come straight from the table, and applying growth to last year's same period is exactly how to keep seasonality from reading as a miss. Same-month YoY as the check is the right guard.
