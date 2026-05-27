# Data Audit - 2026-05-28

## Summary
- App data programmes: 916
- App data by source: {'CSPE': 562, 'JUPAS': 354}
- App data confidence: {'official_html_extracted_needs_review': 562, 'official_pdf_extracted_needs_review': 354}
- App rows without comparable score: 96
- App rows without score source link: 0

## Source Tables
- CSPE extracted score rows: 589
- CSPE rows missing mean score: 47
- CSPE rows that look like placeholder/no published score rows: 39
- CSPE rows with possible merged programme titles: 41
- JUPAS extracted score rows: 354
- JUPAS rows missing reference score: 2
- JUPAS rows missing median or lower quartile: 25
- JUPAS rows with extracted subject weighting / multiplier notes: 48
- JUPAS rows whose selection formula itself contains multiplier syntax: 52

JUPAS subject weighting rows by institution:

- The Chinese University of Hong Kong: 48

JUPAS formula-multiplier rows by institution:

- The University of Hong Kong: 28
- The Education University of Hong Kong: 24

## Master CSV Warning
`outputs/admissions_master_working.csv` currently has 562 rows and source confidence:

- catalog_only_needs_score_extraction: 562

Score fields filled in master CSV:

- upper_quartile: 0
- median: 0
- lower_quartile: 0
- mean: 0
- highest: 0
- lowest_or_minimum_admitted: 0

This means the app is using `data/processed/*` for score display, but the master working CSV has not been merged back with the extracted score rows yet.

## No-Score Sample
- CSPE | Hong Kong Chu Hai College | Bachelor of Arts (Honours) in Chinese Literature
- CSPE | Hong Kong Chu Hai College | Bachelor of Arts (Honours) in Creation in Chinese Literary Arts
- CSPE | Hong Kong Chu Hai College | Bachelor of Arts (Honours) in Criminology and Criminal Justice Programme
- CSPE | Hong Kong Chu Hai College | Bachelor of Arts (Honours) in English Studies
- CSPE | Hong Kong Chu Hai College | Bachelor of Business Administration (Honours)
- CSPE | Hong Kong Chu Hai College | Bachelor of Business Administration (Honours) in Finance and Information Management
- CSPE | Hong Kong Chu Hai College | Bachelor of Commerce (Honours) in Accounting and Banking
- CSPE | Hong Kong Chu Hai College | Bachelor of Engineering (Honours) in Civil Engineering
- CSPE | Hong Kong Chu Hai College | Bachelor of Engineering (Honours) in Construction Engineering and Management
- CSPE | Hong Kong College of Technology | Higher Diploma in Computer Studies (Mobile Applications and Game Development)
- CSPE | Hong Kong College of Technology | Higher Diploma in Creative Design and Media (Moving Image)
- CSPE | Hong Kong College of Technology | Higher Diploma in Creative Design and Media (Visual Communication)

## Possible CSPE Extraction Issues
- Hong Kong College of Technology | Higher Diploma in Creative Design and Media (Moving Image) Higher Diploma in Creative Design and Media (Visual Communication) Higher Diploma in Interior Design Higher Diploma in Music Production for Creative Industries
- Hong Kong College of Technology | Higher Diploma in Computer Studies (Mobile Applications and Game Development) Higher Diploma in Industrial Internet of Things
- Hong Kong College of Technology | Higher Diploma in Language and Corporate Communication (Japanese) Higher Diploma in Language and Corporate Communication (Korean)
- Hong Kong College of Technology | Higher Diploma in Tourism Management (Airline Services) Higher Diploma in Tourism Management (Culinary) Higher Diploma in Tourism Management (Hospitality)
- Hong Kong Metropolitan University | Bachelor of Science with Honours in Building Engineering and Management Bachelor of Science with Honours in Construction Management and Quantity Surveying (Full-time)
- Hong Kong Metropolitan University | Bachelor of Science with Honours in Building Engineering and Management Bachelor of Science with Honours in Construction Management and Quantity Surveying (Full-time)
- Hong Kong Metropolitan University | Bachelor of Science with Honours in Building Engineering and Management Bachelor of Science with Honours in Construction Management and Quantity Surveying (Full-time)
- Hong Kong Metropolitan University | Bachelor of Arts with Honours in Creative Advertising and Media Design Bachelor of Arts with Honours in Creative Writing and Film Arts (Full-time) Bachelor of Arts with Honours in New Music and Interactive Entertainment (Full-time) Bachelor of Fine Arts with Honours in Animation and Visual Effects (Full-time) Bachelor of Fine Arts with Honours in Imaging Design and Digital Art (Full-time)
- Hong Kong Metropolitan University | Bachelor of Arts with Honours in Creative Advertising and Media Design Bachelor of Arts with Honours in Creative Writing and Film Arts (Full-time) Bachelor of Arts with Honours in New Music and Interactive Entertainment (Full-time) Bachelor of Fine Arts with Honours in Animation and Visual Effects (Full-time) Bachelor of Fine Arts with Honours in Imaging Design and Digital Art (Full-time)
- Hong Kong Metropolitan University | Bachelor of Arts with Honours in Creative Advertising and Media Design Bachelor of Arts with Honours in Creative Writing and Film Arts (Full-time) Bachelor of Arts with Honours in New Music and Interactive Entertainment (Full-time) Bachelor of Fine Arts with Honours in Animation and Visual Effects (Full-time) Bachelor of Fine Arts with Honours in Imaging Design and Digital Art (Full-time)
- Hong Kong Metropolitan University | Bachelor of Applied Psychology with Honours, Bachelor of Business Management with Honours Bachelor of Business Administration with Honours in Aviation Services Management (Full-time) Bachelor of Business Administration with Honours in Business Management Bachelor of Business Administration with Honours in Finance and Financial Technology (Full-time) Bachelor of Business Administration with Honours in Global Business Bachelor of Business Administration with Honours in Global Marketing and Supply Chain Management (Full-time) Bachelor of Business Administration with Honours in Human Resource Management Bachelor of Business Administration with Honours in Marketing Bachelor of Business Administration with Honours in Professional Accounting Bachelor of Business Administration with Honours in Real Estate and Surveying
- Hong Kong Metropolitan University | Bachelor of Applied Psychology with Honours, Bachelor of Business Management with Honours Bachelor of Business Administration with Honours in Aviation Services Management (Full-time) Bachelor of Business Administration with Honours in Business Management Bachelor of Business Administration with Honours in Finance and Financial Technology (Full-time) Bachelor of Business Administration with Honours in Global Business Bachelor of Business Administration with Honours in Global Marketing and Supply Chain Management (Full-time) Bachelor of Business Administration with Honours in Human Resource Management Bachelor of Business Administration with Honours in Marketing Bachelor of Business Administration with Honours in Professional Accounting Bachelor of Business Administration with Honours in Real Estate and Surveying

