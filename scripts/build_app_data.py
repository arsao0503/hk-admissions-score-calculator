#!/usr/bin/env python3
"""Build browser-ready programme data for the admissions calculator app."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCORE_ROWS = ROOT / "data/processed/cspe_score_rows_raw_2025_26.csv"
CATALOG = ROOT / "outputs/admissions_master_working.csv"
OUT = ROOT / "app/assets/app-data.js"


def score_bounds(value: str) -> tuple[float | None, float | None, str]:
    text = (value or "").strip()
    if not text:
        return None, None, ""

    numbers = [float(part) for part in re.findall(r"\d+(?:\.\d+)?", text)]
    if not numbers:
        return None, None, text
    if len(numbers) == 1:
        return numbers[0], numbers[0], text
    return min(numbers), max(numbers), text


def score_stat(row: dict[str, str], field: str) -> dict[str, float | str | None]:
    low, high, text = score_bounds(row.get(field, ""))
    return {"text": text, "low": low, "high": high}


def programme_key(institution: str, title: str) -> str:
    return f"{institution.strip().lower()}||{title.strip().lower()}"


def load_catalog() -> dict[str, dict[str, str]]:
    lookup: dict[str, dict[str, str]] = {}
    if not CATALOG.exists():
        return lookup

    with CATALOG.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            key = programme_key(row.get("institution", ""), row.get("programme_title", ""))
            lookup[key] = row
    return lookup


def main() -> None:
    catalog = load_catalog()
    programmes = []

    with SCORE_ROWS.open(newline="", encoding="utf-8") as handle:
        for idx, row in enumerate(csv.DictReader(handle), start=1):
            institution = row.get("institution", "").strip()
            title = row.get("programme_title", "").strip()
            stats = {
                "lowerQuartile": score_stat(row, "lower_quartile"),
                "median": score_stat(row, "median"),
                "mean": score_stat(row, "mean"),
                "upperQuartile": score_stat(row, "upper_quartile"),
                "highest": score_stat(row, "highest"),
                "lowestOrMinimumAdmitted": score_stat(row, "lowest_or_minimum_admitted"),
                "minOrOtherScore": score_stat(row, "min_or_other_score"),
            }
            low, high, raw_score = score_bounds(row.get("mean", ""))
            if low is None or high is None or not institution or not title:
                continue

            extra = catalog.get(programme_key(institution, title), {})
            award = extra.get("award_level", "").strip()
            if not award:
                lowered = title.lower()
                if "bachelor" in lowered:
                    award = "Bachelor's Degree"
                elif "associate" in lowered:
                    award = "Associate Degree"
                elif "higher diploma" in lowered:
                    award = "Higher Diploma"

            programmes.append(
                {
                    "id": f"cspe-{idx}",
                    "academicYear": row.get("academic_year", "").strip(),
                    "sourceSystem": "CSPE",
                    "institution": institution,
                    "providerId": row.get("provider_id", "").strip(),
                    "title": title,
                    "awardLevel": award or "Not specified",
                    "areaOfStudy": row.get("area_of_study", "").strip() or "Not specified",
                    "averageScoreLow": low,
                    "averageScoreHigh": high,
                    "averageScoreText": raw_score,
                    "referenceScoreLabel": "Mean",
                    "scoreStats": stats,
                    "scoreSourceUrl": row.get("score_source_url", "").strip(),
                    "programmeUrl": extra.get("programme_url", "").strip(),
                    "rawScoreText": row.get("raw_score_text", "").strip(),
                    "sourceConfidence": row.get("source_confidence", "").strip(),
                }
            )

    payload = {
        "generatedAt": "2026-05-27",
        "scoreFormula": "HKDSE 5**=7, 5*=6, 5=5, 4=4, 3=3, 2=2, 1=1, U=0",
        "note": "CSPE 2025/26 average score rows extracted from official CSPE/iPASS sources; review flags remain visible in the UI.",
        "programmes": programmes,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "window.HK_ADMISSIONS_DATA = "
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(programmes)} programmes to {OUT}")


if __name__ == "__main__":
    main()
