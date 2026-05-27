#!/usr/bin/env python3
"""Extract programme-level JUPAS admissions score rows from the official PDF."""

from __future__ import annotations

import csv
import re
from pathlib import Path

import pdfplumber
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "data/raw/jupas/af_2025_JUPAS.pdf"
OUT = ROOT / "data/processed/jupas_score_rows_2025.csv"
SOURCE_URL = "https://www.jupas.edu.hk/f/page/3667/af_2025_JUPAS.pdf"


HEADER = [
    "academic_year",
    "source_system",
    "institution",
    "programme_code",
    "programme_title",
    "award_level",
    "area_of_study",
    "selection_formula",
    "upper_quartile",
    "median",
    "lower_quartile",
    "mean",
    "reference_score",
    "raw_score_text",
    "source_url",
    "source_page",
    "source_confidence",
]


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def cell(row: list[object], index: int) -> str:
    return clean(row[index]) if index < len(row) else ""


def number(value: str) -> str:
    match = re.search(r"\d+(?:\.\d+)?", value or "")
    return match.group(0) if match else ""


def code_and_title(value: str) -> tuple[str, str] | None:
    match = re.search(r"\b(JS\d{4}|JSSU\d{2,4}|\d{4})\^?\b", value or "")
    if not match:
        return None
    code = match.group(1)
    if code.isdigit():
        code = f"JS{code}"
    title = clean((value or "")[match.end() :]).lstrip("^").strip()
    return code, title


def institution_for(text: str) -> str:
    checks = [
        ("City University of Hong Kong", "City University of Hong Kong"),
        ("Hong Kong Baptist University", "Hong Kong Baptist University"),
        ("Lingnan University", "Lingnan University"),
        ("The Chinese University of Hong Kong", "The Chinese University of Hong Kong"),
        ("The Education University of Hong Kong", "The Education University of Hong Kong"),
        ("The Hong Kong Polytechnic University", "The Hong Kong Polytechnic University"),
        ("Hong Kong University of Science and Technology", "The Hong Kong University of Science and Technology"),
        ("The University of Hong Kong", "The University of Hong Kong"),
        ("Hong Kong Metropolitan University", "Hong Kong Metropolitan University"),
    ]
    compact = text.replace("Lin gnan", "Lingnan")
    for needle, institution in checks:
        if needle in compact:
            return institution
    return ""


def category(title: str, section: str = "") -> str:
    text = f"{title} {section}".lower()
    rules = [
        ("Medicine", ["medicine", "mbchb", "medical"]),
        ("Dentistry", ["dental", "dentistry"]),
        ("Nursing / Allied Health", ["nursing", "pharmacy", "biomedical", "health", "speech", "occupational therapy", "physiotherapy"]),
        ("Business / Management", ["business", "bba", "management", "marketing", "account", "finance", "economics"]),
        ("Computer Science / AI / Data", ["computer", "computing", "artificial intelligence", "data", "cyber", "information systems", "ict"]),
        ("Engineering", ["engineering", "beng", "mechanical", "civil", "electronic", "aerospace"]),
        ("Science", ["science", "biology", "chemistry", "physics", "mathematics", "environmental"]),
        ("Education", ["education", "teaching", "bachelor of education"]),
        ("Law", ["law", "laws", "llb"]),
        ("Architecture / Built Environment", ["architecture", "surveying", "urban", "landscape", "building"]),
        ("Arts / Humanities / Languages", ["arts", "chinese", "english", "language", "translation", "humanities", "history", "philosophy"]),
        ("Social Sciences / Public Policy", ["social", "psychology", "government", "public", "geography", "sociology"]),
        ("Media / Communication / Design", ["media", "communication", "journalism", "creative", "design", "film", "advertising"]),
        ("Sports / Recreation", ["sport", "physical education"]),
        ("Tourism / Hospitality", ["tourism", "hospitality", "hotel"]),
    ]
    for label, terms in rules:
        if any(term in text for term in terms):
            return label
    return section or "JUPAS Programmes"


def row_dict(
    institution: str,
    code: str,
    title: str,
    formula: str = "",
    upper: str = "",
    median: str = "",
    lower: str = "",
    mean: str = "",
    page: int = 0,
    section: str = "",
) -> dict[str, str] | None:
    title = clean(title)
    if not code or not title:
        return None
    reference = median or lower or mean or upper
    return {
        "academic_year": "2025",
        "source_system": "JUPAS",
        "institution": institution,
        "programme_code": code,
        "programme_title": title,
        "award_level": "Bachelor's Degree" if "HD in " not in title else "Higher Diploma",
        "area_of_study": category(title, section),
        "selection_formula": clean(formula),
        "upper_quartile": number(upper),
        "median": number(median),
        "lower_quartile": number(lower),
        "mean": number(mean),
        "reference_score": number(reference),
        "raw_score_text": clean(
            f"JUPAS {code} | {title} | Upper Quartile: {upper or 'N/A'} | Median: {median or 'N/A'} | Lower Quartile: {lower or 'N/A'} | Mean: {mean or 'N/A'}"
        ),
        "source_url": SOURCE_URL,
        "source_page": str(page),
        "source_confidence": "official_pdf_extracted_needs_review",
    }


