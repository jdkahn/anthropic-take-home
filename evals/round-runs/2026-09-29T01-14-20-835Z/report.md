# Round harness · 2026-09-29T01:15:14.510Z

Exit test (M1): every blank on `seasonality_vs_trend`, no trap fallen into. Justin reads all 9.

| Run | Rung | Concept | Concept ✓ | Rung echo | TTFT | Total | Out tokens | Cache read | Cost |
|---|---|---|---|---|---|---|---|---|---|
| 1.1 | 1 | averages_hiding_segments | ❌ | ✅ | 18.4 s | 32.1 s | 2883 | 0 | $0.112 |
| 1.2 | 1 | averages_hiding_segments | ❌ | ✅ | 14.3 s | 25.8 s | 2558 | 10855 | $0.054 |
| 1.3 | 1 | averages_hiding_segments | ❌ | ✅ | 17.9 s | 29.6 s | 2904 | 10855 | $0.060 |
| 2.1 | 2 | seasonality_vs_trend | ✅ | ✅ | 22.3 s | 38.0 s | 3801 | 10855 | $0.078 |
| 2.2 | 2 | averages_hiding_segments | ❌ | ✅ | 21.9 s | 35.8 s | 3584 | 10855 | $0.074 |
| 2.3 | 2 | seasonality_vs_trend | ✅ | ✅ | 19.9 s | 33.1 s | 3368 | 10855 | $0.070 |
| 3.1 | 3 | seasonality_vs_trend | ✅ | ✅ | 28.7 s | 42.3 s | 4020 | 10855 | $0.083 |
| 3.2 | 3 | seasonality_vs_trend | ✅ | ✅ | 16.5 s | 29.4 s | 2832 | 10855 | $0.059 |
| 3.3 | 3 | seasonality_vs_trend | ✅ | ✅ | 17.2 s | 32.0 s | 3014 | 10855 | $0.063 |

**Total cost:** $0.65 · **rung-echo mismatches:** 0/9 (open Q4)

<details><summary>Reading key: trap facts from expected.json (never in a prompt, D65)</summary>



```json
{
  "seed": 2,
  "seasonality": {
    "aug_2025_active_mom_pct": -8.4,
    "aug_2026_active_mom_pct": -8.3,
    "dec_2024_active_mom_pct": -15.7,
    "dec_2025_active_mom_pct": -14,
    "aug_2026_active_yoy_pct": 35.2
  },
  "segments": {
    "mobile_retention_pre_pct": 37.3,
    "mobile_retention_post_pct": 23.9,
    "desktop_retention_pre_pct": 44.9,
    "desktop_retention_post_pct": 45.1,
    "blended_retention_pre_pct": 41.8,
    "blended_retention_post_pct": 41.5,
    "blended_retention_min_pct": 41,
    "blended_retention_max_pct": 42.8,
    "desktop_signup_share_pre_pct": 60,
    "desktop_signup_share_post_pct": 83.1
  },
  "causation": {
    "signups_apr_2026": 2218,
    "signups_may_2026": 4314,
    "signups_jul_2026": 2387,
    "free_share_of_may_excess_pct": 99.3,
    "team_signups_may_vs_apr_pct": 1.5
  }
}
```

</details>

## Starter 1 · rung 1 · run 1
> Summarize August for the leadership update

**Auto:** cloze ✅ · concept ❌ · rung echo ✅ · TTFT 18.4 s · total 32.1 s · 2883 out tokens · $0.112

**Goal:** Check whether a flat blended metric hides opposite movements in its segments · **concept:** `averages_hiding_segments` · **rung echo:** 1

**Answer** (blank in ⟦ ⟧):

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

**What this means:** the flat 42.1% blended retention is most likely ⟦hiding a sharp mobile web decline, offset by the mix shifting to desktop⟧. Desktop retention held at about 45-46%. Mobile web retention fell by about 13 points, and mobile's share of signups fell from about 40% to 17%. Because far fewer signups now come from the weak segment, the blended number looks unchanged even though mobile got much worse.

### Suggested message for leadership
1. **Growth is healthy.** We are up 35% YoY, and the August dip is the usual summer seasonality. No action needed.
2. **Mobile web has a problem that the dashboard hides.** Since early March, mobile web signups are down about 56% and mobile wk-4 retention fell from ~37% to ~24%. The timing lines up with the 2026-03-03 mobile web redesign.
3. **Ask:** prioritize investigating the mobile signup and onboarding flow.

