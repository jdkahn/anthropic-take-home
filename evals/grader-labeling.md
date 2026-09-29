# M2 labeling sheet (D92)

Label blind: before any grader output exists. Each item shows the last line before the blank; expand **Full visible text** to check whether the cited evidence was on screen (criterion 1).

## Rubric (D69): a why is sound when **both** hold
1. It cites evidence that is **on screen** (the text before the blank, or the options; the text after the blank is still blurred).
2. That evidence **supports this conclusion via the right concept** (here: seasonality vs trend, or averages hiding segments).

## Answer rules (rungs 2–3 only)
- **Rung 2:** sound = the same inference as Claude's blank **in substance**.
- **Rung 3:** sound = **defensible** from the data; it need not match Claude's recommendation.

## "Not required" list: ⚠️ DRAFT, edit before labeling (it goes into the grader prompt too)
A sound why does **not** need:
- Claude's wording
- exact numbers (rounded is fine if the number is on screen)
- more than one piece of evidence, if the one cited is enough
- length, polish, grammar, or confidence
- findings the blank didn't hinge on (e.g. the mobile issue on a seasonality blank)

## How to answer
Reply in chat, one line per item, e.g. `g05 A:y W:n`. Rung 1 needs only `W`. Add a word of reasoning on any you found hard; those notes help calibrate the grader prompt.

---

## g01 · rung 1 · averages_hiding_segments
*Source: `2026-09-29T01-14-20-835Z` starter 1 run 1 · question: "Summarize August for the leadership update"*

**Last line before the blank:** **What this means:** the flat 42.1% blended retention is most likely ___

<details><summary>Full visible text</summary>

## Tasklane: August 2026 leadership update

### Headline numbers
| Metric | Aug 2026 | MoM | YoY |
|---|---|---|---|
| Active users | 12,730 | -8.3% | +35.2% |
| New signups | 2,204 | -7.7% | +35.5% |
| Wk-4 retention (blended) | 42.1% | +0.4 pts | 0.0 pts (42.1% in Aug 2025) |

### Growth
- **The August dip is seasonal.** August 2025 fell -8.4% MoM in active users and -9.6% in signups, then rebounded +13.8% in September. This year's -8.3% matches that pattern.
- **Underlying growth is steady.** YoY active-user growth has held at roughly 32-36% all year, and August is at +35.2%.
- **The May launch spike has faded.** AI Summaries, Product Hunt and the email campaign pushed May signups to 4,314 (+153.6% YoY). Signup growth is back to its normal ~33-35% YoY (July +32.6%, August +35.5%).

### Retention and signups by device (wk-4 retention is signup-weighted)
| Device | Signups Aug 2025 | Signups Feb 2026 | Signups Aug 2026 | Retention Aug 2025 | Retention Aug 2026 |
|---|---|---|---|---|---|
| Desktop | 973 | 1,298 | 1,832 | 45.2% | 45.7% |
| Mobile web | 654 | 844 | 372 | 37.3% | 24.3% |
| **Mobile share of signups** | 40.2% | 39.4% | 16.9% | | |

Other figures:
- Mobile web active users are 3,314, down from 3,604 in August 2025.
- Desktop active users are 9,416, up from 5,812.
- Mobile web retention by plan: free went from 36.2% to 23.0% and team from 38.7% to 25.9%. Both first dropped in March 2026.
- The Mobile web redesign (new navigation and signup flow) shipped on 2026-03-03.

**What this means:** the flat 42.1% blended retention is most likely

</details>

**Claude's blank:** hiding a sharp mobile web decline, offset by the mix shifting to desktop

**Options shown:**
- hiding a sharp mobile web decline, offset by the mix shifting to desktop
- evidence that retention has stayed stable across every device and plan
- a sign that the AI Summaries launch has kept new-user retention strong
- flat because the smaller mobile cohorts swing month to month without meaning

**Learner picked:** hiding a sharp mobile web decline, offset by the mix shifting to desktop

**Learner's why:** Blended averages can hide what's going on inside the segments, so you should always break a flat number down before trusting it.

`W:` ☐ sound ☐ unsound

---

## g02 · rung 1 · averages_hiding_segments
*Source: `2026-09-29T01-14-20-835Z` starter 1 run 2 · question: "Summarize August for the leadership update"*

**Last line before the blank:** **What this means:** the steady 42.1% blended retention is most likely ___

<details><summary>Full visible text</summary>