## JUPAS Missing Reference Score Sample
- City University of Hong Kong | JS1300 | Integrative Bioscience & Bioengineering Programme (Bio3) (Features: Free Choice of Major / Overseas Research Opportunities / Interdisciplinary)
- The University of Hong Kong | JS6236 | Bachelor of Arts and Sciences in Design+

## JUPAS Subject Weighting / Multiplier Sample
- The Chinese University of Hong Kong | JS4018 | Chinese Language and Literature | • Chinese (x 1.2)
- The Chinese University of Hong Kong | JS4032 | English | • English (x 1.5)
- The Chinese University of Hong Kong | JS4094 | Philosophy | • Chinese and English must be included
- The Chinese University of Hong Kong | JS4136 | Chinese Studies | • English (x 1.25)
- The Chinese University of Hong Kong | JS4238 | Insurance, Financial and Actuarial Analysis | • English (x 1.25) • Mathematics (x 1.5) • M1/M2 (x 1.5) • The best one subject of Chemistry, Physics, Economics or ICT (x 1.25)
- The Chinese University of Hong Kong | JS4252 | Quantitative Finance | • English (x 2) • Mathematics (x 2) • The best one subject of M1/M2, Chemistry, Physics or Economics (x 1.5)
- The Chinese University of Hong Kong | JS4254 | Programme in Global Economics and Finance | • English must be included
- The Chinese University of Hong Kong | JS4264 | BBA(IBBA) – JD Double Degree Programme | • English (x 2) • Chinese, English and Mathematics must be included
- The Chinese University of Hong Kong | JS4276 | Quantitative Finance and Risk Management Science | • English (x 2) • Mathematics (x 2) • The best one subject of M1/M2, Chemistry, Physics or Economics (x 1.5)
- The Chinese University of Hong Kong | JS4760 | Interdisciplinary Data Analytics & X Double Major Programme | • Mathematics (x 1.5) • M1 or M2 (x 2) • Economics or ICT (x 1.5)
- The Chinese University of Hong Kong | JS4331 | BA (Chinese Language Studies) and BEd (Chinese Language Education) | • Chinese (x 2) • Chinese must be included
- The Chinese University of Hong Kong | JS4343 | BA (English Studies) and BEd (English Language Education) | • English (x 2) • English must be included
- The Chinese University of Hong Kong | JS4361 | BEd in Mathematics and Mathematics Education | • Mathematics (x 2) • M1 or M2 (x 2) • Chinese or English (x 1.5) • The best one subject of Physics, Economics or ICT (x 1.5) • Mathematics and M1/M2 must be included
- The Chinese University of Hong Kong | JS4386 | BSc in Learning Design and Technology | • Mathematics (x 1.5) • M1 or M2 (x 1.5) • Biology, Chemistry, Physics, DAT, ICT, BAFS, Economics, Geography, Tech and Living (FST) (x 1.5)
- The Chinese University of Hong Kong | JS4408 | Mechanical and Automation Engineering | • Mathematics (x 1.5) • M1 or M2 (x 1.5) • Physics (x 1.5) • Biology, Chemistry, DAT, ICT (x 1.25)
- The Chinese University of Hong Kong | JS4412 | Computer Science and Engineering | • Mathematics (x 1.5) • M1 or M2 (x 1.75) • Biology, Chemistry, Physics, DAT, ICT (x 1.5)
- The Chinese University of Hong Kong | JS4416 | Computational Data Science | • Mathematics (x 2) • M1 or M2 (x 2) • Biology, Chemistry, Physics, Economics, ICT (x 1.5)
- The Chinese University of Hong Kong | JS4428 | Financial Technology | • English (x 1.25) • Chinese (x 1.25) • Mathematics (x 1.75) • M1 or M2 (x 1.75) • Biology, Chemistry, Physics, BAFS, Economics, ICT (x 1.5)

