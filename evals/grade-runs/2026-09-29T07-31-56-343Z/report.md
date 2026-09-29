# Grader mini-eval · 2026-09-29T07:31:56.350Z

Rule (D71, pre-registered in D92): fastest model with ≥ 10/12 agreement (majority of 3), within 1 item of the best, warm p50 ≤ 3 s. Latency measured from Justin's laptop, first call per model dropped.

## Decision: **claude-sonnet-5-5**
No model meets p50 ≤ 3 s: fastest that passes quality (D71).

| Model | **Agreement** (majority of 3) | Single-run mean | Flipped items | **Warm p50** | Warm p90 | Invalid | ≠ end_turn | Out tokens p50 | Cost |
|---|---|---|---|---|---|---|---|---|---|
| claude-sonnet-5-5 | **11/12** | 11.0/12 | none | **4.8 s** | 5.4 s | 0 | 0 | 423 | $0.35 |
| claude-opus-5-5 | **11/12** | 11.0/12 | none | **6.1 s** | 7.1 s | 0 | 0 | 388 | $0.61 |

Single-run mean and flipped items are diagnostics, not part of D71: production grades once, so they show how much the majority vote smooths. **Total cost:** $0.96

## Per item (y = sound, n = unsound, ✗ = invalid)

| Item | Rung | Label | claude-sonnet-5-5 (runs 1·2·3) | claude-opus-5-5 (runs 1·2·3) |
|---|---|---|---|---|
| g01 | 1 | W:n | ✅ W:n · W:n · W:n | ✅ W:n · W:n · W:n |
| g02 | 1 | W:y | ✅ W:y · W:y · W:y | ✅ W:y · W:y · W:y |
| g13 | 1 | W:n | ✅ W:n · W:n · W:n | ✅ W:n · W:n · W:n |
| g04 | 1 | W:y | ✅ W:y · W:y · W:y | ✅ W:y · W:y · W:y |
| g05 | 2 | A:y W:n | ✅ A:y W:n · A:y W:n · A:y W:n | ✅ A:y W:n · A:y W:n · A:y W:n |
| g06 | 2 | A:y W:y | ✅ A:y W:y · A:y W:y · A:y W:y | ✅ A:y W:y · A:y W:y · A:y W:y |
| g07 | 2 | A:n W:n | ✅ A:n W:n · A:n W:n · A:n W:n | ✅ A:n W:n · A:n W:n · A:n W:n |
| g08 | 2 | A:y W:y | ✅ A:y W:y · A:y W:y · A:y W:y | ✅ A:y W:y · A:y W:y · A:y W:y |
| g09 | 3 | A:y W:n | ✅ A:y W:n · A:y W:n · A:y W:n | ✅ A:y W:n · A:y W:n · A:y W:n |
| g10 | 3 | A:n W:n | ❌ A:y W:y · A:y W:y · A:y W:y | ❌ A:y W:y · A:y W:y · A:y W:y |
| g11 | 3 | A:n W:n | ✅ A:n W:n · A:n W:n · A:n W:n | ✅ A:n W:n · A:n W:n · A:n W:n |
| g12 | 3 | A:y W:y | ✅ A:y W:y · A:y W:y · A:y W:y | ✅ A:y W:y · A:y W:y · A:y W:y |

## Disagreements (read these)

### g10 · claude-sonnet-5-5
**Label:** A:n W:n · **Why:** December fell -15.7% and -14.0% vs November in the last two years and rebounded 22-27% in January, so a quarterly total absorbs the dip instead of flagging it as a miss. YoY has held at 31-37% since Sep 2025, which is where the 1.3x comes from.
- **Run 1** (A:y W:y): The learner cites the December MoM drops (-15.7%, -14.0%), the January rebounds (22-27%), and the 31-37% YoY band since Sep 2025. All match the visible text and data. Their recommendation is a Q4 total at ~1.3x last Q4 with monthly numbers reported as YoY checks, which acts on the seasonal interpretation: it uses the stable YoY rate as the trend and avoids reading the December dip as a miss. It differs from the hidden month-by-month target but is defensible and does not contradict the data. The evidence (recurring dip plus steady YoY) supports a seasonality-aware target through the seasonality_vs_trend concept, so both verdicts are sound. One weakness: a quarterly total can hide a shortfall in Oct/Nov until the quarter ends.
  - *Feedback:* You used the repeated December drops (-15.7%, -14.0%) with January rebounds, plus the steady 31-37% YoY band, to justify a 1.3x target that treats the dip as seasonal. That reasoning separates the recurring pattern from the underlying growth, so it holds.