## Tasklane: August 2026 summary

### Headline numbers
| Metric | Aug 2026 | MoM | YoY |
|---|---|---|---|
| Active users | 12,730 | -8.3% | +35.2% |
| New signups | 2,204 | -7.7% | +35.5% |
| Wk-4 retention (blended) | 42.1% | +0.4 pts | flat vs 42.1% |

### The August dip is seasonal
August 2025 fell by almost exactly the same amount: active users -8.4% and signups -9.6% MoM, followed by a +13.8% rebound in September. Year-over-year growth of about 35% matches the 32–36% range we've held since late 2025. The underlying trend is intact.

### Context since spring
- **May spike:** signups hit 4,314 after the AI Summaries release, the Product Hunt launch, and the email campaign. Most of that was desktop free (2,722). Signups have since returned to the normal growth path.
- **Mobile web redesign** shipped on 3 March 2026 with a new navigation and signup flow.

### Retention by segment, August 2025 vs August 2026
| Segment | Signups Aug '25 | Signups Aug '26 | Wk-4 ret. Aug '25 | Wk-4 ret. Aug '26 |
|---|---|---|---|---|
| Desktop free | 537 | 1,020 | 43.9% | 44.7% |
| Desktop team | 436 | 812 | 46.9% | 47.0% |
| Mobile web free | 356 | 202 | 36.2% | 23.0% |
| Mobile web team | 298 | 170 | 38.7% | 25.9% |
| **Mobile web share of signups** | **40%** | **17%** | | |

Mobile web retention sat at 35–40% every month until February 2026. It has been 22–26% every month since March.

**What this means:** the steady 42.1% blended retention is most likely

</details>

**Claude's blank:** masking a mobile web drop offset by more desktop signups

**Options shown:**
- masking a mobile web drop offset by more desktop signups
- a sign the AI Summaries launch kept retention healthy
- showing retention is stable across every device and plan
- normal monthly noise with nothing worth investigating

**Learner picked:** masking a mobile web drop offset by more desktop signups

**Learner's why:** Mobile web retention fell from 36.2% to 23.0% (free) and 38.7% to 25.9% (team), while desktop stayed around 44-47%. Mobile's share of signups dropped from 40% to 17%, so more of the mix is the better-retaining desktop group, which keeps the blended rate at 42.1%.

`W:` ☐ sound ☐ unsound

---

## g03 · rung 1 · averages_hiding_segments
*Source: `2026-09-29T01-14-20-835Z` starter 2 run 2 · question: "How does this summer compare to last summer?"*

**Last line before the blank:** **What this means:** the flat headline retention is most likely ___

<details><summary>Full visible text</summary>

## Summer 2026 vs summer 2025 (Jun–Aug)

| Metric | Summer 2025 | Summer 2026 | Change |
|---|---|---|---|
| Avg monthly active users | 9,826 | 13,532 | **+37.7%** |
| Total new signups | 5,139 | 7,449 | **+45.0%** |
| Signups, Jul–Aug only | 3,427 | 4,591 | +34.0% |
| Wk4 retention (Jun / Jul / Aug) | 42.7 / 41.9 / 42.1 | 41.3 / 41.7 / 42.1 | ~flat |

**Growth is on trend, not accelerating.** Active-user YoY ran 31–37% from Sep 2025 to Apr 2026. Summer came in at 43% (June), 35% (July) and 35.2% (August). June is still carrying the May AI Summaries and Product Hunt spike: May signups were 4,314 and June was 2,858. That lift was gone by July. The August drop (−8.3% MoM) matches last August (−8.4%), so it is the usual seasonal dip and not a slowdown.

## By device

| Segment | Summer 2025 | Summer 2026 |
|---|---|---|
| Desktop signups | 3,075 | 6,205 (+102%) |
| Mobile web signups | 2,064 | 1,244 (−40%) |
| Mobile share of signups | 40.2% | 16.7% |
| Desktop wk4 retention, free / team | ~43.6% / ~47.1% | ~44.2% / ~46.7% |
| Mobile wk4 retention, free / team | ~36.7% / ~39.3% | ~22.7% / ~25.9% |
| Desktop active users (3-mo total) | 18,187 | 29,163 (+60%) |
| Mobile active users (3-mo total) | 11,292 | 11,434 (+1%) |