### To confirm before calling it the redesign
- Compare the mobile signup funnel step by step for the weeks before and after March 3, to find where people drop off.
- Check whether anything else changed for mobile web in early March, such as traffic sources, paid campaigns or tracking changes.
- Look at whether mobile *visitors* fell or only mobile *conversion to signup* fell. That tells you whether this is a product issue or an acquisition issue.

### Dashboard fix
Add device-level retention to the monthly rollup. The blended retention number alone would not have shown this problem.

**Options:**
- ✅ hiding a sharp mobile web decline, offset by the mix shifting to desktop
- ❌ evidence that retention has stayed stable across every device and plan — _takes the blended rate at face value without checking segments_
- ❌ a sign that the AI Summaries launch has kept new-user retention strong — _credits a coincident event with an effect the data doesn't show_
- ❌ flat because the smaller mobile cohorts swing month to month without meaning — _dismisses a large, sustained segment drop as noise_

**Your read:** ☐ blank on the right concept · ☐ no trap fallen into · ☐ blank derivable from what's on screen · ☐ wrong options are real mistakes

## Starter 1 · rung 1 · run 2
> Summarize August for the leadership update

**Auto:** cloze ✅ · concept ❌ · rung echo ✅ · TTFT 14.3 s · total 25.8 s · 2558 out tokens · $0.054

**Goal:** Check whether a steady blended rate is hiding opposite moves in its segments · **concept:** `averages_hiding_segments` · **rung echo:** 1

**Answer** (blank in ⟦ ⟧):

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

**What this means:** the steady 42.1% blended retention is most likely ⟦masking a mobile web drop offset by more desktop signups⟧. If mobile web had kept last year's retention rates, August's blended rate would be about 43.9%, not 42.1%. The flat headline is really a drop of about 1.8 points that the shift toward desktop signups is covering up.

### Suggested message for leadership
- **Growth is healthy.** The August dip is the usual summer seasonality, and year-over-year growth is holding at about 35%.
- **Mobile web is a problem.** Since early March, mobile web signups have fallen by about half and wk-4 retention has dropped about 13 points. Both started the same month as the mobile web redesign. That timing makes the redesign the leading suspect, but it is not yet confirmed.

### Next steps
1. Pull the mobile web signup and onboarding funnel before and after 3 March to find where users now drop off. Also check whether tracking or attribution changed with the redesign.
2. Report retention by device on the dashboard, so a mix shift can't hide a drop again.
3. Watch September for the usual rebound. If it doesn't come, revisit the seasonality read.

**Options:**
- ✅ masking a mobile web drop offset by more desktop signups
- ❌ a sign the AI Summaries launch kept retention healthy — _credits a coincident launch as the cause_
- ❌ showing retention is stable across every device and plan — _takes the blended rate at face value_
- ❌ normal monthly noise with nothing worth investigating — _dismisses a lasting segment shift as noise_

**Your read:** ☐ blank on the right concept · ☐ no trap fallen into · ☐ blank derivable from what's on screen · ☐ wrong options are real mistakes

## Starter 1 · rung 1 · run 3
> Summarize August for the leadership update

**Auto:** cloze ✅ · concept ❌ · rung echo ✅ · TTFT 17.9 s · total 29.6 s · 2904 out tokens · $0.060

**Goal:** Break a blended rate into segments before reporting it as stable · **concept:** `averages_hiding_segments` · **rung echo:** 1

**Answer** (blank in ⟦ ⟧):

## Tasklane: August 2026 leadership summary

### Headline numbers
| Metric | Aug 2026 | MoM | YoY |
|---|---|---|---|
| Active users | 12,730 | -8.3% | +35.2% |
| New signups | 2,204 | -7.7% | +35.5% |
| Wk-4 retention (blended) | 42.1% | +0.4 pts | 0.0 pts |

**The August dip is seasonal, not a slowdown.** Active users fell 8.4% in Aug 2025 as well, and YoY growth (+35.2%) sits right in the +31–36% band the business has held all year. Signups follow the same pattern.

**The May spike has worn off as expected.** AI Summaries, the Product Hunt launch, and the email campaign pushed May signups to 4,314. Most of those were desktop free accounts (2,722). Signups were back to trend by July.

