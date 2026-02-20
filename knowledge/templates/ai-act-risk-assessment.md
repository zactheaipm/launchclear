---
id: ai-act-risk-assessment
name: EU AI Act Risk Classification and Conformity Assessment
jurisdiction: eu-ai-act
legalBasis: "Articles 6-7, 8-15, 43-44, Annex III, EU AI Act"
requiredSections:
  - system-description
  - risk-classification
  - conformity-requirements
  - risk-management
  - compliance-status
---

# EU AI Act Risk Classification and Conformity Assessment

**Regulation**: Regulation (EU) 2024/1689 (EU AI Act)
**Date prepared**: {{date_prepared}}
**Prepared by**: {{prepared_by}}
**AI System Name**: {{system_name}}
**Provider/Deployer**: {{provider_or_deployer}}
**Status**: DRAFT — Requires legal review

---

## 1. AI System Description

### 1.1 System Overview

{{system_overview}}

### 1.2 Intended Purpose

<!-- Article 3(12): The intended purpose is the use for which an AI system is intended by the provider, including the specific context and conditions of use, as specified in the information supplied by the provider. -->

{{intended_purpose}}

### 1.3 System Architecture and Methodology

{{system_architecture}}

### 1.4 Input and Output Data

{{input_output_data}}

### 1.5 Users and Affected Persons

{{users_and_affected_persons}}

### 1.6 Deployment Context

{{deployment_context}}

---

## 2. Risk Classification

### 2.1 Prohibited Practice Assessment (Article 5)

| Prohibited Practice | Article | Applicable? | Justification |
|---------------------|---------|-------------|---------------|
| Social scoring by public authorities | Art. 5(1)(c) | {{social_scoring_applicable}} | {{social_scoring_justification}} |
| Subliminal/manipulative techniques | Art. 5(1)(a) | {{subliminal_applicable}} | {{subliminal_justification}} |
| Exploitation of vulnerabilities | Art. 5(1)(b) | {{exploitation_applicable}} | {{exploitation_justification}} |
| Real-time remote biometric ID in public spaces | Art. 5(1)(h) | {{biometric_id_applicable}} | {{biometric_id_justification}} |
| Emotion recognition in workplace/education | Art. 5(1)(f) | {{emotion_applicable}} | {{emotion_justification}} |
| Biometric categorisation for sensitive attributes | Art. 5(1)(g) | {{bio_categorisation_applicable}} | {{bio_categorisation_justification}} |
| Untargeted facial recognition scraping | Art. 5(1)(e) | {{facial_scraping_applicable}} | {{facial_scraping_justification}} |
| Predictive policing with profiling | Art. 5(1)(d) | {{predictive_policing_applicable}} | {{predictive_policing_justification}} |

**Prohibited practice conclusion**: {{prohibited_conclusion}}

### 2.2 High-Risk Assessment (Articles 6-7, Annex III)

#### 2.2.1 Annex III Category Assessment

| Annex III Category | Applicable? | Justification |
|--------------------|-------------|---------------|
| 1. Biometrics | {{annex_iii_1_applicable}} | {{annex_iii_1_justification}} |
| 2. Critical infrastructure | {{annex_iii_2_applicable}} | {{annex_iii_2_justification}} |
| 3. Education and vocational training | {{annex_iii_3_applicable}} | {{annex_iii_3_justification}} |
| 4. Employment and worker management | {{annex_iii_4_applicable}} | {{annex_iii_4_justification}} |
| 5. Essential services (credit, insurance, benefits) | {{annex_iii_5_applicable}} | {{annex_iii_5_justification}} |
| 6. Law enforcement | {{annex_iii_6_applicable}} | {{annex_iii_6_justification}} |
| 7. Migration, asylum, border control | {{annex_iii_7_applicable}} | {{annex_iii_7_justification}} |
| 8. Justice and democratic processes | {{annex_iii_8_applicable}} | {{annex_iii_8_justification}} |

#### 2.2.2 Article 6(3) Exception Assessment

<!-- Article 6(3) allows Annex III systems to NOT be classified as high-risk if they do not pose a significant risk of harm. -->