Mobile active users in August 2026 were 3,314, down 8% from 3,604 in August 2025. The mobile shift starts with the March 2026 cohort, the month of the Mobile web redesign (released 2026-03-03). In that cohort mobile signups roughly halved (from 844 in Feb to 371 in Mar), mobile retention fell from about 36–40% to about 22–26% in both plans, and desktop signups jumped from 1,298 to 1,783.

**What this means:** the flat headline retention is most likely

</details>

**Claude's blank:** hiding a mobile-web drop that a shift toward desktop signups offsets

**Options shown:**
- hiding a mobile-web drop that a shift toward desktop signups offsets
- showing that retention held steady on every device and plan this year
- showing that AI Summaries lifted retention enough to cancel a mobile dip
- unaffected by mobile, whose signup counts are too small to matter

**Learner picked:** hiding a mobile-web drop that a shift toward desktop signups offsets

**Learner's why:** Desktop signups more than doubled, from 3,075 to 6,205 (+102%).

`W:` ☐ sound ☐ unsound

---

## g04 · rung 1 · averages_hiding_segments
*Source: `2026-09-29T01-14-20-835Z` starter 1 run 1 · question: "Summarize August for the leadership update"*

**Last line before the blank:** **What this means:** the flat 42.1% blended retention is most likely ___

<details><summary>Full visible text</summary>

## Tasklane: August 2026 leadership update

### Headline numbers
| Metric | Aug 2026 | MoM | YoY |
|---|---|---|---|
| Active users | 12,730 | -8.3% | +35.2% |
| New signups | 2,204 | -7.7% | +35.5% |
| Wk-4 retention (blended) | 42.1% | +0.4 pts | 0.0 pts (42.1% in Aug 2025) |

### Growth
- **The August dip is seasonal.** August 2025 fell -8.4% MoM in active users and -9.6% in signups, then rebounded +13.8% in September. This year's -8.3% matches that pattern.
- **Underlying growth is steady.** YoY active-user growth has held at roughly 32-36% all year, and August is at +35.2%.
- **The May launch spike has faded.** AI Summaries, Product Hunt and the email campaign pushed May signups to 4,314 (+153.6% YoY). Signup growth is back to its normal ~33-35% YoY (July +32.6%, August +35.5%).

### Retention and signups by device (wk-4 retention is signup-weighted)
| Device | Signups Aug 2025 | Signups Feb 2026 | Signups Aug 2026 | Retention Aug 2025 | Retention Aug 2026 |
|---|---|---|---|---|---|
| Desktop | 973 | 1,298 | 1,832 | 45.2% | 45.7% |
| Mobile web | 654 | 844 | 372 | 37.3% | 24.3% |
| **Mobile share of signups** | 40.2% | 39.4% | 16.9% | | |

Other figures:
- Mobile web active users are 3,314, down from 3,604 in August 2025.
- Desktop active users are 9,416, up from 5,812.
- Mobile web retention by plan: free went from 36.2% to 23.0% and team from 38.7% to 25.9%. Both first dropped in March 2026.
- The Mobile web redesign (new navigation and signup flow) shipped on 2026-03-03.

**What this means:** the flat 42.1% blended retention is most likely

</details>

**Claude's blank:** hiding a sharp mobile web decline, offset by the mix shifting to desktop

**Options shown:**
- hiding a sharp mobile web decline, offset by the mix shifting to desktop
- evidence that retention has stayed stable across every device and plan
- a sign that the AI Summaries launch has kept new-user retention strong
- flat because the smaller mobile cohorts swing month to month without meaning

**Learner picked:** hiding a sharp mobile web decline, offset by the mix shifting to desktop

**Learner's why:** mobile ret 37.3 -> 24.3 but it's only 17% of signups now vs 40%

`W:` ☐ sound ☐ unsound

---

## g05 · rung 2 · seasonality_vs_trend
*Source: `2026-09-29T01-22-41-526Z` starter 2 run 2 · question: "How does this summer compare to last summer?"*

**Last line before the blank:** ## What this means ___

<details><summary>Full visible text</summary>

## Summer 2026 vs Summer 2025 (Jun–Aug)

| Metric | Summer 2025 | Summer 2026 | Change |
|---|---|---|---|
| Active users (sum of 3 months) | 29,479 | 40,597 | **+37.7%** |
| New signups (total) | 5,139 | 7,449 | **+45.0%** |
| New signups, Jul+Aug only | 3,427 | 4,591 | +34.0% |
| Wk-4 retention (Jun / Jul / Aug) | 42.7 / 41.9 / 42.1 | 41.3 / 41.7 / 42.1 | ~flat |

