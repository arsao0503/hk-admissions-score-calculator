# HK Admissions Score Calculator

Static first version of a Hong Kong admissions score calculator.

## What It Does

- Converts HKDSE grades using the CSPE common scale: `5**=7, 5*=6, 5=5, 4=4, 3=3, 2=2, 1=1, U=0`.
- Calculates Best 5, Best 6, 4C + 2X, and a CSPE comparison score.
- Starts with 2 electives, supports adding more elective rows, and requires each elective to have both a subject name and grade before it is counted.
- Covers standard HKDSE Category A elective subjects and Mathematics extended modules in the subject selector.
- Checks common baseline eligibility patterns for sub-degree and local bachelor's routes.
- Filters CSPE / iPASS 2025/26 programmes by institution, award level, detailed subject category, keyword, and score distance.
- Shows only official score statistics present in the source row, such as Lower Quartile, Median, Mean, Upper Quartile, Highest, and Lowest / Minimum admitted. Missing official fields are omitted instead of filled with generated `N/A` values.
- JUPAS `Highest Attainable` is treated as a formula ceiling, not an admitted-score statistic, and is not used for matching or sorting.
- Links back to official programme and score sources when available.

## Data Build

Run from the project root:

```bash
python3 scripts/build_app_data.py
```

The script reads:

- `data/processed/cspe_score_rows_raw_2025_26.csv`
- `outputs/admissions_master_working.csv`

and writes:

- `app/assets/app-data.js`

## Local Preview

Because programme data is embedded as JavaScript, the app can be opened directly:

```bash
open app/index.html
```

For a server preview:

```bash
python3 -m http.server 5173 -d app
```

Then open `http://localhost:5173`.

## Caveats

This is a shortlist calculator, not a final admission decision tool. The current public app dataset is strongest for CSPE 2025/26 average scores. JUPAS quartile rows must be extracted from official JUPAS PDFs and kept under their own institution/programme formula scale; they should not be mixed with the CSPE common scale.