### Retention by device and plan (Aug 2025 vs Aug 2026)
| Segment | Signups '25 | Signups '26 | Wk-4 ret. '25 | Wk-4 ret. '26 |
|---|---|---|---|---|
| Desktop · free | 537 | 1,020 | 43.9% | 44.7% |
| Desktop · team | 436 | 812 | 46.9% | 47.0% |
| Mobile web · free | 356 | 202 | 36.2% | 23.0% |
| Mobile web · team | 298 | 170 | 38.7% | 25.9% |
| **Mobile web share of signups** | **40.2%** | **16.9%** | | |

Mobile web retention stayed between 35% and 40% every month through Feb 2026. It dropped to 22–26% in March 2026 and has stayed there. The Mobile web redesign, with its new signup flow, shipped on 2026-03-03. In the same month, mobile signups fell from 844 to 371 and desktop signups rose from 1,298 to 1,783. Mobile web active users are down 8% YoY (3,314 vs 3,604). Desktop active users are up 62%.

What this means: the flat 42% blended retention is most likely ⟦masking a mobile web retention drop, propped up by the shift to desktop signups⟧.

### Suggested line for the update
> August usage dipped 8% MoM, in line with last August's seasonal dip. YoY growth holds at +35%. Blended retention looks flat at 42%, but mobile web retention has fallen from ~38% to ~24% since the March redesign. We're investigating.

### Next steps
- **Confirm the cause.** The timing points strongly at the redesign's signup flow, but timing alone doesn't prove it. Compare the Feb and Mar mobile cohorts step by step through the signup and onboarding funnel. Also check whether tracking or device attribution changed with the redesign. That would explain why mobile signups dropped as desktop rose while total signups stayed flat.
- **Size the cost.** At last year's ~37–39% mobile retention, Aug's 372 mobile signups would have kept about 50 more users active in week 4 than they did.
- **Report retention by device from now on**, so the mix shift can't hide this again.

**Options:**
- ✅ masking a mobile web retention drop, propped up by the shift to desktop signups
- ❌ a sign that retention is holding steady across every device and plan — _takes the blended rate at face value_
- ❌ hiding only small-sample swings in mobile rows that will even out soon — _dismisses a sustained drop as noise_
- ❌ the usual August pattern, matching the same month last year exactly — _reads a recurring number as proof nothing changed_

**Your read:** ☐ blank on the right concept · ☐ no trap fallen into · ☐ blank derivable from what's on screen · ☐ wrong options are real mistakes

## Starter 2 · rung 2 · run 1
> How does this summer compare to last summer?

**Auto:** cloze ✅ · concept ✅ · rung echo ✅ · TTFT 22.3 s · total 38.0 s · 3801 out tokens · $0.078

**Goal:** Judge whether a recent decline is a new trend or the usual recurring seasonal pattern · **concept:** `seasonality_vs_trend` · **rung echo:** 2

**Answer** (blank in ⟦ ⟧):

## Summer 2026 vs summer 2025 (Jun–Aug)

| Metric | Summer 2025 | Summer 2026 | Change |
|---|---|---|---|
| Active users (sum of 3 months) | 29,479 | 40,597 | +37.7% |
| New signups | 5,139 | 7,449 | +45.0% |
| Wk-4 retention (Jun / Jul / Aug) | 42.7 / 41.9 / 42.1% | 41.3 / 41.7 / 42.1% | ~flat |

## Month by month

| Active users | Jun | Jul | Aug |
|---|---|---|---|
| 2025 | 9,785 (−0.1% MoM) | 10,278 (+5.0%) | 9,416 (−8.4%) |
| 2026 | 13,992 (−0.4%) | 13,875 (−0.8%) | 12,730 (−8.3%) |
| 2026 YoY | +43.0% | +35.0% | +35.2% |

For context:
- YoY growth in active users ran at **+31.6% to +36.6%** from Sep 2025 to Apr 2026.
- It jumped to **+43%** in May–June 2026, when AI Summaries shipped with the Product Hunt launch and email campaign. May signups hit 4,314, almost all desktop free.
- The same data shows another recurring dip: December fell −15.7% in 2024 and −14.0% in 2025, then January rebounded both years.