### Month by month

| Month | Active users 2025 | MoM | Active users 2026 | MoM | YoY |
|---|---|---|---|---|---|
| Jun | 9,785 | −0.1% | 13,992 | −0.4% | +43.0% |
| Jul | 10,278 | +5.0% | 13,875 | −0.8% | +35.0% |
| Aug | 9,416 | −8.4% | 12,730 | −8.3% | +35.2% |

For context:
- **YoY active-user growth Jan–Apr 2026** (before any May events): +31.6%, +32.5%, +35.3%, +36.6%.
- **May 2026** had the AI Summaries release (May 5), a Product Hunt launch (May 6) and a full-list email (May 12). Signups jumped to 4,314 (+153.6% YoY) and active users to 14,045 (+43.3% YoY). June signups were still elevated (+66.9% YoY), then Jul/Aug signups returned to +32.6% / +35.5% YoY.
- **Dec 2024 and Dec 2025** both show a ~14–16% MoM drop that recovers in January. The same kind of recurring dip shows up in August of both years.

## Something you didn't ask about, but should see

The flat blended retention hides a real problem on **mobile web** since the redesign (Mar 3, 2026):
- Mobile web wk-4 retention fell from ~35–40% to **~22–26%** (free and team), starting in March and not recovering.
- Mobile web signups this summer: **1,244** vs **2,064** last summer (−39.7%). Mobile's share of signups went from 40.2% (Aug 2025) to 16.9% (Aug 2026).
- Mobile web active users in Aug 2026 are **−8.0% YoY** (3,314 vs 3,604), while desktop is **+62.0%** (9,416 vs 5,812).
- Blended retention looks flat only because the mix shifted toward desktop, which retains at 43–48%.

## What this means

</details>

**Claude's blank:** The summer softness, especially August's −8.3%, is the same recurring seasonal dip as last year (−8.4%), not a slowdown. July–August are running ~35% above last year, right in line with the 32–37% YoY trend from before May, so the underlying growth is intact. The May launch lift has faded back to trend rather than reversing it.

**Learner's answer:** This summer's dip is the same seasonal pattern as last year, not a slowdown. The underlying growth rate hasn't changed.

**Learner's why:** Summer is always a slow season for B2B tools because teams are on vacation, so a drop in July and August is expected every year.

`A:` ☐ sound ☐ unsound · `W:` ☐ sound ☐ unsound

---

## g06 · rung 2 · seasonality_vs_trend
*Source: `2026-09-29T01-22-41-526Z` starter 2 run 1 · question: "How does this summer compare to last summer?"*

**Last line before the blank:** ### What the headline comparison means ___

<details><summary>Full visible text</summary>

## Summer 2026 vs summer 2025 (Jun–Aug)

| Metric | Summer 2025 | Summer 2026 | Change |
|---|---|---|---|
| Active users (sum of 3 months) | 29,479 | 40,597 | +37.7% |
| New signups (total) | 5,139 | 7,449 | +45.0% |
| Wk-4 retention (blended) | 41.9–42.7% | 41.3–42.1% | roughly flat |

### Month by month

| Month | Active 2025 | MoM | Active 2026 | MoM | YoY |
|---|---|---|---|---|---|
| Jun | 9,785 | -0.1% | 13,992 | -0.4% | +43.0% |
| Jul | 10,278 | +5.0% | 13,875 | -0.8% | +35.0% |
| Aug | 9,416 | -8.4% | 12,730 | -8.3% | +35.2% |

For context, active-user YoY growth ran between +31.6% and +36.6% every month from Sep 2025 to Apr 2026. It then jumped to about +43% in May and June, when signups spiked after the AI Summaries release, the Product Hunt launch, and the email campaign (4,314 signups in May, mostly desktop free). This year's June started from that elevated base, which is why July was flat instead of up 5%.

### Something you didn't ask about: mobile web broke in March

The mix under the headline has changed a lot since the Mobile web redesign (2026-03-03):

| Summer signups | 2025 | 2026 | Change |
|---|---|---|---|
| Desktop | 3,075 | 6,205 | +102% |
| Mobile web | 2,064 | 1,244 | -40% |

