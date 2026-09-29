#!/usr/bin/env python3
"""Generate the Tasklane sample dataset with three planted traps.

Run:  python3 scripts/generate_tasklane.py   (stdlib only, deterministic)

Writes to data/:
  tasklane.json         what the app sends Claude: dashboard + metrics rows + events (D65, D81)
  tasklane_metrics.csv  the metrics rows, under the file name the UI shows (D81)
  tasklane_events.csv   the events, under the file name the UI shows (D81)
  expected.json         trap facts measured from the output. Harness and humans only,
                        never in a prompt (D65).

Traps (Phase 3 dataset spec, D22-D25):
  1. Seasonality  Aug and Dec dip against a 2.5%/mo trend (D80); YoY stays ~+35%.
  2. Segments     The Mar 2026 mobile-web redesign drops mobile retention 38% -> 24%.
                  It also pushes would-be mobile signups to desktop, so the
                  signup-weighted blended retention stays flat (~41-42%).
  3. Causation    AI Summaries, Product Hunt, and an email campaign all land in May 2026.
                  The signup spike is free-plan only and fades by July.

Every trap is checked against the generated rows, not the parameters, so a seed
or noise change that breaks a trap fails loudly instead of shipping silently.
"""

import csv
import json
import random
from pathlib import Path

SEED = 2  # ~half of seeds pass the checks at spec noise (3%); the checks are the guarantee
OUT = Path(__file__).resolve().parent.parent / "data"

# Sep 2024 .. Aug 2026 as "YYYY-MM". Zero-padded strings sort chronologically.
MONTHS = [f"{2024 + (8 + i) // 12}-{(8 + i) % 12 + 1:02d}" for i in range(24)]
PRE = MONTHS[12:18]  # Sep 2025 - Feb 2026: six months before the redesign
POST = MONTHS[18:]  # Mar 2026 - Aug 2026: six months after

DEVICES = ("desktop", "mobile_web")
PLANS = ("free", "team")

# --- Parameters: the "method" that plants each trap ---------------------------

TREND = 1.025  # D80: 2.5%/mo compounds to ~+35% YoY
SEASON = {"08": 0.90, "12": 0.82}  # multiplier vs. trend, by calendar month
NOISE = 0.03  # +/- relative noise on every row value

BASE_ACTIVE = 8000
BASE_SIGNUPS = 1400
TEAM_ACTIVE_SHARE = 0.64
FREE_SIGNUP_SHARE = 0.55

REDESIGN = "2026-03"
MOBILE_ACTIVE_SHARE = 0.38  # drifts down 2 pts/mo after the redesign
MOBILE_SIGNUP_SHARE = 0.40  # before the redesign
SHIFT_TO_DESKTOP = 0.58  # after: share of would-be mobile signups who sign up on desktop
RETENTION = {"desktop": (45.0, 45.0), "mobile_web": (37.5, 24.0)}  # (before, after)
PLAN_RETENTION_OFFSET = {"free": -1.5, "team": 2.0}  # nets to ~0 at a 55/45 mix

FREE_SIGNUP_SPIKE = {"2026-05": 2.6, "2026-06": 1.4}
FREE_ACTIVE_BUMP = {"2026-05": 1.2, "2026-06": 1.08}

EVENTS = [
    ("2025-02-11", "release", "Slack integration", "Create and update tasks from Slack."),
    ("2025-10-07", "release", "Team templates", "Shared project templates for team workspaces."),
    ("2026-03-03", "release", "Mobile web redesign", "New navigation and signup flow on mobile web."),
    ("2026-05-05", "release", "AI Summaries", "Auto-generated weekly summaries of team progress."),
    ("2026-05-06", "marketing", "Product Hunt launch", "Launched AI Summaries on Product Hunt."),
    ("2026-05-12", "marketing", "Email campaign", "Announcement email to the full mailing list."),
]

DEFINITIONS = {
    "active_users": "Users who used Tasklane at least once that month.",
    "new_signups": "Accounts created that month.",
    "wk4_retention_pct": "Share of that month's new signups still active in their 4th week.",
    "device": "desktop or mobile_web. For signups, the device used to sign up.",
    "plan": "free or team (paid).",
    "dashboard": "Monthly totals across all devices and plans. Retention is signup-weighted.",
}


# --- Generation -----------------------------------------------------------------


def jitter(rng: random.Random, value: float) -> float:
    return value * rng.uniform(1 - NOISE, 1 + NOISE)


