# Source Map

## JUPAS

### Actual admission scores
- JUPAS official admissions score page: https://www.jupas.edu.hk/en/page/detail/3667/
- 2025 JUPAS admissions scores PDF: https://www.jupas.edu.hk/f/page/3667/af_2025_JUPAS.pdf

The JUPAS score PDFs are the main source for actual admission score statistics across the 9 JUPAS participating institutions. They are applicable to local JUPAS applicants only and the data is provided by the respective institutions.

Important caveat: score formulas, subject weightings, and scales differ by institution and programme. Do not compare raw scores across institutions unless the scoring system is identical.

### Programme requirements and links
- JUPAS programmes offered: https://www.jupas.edu.hk/en/programmes-offered/
- JUPAS SSSDP programmes: https://www.jupas.edu.hk/en/programme/sssdp/

Programme pages usually include:
- JUPAS catalogue number
- programme title
- funding category
- minimum entrance requirements
- subject-specific requirements
- application / offer statistics
- official programme or admissions links

## CSPE / iPASS

### Actual admission scores
- CSPE Admission Scores search: https://www.cspe.edu.hk/en/admission-scores/
- CSPE score PDFs are served under:
  `https://feddcs.cspe.edu.hk/ShareFile/pdf/{lang}/admission_score/{academicYearNoSlash}/IF_adm_score_{startYear}_{providerIdNoSlash}.pdf`

Example:
- https://feddcs.cspe.edu.hk/ShareFile/pdf/en/admission_score/202526/IF_adm_score_2025_HU02.pdf

The CSPE page exposes:
- academic year
- institution
- area of study
- undergraduate / sub-degree filters
- Associate Degree / Higher Diploma filters
- PDF and Excel downloads
- programme detail links

The underlying connector observed on 2026-05-27:
- Academic years: `https://www.cspe.edu.hk/connector/en/concourse/adm_default/academic-year?code=adm_default`
- Institutions: `https://www.cspe.edu.hk/connector/en/concourse/institution/list?...`
- Study areas: `https://www.cspe.edu.hk/connector/en/concourse/study-area?...`
- Level of study: `https://www.cspe.edu.hk/connector/en/concourse/level-of-study?...`
- Programmes: `https://www.cspe.edu.hk/connector/en/concourse/admission-scores/programmes?...`

The public page should remain the canonical route. Connector endpoints are useful for automation but may change.

Observed on 2026-05-27:
- `2025/26` CSPE admission-score programme search returned 562 programme rows when queried with empty filters.
- CSPE level filters include `Bachelor's Degree`, `Higher Diploma`, and `Associate Degree`.
- Study-area filters include 14 categories, including Computer Science and Information Technology, Business and Management, Medicine / Dentistry / Health Sciences, Social Sciences, Services, and Arts / Design / Performing Arts.
- The page download buttons call `/concourse/admission-scores/download-pdf` and `/concourse/admission-scores/download-excel`; for automation use the public page as canonical and connector calls as implementation detail.

### Programme requirements and descriptions
- CSPE / iPASS programme search and details are linked from each admission-score result.
- General CSPE application information: https://www.cspe.edu.hk/en/institution/application-information-and-admission-arrangement/

Programme detail pages usually include:
- academic year
- programme type
- area of study and training
- exit award
- mode of delivery
- normal duration
- tuition fee
- application period
- programme webpage
- curriculum content
- normal entry requirements

## Institution-Level Score Calculators / Score Pages

Use these for formula verification and institution-specific caveats:

- HKU JUPAS: https://admissions.hku.hk/apply/jupas
- CUHK admission grades PDF: https://admission.cuhk.edu.hk/wp-content/uploads/2025/05/Admission-Grades-2025.pdf
- HKUST JUPAS: https://join.hkust.edu.hk/admissions/jupas/
- CityUHK JUPAS score calculator: https://www.cityu.edu.hk/admo/jupas-score-calculator
- PolyU JUPAS: https://www.polyu.edu.hk/study/ug/admissions/jupas
- HKBU JUPAS score calculator: https://iss.hkbu.edu.hk/ams_jpscal/
- EdUHK JUPAS scores: https://www.apply.eduhk.hk/ug/jupas_scores
- HKMU JUPAS: https://admissions.hkmu.edu.hk/ug/jupas/

## Interpretation Notes

For quartile statistics:
- Upper Quartile: score at the upper 25% position among admitted students.
- Median: middle admitted-student score.
- Lower Quartile: score at the lower 25% position among admitted students.

Lower Quartile is not the minimum admitted score. It is a better reference point than minimum requirements, but it is still not a guarantee because band choice, interview, subject results, weighting, and yearly applicant strength can change outcomes.

## Discovery-Only Sources

Third-party sites such as school forums, media tables, KongPaper-like score aggregators, and tutoring-centre summaries may be useful to discover missing programme names or old-year files. They should not be loaded into final outputs unless their values are checked against official JUPAS, CSPE, E-APP, or institution pages.