## Under the hood: signups and retention by device

| Summer totals | 2025 | 2026 | Change |
|---|---|---|---|
| Desktop signups | 3,075 | 6,205 | +101.8% |
| Mobile web signups | 2,064 | 1,244 | −39.7% |
| Mobile share of signups | 40.2% | 16.7% | |

- **Desktop wk-4 retention** is unchanged at roughly 43–48%.
- **Mobile web wk-4 retention** fell from roughly 36–40% to **22–26%**, starting in March 2026 when the mobile web redesign (new signup flow) shipped. It hasn't recovered since.
- The blended retention looks flat only because signups shifted heavily toward desktop, the higher-retaining device.
- Mobile web active users in August 2026 were **3,314**, below August 2025 (3,604).

## How to read the Jun–Aug decline

⟦The Jun–Aug decline is the normal summer pattern, not a slowdown. August fell by the same ~8% last year, and YoY growth has settled back to ~35%, where it ran before May. The launch bump has faded, and the underlying growth rate is unchanged.⟧

## What to do with this

- **Report summer on YoY, not MoM.** The honest headline is: overall summer is up ~38% in active users and ~45% in signups, in line with the pre-launch growth rate. The AI Summaries/Product Hunt spike added a one-time bump in May–June rather than a higher growth rate.
- **Watch September.** Last year actives rebounded +13.8% in September. A similar rebound would confirm the seasonal reading. A flat September would be a real warning sign.
- **Flag mobile web as the real problem.** The flat blended retention hides it:
  - Mobile retention dropped ~14 points after the March redesign.
  - Mobile signups are down ~40% YoY.
  - Mobile actives are now below last year.
  - The timing points at the new mobile signup flow. To confirm, check the signup funnel and early-session behaviour for mobile users before vs after March 3.
- **Check the May desktop-free cohort.** Its retention (44.3%) looks normal. Still, track whether those users convert to Team, because that cohort drove much of the summer's signup growth.

**Options:**
- ✅ The Jun–Aug decline is the normal summer pattern, not a slowdown. August fell by the same ~8% last year, and YoY growth has settled back to ~35%, where it ran before May. The launch bump has faded, and the underlying growth rate is unchanged.
- ❌ The Jun–Aug decline shows growth stalling after the launch. Actives fell three months in a row after the May peak, so the launch pulled users forward and momentum is now reversing into a downward trend. — _reads a recurring summer dip as a new trend_
- ❌ The Jun–Aug decline is caused by the mobile web redesign. The drop in actives came after the new signup flow shipped, so the redesign is what is pulling overall active users down this summer. — _blames a recurring dip on a coincident release_
- ❌ The Jun–Aug decline is ordinary month-to-month noise. Shifts of a few percent between months are random variation in active users, so there is no pattern here worth reading into. — _dismisses a real recurring pattern as noise_

**Your read:** ☐ blank on the right concept · ☐ no trap fallen into · ☐ blank derivable from what's on screen · ☐ wrong options are real mistakes

## Starter 2 · rung 2 · run 2
> How does this summer compare to last summer?

**Auto:** cloze ✅ · concept ❌ · rung echo ✅ · TTFT 21.9 s · total 35.8 s · 3584 out tokens · $0.074

**Goal:** Break a blended rate into segments before concluding it held steady · **concept:** `averages_hiding_segments` · **rung echo:** 1

**Answer** (blank in ⟦ ⟧):

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

**What this means:** the flat headline retention is most likely ⟦hiding a mobile-web drop that a shift toward desktop signups offsets⟧. The 40% of signups that used to come from mobile have become about 17%, and those users now retain about 14 points worse. Desktop has become most of the mix and retains in the mid-40s, so the blended number barely moves.

## So how does this summer compare?
- **Headline:** summer is healthy and on its usual YoY trend, with a normal August dip.
- **Underneath:** all the growth is on desktop. Mobile web is flat to shrinking, and its new users churn much faster than a year ago.

## Next steps
1. **Report wk4 retention by device** on the dashboard. The blended figure will keep hiding this as the mix shifts.
2. **Investigate the March mobile redesign.** Funnel-test the new mobile signup flow and look at onboarding for mobile cohorts from March onward. The timing fits, but it is not proven. Check whether anything else changed on mobile web in early March.
3. **Check the desktop signup jump.** Find out whether some would-be mobile signups are now finishing on desktop, for example after a redirect or an attribution change in the new flow. If they are, part of the mobile drop in signups is a tracking artifact. The retention drop would still be real.
4. **Watch mobile active users.** They are now down YoY and will keep eroding if new mobile cohorts retain at about 23–26%.

