# D115 follow-up check: can a sound answer pass?

Round 1: "Summarize August for the leadership update" (fixed real reply) → "How does this summer compare to last summer?" · rung map `{seasonality_vs_trend: 2}` · rounds claude-opus-5-5, grades claude-sonnet-5-5

**Result: 3/3 rounds where g06 and g08 are both graded sound → PASS** (rule: ≥ 2/3, D115) · control (single-turn): ✅ · cost $0.50

| Round | Concept | Rung | Grades | Pass | Blank |
|---|---|---|---|---|---|
| follow-up 1 | seasonality_vs_trend | 2 | g06 ✅ · g08 ✅ | ✅ | This summer's dip is seasonal, not a slowdown. August fell by the same ~8% as last year, and desktop followed last summer's shape almost exactly. Once you set aside the fading launch lift and the mobile web problem, underlying growth is still about 35% YoY. |
| follow-up 2 | seasonality_vs_trend | 2 | g06 ✅ · g08 ✅ | ✅ | Summer 2026 has the same seasonal shape as summer 2025: roughly flat into midsummer, then an ~8% August dip. It sits on the same ~35% YoY growth line, so the summer softness is the recurring pattern, not a slowdown. The one difference, a flat July instead of +5%, comes from June being inflated by the May launch spike, not from weaker demand. |
| follow-up 3 | seasonality_vs_trend | 2 | g06 ✅ · g08 ✅ | ✅ | This summer followed the same seasonal shape as last summer: roughly flat through July, then an ~8% August dip. Growth held at the usual ~35% YoY once the launch-inflated May–June are set aside, so the softer 2026 summer months are the season plus the launch spike fading, not a slowing trend. |
| control (single-turn) | seasonality_vs_trend | 2 | g06 ✅ · g08 ✅ | ✅ | The Jul–Aug decline is the usual seasonal summer dip, not a slowdown. August fell almost exactly as much as last August, and YoY growth is back at the same ~35% it held all year, so the underlying trend is intact. |

## follow-up 1: seasonality_vs_trend (rung 2)

**Goal:** Separate a recurring seasonal pattern from the underlying growth trend when comparing the same period across years

## Summer 2026 vs Summer 2025 (Jun–Aug)

### Totals
| Metric | Summer 2025 | Summer 2026 | Change |
|---|---|---|---|
| Active users (sum of Jun–Aug) | 29,479 | 40,597 | +37.7% |
| New signups (sum of Jun–Aug) | 5,139 | 7,449 | +45.0% |
| Wk-4 retention (range) | 41.9–42.7% | 41.3–42.1% | about flat |

### Month by month, active users
| Month | 2025 | MoM | 2026 | MoM | YoY |
|---|---|---|---|---|---|
| Jun | 9,785 | −0.1% | 13,992 | −0.4% | +43.0% |
| Jul | 10,278 | +5.0% | 13,875 | −0.8% | +35.0% |
| Aug | 9,416 | −8.4% | 12,730 | −8.3% | +35.2% |

- **Shape:** Last summer rose in July, then dropped in August. This summer had no July bump, then dropped in August. Jun→Aug overall was −3.8% in 2025 and −9.0% in 2026.
- **YoY context:** Active-user growth ran +32% to +37% YoY every month from Sep 2025 to Apr 2026. It rose to +43% in May–Jun 2026 after the AI Summaries launch, Product Hunt, and the email campaign. It was back at +35% by July.
- **Signups:** The +45% summer total is inflated by June's launch carryover (2,858, +66.9% YoY). July and August signups were +32.6% and +35.5% YoY.

### Split by device (active users, Jun→Aug)
| Device | 2025 Jun→Aug | 2026 Jun→Aug | Aug YoY |
|---|---|---|---|
| Desktop | 6,049 → 5,812 (−3.9%) | 9,738 → 9,416 (−3.3%) | +62% |
| Mobile web | 3,736 → 3,604 (−3.5%) | 4,254 → 3,314 (−22.1%) | −8% |

Mobile web shrank far more this summer than its usual seasonal drift. This fits the problem that has persisted since the March redesign: mobile web signups are down ~43% YoY and retention is ~13 points lower. Mobile web accounts for almost all of the extra Jun→Aug decline in the blended total.