def generate(rng: random.Random) -> list[dict]:
    rows = []
    for i, month in enumerate(MONTHS):
        season = SEASON.get(month[5:], 1.0)
        after = month >= REDESIGN
        months_since = i - MONTHS.index(REDESIGN) + 1 if after else 0

        active_total = BASE_ACTIVE * TREND**i * season
        signup_total = BASE_SIGNUPS * TREND**i * season
        mobile_active = MOBILE_ACTIVE_SHARE - 0.02 * months_since
        mobile_signup = MOBILE_SIGNUP_SHARE * (1 - SHIFT_TO_DESKTOP) if after else MOBILE_SIGNUP_SHARE

        for device in DEVICES:
            device_active = mobile_active if device == "mobile_web" else 1 - mobile_active
            device_signup = mobile_signup if device == "mobile_web" else 1 - mobile_signup
            base_retention = RETENTION[device][1 if after else 0]

            for plan in PLANS:
                is_free = plan == "free"
                plan_active = 1 - TEAM_ACTIVE_SHARE if is_free else TEAM_ACTIVE_SHARE
                plan_signup = FREE_SIGNUP_SHARE if is_free else 1 - FREE_SIGNUP_SHARE
                active_bump = FREE_ACTIVE_BUMP.get(month, 1.0) if is_free else 1.0
                signup_spike = FREE_SIGNUP_SPIKE.get(month, 1.0) if is_free else 1.0

                rows.append({
                    "month": month,
                    "device": device,
                    "plan": plan,
                    "active_users": round(jitter(rng, active_total * device_active * plan_active * active_bump)),
                    "new_signups": round(jitter(rng, signup_total * device_signup * plan_signup * signup_spike)),
                    "wk4_retention_pct": round(jitter(rng, base_retention + PLAN_RETENTION_OFFSET[plan]), 1),
                })
    return rows


# --- Rollups (shared by the dashboard and the trap checks) ---------------------------


def select(rows: list[dict], months: list[str], **where) -> list[dict]:
    return [r for r in rows if r["month"] in months and all(r[k] == v for k, v in where.items())]


def total(rows: list[dict], months: list[str], field: str, **where) -> int:
    return sum(r[field] for r in select(rows, months, **where))


def retention(rows: list[dict], months: list[str], **where) -> float:
    """Signup-weighted wk4 retention: what a blended dashboard number shows."""
    sel = select(rows, months, **where)
    retained = sum(r["new_signups"] * r["wk4_retention_pct"] for r in sel)
    return round(retained / sum(r["new_signups"] for r in sel), 1)


def pct_change(new: float, old: float | None) -> float | None:
    return None if old is None else round((new / old - 1) * 100, 1)


def build_dashboard(rows: list[dict]) -> list[dict]:
    dash = []
    for i, month in enumerate(MONTHS):
        active = total(rows, [month], "active_users")
        signups = total(rows, [month], "new_signups")
        prev = dash[i - 1] if i >= 1 else None
        year_ago = dash[i - 12] if i >= 12 else None
        dash.append({
            "month": month,
            "active_users": active,
            "active_users_mom_pct": pct_change(active, prev and prev["active_users"]),
            "active_users_yoy_pct": pct_change(active, year_ago and year_ago["active_users"]),
            "new_signups": signups,
            "new_signups_mom_pct": pct_change(signups, prev and prev["new_signups"]),
            "new_signups_yoy_pct": pct_change(signups, year_ago and year_ago["new_signups"]),
            "wk4_retention_pct": retention(rows, [month]),
        })
    return dash


# --- Trap facts + checks -----------------------------------------------------------


def measure_traps(rows: list[dict], dashboard: list[dict]) -> dict:
    d = {r["month"]: r for r in dashboard}

    def desktop_share(months: list[str]) -> float:
        return round(100 * total(rows, months, "new_signups", device="desktop") / total(rows, months, "new_signups"), 1)

    apr, may, jul = "2026-04", "2026-05", "2026-07"
    may_excess = total(rows, [may], "new_signups") - total(rows, [apr], "new_signups")
    free_excess = total(rows, [may], "new_signups", plan="free") - total(rows, [apr], "new_signups", plan="free")
    team_apr = total(rows, [apr], "new_signups", plan="team")
    team_may = total(rows, [may], "new_signups", plan="team")
    blended = [r["wk4_retention_pct"] for r in dashboard]

    return {
        "seasonality": {
            "aug_2025_active_mom_pct": d["2025-08"]["active_users_mom_pct"],
            "aug_2026_active_mom_pct": d["2026-08"]["active_users_mom_pct"],
            "dec_2024_active_mom_pct": d["2024-12"]["active_users_mom_pct"],
            "dec_2025_active_mom_pct": d["2025-12"]["active_users_mom_pct"],
            "aug_2026_active_yoy_pct": d["2026-08"]["active_users_yoy_pct"],
        },
        "segments": {
            "mobile_retention_pre_pct": retention(rows, PRE, device="mobile_web"),
            "mobile_retention_post_pct": retention(rows, POST, device="mobile_web"),
            "desktop_retention_pre_pct": retention(rows, PRE, device="desktop"),
            "desktop_retention_post_pct": retention(rows, POST, device="desktop"),
            "blended_retention_pre_pct": retention(rows, PRE),
            "blended_retention_post_pct": retention(rows, POST),
            "blended_retention_min_pct": min(blended),
            "blended_retention_max_pct": max(blended),
            "desktop_signup_share_pre_pct": desktop_share(PRE),
            "desktop_signup_share_post_pct": desktop_share(POST),
        },
        "causation": {
            "signups_apr_2026": total(rows, [apr], "new_signups"),
            "signups_may_2026": total(rows, [may], "new_signups"),
            "signups_jul_2026": total(rows, [jul], "new_signups"),
            "free_share_of_may_excess_pct": round(100 * free_excess / may_excess, 1),
            "team_signups_may_vs_apr_pct": pct_change(team_may, team_apr),
        },
    }


