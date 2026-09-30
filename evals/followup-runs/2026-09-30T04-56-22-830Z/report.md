# D111 follow-up concept check

Round 1: "Summarize August for the leadership update" (fixed real reply) → follow-up: "How does this summer compare to last summer?" · rung map `{seasonality_vs_trend: 2}` · claude-opus-5-5

**Result: 2/3 on seasonality_vs_trend at rung 2 → PASS** (rule: ≥ 2/3, D111) · cost $0.30

| Run | Concept | Rung | Pass | Blank | Time | Cache read |
|---|---|---|---|---|---|---|
| 1 | seasonality_vs_trend | 2 | ✅ | This summer has the same seasonal shape as last summer: flat through midsummer, then an ~8% August dip, and roughly flat from April to August in both years. It just sits at a higher level. The extra June strength (+43% YoY) was the one-off May launch spike wearing off, so underlying growth is unchanged at about 35% YoY. It is neither accelerating nor slowing. | 39 s | 0 |
| 2 | averages_hiding_segments | 1 | ❌ | driven by mobile web shrinking, not a broad seasonal weakening | 38 s | 12350 |
| 3 | seasonality_vs_trend | 2 | ✅ | This summer's steeper June-to-August slide (−9.0% vs −3.8%) isn't a harsher summer. Desktop followed almost exactly last year's seasonal shape (−3.3% vs −3.9%), so the extra decline comes from mobile web's steady post-redesign erosion, a trend running underneath the normal seasonal dip. | 47 s | 12350 |

## Run 1: seasonality_vs_trend (rung 2)

**Goal:** Separate a recurring seasonal shape from underlying growth when comparing the same period across years

## Summer 2026 vs Summer 2025 (Jun–Aug)

### Totals for the three months
| Metric | Summer 2025 | Summer 2026 | Change |
|---|---|---|---|
| Active users (sum of monthly) | 29,479 | 40,597 | +37.7% |
| New signups | 5,139 | 7,449 | +45.0% |
| Wk-4 retention (monthly range) | 41.9–42.7% | 41.3–42.1% | about −0.5 pts |

### Month by month, active users
| Month | 2025 | MoM | 2026 | MoM | YoY |
|---|---|---|---|---|---|
| Apr | 9,443 | +2.2% | 12,898 | +3.2% | +36.6% |
| May | 9,798 | +3.8% | 14,045 | +8.9% | +43.3% |
| Jun | 9,785 | −0.1% | 13,992 | −0.4% | +43.0% |
| Jul | 10,278 | +5.0% | 13,875 | −0.8% | +35.0% |
| Aug | 9,416 | −8.4% | 12,730 | −8.3% | +35.2% |

- **April → August:** −0.3% in 2025 and −1.3% in 2026.
- **YoY band before the May launches** (Sep 2025–Apr 2026): +31.6% to +36.6%.
- **Signups:** Jun 2026 was 2,858 (+66.9% YoY), as the May spike of 4,314 wore off. Jul and Aug were back to +32.6% and +35.5% YoY.
- **Retention:** the blended rate is roughly flat, about half a point lower than last year.

**What this means:**  **[This summer has the same seasonal shape as last summer: flat through midsummer, then an ~8% August dip, and roughly flat from April to August in both years. It just sits at a higher level. The extra June strength (+43% YoY) was the one-off May launch spike wearing off, so underlying growth is unchanged at about 35% YoY. It is neither accelerating nor slowing.]** 

### What the blended totals don't show
Split by device, the two summers look very different:

| Active users | Summer 2025 | Summer 2026 | Aug YoY |
|---|---|---|---|
| Desktop (Jun / Jul / Aug) | 6,049 / 6,326 / 5,812 | 9,738 / 10,009 / 9,416 | +62.0% |
| Mobile web (Jun / Jul / Aug) | 3,736 / 3,952 / 3,604 | 4,254 / 3,866 / 3,314 | −8.0% |

- **All of the growth this summer is desktop.** Mobile web went from +13.9% YoY in June (launch spillover) to −2.2% in July and −8.0% in August.
- **Mobile web retention** stayed around 22–26% all summer, compared with 36–40% last summer. The blended rate looks flat only because the mix shifted toward desktop.
- **The missing July bump** (+5% in 2025, −0.8% in 2026) comes from two things: a launch-inflated June base, and mobile web shrinking.