What this means:  **[This summer's dip is seasonal, not a slowdown. August fell by the same ~8% as last year, and desktop followed last summer's shape almost exactly. Once you set aside the fading launch lift and the mobile web problem, underlying growth is still about 35% YoY.]** 

### How to put it for leadership
1. **Summer was up ~38% on last summer in active users.** The August dip is the usual seasonal one and matches last year almost to the decimal.
2. **The flat July is not a warning sign on its own.** June started from a base lifted by the May launch, and that lift has now worked out of the numbers. YoY growth is back in its normal band.
3. **The real soft spot is mobile web.** It is down 22% across the summer against a normal ~3–4% drift, and it is the one segment shrinking YoY. That problem is structural, not seasonal. A late-summer rebound won't fix it.

### What to watch
- **September:** last year active users rebounded +13.8% MoM. A similar rebound in desktop would confirm the seasonal read.
- **Mobile web in September:** if it doesn't rebound with desktop, that is more evidence the redesign is the cause. Prioritize the funnel review.

**Grades:**

- g06: sound. You used the right comparison: August fell -8.4% last year and -8.3% this year, and YoY growth of 35.2% sits inside its 31.6-36.6% band, so the trend held and only the season moved.

- g08: sound. You used the right evidence: August fell 8.4% last year and 8.3% this year, and YoY is still ~35%, so the dip is seasonal and not a slowdown in trend.

## follow-up 2: seasonality_vs_trend (rung 2)

**Goal:** Separate a recurring seasonal pattern from underlying growth when comparing the same period across years

## Summer 2026 vs Summer 2025 (Jun–Aug)

### Active users by month
| Month | 2025 | MoM | 2026 | MoM | YoY |
|---|---|---|---|---|---|
| Jun | 9,785 | −0.1% | 13,992 | −0.4% | +43.0% |
| Jul | 10,278 | +5.0% | 13,875 | −0.8% | +35.0% |
| Aug | 9,416 | −8.4% | 12,730 | −8.3% | +35.2% |
| **Summer avg** | **9,826** | | **13,532** | | **+37.7%** |

- **Peak to August:** 2025 fell −8.4% (Jul peak to Aug). 2026 fell −9.0% (Jun peak to Aug).
- **YoY band:** from Sep 2025 to Apr 2026, active users ran **+32% to +37% YoY** every month. June 2026 (+43%) is the only month above that band. It follows May's launch month (AI Summaries, Product Hunt, email campaign).

### New signups
| | 2025 | 2026 | YoY |
|---|---|---|---|
| Jun | 1,712 | 2,858 | +66.9% |
| Jul | 1,800 | 2,387 | +32.6% |
| Aug | 1,627 | 2,204 | +35.5% |
| **Summer total** | **5,139** | **7,449** | **+45.0%** |
| Jul–Aug only | 3,427 | 4,591 | +34.0% |

### Wk-4 retention (blended)
2025: 42.7% / 41.9% / 42.1%. 2026: 41.3% / 41.7% / 42.1%. Both summers sit in the same ~41–43% range.

### Reading the comparison
 **[Summer 2026 has the same seasonal shape as summer 2025: roughly flat into midsummer, then an ~8% August dip. It sits on the same ~35% YoY growth line, so the summer softness is the recurring pattern, not a slowdown. The one difference, a flat July instead of +5%, comes from June being inflated by the May launch spike, not from weaker demand.]** 

### What the blended numbers hide: desktop vs mobile web
The overall shape matches last year, but the two devices are moving differently underneath it:

| Active users | Jun YoY | Jul YoY | Aug YoY | Jul→Aug 2025 | Jul→Aug 2026 |
|---|---|---|---|---|---|
| Desktop | +61.0% | +58.2% | +62.0% | −8.1% | −5.9% |
| Mobile web | +13.9% | −2.2% | −8.0% | −8.8% | −14.3% |

- **Desktop** is growing steadily at about +60% YoY. Its August dip was actually milder than last year's.
- **Mobile web** went from growth to decline over the summer. Its August drop was far steeper than last year's seasonal dip. This fits the collapse in mobile web signups and retention since the March redesign. Fewer new mobile users are sticking, so the mobile active base is shrinking month after month.
- The two effects roughly cancel out, which is why the blended August dip (−8.3%) looks just like last year's (−8.4%).