## JUPAS Selection Formula Multiplier Sample
- The Education University of Hong Kong | JS8001 | BA in Creative and Digital Arts and BEd (Music) | Music (x1.5) Specified ApL subject(s) (x1.5)
- The Education University of Hong Kong | JS8002 | BA in Creative and Digital Arts and BEd (Visual Arts) | Visual Arts (x1.5) Specified ApL subject(s) (x1.5)
- The Education University of Hong Kong | JS8003 | BA in Digital Chinese Culture and Communication and BEd (Chinese Language) | Chinese Language (x1.5) English Language (x1.5) Chinese Literature (x1.5) ICT (x1.5)
- The Education University of Hong Kong | JS8004 | BA in English Studies and Digital Communication and BEd (English Language) | English Language (x1.5) ICT (x1.5) Literature in English (x1.5)
- The Education University of Hong Kong | JS8005 | BA in Heritage Education and Arts Management and BEd (Chinese History) | Chinese History (x1.5) History (x1.5)
- The Education University of Hong Kong | JS8006 | BSocSc in Psychology and BEd (Early Childhood Education) | Chinese Language (x1.5) English Language (x1.5) Specified ApL subjects (x1.5)
- The Education University of Hong Kong | JS8007 | BA in Personal Finance and BEd (Business, Accounting and Financial Studies) | BAFS, Economics (x1.5) Specified ApL subject(s) (x1.5)
- The Education University of Hong Kong | JS8008 | BSc in Artificial Intelligence and Educational Technology and BEd (Information and Communication Technology and Primary Science) | Math, M1/M2 (x1.5) ICT (x1.5) Biology, Chemistry, Physics (x1.5) Combined Science (x1.5) Integrated Science (x1.5) Specified ApL subject(s) (x1.5)
- The Education University of Hong Kong | JS8009 | BSc in Artificial Intelligence and Educational Technology and BEd (Primary Mathematics) | Math, M1/M2 (x1.5) Physics (x1.5) Specified ApL subject(s) (x1.5)
- The Education University of Hong Kong | JS8010 | BSc in Sports Science and Coaching and BEd (Physical Education) | Physical Education (x1.5)
- The Education University of Hong Kong | JS8011 | BSc in Integrated Environmental Management and BEd (Science) | Chemistry (x1.5) Biology (x1.3) Physics (x1.2) Math, M1/M2 (x1.1) Geography (x1.1)
- The Education University of Hong Kong | JS8012 | BSocSc in Sociology and Community Studies and BEd (Geography) | English (x1.5) Geography (x1.5)
- The Education University of Hong Kong | JS8013 | BSocSc in Sociology and Community Studies and BEd (Primary Humanities) | Chinese History (x1.5) Economics (x1.5) Geography (x1.5) History (x1.5) Specified ApL subject(s) (x1.5)
- The Education University of Hong Kong | JS8663 | BA in Special Education | Chinese Language (x1.5) English Language (x1.5)
- The Education University of Hong Kong | JS8674 | BA in Digital Chinese Culture and Communication | Chinese Language (x1.5) Chinese Literature (x1.5) ICT (x1.5)
- The Education University of Hong Kong | JS8675 | BA in English Studies and Digital Communication | English Language (x1.5) ICT (x1.5) Literature in English (x1.5)
- The Education University of Hong Kong | JS8685 | BA in Creative and Digital Arts (Music) | Music (x1.5) Specified ApL subjects (x1.5)
- The Education University of Hong Kong | JS8686 | BA in Creative and Digital Arts (Visual Arts) | Visual Arts (x1.5) Specified ApL subjects (x1.5)

## Recommended Fixes
- Merge extracted CSPE/JUPAS score fields back into `outputs/admissions_master_working.csv` or rename it clearly as catalog seed only.
- Review CSPE provider rows with blank `mean` and placeholder `-` score text; many appear to be officially unpublished scores, but some rows look like table-row merge problems.
- Manually inspect the possible merged CSPE titles before trusting those rows in search/matching.
- Manually spot-check JUPAS rows without reference score against the official PDF pages before treating them as complete.
- Spot-check extracted JUPAS subject weighting rows against the official PDF, especially programmes with high weighted totals.