def add(rows: list[dict[str, str]], seen: set[str], row: dict[str, str] | None) -> None:
    if not row:
        return
    key = f"{row['institution']}::{row['programme_code']}"
    if key in seen:
        return
    seen.add(key)
    rows.append(row)


def extract_cityu(table: list[list[object]], institution: str, page: int, rows: list[dict[str, str]], seen: set[str]) -> None:
    for r in table:
        parsed = code_and_title(cell(r, 0))
        if not parsed:
            continue
        code, title = parsed
        add(rows, seen, row_dict(institution, code, title, cell(r, 1), median=cell(r, 3), lower=cell(r, 4), page=page))


def extract_hkbu(table: list[list[object]], institution: str, page: int, rows: list[dict[str, str]], seen: set[str]) -> None:
    title_parts: list[str] = []
    mean = ""
    for r in table:
        first = cell(r, 0)
        if first.startswith("JS") or title_parts:
            if first and not first.startswith("Score Formula") and not first.startswith("Mean") and not re.fullmatch(r"\d+(?:\.\d+)?", first):
                title_parts.append(first)
        if first.startswith("Mean"):
            continue
        if number(first) and any(cell(r, i) == "Median" for i in range(len(r))):
            mean = number(first)
    parsed = code_and_title(" ".join(title_parts))
    if parsed:
        code, title = parsed
        add(rows, seen, row_dict(institution, code, title, "Best 5", mean=mean, page=page))


def extract_lingnan_text(text: str, institution: str, page: int, rows: list[dict[str, str]], seen: set[str]) -> None:
    pattern = re.compile(
        r"(JS\d{4})\s+(.+?)\s+Median\s+(\d+(?:\.\d+)?).+?Lower\s+Quartile\s+(\d+(?:\.\d+)?)",
        re.S,
    )
    for match in pattern.finditer(text):
        code, title, median, lower = match.groups()
        title = re.sub(r"^(?:FACULTY|SCHOOL).+?\s+", "", clean(title))
        add(rows, seen, row_dict(institution, code, title, "Any Best Five Subjects", median=median, lower=lower, page=page))


def extract_cuhk(table: list[list[object]], institution: str, page: int, rows: list[dict[str, str]], seen: set[str]) -> None:
    current: dict[str, str] | None = None
    section = ""
    for r in table:
        if cell(r, 0).startswith("Faculty"):
            section = cell(r, 0)
            continue
        parsed = code_and_title(cell(r, 0))
        target = cell(r, 2)
        if parsed:
            if current:
                add(rows, seen, current)
            code, title = parsed
            title = clean(f"{title} {cell(r, 1)}")
            current = row_dict(institution, code, title, cell(r, 14), page=page, section=section) or {}
        elif current and cell(r, 1):
            current["programme_title"] = clean(f"{current['programme_title']} {cell(r, 1)}")
            current["area_of_study"] = category(current["programme_title"], section)
        if current and target in {"UQ", "M", "LQ"}:
            score = number(cell(r, 13))
            if target == "UQ":
                current["upper_quartile"] = score
            elif target == "M":
                current["median"] = score
                current["reference_score"] = current.get("reference_score") or score
            elif target == "LQ":
                current["lower_quartile"] = score
                current["reference_score"] = current.get("reference_score") or score
    if current:
        add(rows, seen, current)


def extract_eduhk(table: list[list[object]], institution: str, page: int, rows: list[dict[str, str]], seen: set[str]) -> None:
    for r in table:
        parsed = code_and_title(cell(r, 0))
        if not parsed:
            continue
        code, _ = parsed
        add(rows, seen, row_dict(institution, code, cell(r, 1), cell(r, 2), median=cell(r, 5), lower=cell(r, 4), page=page))


