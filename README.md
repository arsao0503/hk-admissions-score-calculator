# HK Admissions Score Integrator

## Purpose
Build a local, source-linked dataset and student-facing portal for Hong Kong HKDSE pathway planning. The first product focus is actual admissions scores and programme matching; the next expansion connects senior-secondary subject choice, interests, programme options, and graduate outcomes.

## Scope
- JUPAS undergraduate programmes, including UGC-funded and SSSDP programmes listed through JUPAS.
- CSPE / iPASS full-time locally accredited self-financing post-secondary programmes, especially Associate Degree, Higher Diploma, and self-financing undergraduate programmes.
- HKDSE-based score statistics such as Upper Quartile, Median, Lower Quartile, and CSPE common scoring statistics where available.

## Output Target
A consolidated table with one row per programme-year:

| Field | Notes |
| --- | --- |
| source_system | `jupas` or `cspe` |
| academic_year | e.g. `2025`, `2025/26` |
| institution | official institution name |
| programme_code | JUPAS code / CSPE provider-programme ID where available |
| programme_title | official programme title |
| award_level | Bachelor's Degree / Associate Degree / Higher Diploma / etc. |
| area_of_study | official area / faculty / subject grouping where available |
| funding_category | UGC-funded / SSSDP / self-financing |
| score_formula | official score formula / weighting notes |
| upper_quartile | if published |
| median | if published |
| lower_quartile | if published |
| min_or_other_score | only where a source publishes it clearly |
| entrance_requirements | HKDSE minimum / specific subject requirements |
| programme_description | short official description or curriculum summary |
| programme_url | official programme page |
| score_source_url | official score PDF / page |
| notes | caveats, interview, special weighting, not comparable warnings |

## Working Rule
Use official sources first. Third-party sites may be used only as discovery aids and must be verified against JUPAS, CSPE, or individual institution pages before entering final outputs.

## Current Deliverables

- `docs/sources.md` - official source map for JUPAS, CSPE/iPASS, E-APP, and institution score pages.
- `docs/data-model.md` - normalized table design for scores, requirements, programme descriptions, source audit, and future RAG.
- `docs/collection-plan.md` - collection, extraction, validation, and output workflow.
- `docs/extraction-plan.md` - concrete extraction approach for JUPAS PDFs, CSPE detail HTML/PDF, Marker, and cheap model-assisted normalization.
- `docs/implementation-plan.md` - plan for building a Cloudflare Pages / Workers admissions search and RAG site.
- `docs/dse-student-portal-plan.md` - product plan for expanding the calculator into a DSE subject-choice, programme, career, and graduate-outcome portal.
- `app/` - local static HKDSE score calculator and CSPE programme finder prototype.
- `outputs/admissions_master_schema.csv` - canonical spreadsheet header for the combined table.
- `outputs/admissions_master_working.csv` - first combined-table working file when generated.

## Recommended MVP

1. Keep the HKDSE score calculator reliable as the anchor tool.
2. Add source-linked programme detail pages.
3. Add subject-choice and interest exploration for junior secondary students.
4. Add graduate outcome / salary context with clear source caveats.
5. Add AI answer/RAG only after the structured dataset is reliable.

The product should answer practical admissions questions with citations, but the score table should remain the source of truth. RAG is useful for explanations and comparison, not for inventing score thresholds.
