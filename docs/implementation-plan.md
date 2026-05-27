# Implementation Plan

## Product Goal

Create a Hong Kong admissions search tool that combines JUPAS undergraduate and CSPE / iPASS self-financing post-secondary programme data. The first useful version should be a source-linked score table. The later AI layer should answer questions using structured filters plus cited source snippets.

## Core User Questions

- My DSE score is around X. Which programmes are realistic, borderline, or high-risk?
- Which Associate Degree / Higher Diploma programmes have actual admitted-score statistics?
- What are the subject requirements for this programme?
- What is the difference between Lower Quartile, Median, Upper Quartile, minimum requirement, and actual admitted score?
- Which official page should I open before applying?

## Architecture Recommendation

Primary recommendation: Cloudflare Pages + Workers.

Use Cloudflare because the workload is read-heavy, source-linked, and does not need a heavy server at the start.

Suggested stack:
- Frontend: Cloudflare Pages, Astro or Next.js static export.
- API: Cloudflare Workers.
- Structured data: Cloudflare D1 for normalized programme and score tables.
- Raw/source files: Cloudflare R2 for PDFs, Excel files, and captured HTML.
- Vector search: Cloudflare Vectorize for RAG chunks.
- AI gateway/model calls: Workers AI or OpenAI-compatible external provider via Cloudflare AI Gateway.
- Scheduled refresh: Cloudflare Cron Triggers.

Vercel is a good secondary option for the frontend, especially if using Next.js server components. It is less ideal as the primary data platform unless paired with Supabase/Neon + object storage + a vector DB. For this project, Cloudflare is cleaner because Pages, Workers, D1, R2, Vectorize, and cron can live in one operational surface.

## Data Pipeline

1. Fetch
   - Download JUPAS annual score PDFs.
   - Query CSPE admission-score connector filters.
   - Fetch CSPE score-detail HTML through the official detail endpoint.
   - Download CSPE institution score PDFs for verification and fallback extraction.
   - Capture programme detail pages.

2. Extract
   - Parse CSPE connector rows into programme IDs and provider IDs.
   - Parse CSPE detail HTML and institution PDFs into score rows.
   - Parse JUPAS PDFs with institution-specific table rules.
   - Use Marker to convert PDFs into Markdown/JSON before parsing.
   - Use cheap model-assisted phrasing only for ambiguous table fragments, grouped rows, and requirement summaries.
   - Extract JUPAS and CSPE requirements from programme pages.

3. Normalize
   - Store programme identity separately from annual admission score.
   - Keep minimum requirements separate from actual admitted-score statistics.
   - Add source URLs and raw source references to every row.

4. Validate
   - Spot-check samples per institution.
   - Flag unknown score formula.
   - Flag interview, portfolio, subject weighting, or other non-score selection criteria.

5. Publish
   - Write CSV/JSON artifacts for review.
   - Load normalized tables into D1.
   - Generate RAG chunks only from source-linked rows and official pages.

## RAG Design

Use hybrid retrieval:

1. Structured pre-filter
   - award level
   - institution
   - area of study
   - score band
   - lower quartile / median / upper quartile
   - subject requirements

2. Vector retrieval
   - programme descriptions
   - score formula notes
   - entrance requirement text
   - articulation notes

3. Answer composer
   - Return direct table results first.
   - Explain caveats with citations.
   - Never invent missing scores.
   - Say when a score is not comparable across institutions.

Example policy:
- If the user asks "20 分入唔入到 nursing?", first filter structured score rows for Nursing / Health Sciences, then explain using LQ/Median and cite score source pages.
- If the user asks "AD 有咩讀?", use area and award filters first, then RAG for descriptions.

## MVP Milestones

### Milestone 1: Local Dataset
- Finalize combined CSV schema.
- Fetch all CSPE 2025/26 programme rows.
- Extract at least one full CSPE institution score PDF/Excel as a parser test.
- Extract JUPAS 2025 score PDF into rough structured rows.

### Milestone 2: Searchable Table
- Build static table with filters.
- Add source links and warning labels.
- Export CSV for manual use.

### Milestone 3: Cloudflare App
- Import normalized data into D1.
- Serve search API from Workers.
- Deploy frontend to Pages.
- Store source files in R2.

### Milestone 4: RAG
- Chunk official programme pages and score notes.
- Store embeddings in Vectorize.
- Add an AI answer endpoint with citation enforcement.
- Add a "show source rows" panel beside every AI answer.

## Platform Comparison

| Platform | Fit | Notes |
| --- | --- | --- |
| Cloudflare Pages + Workers + D1 + R2 + Vectorize | Best current fit | Low-ops, good for search APIs, scheduled refresh, object storage, and RAG in one stack. |
| Vercel + Supabase/Neon + storage + vector DB | Good secondary | Better if you want Next.js ergonomics. More moving parts for data/RAG. |
| Supabase full stack | Good data backend | Strong Postgres and pgvector. Pair with Vercel/Cloudflare frontend. |
| Railway/Fly.io VPS-style app | Flexible | Useful if PDF extraction needs heavier server-side processing, but more ops. |
| Plain static site | Good first prototype | Works for CSV/JSON table search, but not enough for user accounts or dynamic RAG. |

## Practical Recommendation

Start locally with CSV/JSON and scripts. Then deploy:

1. Cloudflare Pages for the UI.
2. Cloudflare Workers API for search and AI.
3. D1 for structured rows.
4. R2 for raw PDFs/Excel/HTML snapshots.
5. Vectorize only after table search is already correct.

Do not start with RAG as the main product. Admissions score questions are mostly structured-data questions; RAG should explain and cite, not replace the table.

## Extraction Runtime Recommendation

Do not run heavy PDF extraction inside Cloudflare Workers. Workers should orchestrate and serve; extraction should run in a separate batch environment.

Best near-term setup:
- local Mac / cron during development
- GitHub Actions scheduled job for light refresh checks
- small Fly.io / Railway / Hetzner / Render worker only if Marker/PDF extraction needs a persistent Linux runtime

Marker role:
- convert JUPAS and CSPE PDFs into Markdown/JSON
- keep page-level references
- pass recovered tables to deterministic parsers

Cheap model role:
- normalize awkward table text into JSON
- rewrite official requirements into concise summaries
- classify table format

Suggested cheap models:
- Gemini Flash class models for table normalization
- GPT-4.1 mini / GPT-4o mini-class models for JSON normalization and requirement summaries
- local small model only for low-stakes classification, not final numeric extraction

Validation rule:
- model output cannot be accepted unless the numeric values also appear in `raw_score_text` or source table text
- each accepted row needs `source_confidence=official_extracted` or `official_needs_review`

## Deployment Choice

Use Cloudflare as the primary deployment if the first product is a search/RAG knowledge tool:
- Pages for UI
- Workers for APIs
- D1 for structured score data
- R2 for PDFs, CSVs, HTML snapshots
- Vectorize for source snippets and programme descriptions
- AI Gateway for model routing and cost control

Use Vercel as secondary if:
- the frontend becomes a heavy Next.js app
- you want faster UI iteration with a familiar Next ecosystem
- the data layer is moved to Supabase/Neon anyway

Avoid putting the whole pipeline on Vercel serverless functions if Marker/PDF extraction is central. It can work, but cold starts, file handling, and timeout limits make it less clean than a batch worker plus Cloudflare/Supabase storage.
