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

## Recommended Fixes
- Merge extracted CSPE/JUPAS score fields back into `outputs/admissions_master_working.csv` or rename it clearly as catalog seed only.
- Review CSPE provider rows with blank `mean` and placeholder `-` score text; many appear to be officially unpublished scores, but some rows look like table-row merge problems.
- Manually inspect the possible merged CSPE titles before trusting those rows in search/matching.
- Manually spot-check JUPAS rows without reference score against the official PDF pages before treating them as complete.