**Options:**
- ✅ hiding a mobile-web drop that a shift toward desktop signups offsets
- ❌ showing that retention held steady on every device and plan this year — _takes the blended rate at face value_
- ❌ showing that AI Summaries lifted retention enough to cancel a mobile dip — _credits a coincident launch as the cause_
- ❌ unaffected by mobile, whose signup counts are too small to matter — _dismisses a real segment shift as noise_

**Your read:** ☐ blank on the right concept · ☐ no trap fallen into · ☐ blank derivable from what's on screen · ☐ wrong options are real mistakes

## Starter 2 · rung 2 · run 3
> How does this summer compare to last summer?

**Auto:** cloze ✅ · concept ✅ · rung echo ✅ · TTFT 19.9 s · total 33.1 s · 3368 out tokens · $0.070

**Goal:** Separate a recurring seasonal dip from a real change in the growth trend · **concept:** `seasonality_vs_trend` · **rung echo:** 2

**Answer** (blank in ⟦ ⟧):

## Summer 2026 vs summer 2025 (Jun–Aug)

| Month | Active users 2025 | Active users 2026 | YoY | MoM 2025 | MoM 2026 |
|---|---|---|---|---|---|
| Jun | 9,785 | 13,992 | +43.0% | −0.1% | −0.4% |
| Jul | 10,278 | 13,875 | +35.0% | +5.0% | −0.8% |
| Aug | 9,416 | 12,730 | +35.2% | −8.4% | −8.3% |
| **Summer total** | **29,479** | **40,597** | **+37.7%** | | |

**New signups:** 5,139 → 7,449 (+44.9%). June 2026 (2,858, +66.9% YoY) still carries spillover from May's AI Summaries launch, Product Hunt and email campaign, when signups hit 4,314. Jul–Aug alone: 3,427 → 4,591 (+34.0%).

**Week-4 retention (blended):** 42.7 / 41.9 / 42.1% last summer vs 41.3 / 41.7 / 42.1% this summer. Roughly flat.

**Context for the YoY figures:** before the May launch, active-user YoY ran at 31.6% (Jan), 32.5% (Feb), 35.3% (Mar) and 36.6% (Apr). Last year also had dips in December (−15.7%) and August (−8.4%), each followed by a rebound.

## What the summer slide means

This summer, active users fell every month from June to August, ending 9.0% below June. ⟦That slide is mostly the same seasonal pattern as last year, not a slowdown. August's drop (−8.3%) matches last August (−8.4%), and YoY growth has held at about 35% in July and August, which is the same pace as before the launch. June's 43% was temporary launch spillover, not a new, higher trend.⟧

## Where the real concern is: mobile web
The blended numbers hide a segment that is going backwards. Since the March 3 mobile web redesign:
- **Mobile week-4 retention collapsed:** it was about 35–40% and is now about 22–26%, in both free and team plans. Blended retention looks flat only because signups shifted toward desktop, where retention is about 43–48%.
- **Mobile signups roughly halved:** 654 in Aug 2025 vs 372 in Aug 2026 (−43%).
- **Mobile active users are now below last year:** 3,604 in Aug 2025 vs 3,314 in Aug 2026 (−8%). Desktop grew about 62% (5,812 → 9,416).

So the 35% headline growth comes entirely from desktop. Part of this summer's steeper June-to-August decline, compared with last year, comes from mobile shrinking.

## Next steps
1. Report summer as "growth on trend at about 35% YoY, with the usual August dip." Expect a September rebound, as happened last year (+13.8%).
2. Escalate the mobile web redesign. Check the new signup flow's step-by-step completion and week-4 behaviour to find what broke.
3. Watch September YoY. If it stays around 35%, the seasonal reading holds. If it drops meaningfully, look for a real slowdown, starting with mobile.

