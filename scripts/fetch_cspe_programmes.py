#!/usr/bin/env python3
"""Fetch CSPE admission-score programme rows for one academic year.

This captures programme identities from the public CSPE connector. It does not
replace official PDF/Excel score extraction; it gives the project stable IDs and
links for later enrichment.
"""

from __future__ import annotations

import argparse
import json
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path


BASE = "https://www.cspe.edu.hk/connector/en/concourse/admission-scores/programmes"


def fetch_page(year_code: str, page: int, page_size: int) -> tuple[list[dict], dict]:
    params = {
        "academicYear": year_code,
        "institutions": "",
        "studyAreas": "",
        "ugs": "",
        "sds": "",
        "others": "",
        "pageSize": str(page_size),
        "currentPage": str(page),
        "token": "",
    }
    url = f"{BASE}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=30) as response:
        body = response.read()

    root = ET.fromstring(body)
    item = root.find("item")
    if item is None:
        return [], {"total": 0, "currentPage": page, "totalPage": 0}

    programmes = json.loads(item.findtext("programme", "[]"))
    pagination = json.loads(item.findtext("pagi", "{}"))
    return programmes, pagination


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--year-code", default="2526", help="CSPE abbrYearCode, e.g. 2526 for 2025/26")
    parser.add_argument("--page-size", type=int, default=200)
    parser.add_argument("--out", default="data/processed/cspe_programmes_2025_26.json")
    args = parser.parse_args()

    all_rows: list[dict] = []
    page = 1
    total_pages = 1
    while page <= total_pages:
        rows, pagination = fetch_page(args.year_code, page, args.page_size)
        all_rows.extend(rows)
        total_pages = int(pagination.get("totalPage", total_pages) or total_pages)
        page += 1

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(all_rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {len(all_rows)} rows to {out}")


if __name__ == "__main__":
    main()
