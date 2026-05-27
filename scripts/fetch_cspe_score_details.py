#!/usr/bin/env python3
"""Fetch CSPE admission-score detail HTML grouped by institution.

The CSPE programme connector gives programme identities. The detail endpoint
returns the actual score tables shown when users select programmes and click
"Details" on the public Admission Scores page.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path


DETAIL_URL = "https://www.cspe.edu.hk/connector/en/concourse/admission-scores/detail"


def slug(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "unknown"


def provider_pdf_url(lang: str, academic_year: str, provider_id: str) -> str:
    year_path = academic_year.replace("/", "")
    start_year = academic_year[:4]
    provider = provider_id.replace("/", "")
    return (
        f"https://feddcs.cspe.edu.hk/ShareFile/pdf/{lang}/admission_score/"
        f"{year_path}/IF_adm_score_{start_year}_{provider}.pdf"
    )


def fetch_detail_html(year_code: str, programme_ids: list[str]) -> bytes:
    data = urllib.parse.urlencode(
        {
            "academicYear": year_code,
            "institutions": "",
            "programmeIds": ",".join(programme_ids),
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        DETAIL_URL,
        data=data,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0",
        },
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--programmes",
        default="data/processed/cspe_programmes_2025_26.json",
        help="CSPE programme connector JSON from fetch_cspe_programmes.py",
    )
    parser.add_argument("--year-code", default="2526", help="CSPE abbrYearCode, e.g. 2526")
    parser.add_argument("--lang", default="en", choices=["en", "tc", "sc"])
    parser.add_argument("--out-dir", default="data/raw/cspe/details/2025_26")
    parser.add_argument("--index-out", default="data/processed/cspe_score_detail_sources_2025_26.csv")
    parser.add_argument(
        "--limit-institutions",
        type=int,
        default=0,
        help="Optional smoke-test limit. 0 means fetch all institutions.",
    )
    args = parser.parse_args()

    rows = json.loads(Path(args.programmes).read_text(encoding="utf-8"))
    groups: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for row in rows:
        key = (row["institution"].strip(), row["providerId"].strip())
        groups[key].append(row)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    index_path = Path(args.index_out)
    index_path.parent.mkdir(parents=True, exist_ok=True)

    fieldnames = [
        "academic_year",
        "institution",
        "provider_id",
        "programme_count",
        "detail_html_path",
        "detail_endpoint",
        "score_pdf_url",
    ]
    written = 0
    with index_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()

        for (institution, provider_id), programmes in sorted(groups.items()):
            if args.limit_institutions and written >= args.limit_institutions:
                break

            academic_year = programmes[0]["academicYear"]
            body = fetch_detail_html(args.year_code, [p["programmeId"] for p in programmes])
            filename = f"{slug(provider_id)}-{slug(institution)}.html"
            path = out_dir / filename
            path.write_bytes(body)

            writer.writerow(
                {
                    "academic_year": academic_year,
                    "institution": institution,
                    "provider_id": provider_id,
                    "programme_count": len(programmes),
                    "detail_html_path": str(path),
                    "detail_endpoint": DETAIL_URL,
                    "score_pdf_url": provider_pdf_url(args.lang, academic_year, provider_id),
                }
            )
            written += 1
            print(f"wrote {path} ({len(programmes)} programmes)")

    print(f"wrote index for {written} institutions to {index_path}")


if __name__ == "__main__":
    main()
