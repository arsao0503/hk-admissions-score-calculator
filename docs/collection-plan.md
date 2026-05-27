# Collection Plan

## Source Priority

1. Actual admission score statistics.
2. Programme-specific entrance requirements.
3. Programme description, award, duration, fee, and official link.
4. Articulation / senior-year pathway notes, if explicitly published.

Do not mix these into one free-text field. A user should be able to filter by actual score first, then open the requirements and programme explanation.

## Phase 1: Source Capture
1. Download JUPAS annual admissions score PDFs for available years, starting with 2025.
2. Capture JUPAS programme pages for current-year programme requirements and official links.
3. Download CSPE admission-score Excel/PDF outputs for all programmes, starting with 2025/26.
4. Capture CSPE programme detail pages for current-year descriptions and entry requirements.

Minimum raw files to keep for each annual refresh:
- JUPAS annual score PDFs.
- CSPE admission-score Excel/PDF exports for all filters or all programmes.
- CSPE programme search JSON/XML snapshots.
- JUPAS programme page snapshots for requirements.
- Institution score formula pages or PDFs.

## Phase 2: Extraction
1. Parse JUPAS PDF tables into structured rows.
2. Parse CSPE Excel or PDF tables into structured rows.
3. Extract programme URLs and descriptions from JUPAS/CSPE programme detail pages.
4. Store source URLs and local raw file paths for every extracted row.

Suggested extraction order:
1. CSPE connector rows, because they expose programme IDs and provider IDs cleanly.
2. CSPE score-detail HTML, because it exposes the official tables shown behind the public "Details" button.
3. CSPE institution PDFs, for verification and for cases where the HTML table structure is too ambiguous.
4. JUPAS PDF tables, with institution-specific parser rules where needed.
5. JUPAS programme pages, for requirements and official links.

Current extraction status as of 2026-05-27:
- CSPE 2025/26 programme catalog captured: 562 rows.
- CSPE 2025/26 provider detail HTML captured: 29 provider files.
- First-pass CSPE raw score rows extracted: 589 rows, marked `official_html_extracted_needs_review`.
- JUPAS 2025 admissions score PDF downloaded, not yet parsed.

## Phase 3: Validation
1. Spot-check each institution against its own score calculator or admissions page.
2. Flag rows where score formula or weighting is unclear.
3. Flag programmes with interview, portfolio, subject weighting, or non-score selection criteria.
4. Keep `Lower Quartile` separate from minimum scores.

## Phase 4: User-Facing Output
1. Produce a searchable CSV / spreadsheet.
2. Produce a short guide explaining score interpretation.
3. Optional: build a small local search page for filtering by institution, score band, award level, and area of study.

## Validation Checklist

- Every row has `source_system`, `academic_year`, `institution`, `programme_title`, `award_level`, and at least one official source URL.
- Score statistics and minimum entrance requirements are separate.
- Rows with missing `score_formula` are marked `formula_status=unknown`.
- Rows with interview / portfolio / subject weighting are marked in `selection_notes`.
- JUPAS and CSPE scores are not ranked together unless the same formula is confirmed.
- A sample of each institution is manually checked against the official PDF/page after extraction.
