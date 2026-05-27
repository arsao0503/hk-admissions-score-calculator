# Source Manifest

Retrieved seed files on 2026-05-27.

## JUPAS

| Year | Source | Local file | Notes |
| --- | --- | --- | --- |
| 2025 | https://www.jupas.edu.hk/f/page/3667/af_2025_JUPAS.pdf | `data/raw/jupas/af_2025_JUPAS.pdf` | Official JUPAS admissions scores of the 9 JUPAS participating institutions. |

## CSPE

| Academic Year | Source | Local file | Notes |
| --- | --- | --- | --- |
| 2025/26 | https://feddcs.cspe.edu.hk/ShareFile/pdf/en/admission_score/202526/IF_adm_score_2025_HU02.pdf | `data/raw/cspe/IF_adm_score_2025_HU02.pdf` | Seed sample from CSPE PDF pattern for extraction testing. |
| 2025/26 | https://www.cspe.edu.hk/connector/en/concourse/admission-scores/programmes?academicYear=2526... | `data/processed/cspe_programmes_2025_26.json` | 562 CSPE admission-score programme identities fetched from public connector on 2026-05-27. |
| 2025/26 | https://www.cspe.edu.hk/connector/en/concourse/admission-scores/detail | `data/raw/cspe/details/2025_26/*.html` | 29 provider-level official score-detail HTML files fetched by selected programme IDs on 2026-05-27. |

## Discovery Endpoints

| Source | URL | Notes |
| --- | --- | --- |
| JUPAS admissions score index | https://www.jupas.edu.hk/en/page/detail/3667/ | Annual PDFs, 2012 onward shown on page. |
| JUPAS programme search | https://www.jupas.edu.hk/en/programmes-offered/ | Programme requirements and programme pages. |
| JUPAS SSSDP programme list | https://www.jupas.edu.hk/en/programme/sssdp/ | JUPAS-covered SSSDP programmes. |
| CSPE admission score search | https://www.cspe.edu.hk/en/admission-scores/ | Search and download admission statistics for self-financing programmes. |
| CSPE academic-year connector | https://www.cspe.edu.hk/connector/en/concourse/adm_default/academic-year?code=adm_default | Observed XML response listing available years. |

## Generated Review Outputs

| Output | Path | Notes |
| --- | --- | --- |
| CSPE 2025/26 programme catalog | `outputs/cspe_programmes_2025_26_catalog.csv` | Lightweight programme list generated from the connector snapshot; not yet enriched with scores. |
| Master schema | `outputs/admissions_master_schema.csv` | Canonical header for the future combined JUPAS + CSPE score table. |
| CSPE detail source index | `data/processed/cspe_score_detail_sources_2025_26.csv` | Maps 29 providers to local score-detail HTML files and official institution score PDFs. |
| CSPE raw score rows | `data/processed/cspe_score_rows_raw_2025_26.csv` | First-pass expanded table extraction from official CSPE detail HTML; needs review before final normalization. |
| Working master table | `outputs/admissions_master_working.csv` | 562 CSPE seed rows in the canonical table shape, with programme links and score-source links. |