def extract_polyu(table: list[list[object]], institution: str, page: int, rows: list[dict[str, str]], seen: set[str]) -> None:
    pending: dict[str, str] | None = None
    for r in table:
        code = next((clean(c) for c in r if re.fullmatch(r"JS\d{4}", clean(c))), "")
        joined = " ".join(clean(c) for c in r if c)
        if code:
            if pending:
                add(rows, seen, pending)
            code_index = next(i for i, c in enumerate(r) if clean(c) == code)
            title = " ".join(clean(c) for c in r[:code_index] if clean(c))
            median = ""
            lower = ""
            for i, c in enumerate(r):
                if clean(c) == "Median":
                    median = next((number(clean(x)) for x in r[i + 1 :] if number(clean(x))), "")
                if clean(c) == "Lower Quartile":
                    lower = next((number(clean(x)) for x in r[i + 1 :] if number(clean(x))), "")
            mean = next((number(clean(c)) for c in r[code_index + 1 :] if number(clean(c))), "")
            pending = row_dict(institution, code, title, mean=mean, median=median, lower=lower, page=page)
        elif pending and "Lower Quartile" in joined:
            nums = [number(clean(c)) for c in r if number(clean(c))]
            if nums:
                pending["lower_quartile"] = nums[-1]
                pending["reference_score"] = pending.get("reference_score") or nums[-1]
        elif pending and any(clean(c) for c in r[:3]) and not any(x in joined for x in ["Median", "Lower Quartile"]):
            pending["programme_title"] = clean(f"{pending['programme_title']} {' '.join(clean(c) for c in r[:3] if clean(c))}")
            pending["area_of_study"] = category(pending["programme_title"])
    if pending:
        add(rows, seen, pending)


def extract_hkust(table: list[list[object]], institution: str, page: int, rows: list[dict[str, str]], seen: set[str]) -> None:
    pending_title = ""
    section = ""
    for r in table:
        if cell(r, 0).startswith(("School", "Academy", "Joint")):
            section = cell(r, 0)
            continue
        parsed = code_and_title(cell(r, 0))
        if not parsed:
            title_text = cell(r, 1) or cell(r, 0)
            if title_text and not any(word in title_text for word in ["PROGRAM", "WEIGHTED", "HIGHEST", "LOWER"]):
                pending_title = clean(f"{pending_title} {title_text}")
            continue
        code, title = parsed
        title = title or pending_title or cell(r, 1)
        pending_title = ""
        add(rows, seen, row_dict(institution, code, title, "Best 5 subjects + 6th subject bonus", upper=cell(r, 2), median=cell(r, 3), lower=cell(r, 4), page=page, section=section))


def extract_hku(table: list[list[object]], institution: str, page: int, rows: list[dict[str, str]], seen: set[str]) -> None:
    section = ""
    for r in table:
        if cell(r, 0).startswith(("Faculty", "HKU Business", "Li Ka Shing", "School")):
            section = cell(r, 0)
            continue
        parsed = code_and_title(cell(r, 0))
        if not parsed:
            continue
        code, _ = parsed
        add(rows, seen, row_dict(institution, code, cell(r, 1), cell(r, 2), upper=cell(r, 3), median=cell(r, 4), lower=cell(r, 5), page=page, section=section))


def extract_hkmu(table: list[list[object]], institution: str, page: int, rows: list[dict[str, str]], seen: set[str]) -> None:
    section = ""
    for r in table:
        if cell(r, 0).startswith("School"):
            section = cell(r, 0)
            continue
        parsed = code_and_title(cell(r, 0))
        if not parsed:
            continue
        code, title0 = parsed
        title = clean(" ".join([title0, cell(r, 1), cell(r, 2), cell(r, 3)]))
        add(rows, seen, row_dict(institution, code, title, "Best 5", median=cell(r, 4), lower=cell(r, 5), page=page, section=section))


def main() -> None:
    rows: list[dict[str, str]] = []
    seen: set[str] = set()
    reader = PdfReader(PDF)
    with pdfplumber.open(PDF) as pdf:
        for page_index, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            institution = institution_for(text)
            if not institution:
                continue
            if institution == "Lingnan University":
                extract_lingnan_text(reader.pages[page_index - 1].extract_text() or text, institution, page_index, rows, seen)
            for table in page.extract_tables():
                if institution == "City University of Hong Kong":
                    extract_cityu(table, institution, page_index, rows, seen)
                elif institution == "Hong Kong Baptist University":
                    extract_hkbu(table, institution, page_index, rows, seen)
                elif institution == "The Chinese University of Hong Kong":
                    extract_cuhk(table, institution, page_index, rows, seen)
                elif institution == "The Education University of Hong Kong":
                    extract_eduhk(table, institution, page_index, rows, seen)
                elif institution == "The Hong Kong Polytechnic University":
                    extract_polyu(table, institution, page_index, rows, seen)
                elif institution == "The Hong Kong University of Science and Technology":
                    extract_hkust(table, institution, page_index, rows, seen)
                elif institution == "The University of Hong Kong":
                    extract_hku(table, institution, page_index, rows, seen)
                elif institution == "Hong Kong Metropolitan University":
                    extract_hkmu(table, institution, page_index, rows, seen)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=HEADER)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} JUPAS rows to {OUT}")


if __name__ == "__main__":
    main()
