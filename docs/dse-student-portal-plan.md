# DSE Student Portal Product Plan

## Direction

The current calculator is useful once a student already knows their HKDSE score and wants to compare programmes. The next product should become a decision portal for students who are still choosing subjects, exploring interests, or trying to understand what a programme may lead to after graduation.

Working positioning:

> A Hong Kong DSE pathway planner that connects interests, senior-secondary subject choices, admission likelihood, programme options, and graduate outcomes with source-linked data.

The product should not promise that one subject combination or degree guarantees a salary. It should show evidence, explain uncertainty, and help students ask better questions earlier.

## Target Users

### Junior secondary students

Students in S1-S3 who need to understand:

- what senior secondary subjects exist
- what each subject actually studies
- which interests and strengths match which subjects
- how subject choices can open or limit later programme options
- what careers and further-study paths are commonly related

### DSE candidates

Students in S4-S6 who need to:

- estimate admissions competitiveness from HKDSE score
- understand programme weighting / multiplier / selection formula
- compare JUPAS, SSSDP, Associate Degree, Higher Diploma, and self-financing options
- plan Band A / B / C choices with risk labels
- understand programme-specific subject requirements

### Parents / teachers / counsellors

Adults who need:

- source-linked explanations instead of forum rumours
- quick comparison between routes
- salary and employment data with caveats
- printable or shareable shortlists

## Product Pillars

### 1. Admissions Score Calculator

Keep the current calculator as the anchor. It should remain fast, practical, and score-first.

Enhancements:

- saved subject profile in browser storage
- compare programmes side by side
- show why a programme is labelled `較穩陣`, `接近平均`, `挑戰`, or `只供參考`
- separate `actual admitted score statistics`, `minimum requirements`, and `subject weighting`
- export / share a shortlist

### 2. Interest-to-Subject Explorer

This is the main junior-secondary feature.

Flow:

1. Student selects interests, preferred learning style, strengths, disliked activities, and career curiosities.
2. System maps them to DSE subjects and Applied Learning areas.
3. It shows suggested subject clusters, not a single answer.
4. Each cluster links to possible JUPAS / sub-degree areas and common career fields.

Suggested interest dimensions:

- people / service / counselling
- business / money / markets
- coding / systems / engineering
- science / health / lab work
- writing / languages / communication
- design / media / performance
- society / history / policy
- sport / physical performance
- hospitality / travel / customer experience

Output should be cautious:

- `Strongly related`
- `Useful but not required`
- `Usually not required, but may help`
- `Check programme-specific requirement`

### 3. Subject Syllabus Library

Each HKDSE subject should have a student-friendly subject page.

Fields:

- subject name
- category: core / elective / Applied Learning / other language
- EDB / HKEAA official source links
- what you study
- assessment components
- skills trained
- common misconceptions
- workload / exam-style notes
- related programme areas
- related career fields
- whether it is often required, preferred, or weighted by programmes

Start with Category A subjects and Mathematics M1/M2. Add Applied Learning as a second phase because ApL has many course variants and provider-specific details.

### 4. Programme-to-Career Pages

Every programme card should eventually link to a richer programme detail page:

- admission score history
- selection formula / weighting
- subject requirements
- curriculum highlights
- possible articulation / professional recognition
- common graduate industries / occupations
- salary references when available
- source confidence and last updated date

Important rule: salary data should be attached to the most specific reliable level available:

1. programme-specific official GES, if published
2. faculty / school / department-level official GES
3. institution-level official GES
4. UGC broad academic programme category salary data

Never imply that a specific programme has a salary figure if the source only gives an institution-wide or broad discipline figure.

### 5. Career & Salary Explorer

This should be a separate area, not squeezed inside the score calculator.

Views:

- by broad academic category
- by institution
- by programme area
- by career field
- salary trend over years
- employment / further study / seeking employment split

Recommended first dataset:

- UGC Data.gov average annual salaries by level of study and broad academic programme category
- official institution Graduate Employment Survey summaries
- JUPAS institution prospect pages where they summarize graduate outcomes

Display caveats:

- survey response rate
- whether data is mean or median
- whether salary is monthly or annual
- whether the sample is full-time employed only
- whether medical / education / professional programmes distort the average

### 6. Pathway Planner

A guided workflow that combines everything:

1. `我係初中生，想揀科`
2. `我已有 DSE predicted grade`
3. `我想知某個職業 / 行業要讀咩`
4. `我想比較幾個 programme`

For each workflow, the portal should produce:

- suggested subjects or programmes
- why they match
- what to verify manually
- official source links
- next action checklist

## Information Architecture

Recommended top-level navigation:

- `計分器`
- `選科探索`
- `課程搜尋`
- `科目資料庫`
- `出路與薪資`
- `升學路線`

Suggested page structure:

- `/app/` current calculator
- `/subjects/` subject syllabus library
- `/interests/` interest-to-subject explorer
- `/programmes/` searchable programme index
- `/programmes/:code/` programme detail
- `/careers/` career and salary explorer
- `/pathways/` guided route planner
- `/sources/` source methodology and caveats

## Data Model Extensions

### `subjects`

- `id`
- `subject_code`
- `subject_name_en`
- `subject_name_zh`
- `category`
- `key_learning_area`
- `study_scope_summary`
- `assessment_summary`
- `skills`
- `official_edb_url`
- `official_hkeaa_url`
- `active_from_year`
- `active_to_year`
- `notes`

### `interest_tags`

- `id`
- `label_zh`
- `label_en`
- `description`
- `student_friendly_prompt`