- **Run 2** (A:y W:y): The learner cites December's MoM drops (-15.7% and -14.0%), the 22-27% January rebound, and 31-37% YoY since Sep 2025. All match the visible text, and 1.3x sits within that band. Their recommendation, one Q4 total at ~1.3x last Q4 with monthly numbers checked YoY, acts on the seasonal interpretation: a quarterly total absorbs the recurring dip, and same-month YoY comparison is seasonally adjusted. It differs from the hidden month-by-month targets but is defensible, and it doesn't contradict the data. The evidence separates seasonality from trend, since the repeated dip and the steady YoY are exactly what the concept is about. One weakness is that a Q4 aggregate could hide a December miss if October and November run high.
  - *Feedback:* You used the repeated December drops (-15.7% and -14.0%) to show the dip is seasonal, and the steady 31-37% YoY to justify the 1.3x, which is the right evidence for separating pattern from trend. A quarterly total plus same-month YoY checks is a defensible way to keep the dip from reading as a miss.
- **Run 3** (A:y W:y): The learner cites the December MoM drops (-15.7%, -14.0%), the January rebounds (22-27%), and steady YoY of 31-37% since Sep 2025. All of these match the visible text. Their recommendation is a Q4 total at ~1.3x last Q4 with monthly numbers checked YoY. That is defensible: it applies the steady underlying growth, and a quarterly total absorbs the recurring December dip. Comparing each month to the same month last year is a seasonally adjusted check. It differs from the hidden month-by-month targets but acts on the same interpretation (seasonal dip plus about 30-35% growth) and doesn't contradict the data. The why cites visible evidence, and that evidence supports the conclusion through the seasonality concept. Both verdicts are sound.
  - *Feedback:* You used the repeated December drops (-15.7% and -14.0%) and the steady 31-37% YoY to justify a quarterly total at about 1.3x. That works because the seasonal dip is absorbed while the growth rate sets the level.

### g10 · claude-opus-5-5
**Label:** A:n W:n · **Why:** December fell -15.7% and -14.0% vs November in the last two years and rebounded 22-27% in January, so a quarterly total absorbs the dip instead of flagging it as a miss. YoY has held at 31-37% since Sep 2025, which is where the 1.3x comes from.
- **Run 1** (A:y W:y): The learner cites December MoM drops of −15.7% and −14.0% and January rebounds of 22–27%, all matching the visible text. They also cite YoY active-user growth of 31–37% since Sep 2025, which is accurate for the non-launch months. Last Q4 was 11,185 + 11,135 + 9,573 = 29,893, so 1.3x gives about 38,900, in line with applying ~30% growth month by month. A quarterly total set at YoY growth, with each month checked against the same month last year, handles seasonality correctly. It doesn't read the December dip as a miss and doesn't build in the May spike. It differs from the hidden month-by-month targets but is defensible from the data, so answer_sound and why_sound are both true.
  - *Feedback:* You used the repeated ~15% December drop and January rebound to show why a single month would falsely flag a miss. You then anchored growth to the steady 31–37% YoY run rate rather than the May–June launch spike, which is exactly what separates the seasonal pattern from the trend.
- **Run 2** (A:y W:y): The learner cites December MoM drops of −15.7% and −14.0%, January rebounds of 22–27%, and YoY of 31–37% since Sep 2025. All of these match the visible text and the dashboard. Their recommendation is a Q4 total at about 1.3x last Q4, with monthly numbers checked against the same month last year. That applies the underlying ~30% trend and keeps the seasonal December dip from reading as a miss, so it acts on the interpretation and is defensible even though it differs from the hidden per-month target. Their evidence separates the recurring seasonal shape from the steady YoY trend, which is the round's concept, so both verdicts are sound.
  - *Feedback:* You used the repeated −14% to −16% December drops and the steady 31–37% YoY growth to separate a holiday pattern from the underlying trend. A quarterly total at about 1.3x, with monthly checks against the same month last year, keeps December from being misread as a miss.
- **Run 3** (A:y W:y): The learner cites December's MoM drops of −15.7% and −14.0% and the 22–27% January rebound, all matching the visible table and data. They also cite 31–37% YoY since Sep 2025, which matches the dashboard and excludes the May–June launch spike. Their recommendation is one Q4 total at 1.3x last Q4 (about 41,500 active users from 31,893), with monthly numbers checked against the same month last year. This acts on the seasonality-vs-trend reading: it builds in the recurring dip, anchors on the underlying run rate, and compares like months, so it is defensible even though it differs from the hidden month-by-month target. The recommendation and the why are both sound.
  - *Feedback:* You used the repeated −14% to −16% December drop, with its January rebound, to show the dip is seasonal. You then took the 1.3x from the steady 31–37% YoY run rate rather than the May launch spike. Comparing each month to the same month last year keeps the holiday dip from being read as a miss.