### For the leadership update
1. Summer followed the normal seasonal pattern. Growth is steady at about 35% YoY, and the AI Summaries lift was a one-time step.
2. Desktop is carrying growth at about +60% YoY. Mobile web is now declining year over year, which is consistent with the March redesign problem.
3. **Watch September.** A rebound of about +10–14% MoM, like the +13.8% last year, confirms the seasonal read. A weaker rebound, especially on mobile web, would suggest the mobile decline is starting to drag on the total.

**Options:**

- This summer has the same seasonal shape as last summer, just at a higher level. June's extra strength was the May launch spike wearing off, so underlying growth is unchanged at about 35% YoY. — _correct_

- This summer is weaker than last summer. YoY growth slid from 43% in June to 35% by August, and July missed last year's bump, so growth is clearly decelerating into the fall. — _reads a fading one-off spike as a slowing trend_

- This summer is stronger because AI Summaries permanently raised growth. Summer usage is about 38% above last year, higher than the rate before the launch, so the lift is lasting. — _credits a lasting effect to a coincident launch_

- The two summers are essentially identical. The same August dip and flat blended retention show that nothing changed underneath, so there is nothing new to flag this year. — _takes blended totals at face value_

## Run 2: averages_hiding_segments (rung 1)

**Goal:** Break a blended change down by segment before deciding what drove it

## Summer 2026 vs Summer 2025 (Jun–Aug)

### Totals
| Metric | Summer 2025 | Summer 2026 | Change |
|---|---|---|---|
| Active users (sum of 3 months) | 29,479 | 40,597 | +37.7% |
| New signups (sum of 3 months) | 5,139 | 7,449 | +45.0% |
| New signups, Jul–Aug only | 3,427 | 4,591 | +34.0% |
| Wk-4 retention (Jun / Jul / Aug) | 42.7 / 41.9 / 42.1% | 41.3 / 41.7 / 42.1% | Converged by Aug |

June 2026 signups (2,858) still carried some of the May launch spike. That is why the full-summer signup growth (+45%) runs above the Jul–Aug rate (+34%).

### Shape of the season (active users)
| | Jun | Jul | Aug | Jun → Aug |
|---|---|---|---|---|
| 2025 | 9,785 | 10,278 (+5.0%) | 9,416 (−8.4%) | −3.8% |
| 2026 | 13,992 | 13,875 (−0.8%) | 12,730 (−8.3%) | −9.0% |

Both years show the August dip. However, 2026 had no July bump, and it lost more ground across the whole summer: −1,262 users from June to August.

### Active users by segment, Jun → Aug
| Segment | 2025 Jun → Aug | 2026 Jun → Aug | 2026 change |
|---|---|---|---|
| Desktop team | 3,883 → 3,707 | 6,084 → 6,110 | +26 |
| Desktop free | 2,166 → 2,105 | 3,654 → 3,306 | −348 |
| Mobile web (free + team) | 3,736 → 3,604 | 4,254 → 3,314 | −940 |

What this means: this summer's steeper June-to-August slide is most likely  **[driven by mobile web shrinking, not a broad seasonal weakening]** .

### Why
- **Mobile web accounts for about 74% of the drop** (940 of 1,262). It fell 22% over the summer, compared with 3.5% last year.
- **Mobile web is now below last year.** It was +13.9% YoY in June, −2.2% in July, and −8.0% in August. The redesign's weak signup flow is draining the base: fewer new mobile users arrive, and fewer of them stay.
- **Desktop free** fell 348. This fits the May launch cohort fading, since the segment has declined steadily from its May peak of 3,818. It is still +57% above last August.
- **Desktop team, the paid core, held flat through the summer** (+0.4%). Last year it dipped 4.5%. This is the healthiest part of the business.

### Framing for leadership
1. This summer ran about **+35–38% above last summer** on users. The August seasonal dip showed up as expected.
2. The paid desktop base came through the summer without its usual dip.
3. Almost all of the extra summer softness is **mobile web**, which has now turned negative YoY. This makes the March redesign issue more urgent than it looked in the August snapshot.
4. **Watch in September:** desktop should rebound as it did last year. If mobile web does not rebound, that confirms the problem is structural rather than seasonal.

**Options:**

- driven by mobile web shrinking, not a broad seasonal weakening — _correct_

- a deeper seasonal dip hitting every segment about equally — _takes the blended number at face value_

- AI Summaries launch users churning out across the summer — _credits the whole slide to a coincident event_