### `subject_interest_links`

- `subject_id`
- `interest_tag_id`
- `relationship_strength`
- `reason`
- `source_type`

### `programme_subject_links`

- `programme_id`
- `subject_id`
- `relationship_type`
- `weighting_or_multiplier`
- `requirement_status`
- `source_url`
- `academic_year`

`relationship_type` examples:

- `required`
- `preferred`
- `weighted`
- `useful_background`
- `not_required`

### `graduate_outcomes`

- `id`
- `institution`
- `programme_id`
- `academic_year`
- `data_level`
- `broad_academic_category`
- `employment_rate`
- `further_study_rate`
- `seeking_employment_rate`
- `mean_monthly_salary`
- `median_monthly_salary`
- `mean_annual_salary`
- `median_annual_salary`
- `sample_size`
- `response_rate`
- `source_url`
- `source_confidence`
- `notes`

`data_level` examples:

- `programme`
- `department`
- `faculty`
- `institution`
- `ugc_broad_category`

### `career_fields`

- `id`
- `career_field_name_zh`
- `career_field_name_en`
- `description`
- `related_subjects`
- `related_programme_areas`
- `common_entry_routes`
- `notes`

## Source Map

### Curriculum / subject sources

- EDB Subjects under the Eight Key Learning Areas: https://www.edb.gov.hk/en/curriculum-development/kla/overview.html
- EDB Secondary Education Curriculum Guide: https://www.edb.gov.hk/en/curriculum-development/major-level-of-edu/secondary/CG_documents.html
- EDB Life Planning Information Website: https://lifeplanning.edb.gov.hk/en/parents/junior-senior-secondary-level.html
- HKEAA HKDSE Subject Information: https://www.hkeaa.edu.hk/en/hkdse/assessment/subject_information/
- EDB Senior Secondary curriculum renewal / M1-M2 recognition notes: https://www.edb.gov.hk/en/curriculum-development/kla/ma/optimising_measures_ep.html

### Graduate outcomes / salary sources

- UGC / Data.gov average annual salaries: https://data.gov.hk/en-data/dataset/hk-ugc-ugc-average-annual-salaries-graduates
- UGC CSV direct source: https://www.ugcs.gov.hk/datagovhk/Average_Annual_Salaries_FT_Employment(Eng).csv
- HKU Graduate Employment Survey: https://www.cedars.hku.hk/careers/graduate-employment-survey
- CUHK 2024 graduate profile: https://cpdc.osa.cuhk.edu.hk/sites/cu_joblink/files/Profile_2024.pdf
- HKUST UG GES 2024 survey findings: https://career-new.ust.hk/web/public/documents/SurveyFindings_UG_2024.pdf
- EdUHK Graduate Employment Survey: https://www.eduhk.hk/sao/en/info/publication_and_surveys/graduate_employment_survey
- HKBU Graduate Employment Survey: https://sa.hkbu.edu.hk/en/career/Resources/Graduate-Employment-Survey.html
- PolyU Graduate Employment Survey: https://www.polyu.edu.hk/sao/careers-and-placement-section/employer-services/graduate-recruitment/graduate-employment-survey
- CityUHK Graduate Employment Survey: https://www.cityu.edu.hk/clc/ges/report/
- JUPAS institution graduate prospects pages, e.g. HKBU: https://www.jupas.edu.hk/en/about-jupas-participating-institutions/hkbu/prospects-of-graduates

## MVP Roadmap

### Phase 1: Portal foundation

Goal: make the current app feel like the first tool inside a larger portal.

Build:

- homepage / portal shell
- current calculator as `計分器`
- source methodology page
- programme detail route skeleton
- subject data schema
- graduate outcome schema

### Phase 2: Subject and interest MVP

Goal: support junior secondary students choosing senior-secondary subjects.

Build:

- subject library for Category A subjects
- interest questionnaire
- subject cluster recommendation
- subject pages with syllabus summaries and official links
- subject-to-programme-area mapping

### Phase 3: Graduate outcome MVP

Goal: make programme choice less score-only.

Build:

- import UGC salary CSV
- import selected official GES summaries
- show salary and employment caveats
- add career / outcome panels to programme pages
- compare broad categories, not just institutions

### Phase 4: Guided pathway planner

Goal: turn the portal into a decision assistant.

Build:

- junior-secondary workflow
- DSE candidate workflow
- career-first workflow
- shareable / printable shortlist
- source-linked next action checklist

### Phase 5: AI explanation layer

Goal: answer natural-language questions without losing source discipline.

Build only after structured data is reliable:

- cited answer panel
- RAG over source-linked official text
- structured filters before free-text retrieval
- no invented salary / score / requirement policy

## Implementation Priorities

Recommended next build order:

1. Add a proper portal navigation shell around the existing calculator.
2. Add `/subjects/` with 5-8 pilot subject pages: Biology, Chemistry, Physics, Economics, BAFS, ICT, Geography, Visual Arts.
3. Add `data/processed/graduate_outcomes_ugc_salary.csv` from the UGC CSV.
4. Add a career/outcome panel to programme cards, initially using broad academic category data only.
5. Add an interest questionnaire that maps to subject clusters and programme areas.

## Product Guardrails

- Do not rank subjects only by salary.
- Do not say a subject is required unless the official programme requirement says so.
- Do not compare salary figures without showing data level and source year.
- Do not hide uncertainty: show `programme-level`, `faculty-level`, `institution-level`, or `broad-category` beside each outcome figure.
- Keep official source links visible.
- Keep score, subject choice, and career outcome as connected but distinct decisions.