- Wk-4 retention for mobile web signups fell from about 35–40% to about 22–26%, starting in March and holding there since. Desktop retention stayed at about 42–48%.
- Mobile web active users in August were 3,314, down 8% YoY. Desktop was at 9,416, up 62%.
- Blended retention looks flat only because mobile's share of signups dropped from 40% to 17%. The worse-retaining segment shrank, which hides the damage.

### What the headline comparison means

</details>

**Claude's blank:** The August drop matches last year's almost exactly (-8.3% vs -8.4%), so it's the usual summer dip, not a slowdown. With YoY growth back at ~35%, the same pace as the rest of the year once the May launch spike washed out, the underlying growth trend is unchanged.

**Learner's answer:** The August drop is the normal summer dip rather than a slowdown, and growth underneath is still on its usual ~35% YoY pace.

**Learner's why:** Last August fell -8.4% MoM and this August fell -8.3%, almost identical. YoY active-user growth is 35.2% in August, inside the 31.6-36.6% range it held from Sep 2025 to Apr 2026, so the trend didn't bend. Only the month did.

`A:` ☐ sound ☐ unsound · `W:` ☐ sound ☐ unsound

---

## g07 · rung 2 · seasonality_vs_trend
*Source: `2026-09-29T01-22-41-526Z` starter 2 run 2 · question: "How does this summer compare to last summer?"*

**Last line before the blank:** ## What this means ___

<details><summary>Full visible text</summary>

## Summer 2026 vs Summer 2025 (Jun–Aug)

| Metric | Summer 2025 | Summer 2026 | Change |
|---|---|---|---|
| Active users (sum of 3 months) | 29,479 | 40,597 | **+37.7%** |
| New signups (total) | 5,139 | 7,449 | **+45.0%** |
| New signups, Jul+Aug only | 3,427 | 4,591 | +34.0% |
| Wk-4 retention (Jun / Jul / Aug) | 42.7 / 41.9 / 42.1 | 41.3 / 41.7 / 42.1 | ~flat |

### Month by month

| Month | Active users 2025 | MoM | Active users 2026 | MoM | YoY |
|---|---|---|---|---|---|
| Jun | 9,785 | −0.1% | 13,992 | −0.4% | +43.0% |
| Jul | 10,278 | +5.0% | 13,875 | −0.8% | +35.0% |
| Aug | 9,416 | −8.4% | 12,730 | −8.3% | +35.2% |

For context:
- **YoY active-user growth Jan–Apr 2026** (before any May events): +31.6%, +32.5%, +35.3%, +36.6%.
- **May 2026** had the AI Summaries release (May 5), a Product Hunt launch (May 6) and a full-list email (May 12). Signups jumped to 4,314 (+153.6% YoY) and active users to 14,045 (+43.3% YoY). June signups were still elevated (+66.9% YoY), then Jul/Aug signups returned to +32.6% / +35.5% YoY.
- **Dec 2024 and Dec 2025** both show a ~14–16% MoM drop that recovers in January. The same kind of recurring dip shows up in August of both years.

## Something you didn't ask about, but should see

The flat blended retention hides a real problem on **mobile web** since the redesign (Mar 3, 2026):
- Mobile web wk-4 retention fell from ~35–40% to **~22–26%** (free and team), starting in March and not recovering.
- Mobile web signups this summer: **1,244** vs **2,064** last summer (−39.7%). Mobile's share of signups went from 40.2% (Aug 2025) to 16.9% (Aug 2026).
- Mobile web active users in Aug 2026 are **−8.0% YoY** (3,314 vs 3,604), while desktop is **+62.0%** (9,416 vs 5,812).
- Blended retention looks flat only because the mix shifted toward desktop, which retains at 43–48%.

## What this means

</details>

**Claude's blank:** The summer softness, especially August's −8.3%, is the same recurring seasonal dip as last year (−8.4%), not a slowdown. July–August are running ~35% above last year, right in line with the 32–37% YoY trend from before May, so the underlying growth is intact. The May launch lift has faded back to trend rather than reversing it.

**Learner's answer:** After going through every table carefully, I'm confident this summer marks a real slowdown. The spring momentum has reversed and the business is losing steam heading into the fall.

**Learner's why:** I checked each month: active users went from 13,992 in June to 13,875 in July to 12,730 in August, three straight declines. May was 14,045, so we've now fallen every month since the launch peak. That's a clear downward trend, not a blip, and I'd flag it to leadership as the main risk.

`A:` ☐ sound ☐ unsound · `W:` ☐ sound ☐ unsound

---

