# Data Model

## Tables

### `programmes`
- `id`
- `source_system`
- `institution`
- `institution_chinese`
- `programme_code`
- `programme_title`
- `programme_title_chinese`
- `award_level`
- `area_of_study`
- `funding_category`
- `mode_of_study`
- `normal_duration`
- `tuition_fee`
- `programme_url`
- `active_academic_year`

### `admission_scores`
- `id`
- `programme_id`
- `academic_year`
- `score_system`
- `score_formula`
- `upper_quartile`
- `median`
- `lower_quartile`
- `min_or_other_score`
- `score_source_url`
- `raw_score_text`
- `notes`
- `formula_status`
- `selection_notes`

### `requirements`
- `id`
- `programme_id`
- `academic_year`
- `general_requirements`
- `chinese_requirement`
- `english_requirement`
- `math_requirement`
- `citizenship_requirement`
- `elective_requirements`
- `specific_subject_requirements`
- `interview_or_portfolio`
- `requirements_source_url`

### `programme_descriptions`
- `id`
- `programme_id`
- `academic_year`
- `summary`
- `curriculum_highlights`
- `career_or_articulation_notes`
- `description_source_url`

### `source_documents`
- `id`
- `source_system`
- `source_url`
- `local_path`
- `retrieved_at`
- `document_year`
- `document_type`
- `notes`

### `rag_chunks`
- `id`
- `programme_id`
- `source_document_id`
- `chunk_type`
- `chunk_text`
- `source_url`
- `source_title`
- `retrieved_at`
- `embedding_model`
- `embedding_vector_id`

Use RAG chunks for explanation and source-grounded answers. Do not use embedding similarity as the canonical filter for numeric score questions; filter the structured `admission_scores` table first.

## Normalization Rules

- Keep raw source files under `data/raw/`.
- Keep extracted normalized tables under `data/processed/` when created.
- Preserve original score text in `raw_score_text` if PDF extraction is imperfect.
- Do not convert scores across institutions by default.
- Use separate fields for actual score statistics and minimum entrance requirements.

## Canonical Combined Table

The first export should be one row per programme-year, using `outputs/admissions_master_schema.csv` as the header. It can later be split into database tables, but the spreadsheet view is useful for manual review.

Important score fields:
- `upper_quartile`
- `median`
- `lower_quartile`
- `mean`
- `highest`
- `lowest_or_minimum_admitted`
- `score_formula`
- `score_formula_url`

Important decision fields:
- `score_comparability_group`
- `formula_status`
- `selection_notes`
- `requirements_summary`
- `source_confidence`