def require(ok: bool, what: str) -> None:
    # Not `assert`: `python -O` strips asserts, and these checks are the guarantee.
    if not ok:
        raise SystemExit(f"Trap check failed: {what}")


def check(rows: list[dict], facts: dict) -> None:
    s, g, c = facts["seasonality"], facts["segments"], facts["causation"]

    require(len(rows) == 96, f"expected 96 metrics rows, got {len(rows)}")

    # 1. Seasonality: the Aug 2026 dip looks alarming month over month, but it matches last August.
    require(s["aug_2026_active_mom_pct"] <= -5, f"Aug 2026 dip visible: {s['aug_2026_active_mom_pct']}")
    require(abs(s["aug_2026_active_mom_pct"] - s["aug_2025_active_mom_pct"]) <= 2, f"Aug dips match within 2 pts: {s}")
    require(s["dec_2025_active_mom_pct"] <= -12, f"Dec 2025 dip visible: {s['dec_2025_active_mom_pct']}")
    require(abs(s["dec_2025_active_mom_pct"] - s["dec_2024_active_mom_pct"]) <= 3, f"Dec dips match within 3 pts: {s}")
    require(30 <= s["aug_2026_active_yoy_pct"] <= 40, f"Aug 2026 YoY ~+35%: {s['aug_2026_active_yoy_pct']}")

    # 2. Segments: mobile collapses, the blended number doesn't move.
    require(36 <= g["mobile_retention_pre_pct"] <= 40, f"mobile retention before ~38%: {g['mobile_retention_pre_pct']}")
    require(22 <= g["mobile_retention_post_pct"] <= 26, f"mobile retention after ~24%: {g['mobile_retention_post_pct']}")
    require(40 <= g["blended_retention_min_pct"] and g["blended_retention_max_pct"] <= 43, f"blended retention stays 40-43%: {g}")
    require(abs(g["blended_retention_post_pct"] - g["blended_retention_pre_pct"]) <= 1, f"blended flat across redesign: {g}")
    require(g["desktop_signup_share_post_pct"] - g["desktop_signup_share_pre_pct"] >= 15, f"desktop signup share grows: {g}")

    # 3. Causation: the May spike is free-plan only and gone by July.
    require(c["signups_may_2026"] >= 1.5 * c["signups_apr_2026"], f"May spike >= 1.5x April: {c}")
    require(c["free_share_of_may_excess_pct"] >= 90, f"spike is free-plan: {c['free_share_of_may_excess_pct']}")
    require(abs(c["team_signups_may_vs_apr_pct"]) <= 10, f"team signups flat in May: {c['team_signups_may_vs_apr_pct']}")
    require(0.95 <= c["signups_jul_2026"] / c["signups_apr_2026"] <= 1.2, f"spike faded by July: {c}")


# --- Output ---------------------------------------------------------------------------


def write_csv(path: Path, rows: list[dict]) -> None:
    with path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    rows = generate(random.Random(SEED))
    dashboard = build_dashboard(rows)
    facts = measure_traps(rows, dashboard)
    check(rows, facts)

    events = [{"date": d, "type": t, "name": n, "description": desc} for d, t, n, desc in EVENTS]
    OUT.mkdir(exist_ok=True)
    payload = {
        "company": "Tasklane, a B2B team task app",
        "period": f"{MONTHS[0]} to {MONTHS[-1]}, monthly",
        "files": ["tasklane_metrics.csv", "tasklane_events.csv"],
        "definitions": DEFINITIONS,
        "dashboard": dashboard,
        "metrics": rows,
        "events": events,
    }
    (OUT / "tasklane.json").write_text(json.dumps(payload, indent=2) + "\n")
    (OUT / "expected.json").write_text(json.dumps({"seed": SEED, **facts}, indent=2) + "\n")
    write_csv(OUT / "tasklane_metrics.csv", rows)
    write_csv(OUT / "tasklane_events.csv", events)
    print(json.dumps(facts, indent=2))
    print("All trap checks passed.")


if __name__ == "__main__":
    main()
