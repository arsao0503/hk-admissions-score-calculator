# Scripts

Planned scripts:

1. `fetch_jupas_sources.*`
   - Download annual JUPAS admissions score PDFs.
   - Track source URL, local path, file size, and retrieved date.

2. `fetch_cspe_sources.*`
   - Query CSPE admission score filters.
   - Download official CSPE Excel/PDF outputs and programme detail pages.

3. `extract_scores.*`
   - Parse JUPAS and CSPE source documents into normalized CSV/JSON.
   - Preserve raw text snippets for auditability.

4. `validate_rows.*`
   - Spot-check extracted rows against programme pages and institution calculators.

## Implemented

### `fetch_cspe_programmes.py`

Fetches CSPE admission-score programme identities for one academic year from the public connector.

Example:

```bash
python3 scripts/fetch_cspe_programmes.py --year-code 2526 --page-size 200 --out data/processed/cspe_programmes_2025_26.json
```

Current result: 562 programme rows for 2025/26.

### `fetch_cspe_score_details.py`

Fetches CSPE admission-score detail HTML grouped by institution/provider.

Example smoke test:

```bash
python3 scripts/fetch_cspe_score_details.py --limit-institutions 2
```

Full 2025/26 fetch:

```bash
python3 scripts/fetch_cspe_score_details.py
```

This writes official score-detail HTML under `data/raw/cspe/details/2025_26/` and an index at `data/processed/cspe_score_detail_sources_2025_26.csv`.

### `build_cspe_master_seed.py`

Builds the first CSPE rows in the canonical combined table shape. Score cells remain blank until extraction is complete, but official programme links, score source links, and local raw detail HTML paths are populated.

Example:

```bash
python3 scripts/build_cspe_master_seed.py
```

Output: `outputs/admissions_master_working.csv`.

### `extract_cspe_detail_tables.py`

Expands CSPE score-detail HTML tables and writes a conservative raw score-row CSV.

Example:

```bash
python3 scripts/extract_cspe_detail_tables.py
```

Output: `data/processed/cspe_score_rows_raw_2025_26.csv`.

This is not the final normalized table. It is an audit-friendly extraction layer used before populating the master score fields.

### `fetch_jupas_sources.py`

Downloads official JUPAS annual admissions score PDFs.

Example:

```bash
python3 scripts/fetch_jupas_sources.py 2025
```
