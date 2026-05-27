#!/usr/bin/env python3
"""Extract generic score rows from fetched CSPE score-detail HTML.

This is intentionally conservative. It expands HTML table rowspans/colspans and
keeps both normalized score columns and the raw expanded row for audit.
"""

from __future__ import annotations

import argparse
import csv
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path


class TableParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.tables: list[list[list[dict]]] = []
        self._table_stack = 0
        self._current_table: list[list[dict]] | None = None
        self._current_row: list[dict] | None = None
        self._current_cell: dict | None = None
        self._capture = False
        self._parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {k: v or "" for k, v in attrs}
        if tag == "table":
            self._table_stack += 1
            if self._table_stack == 1:
                self._current_table = []
        elif tag == "tr" and self._table_stack == 1:
            self._current_row = []
        elif tag in {"td", "th"} and self._table_stack == 1 and self._current_row is not None:
            self._current_cell = {
                "text": "",
                "rowspan": int(attr.get("rowspan", "1") or "1"),
                "colspan": int(attr.get("colspan", "1") or "1"),
            }
            self._capture = True
            self._parts = []

    def handle_data(self, data: str) -> None:
        if self._capture:
            self._parts.append(data)

    def handle_entityref(self, name: str) -> None:
        if self._capture:
            self._parts.append(html.unescape(f"&{name};"))

    def handle_endtag(self, tag: str) -> None:
        if tag in {"td", "th"} and self._capture and self._current_cell is not None:
            text = " ".join("".join(self._parts).split())
            self._current_cell["text"] = text
            self._current_row.append(self._current_cell)  # type: ignore[union-attr]
            self._current_cell = None
            self._capture = False
            self._parts = []
        elif tag == "tr" and self._table_stack == 1 and self._current_row is not None:
            self._current_table.append(self._current_row)  # type: ignore[union-attr]
            self._current_row = None
        elif tag == "table":
            if self._table_stack == 1 and self._current_table is not None:
                self.tables.append(self._current_table)
                self._current_table = None
            self._table_stack -= 1


def expand_table(table: list[list[dict]]) -> list[list[str]]:
    expanded: list[list[str]] = []
    spans: dict[tuple[int, int], tuple[str, int]] = {}

    for row_idx, row in enumerate(table):
        out: list[str] = []
        col_idx = 0

        def fill_pending() -> None:
            nonlocal col_idx
            while (row_idx, col_idx) in spans:
                value, remaining = spans.pop((row_idx, col_idx))
                out.append(value)
                if remaining > 1:
                    spans[(row_idx + 1, col_idx)] = (value, remaining - 1)
                col_idx += 1

        fill_pending()
        for cell in row:
            fill_pending()
            value = cell["text"]
            rowspan = cell["rowspan"]
            colspan = cell["colspan"]
            for offset in range(colspan):
                out.append(value)
                if rowspan > 1:
                    spans[(row_idx + 1, col_idx + offset)] = (value, rowspan - 1)
            col_idx += colspan
        fill_pending()
        expanded.append(out)

    return expanded


def normalize_header(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "_", value)
    return value.strip("_")


def table_to_records(rows: list[list[str]]) -> list[dict]:
    if len(rows) < 2:
        return []

    header_idx = 0
    for idx, row in enumerate(rows[:4]):
        joined = " ".join(row).lower()
        if "programme" in joined or "program" in joined:
            header_idx = idx
            break

    headers = rows[header_idx]
    records: list[dict] = []
    for row in rows[header_idx + 1 :]:
        if not any(cell.strip() for cell in row):
            continue
        padded = row + [""] * max(0, len(headers) - len(row))
        cells = {normalize_header(headers[i] or f"column_{i}"): padded[i] for i in range(len(headers))}
        raw = dict(zip([headers[i] or f"column_{i}" for i in range(len(padded))], padded))
        records.append({"cells": cells, "raw": raw})
    return records


def pick(cells: dict, candidates: list[str]) -> str:
    for key, value in cells.items():
        if any(candidate in key for candidate in candidates) and value:
            return value
    return ""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--index", default="data/processed/cspe_score_detail_sources_2025_26.csv")
    parser.add_argument("--out", default="data/processed/cspe_score_rows_raw_2025_26.csv")
    args = parser.parse_args()

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "academic_year",
        "institution",
        "provider_id",
        "programme_title",
        "area_of_study",
        "mean",
        "median",
        "lower_quartile",
        "upper_quartile",
        "highest",
        "score_range",
        "raw_score_text",
        "raw_row_json",
        "raw_source_local_path",
        "score_source_url",
        "source_confidence",
    ]

    count = 0
    with Path(args.index).open(newline="", encoding="utf-8") as index_handle, out.open(
        "w", newline="", encoding="utf-8"
    ) as out_handle:
        writer = csv.DictWriter(out_handle, fieldnames=fields)
        writer.writeheader()
        for source in csv.DictReader(index_handle):
            path = Path(source["detail_html_path"])
            parser_obj = TableParser()
            parser_obj.feed(path.read_text(encoding="utf-8", errors="replace"))
            for table in parser_obj.tables:
                for record in table_to_records(expand_table(table)):
                    cells = record["cells"]
                    programme = pick(cells, ["programme", "program"])
                    if not programme or programme.lower() == "programme":
                        continue
                    raw_json = json.dumps(record["raw"], ensure_ascii=False, sort_keys=True)
                    writer.writerow(
                        {
                            "academic_year": source["academic_year"],
                            "institution": source["institution"],
                            "provider_id": source["provider_id"],
                            "programme_title": programme,
                            "area_of_study": pick(cells, ["areas_of_study", "area"]),
                            "mean": pick(cells, ["average_score", "mean"]),
                            "median": pick(cells, ["median"]),
                            "lower_quartile": pick(cells, ["lower_quartile"]),
                            "upper_quartile": pick(cells, ["upper_quartile"]),
                            "highest": pick(cells, ["maximum_score", "highest"]),
                            "score_range": pick(cells, ["range"]),
                            "raw_score_text": " | ".join(f"{k}: {v}" for k, v in record["raw"].items() if v),
                            "raw_row_json": raw_json,
                            "raw_source_local_path": source["detail_html_path"],
                            "score_source_url": source["score_pdf_url"],
                            "source_confidence": "official_html_extracted_needs_review",
                        }
                    )
                    count += 1

    print(f"wrote {count} raw CSPE score rows to {out}")


if __name__ == "__main__":
    main()