### For the leadership update
1. **Summer followed the normal seasonal pattern.** It averaged +38% more active users than last summer, and growth is back to the pre-launch run rate of about 35% YoY.
2. **The launch lift was real but temporary.** It showed up in May–June signups and has since settled.
3. **Flag mobile web.** It is the one part of the business shrinking year over year, and the decline sped up this summer.
4. **Watch September.** Last year active users rebounded +13.8%. A similar rebound would confirm the seasonal read. Check mobile web on its own: if it doesn't rebound, that's further evidence of a structural problem, not seasonality.

**Grades:**

- g06: sound. You compared the August dips (-8.4% last year vs -8.3% this year) and showed that August's +35.2% YoY sits inside the band it held from Sep 2025 to Apr 2026. Together, an unchanged seasonal dip and unchanged YoY growth settle that the month moved, not the trend.

- g08: sound. You used the right comparison: August fell 8.4% last year and 8.3% this year, and YoY is still about 35%, so the dip is seasonal rather than a slowdown. That pairing of same-month dips across years with a stable YoY line is what separates season from trend.

## follow-up 3: seasonality_vs_trend (rung 2)

**Goal:** Judge whether a month-over-month drop is a recurring seasonal pattern or a real change in trend

## Summer 2026 vs summer 2025 (Jun–Aug)

### Totals
| Metric | Summer 2025 | Summer 2026 | Change |
|---|---|---|---|
| Active users (sum of Jun–Aug) | 29,479 | 40,597 | +37.7% |
| New signups (sum of Jun–Aug) | 5,139 | 7,449 | +45.0% |
| New signups (Jul–Aug only) | 3,427 | 4,591 | +34.0% |
| Wk-4 retention (range) | 41.9–42.7% | 41.3–42.1% | about 0.5 pts lower |

### Month by month: active users
| Month | 2025 | MoM | 2026 | MoM | YoY |
|---|---|---|---|---|---|
| Apr | 9,443 | +2.2% | 12,898 | +3.2% | +36.6% |
| May | 9,798 | +3.8% | 14,045 | +8.9% | +43.3% |
| Jun | 9,785 | −0.1% | 13,992 | −0.4% | +43.0% |
| Jul | 10,278 | +5.0% | 13,875 | −0.8% | +35.0% |
| Aug | 9,416 | −8.4% | 12,730 | −8.3% | +35.2% |

- **April to August:** 2025 went from 9,443 to 9,416 (−0.3%). 2026 went from 12,898 to 12,730 (−1.3%).
- **YoY band:** active users ran +32% to +37% YoY every month from Sep 2025 to Apr 2026.
- **Events:** AI Summaries shipped on 2026-05-05. The Product Hunt launch and the full-list email followed in May. May 2026 signups hit 4,314, mostly desktop free, and June signups were still +66.9% YoY.
- **Why July differs:** in 2025, July grew +5%. In 2026, July started from a June that was still inflated by the May launch traffic.

**What this means:**  **[This summer followed the same seasonal shape as last summer: roughly flat through July, then an ~8% August dip. Growth held at the usual ~35% YoY once the launch-inflated May–June are set aside, so the softer 2026 summer months are the season plus the launch spike fading, not a slowing trend.]** 

### What's different under the hood: mobile web
The blended numbers look like last summer, but the mix inside them does not:

| Active users, Jun–Aug | 2025 | 2026 | Change |
|---|---|---|---|
| Desktop | 18,187 | 29,163 | +60.4% |
| Mobile web | 11,292 | 11,434 | +1.3% |

- **Desktop** in 2026 moved the same way it did last summer: Jun→Aug −3.3%, vs −3.9% in 2025.
- **Mobile web** fell **22% within the summer** (4,254 in Jun → 3,314 in Aug). Last summer it fell 3.5% over the same months. Since the March redesign, mobile web signups are down ~43% YoY and wk-4 retention is down ~13 points. Fewer and weaker new cohorts are now showing up as a shrinking mobile active base.
- **Blended retention** looks nearly flat only because signups shifted toward desktop, where retention is higher.

