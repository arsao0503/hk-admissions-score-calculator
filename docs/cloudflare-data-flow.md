# Cloudflare Data Flow

## Components

- `crawler-worker`: scheduled Worker that checks official source pages and queues refresh jobs.
- `extractor`: local or containerized job for PDF/Excel parsing. Keep this outside Workers if extraction libraries are too heavy.
- `D1`: normalized relational tables for programmes, scores, and requirements.
- `R2`: raw files and generated artifacts.
- `Vectorize`: embeddings for official descriptions and explanatory notes.
- `search-worker`: public API for filters, programme detail, and AI answers.
- `Pages`: frontend.

## Request Flow

1. User searches by score, award level, subject area, and institution.
2. Worker queries D1 with deterministic filters.
3. UI shows table rows, score caveats, and official links.
4. If user asks an AI question, Worker retrieves the relevant D1 rows first.
5. Worker retrieves related Vectorize chunks from the selected programmes and source docs.
6. AI answer cites the official source URLs and exposes the matching rows.

## Refresh Flow

1. Cron trigger checks source manifest and last modified headers.
2. New raw documents are saved to R2 and local project storage during development.
3. Extractor writes normalized CSV/JSON.
4. Validation checks run.
5. Approved data is imported to D1 and chunks are embedded into Vectorize.

## Why This Split

Cloudflare Workers are excellent for serving and orchestrating. Heavy PDF extraction may be awkward inside Workers, so the robust design is to run extraction locally or in a small batch environment, then upload clean artifacts to Cloudflare.