## g08 · rung 2 · seasonality_vs_trend
*Source: `2026-09-29T01-22-41-526Z` starter 2 run 1 · question: "How does this summer compare to last summer?"*

**Last line before the blank:** ### What the headline comparison means ___

<details><summary>Full visible text</summary>

## Summer 2026 vs summer 2025 (Jun–Aug)

| Metric | Summer 2025 | Summer 2026 | Change |
|---|---|---|---|
| Active users (sum of 3 months) | 29,479 | 40,597 | +37.7% |
| New signups (total) | 5,139 | 7,449 | +45.0% |
| Wk-4 retention (blended) | 41.9–42.7% | 41.3–42.1% | roughly flat |

### Month by month

| Month | Active 2025 | MoM | Active 2026 | MoM | YoY |
|---|---|---|---|---|---|
| Jun | 9,785 | -0.1% | 13,992 | -0.4% | +43.0% |
| Jul | 10,278 | +5.0% | 13,875 | -0.8% | +35.0% |
| Aug | 9,416 | -8.4% | 12,730 | -8.3% | +35.2% |

For context, active-user YoY growth ran between +31.6% and +36.6% every month from Sep 2025 to Apr 2026. It then jumped to about +43% in May and June, when signups spiked after the AI Summaries release, the Product Hunt launch, and the email campaign (4,314 signups in May, mostly desktop free). This year's June started from that elevated base, which is why July was flat instead of up 5%.

### Something you didn't ask about: mobile web broke in March

The mix under the headline has changed a lot since the Mobile web redesign (2026-03-03):

| Summer signups | 2025 | 2026 | Change |
|---|---|---|---|
| Desktop | 3,075 | 6,205 | +102% |
| Mobile web | 2,064 | 1,244 | -40% |

- Wk-4 retention for mobile web signups fell from about 35–40% to about 22–26%, starting in March and holding there since. Desktop retention stayed at about 42–48%.
- Mobile web active users in August were 3,314, down 8% YoY. Desktop was at 9,416, up 62%.
- Blended retention looks flat only because mobile's share of signups dropped from 40% to 17%. The worse-retaining segment shrank, which hides the damage.

### What the headline comparison means

</details>

**Claude's blank:** The August drop matches last year's almost exactly (-8.3% vs -8.4%), so it's the usual summer dip, not a slowdown. With YoY growth back at ~35%, the same pace as the rest of the year once the May launch spike washed out, the underlying growth trend is unchanged.

**Learner's answer:** nothing's actually wrong, august just sags every year

**Learner's why:** -8.4% last aug vs -8.3% now, and YoY is still ~35% like the rest of the year

`A:` ☐ sound ☐ unsound · `W:` ☐ sound ☐ unsound

---

## g09 · rung 3 · seasonality_vs_trend
*Source: `2026-09-29T01-22-41-526Z` starter 3 run 2 · question: "We're setting Q4 targets. What should we expect for December?"*

**Last line before the blank:** ## Recommendation ___

<details><summary>Full visible text</summary>

## What December has looked like

| Month | Active users | MoM | New signups | MoM |
|---|---|---|---|---|
| 2024-11 | 8,452 | | 1,473 | |
| **2024-12** | **7,127** | **−15.7%** | **1,260** | **−14.5%** |
| 2025-01 | 8,899 | +24.9% | 1,555 | +23.4% |
| 2025-11 | 11,135 | | 1,963 | |
| **2025-12** | **9,573** | **−14.0%** | **1,661** | **−15.4%** |
| 2026-01 | 11,715 | +22.4% | 2,112 | +27.2% |

August shows a smaller version of the same pattern (−8.4% in 2025, −8.3% in 2026).

## Underlying growth

Active-user YoY has held at **31–37%** every month from Sep 2025 to Apr 2026. It jumped to about 43% in May–Jun 2026 (AI Summaries, Product Hunt, and the email campaign all landed in early May), then dropped back to **35.0% (Jul)** and **35.2% (Aug)**. Signups tell the same story: a May spike of 4,314, then a return to about 35% YoY by August.

## Interpretation

The December drop is a recurring holiday dip, not a slowdown. It happened in both years, it was about the same size (−14% to −16% vs November), and it fully reversed in January. The trend underneath runs at about 33–35% YoY, and the May launch boost has faded.

## Q4 estimate (last year × 1.32–1.36)