**Options:**
- ✅ That slide is mostly the same seasonal pattern as last year: August's drop matches last August, and YoY growth has held at about 35%, the pre-launch pace. June's 43% was temporary launch spillover.
- ❌ That slide shows growth stalling: users fell three months running after the May peak, so the launch boost is fading and momentum is turning negative heading into autumn. — _reads a recurring summer dip as a downward trend_
- ❌ That slide hides a lasting step-up from AI Summaries: June's 43% YoY shows the launch permanently lifted growth above last year's pace, despite the monthly dip. — _takes a coincident launch spike as a lasting cause_
- ❌ That slide is just random month-to-month noise: with user counts this large, small monthly moves like these carry no real pattern either way. — _dismisses a real recurring pattern as noise_

**Your read:** ☐ blank on the right concept · ☐ no trap fallen into · ☐ blank derivable from what's on screen · ☐ wrong options are real mistakes

## Starter 3 · rung 3 · run 1
> We're setting Q4 targets. What should we expect for December?

**Auto:** cloze ✅ · concept ✅ · rung echo ✅ · TTFT 28.7 s · total 42.3 s · 4020 out tokens · $0.083

**Goal:** Turn a seasonal pattern into a target that won't be misread as a miss · **concept:** `seasonality_vs_trend` · **rung echo:** 3

**Answer** (blank in ⟦ ⟧):

## December forecast for Tasklane

### What December has looked like before
| | Nov → Dec 2024 | Nov → Dec 2025 | Dec → Jan (rebound) |
|---|---|---|---|
| Active users | −15.7% | −14.0% | +24.9% / +22.4% |
| New signups | −14.5% | −15.4% | +23.4% / +27.2% |
| Wk4 retention | 42.8% | 41.9% | — |

August also dips every year: active users fell −8.4% in Aug 2025 and −8.3% in Aug 2026.

### Underlying growth (year over year)
- **Active users:** 31.6–36.6% YoY from Sep 2025 to Apr 2026. It rose to about 43% in May and June 2026, then fell back to 35.0% in July and 35.2% in August.
- **New signups:** 31.8–35.8% YoY in normal months. They spiked to 153.6% in May 2026, when AI Summaries launched alongside Product Hunt and an email campaign. Signups then fell to 66.9% in June and returned to 32.6% and 35.5% in July and August.
- **Wk4 retention (blended):** 41–43% in every month for two years.

### Interpretation
The December drop of about 14–16% is a recurring holiday pattern, not a slowdown. It has appeared in both years and fully reversed in January. Underlying growth is steady at about 33–35% YoY. The May spike was a one-off launch bump that had fully faded by July. The August 2026 dip is the normal summer dip.

### What that projects
- **Implied Nov 2026:** about 14,800–15,100 active users and 2,590–2,670 signups (Nov 2025 × 1.33–1.36).
- **Dec 2026:** Dec 2025 × 1.33–1.36 gives **about 12,700–13,000 active users** and **about 2,190–2,260 signups**, with retention near 42%.

### Recommendation
⟦Set December targets from last December grown at the steady ~33–35% YoY rate (about 12,900 active users and 2,200 signups). Tell stakeholders upfront to expect a ~15% drop from November.⟧

### Risks and what to watch
- **Mobile web is weaker than the blended numbers show.** Since the 3 March mobile web redesign, mobile signups fell from about 650–850 a month to about 370 a month. Mobile wk4 retention also dropped from roughly 35–40% to 22–26%.
  - Desktop signups rose by almost exactly the same amount, so total signups didn't fall. Many users seem to be signing up on desktop instead.
  - Blended retention looks steady only because the mix shifted toward desktop. If the mix swings back, blended retention could fall below 41% even if nothing else changes. Consider a separate mobile retention target.
- **No Q4 launch or campaign is in the events list.** If one is planned, forecast its lift separately rather than folding it into the baseline. May showed that launch bumps fade within about two months.
- **Early check:** track October and November YoY. If both hold at 33–35%, the December target is on track. If November itself comes in below about 14,800 active users, revisit December before it lands.

**Options:**
- ✅ Set December targets from last December grown at the steady ~33–35% YoY rate (about 12,900 active users and 2,200 signups), and tell stakeholders to expect a ~15% drop from November.
- ❌ Set December targets from November's level plus the usual 2–4% monthly growth (about 15,400 active users and 2,700 signups), and treat any drop from November as a miss. — _ignores the recurring December dip_
- ❌ Set December targets from last December grown at the recent ~43% YoY rate (about 13,700 active users and 2,400 signups), since the AI Summaries launch lifted the trajectory. — _treats a one-off launch spike as lasting growth_
- ❌ Set December targets below this year's pace (about 11,500 active users and 2,000 signups), since the August drop and falling signups since May show growth is slowing. — _reads recurring dips and a fading spike as a downward trend_