- ordinary monthly noise that is expected in a larger user base — _dismisses a real, concentrated shift as noise_

## Run 3: seasonality_vs_trend (rung 2)

**Goal:** Separate a recurring seasonal pattern from an underlying trend when two years' summers look different

## Summer 2026 vs Summer 2025 (Jun–Aug)

### Totals
| Metric (Jun–Aug sum) | 2025 | 2026 | YoY |
|---|---|---|---|
| Active users (monthly sum) | 29,479 | 40,597 | +37.7% |
| New signups | 5,139 | 7,449 | +45.0% |
| Wk-4 retention (monthly range) | 41.9–42.7% | 41.3–42.1% | roughly flat |

Signups are inflated by the tail of the May launch spike. June 2026 alone was +66.9% YoY. By August, signups were back to +35.5%.

### Shape of the summer, all users
| Active users | Jun | Jul | Aug | Jun→Aug |
|---|---|---|---|---|
| 2025 | 9,785 | 10,278 (+5.0%) | 9,416 (−8.4%) | −3.8% |
| 2026 | 13,992 | 13,875 (−0.8%) | 12,730 (−8.3%) | −9.0% |

So this summer had no July bump, and it slid further from June to August than last summer did.

### Same shape, split by device
| Active users | Jun | Jul | Aug | Jun→Aug | Aug YoY |
|---|---|---|---|---|---|
| Desktop 2025 | 6,049 | 6,326 (+4.6%) | 5,812 (−8.1%) | −3.9% | |
| Desktop 2026 | 9,738 | 10,009 (+2.8%) | 9,416 (−5.9%) | −3.3% | +62.0% |
| Mobile web 2025 | 3,736 | 3,952 (+5.8%) | 3,604 (−8.8%) | −3.5% | |
| Mobile web 2026 | 4,254 | 3,866 (−9.1%) | 3,314 (−14.3%) | −22.1% | −8.0% |

Mobile web YoY in active users went from +13.9% (Jun) to −2.2% (Jul) to −8.0% (Aug). Summer signups on mobile web were down 39.7% YoY (2,064 → 1,244), while desktop signups roughly doubled (3,075 → 6,205).

### What this means
 **[This summer's steeper June-to-August slide (−9.0% vs −3.8%) isn't a harsher summer. Desktop followed almost exactly last year's seasonal shape (−3.3% vs −3.9%), so the extra decline comes from mobile web's steady post-redesign erosion, a trend running underneath the normal seasonal dip.]** 

### For the leadership update
- **Headline:** Summer 2026 active users were about 38% above summer 2025. The August dip repeats last year's pattern, and desktop, now about three-quarters of active users, is tracking last summer's seasonal curve at roughly +60% YoY.
- **Caveat:** the blended summer looks softer than last year only because mobile web has been shrinking since the March redesign. That decline will not reverse in September the way the seasonal dip should.
- **What to watch in September:** desktop should rebound about +10–14% MoM, as it did last year. If mobile web stays flat or keeps falling while desktop rebounds, that confirms the mobile problem is structural, not seasonal.
- **To confirm the cause:** compare the mobile web signup funnel step by step before and after 2026-03-03, and check whether mobile web traffic itself fell. That separates a broken flow from fewer visitors.

**Options:**

- This summer's steeper June-to-August slide (−9.0% vs −3.8%) isn't a harsher summer. Desktop followed almost exactly last year's seasonal shape (−3.3% vs −3.9%), so the extra decline comes from mobile web's steady post-redesign erosion, a trend running underneath the normal seasonal dip. — _correct_

- This summer's steeper June-to-August slide (−9.0% vs −3.8%) means growth is slowing across the board. The seasonal dip hit harder this year for all users, so the roughly 35% YoY pace is likely to erode further as the business heads into the fall. — _takes the blended decline at face value without splitting by device_

- This summer's steeper June-to-August slide (−9.0% vs −3.8%) is the May launch wearing off. Users who came in with AI Summaries and Product Hunt are churning back out, so the extra decline is a one-off launch hangover rather than anything lasting. — _attributes the decline to a coincident event without checking which segment moved_

- This summer's steeper June-to-August slide (−9.0% vs −3.8%) is within normal month-to-month variation. Both summers dip in August and recover in September, so there is no meaningful difference between the two years worth flagging to leadership. — _dismisses a real segment-level trend as noise_
