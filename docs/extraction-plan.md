# Extraction Plan

## Goal

Build one reusable admissions table from official JUPAS and CSPE sources, with actual admitted-score statistics separated from minimum entrance requirements.

The working principle is simple: use deterministic structured extraction first, then use Marker / cheap model phrasing only where the source is a PDF or awkward HTML table.

## Source Types

### JUPAS

Primary source:
- Annual admissions score PDF from JUPAS.

Extraction route:
1. Download the PDF into `data/raw/jupas/`.
2. Run Marker or another PDF-to-Markdown/table extractor.
3. Parse institution sections separately because score formulas differ by institution.
4. Preserve raw score text and page reference for each extracted row.
5. Join score rows to current JUPAS programme pages for requirements, descriptions, and official links.

Why separate by institution:
- HKU, CUHK, HKUST, CityUHK, PolyU, HKBU, LingU, EdUHK, and HKMU do not use one universal score formula.
- A programme may publish weighted scores, best-5 scores, median/LQ only, or institution-specific grade points.

### CSPE / Concourse

Primary sources:
- CSPE admission-score programme connector.
- CSPE admission-score detail endpoint.
- CSPE institution score PDFs.
- CSPE programme detail pages.

Extraction route:
1. Fetch programme identities from the connector.
2. Fetch score-detail HTML by institution/programme selection.
3. Keep the institution PDF URL for source verification.
4. Parse tables into score rows where possible.
5. Use Marker / model-assisted phrasing for tables with rowspans or grouped programmes.

Important observation:
- CSPE's "download Excel" output currently behaves like a programme catalog export, not a full score-statistics export.
- The score-detail HTML and institution PDFs are better sources for actual Average / Range / Quartile statistics.

## Marker / Cheap Model Workflow

Use Marker for layout recovery, not as the final authority.

Recommended flow:
1. `raw PDF -> Marker Markdown/JSON`
2. deterministic parser extracts programme names and numeric fields
3. cheap model rewrites ambiguous table fragments into normalized JSON
4. validation script checks that every normalized row contains a source URL, institution, programme title, and score field
5. spot-check against the official PDF/HTML

Suggested model jobs:
- `classify_table_template`: identify whether table uses UQ/M/LQ, Average/Range, grouped rows, Chinese/English/Best-3, or institution-specific format.
- `normalize_score_row`: convert one table row or grouped row into canonical fields.
- `summarize_requirements`: compress official entrance requirement text into a short search-friendly summary.

Keep model output under review:
- never allow the model to invent missing score values
- keep `raw_score_text`
- mark uncertain rows with `source_confidence=needs_review`

## Canonical Score Fields

Use these fields even when a source only fills some of them:
- `upper_quartile`
- `median`
- `lower_quartile`
- `mean`
- `highest`
- `lowest_or_minimum_admitted`
- `score_range`
- `raw_score_text`
- `score_formula`
- `score_comparability_group`
- `source_confidence`

## First Extraction Targets

1. CSPE 2025/26 programme catalog: already captured.
2. CSPE 2025/26 detail HTML grouped by institution.
3. PolyU HKCC CSPE score PDF as a clean quartile parser test.
4. CUSCS CSPE score PDF as a grouped subject-score parser test.
5. JUPAS 2025 PDF as the first undergraduate parser test.

## Output Contract

The first spreadsheet should be `outputs/admissions_master_working.csv`.

It may contain blank score cells at first, but every row should include:
- `source_system`
- `academic_year`
- `institution`
- `programme_title`
- `award_level`
- `programme_url` when known
- `score_source_url`
- `raw_source_local_path`
- `source_confidence`

Rows become "usable for admissions comparison" only when at least one actual score field is populated and the scoring formula is marked known or partly known.