**Your read:** ☐ blank on the right concept · ☐ no trap fallen into · ☐ blank derivable from what's on screen · ☐ wrong options are real mistakes

## Starter 3 · rung 3 · run 2
> We're setting Q4 targets. What should we expect for December?

**Auto:** cloze ✅ · concept ✅ · rung echo ✅ · TTFT 16.5 s · total 29.4 s · 2832 out tokens · $0.059

**Goal:** Turn a seasonal pattern and an underlying growth rate into a target that won't be misread · **concept:** `seasonality_vs_trend` · **rung echo:** 3

**Answer** (blank in ⟦ ⟧):

## December forecast

### The pattern
December drops sharply every year, then January rebounds.

| | Nov → Dec active users | Dec YoY |
|---|---|---|
| 2024 | 8,452 → 7,127 (**−15.7%**) | n/a |
| 2025 | 11,135 → 9,573 (**−14.0%**) | +34.3% |

Signups follow the same shape (−14.5% and −15.4%). August has a smaller recurring dip (−8.4% in 2025, −8.3% in 2026), which explains July–August 2026.

### Underlying growth
Year-over-year growth in active users has held steady at about **31–36%**: Jan–Apr 2026 ran 31.6–36.6%, and Jul–Aug 2026 ran 35.0% and 35.2%. The May–June jump to 43% YoY, with 4,314 signups in May, lines up with the AI Summaries launch, Product Hunt, and the email campaign. By July it had faded back to the normal rate, so it was a one-off.

### Interpretation
The December drop is a recurring holiday effect on top of steady growth of about 35% YoY. It is not a slowdown. The best base for December is last December scaled by the steady YoY rate.

| Q4 2026 (at ~31–36% YoY) | Active users | New signups |
|---|---|---|
| October | ~15,100 | ~2,590 |
| November | ~14,900 | ~2,610 |
| **December** | **~12,500–13,000 (≈12,900)** | **~2,180–2,260 (≈2,200)** |

### Recommendation
⟦Set the December target at about 12,900 active users and 2,200 signups, using last December scaled by the steady ~35% YoY rate rather than November's level or the May launch spike. Agree up front that a ~14% drop from November is expected, and judge December on YoY growth, not month-over-month.⟧

### Risks and what to watch
- **Mobile web is shrinking.** Since the March 2026 mobile redesign, mobile signups fell from roughly 800 to about 370 a month, and week-4 retention on mobile fell from about 36–40% to about 22–26%. Mobile active users are now down YoY (Aug: 3,314 vs 3,604). Desktop is carrying all the growth, up 62% YoY in August. The blended retention figure (~42%) hides this because the signup mix shifted to desktop. If mobile keeps eroding, expect the low end of the range, about 12,500.
- **No launch bump is assumed.** If a campaign is planned for Q4, add it as a separate, explicit uplift rather than raising the baseline.
- **Early check:** September should land near 14,500 active users (35% YoY on 10,720). If Sept–Oct YoY slips below about 30%, revise December down before the holidays hide the signal.
- Also flag the mobile regression to the product team. It is a fixable drag on the forecast.

**Options:**
- ✅ Set the December target at about 12,900 active users and 2,200 signups, using last December scaled by the steady ~35% YoY rate. Agree up front that a ~14% drop from November is expected, and judge December on YoY growth.
- ❌ Set the December target at about 14,900 active users, holding November's level since growth has been steady all year. Treat any shortfall against November as a warning sign that needs a response. — _ignores the recurring December dip_
- ❌ Set the December target at about 13,700 active users, using the 43% YoY pace from May–June. The AI Summaries launch showed the new growth level the product can now sustain. — _treats a one-off launch spike as a new trend_
- ❌ Set the December target below last December's 9,573, since active users fell for three straight months from June to August. Plan for the decline to continue into the holidays. — _reads a seasonal dip as a downward trend_

