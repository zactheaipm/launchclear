---
id: genai-training-disclosure
name: Training Data Disclosure and Compliance Report
jurisdiction: multi
legalBasis: "EU AI Act Article 53(1)(c)-(d), China CAC GenAI Measures Articles 7-8, Brazil AI Bill, California SB 942"
requiredSections:
  - training-data-sources
  - data-licensing
  - personal-data
  - copyrighted-works
  - opt-out-mechanisms
  - data-governance
  - cross-jurisdictional-table
---

# Training Data Disclosure and Compliance Report

**Organisation**: {{organisation_name}}
**AI system / model**: {{model_or_system_name}}
**Model version**: {{model_version}}
**Date prepared**: {{date_prepared}}
**Prepared by**: {{prepared_by}}
**Target markets**: {{target_markets}}
**Status**: DRAFT — Requires legal review

---

## 1. Training Data Sources

<!-- Describe all data sources used for pre-training, fine-tuning, and evaluation. EU AI Act Article 53(1)(d) requires a "sufficiently detailed summary about the content used for training." China CAC GenAI Measures Article 7 requires training data legality verification. -->

### 1.1 Overview of Training Data

{{training_data_overview}}

### 1.2 Data Source Inventory

| Source Name | Source Type | Volume | Acquisition Method | Date Range | Used For |
|-------------|-----------|--------|-------------------|------------|----------|
{{training_data_source_table}}

### 1.3 Data Source Categories

| Category | Included? | Description |
|----------|----------|-------------|
| Public web scrape | {{includes_web_scrape}} | {{web_scrape_description}} |
| Licensed datasets | {{includes_licensed}} | {{licensed_description}} |
| User-generated content | {{includes_ugc}} | {{ugc_description}} |
| Proprietary data | {{includes_proprietary}} | {{proprietary_description}} |
| Synthetic data | {{includes_synthetic}} | {{synthetic_description}} |
| Copyrighted works | {{includes_copyrighted}} | {{copyrighted_description}} |
| Personal data | {{includes_personal}} | {{personal_description}} |
| Government / public records | {{includes_government}} | {{government_description}} |
| Open-source datasets | {{includes_open_source}} | {{open_source_description}} |

### 1.4 Fine-Tuning Data (If Applicable)

{{fine_tuning_data_description}}

---

## 2. Data Licensing Status

<!-- Document the licensing and legal basis for each data source. EU AI Act Article 53(1)(c) requires a copyright compliance policy. China CAC GenAI Measures Article 7 requires lawful sourcing of training data. -->

### 2.1 Licensing Summary

{{licensing_summary}}

### 2.2 Per-Source Licensing

| Source Name | License Type | License Terms | Restrictions | Verification Date |
|-------------|-------------|---------------|-------------|-------------------|
{{licensing_table}}

### 2.3 Data Processing Agreements

{{data_processing_agreements}}

---

## 3. Personal Data in Training Data

<!-- GDPR Articles 6-7 (legal basis), Article 13-14 (transparency), Article 35 (DPIA). China CAC GenAI Measures Article 7(2) requires compliance with personal information protection laws. Brazil LGPD applies to personal data in training sets. -->

### 3.1 Personal Data Assessment

| Question | Response |
|----------|----------|
| Does training data contain personal data? | {{contains_personal_data}} |
| Categories of personal data included | {{personal_data_categories}} |
| Number of data subjects (estimated) | {{data_subject_count}} |
| Includes special category data (GDPR Art. 9)? | {{special_category_data}} |
| Includes data of minors? | {{minors_data}} |

### 3.2 Legal Basis for Processing

{{personal_data_legal_basis}}

### 3.3 Data Subject Rights Implementation

<!-- How data subjects can exercise their rights regarding training data (access, erasure, objection). -->

{{data_subject_rights_implementation}}

### 3.4 Data Minimization Measures

{{data_minimization_measures}}

### 3.5 Anonymization / Pseudonymization

{{anonymization_measures}}

---

## 4. Copyrighted Works

<!-- EU AI Act Article 53(1)(c) requires compliance with EU copyright law (Directive 2019/790), including identification and compliance with rights reservations under Article 4(3). US fair use analysis may also apply. -->

### 4.1 Copyright Assessment

| Question | Response |
|----------|----------|
| Does training data include copyrighted works? | {{includes_copyrighted_works}} |
| Types of copyrighted works included | {{copyrighted_work_types}} |
| Licensing status of copyrighted works | {{copyright_licensing_status}} |
| Text and data mining (TDM) reliance | {{tdm_reliance}} |

### 4.2 EU Text and Data Mining Compliance (Directive 2019/790)

<!-- Article 3: TDM exception for research organisations. Article 4: General TDM exception, subject to rights reservation (opt-out). Article 53(1)(c) of AI Act requires GPAI providers to comply. -->

#### 4.2.1 Rights Reservation (Opt-Out) Compliance

{{rights_reservation_compliance}}

#### 4.2.2 Identification of Opt-Out Works

{{opt_out_identification_process}}

#### 4.2.3 Technical Measures for TDM Compliance

{{tdm_technical_measures}}

### 4.3 US Copyright Considerations

{{us_copyright_considerations}}

### 4.4 Copyright Compliance Mechanisms

{{copyright_compliance_mechanisms}}

---

## 5. Opt-Out Mechanisms

<!-- Multiple jurisdictions require mechanisms for data subjects or rights holders to opt out of training data use. GDPR right to object (Article 21). EU AI Act rights reservation compliance. China CAC GenAI Measures require lawful data sourcing and respect for intellectual property. -->