| Exception Criterion | Met? | Justification |
|---------------------|------|---------------|
| Performs narrow procedural task | {{narrow_task_met}} | {{narrow_task_justification}} |
| Improves result of previously completed human activity | {{improves_human_met}} | {{improves_human_justification}} |
| Detects decision-making patterns without replacing assessment | {{pattern_detect_met}} | {{pattern_detect_justification}} |
| Preparatory task for assessments in Annex III use cases | {{preparatory_met}} | {{preparatory_justification}} |

**Article 6(3) exception applies**: {{exception_conclusion}}

### 2.3 Limited-Risk / Transparency Obligations (Articles 50-52)

| Transparency Obligation | Applicable? | Justification |
|------------------------|-------------|---------------|
| AI interaction disclosure (Art. 50(1)) | {{interaction_disclosure_applicable}} | {{interaction_disclosure_justification}} |
| Synthetic content marking (Art. 50(2)) | {{synthetic_marking_applicable}} | {{synthetic_marking_justification}} |
| Deepfake disclosure (Art. 50(4)) | {{deepfake_disclosure_applicable}} | {{deepfake_disclosure_justification}} |
| Emotion recognition disclosure (Art. 50(3)) | {{emotion_disclosure_applicable}} | {{emotion_disclosure_justification}} |

### 2.4 Classification Conclusion

**Risk classification**: {{risk_classification}}
**Justification**: {{classification_justification}}
**Applicable Annex III categories**: {{applicable_categories}}
**Applicable provisions**: {{applicable_provisions}}

---

## 3. Conformity Requirements (High-Risk Systems)

<!-- Only applicable if classified as high-risk. Articles 8-15. -->

### 3.1 Risk Management System (Article 9)

{{risk_management_system}}

### 3.2 Data and Data Governance (Article 10)

{{data_governance}}

### 3.3 Technical Documentation (Article 11)

{{technical_documentation}}

### 3.4 Record-Keeping / Logging (Article 12)

{{record_keeping}}

### 3.5 Transparency and Information to Deployers (Article 13)

{{transparency_to_deployers}}

### 3.6 Human Oversight (Article 14)

{{human_oversight}}

### 3.7 Accuracy, Robustness, Cybersecurity (Article 15)

{{accuracy_robustness_cybersecurity}}

---

## 4. Conformity Assessment Procedure (Articles 43-44)

### 4.1 Applicable Procedure

{{conformity_procedure}}

### 4.2 Internal Control (Annex VI)

{{internal_control}}

### 4.3 Third-Party Assessment (Annex VII)

<!-- Required for biometric identification systems (Article 43(1)). -->

{{third_party_assessment}}

### 4.4 EU Declaration of Conformity (Article 47)

{{declaration_of_conformity}}

### 4.5 CE Marking (Article 48)

{{ce_marking}}

### 4.6 EU Database Registration (Article 49)

{{database_registration}}

---

## 5. Compliance Timeline

| Obligation | Deadline | Status | Notes |
|-----------|----------|--------|-------|
| Prohibited practice compliance | 2 February 2025 | {{prohibited_status}} | {{prohibited_notes}} |
| GPAI obligations (if applicable) | 2 August 2025 | {{gpai_status}} | {{gpai_notes}} |
| High-risk system compliance | 2 August 2026 | {{high_risk_status}} | {{high_risk_notes}} |
| Annex I product safety | 2 August 2027 | {{annex_i_status}} | {{annex_i_notes}} |

---

## 6. Gap Analysis and Remediation Plan

### 6.1 Current Compliance Gaps

{{compliance_gaps}}

### 6.2 Remediation Actions

| Gap | Required Action | Priority | Estimated Effort | Deadline |
|-----|----------------|----------|-----------------|----------|
{{remediation_table}}

---

**REVIEW NOTES FOR LEGAL TEAM**:

{{review_notes}}

---

*This risk assessment was generated by LaunchClear. Risk classification determinations under the EU AI Act require professional legal and technical judgement. All content should be reviewed by qualified counsel before reliance.*
