#!/usr/bin/env python3
"""Build a CSPE seed table using the canonical master schema.

This produces a reviewable table before score extraction is complete. It keeps
programme identities, official detail links, score-source links, and source
confidence flags ready for later enrichment.
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path


MASTER_FIELDS = [
    "source_system",
    "academic_year",
    "institution",
    "institution_chinese",
    "programme_code",
    "programme_id",
    "programme_title",
    "programme_title_chinese",
    "award_level",
    "area_of_study",
    "funding_category",
    "mode_of_study",
    "normal_duration",
    "tuition_fee",
    "score_system",
    "score_comparability_group",
    "score_formula",
    "score_formula_url",
    "upper_quartile",
    "median",
    "lower_quartile",
    "mean",
    "highest",
    "lowest_or_minimum_admitted",
    "min_or_other_score",
    "requirements_summary",
    "chinese_requirement",
    "english_requirement",
    "math_requirement",
    "citizenship_requirement",
    "elective_requirements",
    "specific_subject_requirements",
    "interview_or_portfolio",
    "selection_notes",
    "programme_description",
    "articulation_or_career_notes",
    "programme_url",
    "score_source_url",
    "requirements_source_url",
    "raw_source_local_path",
    "source_confidence",
    "last_retrieved_at",
    "notes",
]


def award_level_from_title(title: str) -> str:
    lower = title.lower()
    if "associate" in lower:
        return "Associate Degree"
    if "higher diploma" in lower:
        return "Higher Diploma"
    if "bachelor" in lower:
        return "Bachelor's Degree"
    return ""


def programme_url(row: dict) -> str:
    return (
        "https://www.cspe.edu.hk/en/ipass/prog-details?"
        f"progId={row['programmeIdEncoded']}&provId={row['providerId']}&year={row['academicYear']}"
    )


def provider_pdf_url(academic_year: str, provider_id: str) -> str:
    return (
        "https://feddcs.cspe.edu.hk/ShareFile/pdf/en/admission_score/"
        f"{academic_year.replace('/', '')}/IF_adm_score_{academic_year[:4]}_{provider_id.replace('/', '')}.pdf"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--programmes", default="data/processed/cspe_programmes_2025_26.json")
    parser.add_argument(
        "--detail-index",
        default="data/processed/cspe_score_detail_sources_2025_26.csv",
        help="Optional detail HTML index from fetch_cspe_score_details.py",
    )
    parser.add_argument("--out", default="outputs/admissions_master_working.csv")
    args = parser.parse_args()

    programmes = json.loads(Path(args.programmes).read_text(encoding="utf-8"))
    detail_paths: dict[tuple[str, str], str] = {}
    detail_index = Path(args.detail_index)
    if detail_index.exists():
        with detail_index.open(newline="", encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                detail_paths[(row["institution"].strip(), row["provider_id"].strip())] = row[
                    "detail_html_path"
                ]

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=MASTER_FIELDS)
        writer.writeheader()
        for row in programmes:
            institution = row["institution"].strip()
            provider_id = row["providerId"].strip()
            title = row["programmeName"].strip()
            record = {field: "" for field in MASTER_FIELDS}
            record.update(
                {
                    "source_system": "cspe",
                    "academic_year": row["academicYear"],
                    "institution": institution,
                    "programme_code": provider_id,
                    "programme_id": row["programmeId"],
                    "programme_title": title,
                    "award_level": award_level_from_title(title),
                    "score_system": "CSPE Common Scoring System or institution-submitted statistics",
                    "score_comparability_group": "cspe_common_scoring_or_provider_grouped",
                    "score_formula": "HKDSE 5**=7, 5*=6, 5=5, 4=4, 3=3, 2=2, 1=1, U=0 unless source notes otherwise",
                    "programme_url": programme_url(row),
                    "score_source_url": provider_pdf_url(row["academicYear"], provider_id),
                    "requirements_source_url": programme_url(row),
                    "raw_source_local_path": detail_paths.get((institution, provider_id), ""),
                    "source_confidence": "catalog_only_needs_score_extraction",
                    "notes": "Seed row; actual score fields pending extraction from CSPE detail HTML/PDF.",
                }
            )
            writer.writerow(record)

    print(f"wrote {len(programmes)} seed rows to {out}")


if __name__ == "__main__":
    main()
