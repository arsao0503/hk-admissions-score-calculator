#!/usr/bin/env python3
"""Build browser-ready programme data for the admissions calculator app."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCORE_ROWS = ROOT / "data/processed/cspe_score_rows_raw_2025_26.csv"
JUPAS_ROWS = ROOT / "data/processed/jupas_score_rows_2025.csv"
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


def empty_score_stat() -> dict[str, float | str | None]:
    return {"text": "", "low": None, "high": None}


def jupas_admission_raw_text(row: dict[str, str]) -> str:
    parts = [
        f"JUPAS {row.get('programme_code', '').strip()}",
        row.get("programme_title", "").strip(),
    ]
    for label, field in [
        ("Upper Quartile", "upper_quartile"),
        ("Median", "median"),
        ("Lower Quartile", "lower_quartile"),
        ("Mean", "mean"),
        ("Subject Weighting", "subject_weighting"),
    ]:
        value = row.get(field, "").strip()
        if value:
            parts.append(f"{label}: {value}")
    return " | ".join(part for part in parts if part)


def programme_key(institution: str, title: str) -> str:
    return f"{institution.strip().lower()}||{title.strip().lower()}"


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip().lower())


def detailed_category(title: str, area: str) -> str:
    text = normalize_text(f"{title} {area}")
    rules = [
        ("Hospitality / Tourism / Aviation", ["hospitality", "tourism", "aviation", "airline", "airport", "theme park", "hotel"]),
        ("Culinary / Baking", ["culinary", "baking", "pastry"]),
        ("Sports / Recreation", ["sports", "sport coaching", "sport performance", "fitness", "esports", "sports and recreation"]),
        ("Environmental / Food / Laboratory Sciences", ["sustainability", "environmental", "food", "testing", "laboratory"]),
        ("Design / Visual Arts", ["design", "visual", "fine arts", "arts practice"]),
        ("Journalism / Media / Communication", ["journalism", "mass media", "communication", "public relations"]),
        ("Medicine", ["medicine", "medical sciences"]),
        ("Nursing", ["nursing"]),
        ("Allied Health / Rehabilitation", ["physiotherapy", "rehabilitation", "health care", "health and social care"]),
        ("Pharmacy / Pharmaceutical Sciences", ["pharmaceutical", "pharmacy", "dispensing"]),
        ("Biomedical / Life Sciences", ["biomedical", "molecular", "life science"]),
        ("Dental / Oral Health", ["dental", "dentistry"]),
        ("Psychology / Counselling", ["psychology", "counselling"]),
        ("Computer Science / Software", ["computer science", "software", "computing"]),
        ("AI / Data Science / FinTech", ["artificial intelligence", "data science", "fintech", "financial technology"]),
        ("Cybersecurity / Information Technology", ["cyber", "information technology", "ict", "intelligent technologies"]),
        ("Engineering", ["engineering", "mechanical", "electrical", "civil"]),
        ("Architecture / Surveying / Construction", ["architecture", "surveying", "building", "construction", "quantity surveying", "town planning"]),
        ("Accounting / Finance", ["accounting", "finance", "banking", "financial"]),
        ("Marketing / Public Relations / Advertising", ["marketing", "public relations", "advertising"]),
        ("Business / Management", ["business", "management", "global business", "human resource", "supply chain", "real estate", "commerce"]),
        ("Education / Teaching", ["education", "teaching", "early childhood"]),
        ("Language / Translation / Communication", ["language", "translation", "english", "chinese", "putonghua", "linguistic", "bilingual", "professional communication"]),
        ("Creative Media / Film / Animation", ["creative", "media", "animation", "film", "music"]),
        ("Social Work / Human Services", ["social work", "human services"]),
        ("Social Sciences / Public Services", ["social sciences", "criminology", "public", "security"]),
        ("Sciences", ["science", "stem"]),
        ("Law", ["law"]),
        ("Humanities / Culture / History", ["humanities", "history", "philosophy", "cultural"]),
    ]
    for label, keywords in rules:
        if any(keyword in text for keyword in keywords):
            return label
    return area or "Unclassified"


def load_catalog() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    if not CATALOG.exists():
        return rows

    with CATALOG.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            rows.append(row)
    return rows


def load_score_rows() -> list[dict[str, str]]:
    with SCORE_ROWS.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def load_jupas_rows() -> list[dict[str, str]]:
    if not JUPAS_ROWS.exists():
        return []
    with JUPAS_ROWS.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def find_score_row(catalog_row: dict[str, str], score_rows: list[dict[str, str]]) -> dict[str, str] | None:
    institution = normalize_text(catalog_row.get("institution", ""))
    title = normalize_text(catalog_row.get("programme_title", ""))
    if not institution or not title:
        return None

    candidates = [row for row in score_rows if normalize_text(row.get("institution", "")) == institution]
    for row in candidates:
        score_title = normalize_text(row.get("programme_title", ""))
        if score_title == title:
            return row
    for row in candidates:
        score_title = normalize_text(row.get("programme_title", ""))
        if title in score_title or score_title in title:
            return row
    return None


def main() -> None:
    catalog = load_catalog()
    score_rows = load_score_rows()
    jupas_rows = load_jupas_rows()
    programmes = []

    for idx, extra in enumerate(catalog, start=1):
        row = find_score_row(extra, score_rows)
        if not row:
            continue
        institution = extra.get("institution", "").strip() or row.get("institution", "").strip()
        title = extra.get("programme_title", "").strip() or row.get("programme_title", "").strip()
        area_of_study = row.get("area_of_study", "").strip() or "Not specified"
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
        if not institution or not title:
            continue

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
                    "areaOfStudy": area_of_study,
                    "detailedCategory": detailed_category(title, area_of_study),
                    "averageScoreLow": low,
                    "averageScoreHigh": high,
                    "averageScoreText": raw_score or "N/A",
                    "referenceScoreLabel": "Mean",
                    "scoreStats": stats,
                    "scoreSourceUrl": row.get("score_source_url", "").strip(),
                    "programmeUrl": extra.get("programme_url", "").strip(),
                    "rawScoreText": row.get("raw_score_text", "").strip(),
                    "sourceConfidence": row.get("source_confidence", "").strip(),
            }
        )

    for idx, row in enumerate(jupas_rows, start=1):
        institution = row.get("institution", "").strip()
        title = row.get("programme_title", "").strip()
        reference_low, reference_high, reference_text = score_bounds(row.get("reference_score", ""))
        if not institution or not title:
            continue

        stats = {
            "lowerQuartile": score_stat(row, "lower_quartile"),
            "median": score_stat(row, "median"),
            "mean": score_stat(row, "mean"),
            "upperQuartile": score_stat(row, "upper_quartile"),
            # JUPAS "Highest Attainable" is a formula ceiling, not an admitted-score statistic.
            # Keep it out of the app score table so users do not read it as an admissions result.
            "highest": empty_score_stat(),
            "lowestOrMinimumAdmitted": empty_score_stat(),
            "minOrOtherScore": empty_score_stat(),
        }

        programmes.append(
            {
                "id": f"jupas-2025-{idx}",
                "academicYear": row.get("academic_year", "").strip(),
                "sourceSystem": "JUPAS",
                "institution": institution,
                "providerId": "JUPAS",
                "programmeCode": row.get("programme_code", "").strip(),
                "title": title,
                "awardLevel": row.get("award_level", "").strip() or "Bachelor's Degree",
                "areaOfStudy": row.get("area_of_study", "").strip() or "JUPAS Programmes",
                "detailedCategory": detailed_category(title, row.get("area_of_study", "")),
                "averageScoreLow": reference_low,
                "averageScoreHigh": reference_high,
                "averageScoreText": reference_text,
                "referenceScoreLabel": "JUPAS reference score",
                "scoreStats": stats,
                "scoreSourceUrl": row.get("source_url", "").strip(),
                "programmeUrl": "",
                "rawScoreText": jupas_admission_raw_text(row),
                "selectionFormula": row.get("selection_formula", "").strip(),
                "subjectWeighting": row.get("subject_weighting", "").strip(),
                "sourceConfidence": row.get("source_confidence", "").strip(),
            }
        )

    payload = {
        "generatedAt": "2026-05-27",
        "scoreFormula": "CSPE calculator uses HKDSE 5**=7, 5*=6, 5=5, 4=4, 3=3, 2=2, 1=1, U=0. JUPAS rows preserve official institution/programme-specific weighted scores from the source PDF.",
        "note": "CSPE 2025/26 rows and JUPAS 2025 rows are extracted from official sources. JUPAS rows use institution/programme-specific scoring formulae and must not be compared directly with the CSPE common scale. JUPAS formula ceilings are not admitted-score statistics.",
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