**Your read:** ☐ blank on the right concept · ☐ no trap fallen into · ☐ blank derivable from what's on screen · ☐ wrong options are real mistakes

## Starter 3 · rung 3 · run 3
> We're setting Q4 targets. What should we expect for December?

**Auto:** cloze ✅ · concept ✅ · rung echo ✅ · TTFT 17.2 s · total 32.0 s · 3014 out tokens · $0.063

**Goal:** Turn a seasonal pattern into Q4 targets that hold up in the dip month · **concept:** `seasonality_vs_trend` · **rung echo:** 3

**Answer** (blank in ⟦ ⟧):

## December is a seasonal dip

December drops sharply from November every year. The ~8% August dip is the same kind of recurring pattern.

| | Nov → Dec active users | Nov → Dec signups |
|---|---|---|
| 2024 | 8,452 → 7,127 (**−15.7%**) | 1,473 → 1,260 (−14.5%) |
| 2025 | 11,135 → 9,573 (**−14.0%**) | 1,963 → 1,661 (−15.4%) |

The dip didn't slow growth either year. January rebounded +22–25% both times, and YoY growth has held steady at **~32–36%** for a year.

## The underlying trend is ~35% YoY

- May 2026 spiked (AI Summaries, Product Hunt, email): signups hit 4,314 (+154% YoY) and active users grew 43% YoY.
- The spike faded. By July and August, YoY growth was back to **35.0% / 35.2%** for active users and **32.6% / 35.5%** for signups. The launches created a one-off burst of signups, not a higher growth rate.
- August 2026 (12,730, −8.3% MoM) matches last August's −8.4%, so it isn't a slowdown.

## Expected Q4 (last year × 1.32–1.36)

| Month | Active users | New signups |
|---|---|---|
| Oct 2026 | ~15,100 (14,760–15,210) | ~2,610 (2,570–2,650) |
| Nov 2026 | ~15,000 (14,700–15,140) | ~2,630 (2,590–2,670) |
| **Dec 2026** | **~12,900 (12,640–13,020)** | **~2,230 (2,190–2,260)** |

December will likely come in ~14% below November and still be on plan.

**Recommendation:** ⟦Set December's targets from last December grown at ~35% YoY (about 12,900 active users and 2,230 signups), not from November or the May peak. Agree up front that a ~14% drop from November is expected, and judge December on YoY growth, not month-over-month.⟧

## Risks and what to watch

- **Mobile web is shrinking under the blended numbers.** Since the March 2026 mobile redesign, mobile signups fell from ~850/month to ~370. Mobile wk4 retention fell from ~36–40% to ~22–26%. Mobile active users are now **down ~8% YoY** (3,314 vs 3,604 in August), while desktop is up ~62%. Blended retention looks flat (~41–42%) only because the signup mix shifted to desktop. The 35% trend currently depends on desktop alone. If desktop growth cools, the forecast has no mobile cushion. Fixing the mobile signup flow is upside that the targets above don't include.
- **Don't bake in launch spikes.** If another launch or campaign lands in Q4, track it as a separate line on top of the baseline. May showed that the extra signups fade within about two months.
- **Check early.** If October comes in below ~14,700 active users (≈32% YoY), revise November and December down before year-end reviews, not after.

**Options:**
- ✅ Set December's targets from last December grown at ~35% YoY (about 12,900 active users and 2,230 signups), not from November or the May peak. Agree up front that a ~14% drop from November is expected, and judge December on YoY growth, not month-over-month.
- ❌ Set December's targets by extending November's level with the usual ~3% monthly growth (about 15,400 active users and 2,700 signups), since the recent months show steady momentum. Flag any shortfall from November as a warning sign. — _ignores the recurring December dip and projects November forward_
- ❌ Set December's targets off the May 2026 level (about 14,000 active users and 4,300 signups), since AI Summaries lifted the product onto a new baseline. Treat anything below that as a sign that the launch effect is wearing off. — _takes a one-off launch spike as the new trend_
- ❌ Set December's targets below this August's level (under 12,700 active users and 2,200 signups), since the August drop suggests growth is stalling. Plan for a softer Q4 and reset expectations for next year. — _reads a recurring seasonal dip as a declining trend_

**Your read:** ☐ blank on the right concept · ☐ no trap fallen into · ☐ blank derivable from what's on screen · ☐ wrong options are real mistakes