### For the leadership update
1. **Summer vs summer:** growth is on its normal ~35% YoY track. The August dip matches last year.
2. **The launch** gave May–June a one-time lift, which has now worked through.
3. **The risk to flag:** mobile web is shrinking in absolute terms while desktop carries all the growth. If this continues, it will start to drag the overall YoY rate below the band.
4. **What to watch in September:** an overall rebound of about +10–14% MoM, as happened last year, confirms the seasonal read. Also watch whether mobile web active users rebound too or keep sliding.

**Grades:**

- g06: sound. You compared August to August (-8.4% vs -8.3% MoM) and checked that 35.2% YoY sits inside the 31.6-36.6% band it held before the launch, which separates a repeating seasonal dip from a real trend change.

- g08: sound. You compared August's dip across years (-8.4% then, -8.3% now) and checked that YoY is still about 35%. A repeating dip at the same size plus an unchanged YoY rate is what separates seasonality from a trend change.

## control (single-turn): seasonality_vs_trend (rung 2)

**Goal:** Separate a recurring seasonal dip from a real change in the growth trend

## Summer 2026 vs Summer 2025 (Jun–Aug)

| Month | Active users | MoM | YoY | New signups | Wk-4 retention |
|---|---|---|---|---|---|
| Jun 2025 | 9,785 | -0.1% | n/a | 1,712 | 42.7% |
| Jul 2025 | 10,278 | +5.0% | n/a | 1,800 | 41.9% |
| Aug 2025 | 9,416 | -8.4% | n/a | 1,627 | 42.1% |
| Jun 2026 | 13,992 | -0.4% | +43.0% | 2,858 | 41.3% |
| Jul 2026 | 13,875 | -0.8% | +35.0% | 2,387 | 41.7% |
| Aug 2026 | 12,730 | -8.3% | +35.2% | 2,204 | 42.1% |

**Summer totals**
- Active user-months: 40,597 vs 29,479, **+37.7% YoY**
- New signups: 7,449 vs 5,139, **+45% YoY**. June carries the tail of the May launch spike (4,314 signups in May). Jul–Aug alone: 4,591 vs 3,427, **+34%**.
- Blended wk-4 retention: flat at about 41–42% both summers.

**Context from the rest of the year**
- Active users YoY ran +31.6% to +36.6% from Sep 2025 through Apr 2026. It jumped to +43% in May–June, the AI Summaries / Product Hunt / email campaign months, and is back to +35% in Jul–Aug.
- The pattern repeats: Dec 2024 fell -15.7% MoM and Dec 2025 fell -14.0%. Aug 2025 fell -8.4% MoM and Aug 2026 fell -8.3%.
- Active users are down 9.0% from June to August 2026.

**What the summer decline means:**  **[The Jul–Aug decline is the usual seasonal summer dip, not a slowdown. August fell almost exactly as much as last August, and YoY growth is back at the same ~35% it held all year, so the underlying trend is intact.]** 

## Two things the headline hides

**1. The May launch lift was temporary.** YoY growth went from ~35% to 43% in May–June and has returned to baseline. Signups and actives from the AI Summaries launch haven't raised the growth rate. To confirm whether any of those users stuck, check the retention of the May signup cohort beyond week 4.

**2. Mobile web has been weak since the 3 Mar 2026 redesign.**
- Mobile web signups: ~845/month before (Feb 844), ~370/month since (Aug 372).
- Mobile web wk-4 retention: ~35–40% before, ~22–26% since, in both plans.
- Mobile web active users in Aug: 3,314 vs 3,604 last August, **-8% YoY**. Desktop: 9,416 vs 5,812, **+62%**.
- Blended retention looks flat only because the signup mix shifted to desktop, which retains better. The mobile rate itself roughly dropped by a third.

## Recommended next steps
- Report summer as on-trend: ~35% YoY, with a normal August dip. Don't flag it as a slowdown.
- Escalate the mobile web redesign. Review the new signup flow's funnel, and consider testing the old flow against the new one on a share of traffic.
- Watch September. Last year it rebounded +13.8% MoM. A similar rebound would confirm the seasonal read.

**Grades:**

- g06: sound. You used the two comparisons that settle it: August fell -8.3% versus -8.4% last year, so the dip repeats, and YoY growth of 35.2% sits inside the 31.6-36.6% band it held all year, so the trend didn't bend.

- g08: sound. You compared August's drop year over year (-8.4% vs -8.3%) and checked that YoY is back near 35%, which is exactly what shows this is a repeating seasonal dip and not a trend change.
