#!/usr/bin/env python3
"""Audit generated admissions data for obvious extraction and merge issues."""

from __future__ import annotations

import csv
import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
APP_DATA = ROOT / "app/assets/app-data.js"
MASTER = ROOT / "outputs/admissions_master_working.csv"
CSPE = ROOT / "data/processed/cspe_score_rows_raw_2025_26.csv"
JUPAS = ROOT / "data/processed/jupas_score_rows_2025.csv"
REPORT = ROOT / "docs/data-audit-2026-05-28.md"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def app_payload() -> dict:
    text = APP_DATA.read_text(encoding="utf-8")
    match = re.fullmatch(r"window\.HK_ADMISSIONS_DATA = (.*);\n?", text, re.S)
    if not match:
        raise ValueError(f"Cannot parse {APP_DATA}")
    return json.loads(match.group(1))


def has_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def top(counter: Counter, limit: int = 12) -> str:
    return "\n".join(f"- {name or 'N/A'}: {count}" for name, count in counter.most_common(limit))


def main() -> None:
    payload = app_payload()
    programmes = payload.get("programmes", [])
    master = read_csv(MASTER)
    cspe = read_csv(CSPE)
    jupas = read_csv(JUPAS)

    by_system = Counter(row.get("sourceSystem") for row in programmes)
    by_confidence = Counter(row.get("sourceConfidence") for row in programmes)
    no_score = [row for row in programmes if not has_number(row.get("averageScoreHigh"))]
    no_app_link = [row for row in programmes if not row.get("scoreSourceUrl")]

    cspe_missing_mean = [row for row in cspe if not row.get("mean", "").strip()]
    cspe_placeholder = [
        row
        for row in cspe
        if "-" in row.get("raw_score_text", "") and not row.get("mean", "").strip()
    ]
    cspe_possible_merged_titles = [
        row
        for row in cspe
        if len(row.get("programme_title", "")) > 110
        or " Higher Diploma in " in row.get("programme_title", "")
        or " Bachelor " in row.get("programme_title", "")[20:]
    ]
    jupas_missing_reference = [row for row in jupas if not row.get("reference_score", "").strip()]
    jupas_missing_quartile_pair = [
        row for row in jupas if not row.get("median", "").strip() or not row.get("lower_quartile", "").strip()
    ]

    master_confidence = Counter(row.get("source_confidence") for row in master)
    master_score_fields = ["upper_quartile", "median", "lower_quartile", "mean", "highest", "lowest_or_minimum_admitted"]
    master_score_filled = {
        field: sum(1 for row in master if row.get(field, "").strip()) for field in master_score_fields
    }

    sample_no_score = "\n".join(
        f"- {row.get('sourceSystem')} | {row.get('institution')} | {row.get('title')}"
        for row in no_score[:12]
    )
    sample_merged = "\n".join(
        f"- {row.get('institution')} | {row.get('programme_title')}"
        for row in cspe_possible_merged_titles[:12]
    )
    sample_jupas = "\n".join(
        f"- {row.get('institution')} | {row.get('programme_code')} | {row.get('programme_title')}"
        for row in jupas_missing_reference[:12]
    )

    report = f"""# Data Audit - 2026-05-28

## Summary
- App data programmes: {len(programmes)}
- App data by source: {dict(by_system)}
- App data confidence: {dict(by_confidence)}
- App rows without comparable score: {len(no_score)}
- App rows without score source link: {len(no_app_link)}

## Source Tables
- CSPE extracted score rows: {len(cspe)}
- CSPE rows missing mean score: {len(cspe_missing_mean)}
- CSPE rows that look like placeholder/no published score rows: {len(cspe_placeholder)}
- CSPE rows with possible merged programme titles: {len(cspe_possible_merged_titles)}
- JUPAS extracted score rows: {len(jupas)}
- JUPAS rows missing reference score: {len(jupas_missing_reference)}
- JUPAS rows missing median or lower quartile: {len(jupas_missing_quartile_pair)}

## Master CSV Warning
`outputs/admissions_master_working.csv` currently has {len(master)} rows and source confidence:

{top(master_confidence)}

Score fields filled in master CSV:

{chr(10).join(f'- {field}: {count}' for field, count in master_score_filled.items())}

This means the app is using `data/processed/*` for score display, but the master working CSV has not been merged back with the extracted score rows yet.

## No-Score Sample
{sample_no_score or '- None'}

## Possible CSPE Extraction Issues
{sample_merged or '- None'}

## JUPAS Missing Reference Score Sample
{sample_jupas or '- None'}

## Recommended Fixes
- Merge extracted CSPE/JUPAS score fields back into `outputs/admissions_master_working.csv` or rename it clearly as catalog seed only.
- Review CSPE provider rows with blank `mean` and placeholder `-` score text; many appear to be officially unpublished scores, but some rows look like table-row merge problems.
- Manually inspect the possible merged CSPE titles before trusting those rows in search/matching.
- Manually spot-check JUPAS rows without reference score against the official PDF pages before treating them as complete.
"""
    REPORT.write_text(report, encoding="utf-8")
    print(report)


if __name__ == "__main__":
    main()