| Month | Active users | New signups |
|---|---|---|
| Oct 2026 | ~14,800–15,200 | ~2,570–2,650 |
| Nov 2026 | ~14,700–15,100 | ~2,590–2,670 |
| **Dec 2026** | **~12,650–13,000** | **~2,190–2,260** |

## Separate issue worth a follow-up

Since the **mobile web redesign (2026-03-03)**, mobile web signups have fallen from about 850/month to about 370/month. Desktop signups rose by roughly the same amount, so the totals look normal. Mobile web 4th-week retention also dropped from about 36–40% to about 22–26%. The blended retention (~41–42%) hides this because more signups now come from desktop. Mobile web active users are **down about 8% YoY** in August, while desktop is up about 62%.

## Recommendation

</details>

**Claude's blank:** Set the December target at about 12,800 active users and 2,200 signups, deliberately below November. Judge December against December 2025 (YoY), not against November, so the usual holiday drop isn't read as a miss.

**Learner's answer:** Target about 12,800 active users for December, below November, and judge it against December 2025 rather than against November.

**Learner's why:** Because that's what the analysis above recommends, and it seems reasonable.

`A:` ☐ sound ☐ unsound · `W:` ☐ sound ☐ unsound

---

## g10 · rung 3 · seasonality_vs_trend
*Source: `2026-09-29T01-22-41-526Z` starter 3 run 1 · question: "We're setting Q4 targets. What should we expect for December?"*

**Last line before the blank:** ## Recommendation ___

<details><summary>Full visible text</summary>

## What December has looked like

| | Dec 2024 | Dec 2025 |
|---|---|---|
| Active users | 7,127 | 9,573 |
| MoM vs November | −15.7% | −14.0% |
| New signups | 1,260 | 1,661 |
| MoM vs November | −14.5% | −15.4% |
| Wk-4 retention | 42.8% | 41.9% |

Both years show the same shape. September jumps, October and November hold high, December drops about 14–16%, and January rebounds by 22–27%. August also dips about 8% each year.

## Underlying growth

Year-over-year growth has stayed steady through those dips:
- **Active users:** roughly 31–37% YoY in every month from Sep 2025 to Apr 2026, and 35% in Jul and Aug 2026. The exception is May–Jun 2026, at about 43%.
- **Signups:** 30–36% YoY in almost every month. The exception is May 2026 (+154%) and Jun 2026 (+67%). That spike came from the AI Summaries launch, Product Hunt and the email campaign, and it had faded by July (+33%).
- Last year's December was about 1.7% above August for active users (9,573 vs 9,416) and 2.1% above for signups (1,661 vs 1,627). This August came in at 12,730 active users and 2,204 signups.

**Interpretation:** the December drop is a recurring holiday pattern, not a slowdown. The business is growing about 30–35% a year underneath it. The May launch was a one-off spike rather than a new growth rate. Expect December to sit well below November and roughly level with August.

## Recommendation

</details>

**Claude's blank:** Set December's target by applying ~30–35% YoY growth to last December, about 12,400–12,900 active users and 2,150–2,250 signups. Set Q4 targets month by month so the expected ~15% December dip isn't read as a miss.

**Learner's answer:** Don't give December its own target. Set one Q4 total for active users at about 1.3x last Q4, and report the monthly numbers only as a check against the same month last year.

**Learner's why:** December fell -15.7% and -14.0% vs November in the last two years and rebounded 22-27% in January, so a quarterly total absorbs the dip instead of flagging it as a miss. YoY has held at 31-37% since Sep 2025, which is where the 1.3x comes from.

`A:` ☐ sound ☐ unsound · `W:` ☐ sound ☐ unsound

---

## g11 · rung 3 · seasonality_vs_trend
*Source: `2026-09-29T01-22-41-526Z` starter 3 run 2 · question: "We're setting Q4 targets. What should we expect for December?"*

**Last line before the blank:** ## Recommendation ___

<details><summary>Full visible text</summary>

## What December has looked like

| Month | Active users | MoM | New signups | MoM |
|---|---|---|---|---|
| 2024-11 | 8,452 | | 1,473 | |
| **2024-12** | **7,127** | **−15.7%** | **1,260** | **−14.5%** |
| 2025-01 | 8,899 | +24.9% | 1,555 | +23.4% |
| 2025-11 | 11,135 | | 1,963 | |
| **2025-12** | **9,573** | **−14.0%** | **1,661** | **−15.4%** |
| 2026-01 | 11,715 | +22.4% | 2,112 | +27.2% |