### 5.1 Opt-Out Mechanisms Provided

| Mechanism | Available? | Description | Response Time |
|-----------|-----------|-------------|---------------|
| Data subject opt-out (personal data) | {{personal_opt_out_available}} | {{personal_opt_out_description}} | {{personal_opt_out_response_time}} |
| Rights holder opt-out (copyrighted works) | {{copyright_opt_out_available}} | {{copyright_opt_out_description}} | {{copyright_opt_out_response_time}} |
| robots.txt / machine-readable opt-out | {{robots_opt_out_available}} | {{robots_opt_out_description}} | {{robots_opt_out_response_time}} |
| API-based opt-out | {{api_opt_out_available}} | {{api_opt_out_description}} | {{api_opt_out_response_time}} |

### 5.2 Opt-Out Request Process

{{opt_out_process_description}}

### 5.3 Technical Implementation of Opt-Out

<!-- How opted-out data is removed from training sets. Challenges with model unlearning. -->

{{opt_out_technical_implementation}}

### 5.4 Record-Keeping for Opt-Out Requests

{{opt_out_record_keeping}}

---

## 6. Data Governance Measures

<!-- Describe data governance controls applied to training data throughout its lifecycle. EU AI Act Articles 10-11 (data governance for high-risk). China CAC GenAI Measures Article 7 (training data requirements). -->

### 6.1 Data Quality Controls

{{data_quality_controls}}

### 6.2 Bias Identification and Mitigation

{{bias_identification_measures}}

### 6.3 Data Filtering and Curation

<!-- What data was excluded from training and why. Content filtering, deduplication, toxicity filtering. -->

{{data_filtering_description}}

### 6.4 Data Provenance Tracking

{{data_provenance_tracking}}

### 6.5 Data Retention and Deletion

{{data_retention_policy}}

### 6.6 Security Measures for Training Data

{{training_data_security}}

---

## 7. Cross-Jurisdictional Disclosure Requirements

<!-- Summary table mapping disclosure obligations to each target jurisdiction. Different jurisdictions require different levels of training data disclosure. -->

### 7.1 Requirements Matrix

| Requirement | EU (AI Act) | EU (GDPR) | China (CAC) | UK | US Federal | California | Singapore | Brazil |
|-------------|-------------|-----------|-------------|-----|-----------|------------|-----------|--------|
| Training data summary (public) | {{eu_aia_summary}} | N/A | {{china_summary}} | {{uk_summary}} | {{us_fed_summary}} | {{ca_summary}} | {{sg_summary}} | {{br_summary}} |
| Copyright compliance policy | {{eu_aia_copyright}} | N/A | {{china_copyright}} | {{uk_copyright}} | {{us_fed_copyright}} | {{ca_copyright}} | {{sg_copyright}} | {{br_copyright}} |
| Personal data legal basis | {{eu_aia_personal}} | {{eu_gdpr_personal}} | {{china_personal}} | {{uk_personal}} | {{us_fed_personal}} | {{ca_personal}} | {{sg_personal}} | {{br_personal}} |
| Opt-out mechanism | {{eu_aia_optout}} | {{eu_gdpr_optout}} | {{china_optout}} | {{uk_optout}} | {{us_fed_optout}} | {{ca_optout}} | {{sg_optout}} | {{br_optout}} |
| Data source disclosure | {{eu_aia_sources}} | {{eu_gdpr_sources}} | {{china_sources}} | {{uk_sources}} | {{us_fed_sources}} | {{ca_sources}} | {{sg_sources}} | {{br_sources}} |
| Bias / representativeness | {{eu_aia_bias}} | N/A | {{china_bias}} | {{uk_bias}} | {{us_fed_bias}} | {{ca_bias}} | {{sg_bias}} | {{br_bias}} |

### 7.2 Jurisdiction-Specific Notes

#### EU AI Act (Articles 53(1)(c)-(d), Annex XI)

{{eu_ai_act_notes}}

#### EU GDPR (Articles 6, 13-14, 35)

{{eu_gdpr_notes}}

#### China — CAC Interim Measures for GenAI Services (Articles 7-8)

<!-- Article 7: Training data must be obtained through lawful means. Must not infringe intellectual property. Must comply with personal information protection laws. Article 8: Training data must be true, accurate, objective, and diverse. -->

{{china_cac_notes}}

#### United Kingdom — ICO AI Guidance, DSIT Foundation Model Principles

{{uk_notes}}

#### United States — NIST AI RMF, FTC Guidance

{{us_notes}}

#### California — SB 942

{{california_notes}}

#### Singapore — IMDA GenAI Governance Framework

{{singapore_notes}}

#### Brazil — AI Bill (PL 2338/2023), LGPD

{{brazil_notes}}

---

## 8. Public Disclosure Summary

<!-- EU AI Act Article 53(1)(d) requires GPAI providers to make publicly available a sufficiently detailed summary about the content used for training. This section is intended for public release. -->

### 8.1 Public Summary of Training Data

{{public_training_data_summary}}

### 8.2 Public Contact for Data Inquiries

{{public_data_contact}}

---

**REVIEW NOTES FOR LEGAL TEAM**:

{{review_notes}}

---

*This training data disclosure was generated by LaunchClear. Training data compliance requirements vary significantly across jurisdictions and are evolving rapidly — particularly the interaction between EU AI Act copyright provisions, GDPR data subject rights, and China's training data legality requirements. All content should be reviewed by qualified legal counsel for each target market. Technical claims about data governance should be verified by the data engineering team.*
