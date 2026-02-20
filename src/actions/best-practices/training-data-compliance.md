# Training Data Copyright Compliance and Provenance

## Overview

Training data compliance is a growing regulatory focus across jurisdictions.
The EU AI Act, China's CAC GenAI measures, and emerging frameworks in Brazil
and the US all require varying degrees of transparency about training data
sources, copyright status, and data provenance.

## Regulatory Requirements by Jurisdiction

### EU (AI Act + Copyright Directive)

- **Article 53(1)(c)**: GPAI providers must put in place a policy to comply
  with Union copyright law, in particular to identify and comply with
  reservations of rights (opt-outs) expressed under Article 4(3) of the
  Copyright Directive
- **Article 53(1)(d)**: Draw up and make publicly available a sufficiently
  detailed summary about the content used for training
- **Text and Data Mining (TDM)**: Article 4 of the Copyright Directive allows
  TDM for any purpose, but rights holders can opt out. AI providers must
  respect these opt-outs (e.g., robots.txt, metadata)
- **GDPR**: If training data includes personal data, legal basis required.
  Data subject rights (erasure, access, objection) apply to training data.

### China (CAC GenAI Measures)

- **Article 7**: Training data must be lawfully obtained
- Intellectual property of training data must not be infringed
- Training data must not contain content prohibited by Chinese law
- Measures must be taken to improve the quality and accuracy of training data
- Data labeling rules must be formulated and quality assessment conducted

### UK

- ICO expects transparency about personal data use in training
- Text and data mining exception exists but is narrow
- Proposed broader TDM exception for AI training was withdrawn; current
  law requires rights holder permission except for research

### US Federal

- No comprehensive federal training data law
- Copyright Office studying AI training data copyright issues
- Fair use doctrine applies but is untested at scale for AI training
- NIST AI 600-1 identifies training data provenance as a GenAI risk area

### Brazil (AI Bill)

- Foundation model providers must disclose training data sources
- Transparency about data used in AI system development
- Personal data in training subject to LGPD

## Implementation: Training Data Inventory

### 1. Data Source Cataloguing

Create a comprehensive inventory of all training data sources:

- **Source identification**: URL, dataset name, provider, licence
- **Collection method**: API, web scrape, licensed download, user-generated,
  synthetic generation, government open data
- **Data type**: Text, images, audio, video, structured data, code
- **Volume**: Approximate size and record count
- **Date range**: When data was collected and the time period it covers
- **Personal data assessment**: Whether the source contains or could
  contain personal data

### 2. Copyright Status Assessment

For each data source, assess copyright status:

- **Public domain**: No copyright restrictions (government works,
  expired copyrights)
- **Open licence**: Creative Commons, MIT, Apache, etc. — document
  licence terms and any attribution requirements
- **Licensed**: Commercial licence obtained — document licence scope,
  restrictions, and expiry
- **Fair use / TDM exception**: Relying on legal exception — document
  the legal analysis supporting this
- **Rights holder opt-out**: Check for opt-out signals (robots.txt
  with AI crawler restrictions, metadata opt-out flags, rights
  reservation statements)
- **Unknown / needs assessment**: Flag for legal review

### 3. Opt-Out Mechanism

Implement and document rights holder opt-out:

- **Respect robots.txt**: Honour AI-specific crawl directives (e.g.,
  `User-agent: GPTBot`, `User-agent: CCBot`, etc.)
- **Metadata checking**: Check for machine-readable rights reservation
  in content metadata
- **Opt-out request process**: Provide a mechanism for rights holders
  to request removal of their content from training data
- **Compliance verification**: Regular audits of opt-out compliance

### 4. Personal Data in Training Data

If training data includes personal data:

- Document the legal basis for processing (GDPR, LGPD, etc.)
- Assess whether transparency obligations are met (Article 14 GDPR
  for data not collected directly from the data subject)
- Consider data minimisation (do you need personal data for training?)
- Implement mechanisms for data subject rights (access, erasure,
  objection) — noting the technical complexity for data encoded in
  model weights
- Consider anonymisation or pseudonymisation before training

## Training Data Disclosure Document

Prepare a disclosure document that satisfies cross-jurisdictional
requirements:

1. **Summary of training data sources**: General categories of data
   used (web text, books, code, images, etc.)
2. **Data collection methods**: How data was gathered
3. **Copyright compliance approach**: How copyright is respected,
   opt-out mechanisms, licensing
4. **Personal data handling**: Whether personal data is included,
   legal basis, data subject rights
5. **Data quality measures**: How data quality is assessed and
   maintained
6. **Data filtering**: What content was excluded and why
7. **Update frequency**: How often training data is refreshed

For China specifically, additionally document:
- Verification that training data complies with Chinese content laws
- Data labeling methodology and quality assessment
- Measures to ensure accuracy and completeness

## Common Pitfalls

- **Undocumented scraping**: Web scraping without documenting sources
  creates unmanageable copyright risk
- **Ignoring opt-outs**: Failing to respect robots.txt or rights
  reservation signals violates EU Copyright Directive
- **Assuming fair use**: Fair use is a defence, not a right — it is
  fact-specific and untested for large-scale AI training
- **Personal data in training data**: Not assessing whether training
  data contains personal data is a GDPR compliance gap
- **Static assessment**: Data sources change; opt-outs are added;
  licences expire — training data compliance needs periodic review
- **No provenance chain**: If you can't trace training data back to
  its source, you can't verify compliance