August shows a smaller version of the same pattern (−8.4% in 2025, −8.3% in 2026).

## Underlying growth

Active-user YoY has held at **31–37%** every month from Sep 2025 to Apr 2026. It jumped to about 43% in May–Jun 2026 (AI Summaries, Product Hunt, and the email campaign all landed in early May), then dropped back to **35.0% (Jul)** and **35.2% (Aug)**. Signups tell the same story: a May spike of 4,314, then a return to about 35% YoY by August.

## Interpretation

The December drop is a recurring holiday dip, not a slowdown. It happened in both years, it was about the same size (−14% to −16% vs November), and it fully reversed in January. The trend underneath runs at about 33–35% YoY, and the May launch boost has faded.

## Q4 estimate (last year × 1.32–1.36)

| Month | Active users | New signups |
|---|---|---|
| Oct 2026 | ~14,800–15,200 | ~2,570–2,650 |
| Nov 2026 | ~14,700–15,100 | ~2,590–2,670 |
| **Dec 2026** | **~12,650–13,000** | **~2,190–2,260** |

## Separate issue worth a follow-up

Since the **mobile web redesign (2026-03-03)**, mobile web signups have fallen from about 850/month to about 370/month. Desktop signups rose by roughly the same amount, so the totals look normal. Mobile web 4th-week retention also dropped from about 36–40% to about 22–26%. The blended retention (~41–42%) hides this because more signups now come from desktop. Mobile web active users are **down about 8% YoY** in August, while desktop is up about 62%.

## Recommendation

</details>

**Claude's blank:** Set the December target at about 12,800 active users and 2,200 signups, deliberately below November. Judge December against December 2025 (YoY), not against November, so the usual holiday drop isn't read as a miss.

**Learner's answer:** Set December at about 15,000 active users, level with November.

**Learner's why:** YoY growth has been steady at 31-37% every month, so there's no reason December should be any different from November.

`A:` ☐ sound ☐ unsound · `W:` ☐ sound ☐ unsound

---

## g12 · rung 3 · seasonality_vs_trend
*Source: `2026-09-29T01-22-41-526Z` starter 3 run 1 · question: "We're setting Q4 targets. What should we expect for December?"*

**Last line before the blank:** ## Recommendation ___

<details><summary>Full visible text</summary>

## What December has looked like

| | Dec 2024 | Dec 2025 |
|---|---|---|
| Active users | 7,127 | 9,573 |
| MoM vs November | −15.7% | −14.0% |
| New signups | 1,260 | 1,661 |
| MoM vs November | −14.5% | −15.4% |
| Wk-4 retention | 42.8% | 41.9% |

Both years show the same shape. September jumps, October and November hold high, December drops about 14–16%, and January rebounds by 22–27%. August also dips about 8% each year.

## Underlying growth

Year-over-year growth has stayed steady through those dips:
- **Active users:** roughly 31–37% YoY in every month from Sep 2025 to Apr 2026, and 35% in Jul and Aug 2026. The exception is May–Jun 2026, at about 43%.
- **Signups:** 30–36% YoY in almost every month. The exception is May 2026 (+154%) and Jun 2026 (+67%). That spike came from the AI Summaries launch, Product Hunt and the email campaign, and it had faded by July (+33%).
- Last year's December was about 1.7% above August for active users (9,573 vs 9,416) and 2.1% above for signups (1,661 vs 1,627). This August came in at 12,730 active users and 2,204 signups.

**Interpretation:** the December drop is a recurring holiday pattern, not a slowdown. The business is growing about 30–35% a year underneath it. The May launch was a one-off spike rather than a new growth rate. Expect December to sit well below November and roughly level with August.

## Recommendation

</details>

**Claude's blank:** Set December's target by applying ~30–35% YoY growth to last December, about 12,400–12,900 active users and 2,150–2,250 signups. Set Q4 targets month by month so the expected ~15% December dip isn't read as a miss.

**Learner's answer:** Set December at about 12,400-12,900 active users, which is last December grown ~30-35%, and tell leadership in advance that it will sit ~15% under November.

**Learner's why:** Both Decembers dropped about 14-16% from November (-15.7%, -14.0%) and then rebounded in January, while YoY stayed around 31-37%. So the right comparison for December is last December plus normal growth, not November.

`A:` ☐ sound ☐ unsound · `W:` ☐ sound ☐ unsound
