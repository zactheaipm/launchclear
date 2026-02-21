---
id: dpia-gdpr
name: GDPR Data Protection Impact Assessment
jurisdiction: eu-gdpr
legalBasis: "Articles 35-36, GDPR"
requiredSections:
  - processing-description
  - necessity-proportionality
  - risk-assessment
  - risk-mitigation
  - dpo-consultation
  - data-subject-views
  - lawful-basis-analysis
  - data-retention-schedule
  - international-data-transfers
---

# Data Protection Impact Assessment (DPIA)

**Regulation**: General Data Protection Regulation (EU) 2016/679, Articles 35-36
**Date prepared**: {{date_prepared}}
**Prepared by**: {{prepared_by}}
**DPO consulted**: {{dpo_consulted}}
**Status**: DRAFT — Requires legal review

---

## 1. Description of Processing Operations

<!-- Article 35(7)(a): A systematic description of the envisaged processing operations and the purposes of the processing, including, where applicable, the legitimate interest pursued by the controller. -->

### 1.1 Overview of the AI System

{{system_overview}}

### 1.2 Purpose of Processing

{{processing_purpose}}

### 1.3 Categories of Data Subjects

{{data_subject_categories}}

### 1.4 Categories of Personal Data Processed

{{personal_data_categories}}

### 1.5 Data Sources

{{data_sources}}

### 1.6 Recipients of Personal Data

{{data_recipients}}

### 1.7 Data Retention Periods

{{retention_periods}}

### 1.8 Technical Description of Processing

{{technical_description}}

### 1.9 Data Flows

{{data_flow_description}}

---

## 2. Assessment of Necessity and Proportionality

<!-- Article 35(7)(b): An assessment of the necessity and proportionality of the processing operations in relation to the purposes. -->

### 2.1 Legal Basis for Processing

{{legal_basis}}

### 2.2 Necessity Assessment

{{necessity_assessment}}

### 2.3 Proportionality Assessment

{{proportionality_assessment}}

### 2.4 Data Minimisation

{{data_minimisation}}

### 2.5 Purpose Limitation

{{purpose_limitation}}

### 2.6 Storage Limitation

{{storage_limitation}}

### 2.7 Data Quality and Accuracy

{{data_quality}}

---

## 3. Assessment of Risks to Rights and Freedoms

<!-- Article 35(7)(c): An assessment of the risks to the rights and freedoms of data subjects. -->

### 3.1 Identified Risks

| Risk | Likelihood | Severity | Risk Level | Affected Right |
|------|-----------|----------|------------|----------------|
{{risk_table}}

### 3.2 Risk to Right of Non-Discrimination

{{non_discrimination_risk}}

### 3.3 Risk to Right of Explanation (Article 22)

{{explanation_risk}}

### 3.4 Risk of Automated Decision-Making

{{automated_decision_risk}}

### 3.5 Risk to Confidentiality and Data Security

{{confidentiality_risk}}

### 3.6 Risk to Data Subject Autonomy

{{autonomy_risk}}

### 3.7 Risks Specific to AI Processing

{{ai_specific_risks}}

---

## 4. Measures to Address Risks

<!-- Article 35(7)(d): The measures envisaged to address the risks, including safeguards, security measures and mechanisms to ensure the protection of personal data. -->

### 4.1 Technical Measures

{{technical_measures}}

### 4.2 Organisational Measures

{{organisational_measures}}

### 4.3 Safeguards for Automated Decision-Making

{{automated_decision_safeguards}}

### 4.4 Data Subject Rights Implementation

| Right | Implementation | Notes |
|-------|---------------|-------|
| Right of access (Art. 15) | {{access_implementation}} | |
| Right to rectification (Art. 16) | {{rectification_implementation}} | |
| Right to erasure (Art. 17) | {{erasure_implementation}} | |
| Right to restriction (Art. 18) | {{restriction_implementation}} | |
| Right to data portability (Art. 20) | {{portability_implementation}} | |
| Right to object (Art. 21) | {{objection_implementation}} | |
| Right re automated decisions (Art. 22) | {{article22_implementation}} | |

### 4.5 Security Measures

{{security_measures}}

### 4.6 International Transfer Safeguards

{{transfer_safeguards}}

---

## 5. Consultation

### 5.1 Data Protection Officer Consultation

{{dpo_consultation_details}}

### 5.2 Data Subject Views

{{data_subject_views}}

### 5.3 Prior Consultation with Supervisory Authority

<!-- Article 36: If the DPIA indicates high risk that cannot be mitigated, prior consultation with the supervisory authority is required. -->

{{supervisory_authority_consultation}}

---

## 6. Compliance Demonstration

### 6.1 GDPR Principles Compliance

| Principle | Article | Compliance Status | Evidence |
|-----------|---------|-------------------|----------|
| Lawfulness, fairness, transparency | Art. 5(1)(a) | {{lawfulness_status}} | {{lawfulness_evidence}} |
| Purpose limitation | Art. 5(1)(b) | {{purpose_status}} | {{purpose_evidence}} |
| Data minimisation | Art. 5(1)(c) | {{minimisation_status}} | {{minimisation_evidence}} |
| Accuracy | Art. 5(1)(d) | {{accuracy_status}} | {{accuracy_evidence}} |
| Storage limitation | Art. 5(1)(e) | {{storage_status}} | {{storage_evidence}} |
| Integrity and confidentiality | Art. 5(1)(f) | {{integrity_status}} | {{integrity_evidence}} |
| Accountability | Art. 5(2) | {{accountability_status}} | {{accountability_evidence}} |

### 6.2 Residual Risk Assessment

{{residual_risk_assessment}}

---

## 7. Review and Sign-Off

### 7.1 Review Schedule

{{review_schedule}}

### 7.2 Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Data Controller | {{controller_name}} | {{controller_date}} | |
| DPO | {{dpo_name}} | {{dpo_date}} | |
| AI/ML Lead | {{ml_lead_name}} | {{ml_lead_date}} | |

---

**REVIEW NOTES FOR LEGAL TEAM**:

{{review_notes}}

---

## 8. Lawful Basis Analysis

### 8.1 Primary Legal Basis (Article 6)
{{LAWFUL_BASIS_ASSESSMENT}}

### 8.2 Special Category Data (Article 9)
{{SPECIAL_CATEGORY_BASIS}}

### 8.3 Legitimate Interest Balancing Test (if Article 6(1)(f) relied upon)
{{LEGITIMATE_INTEREST_ASSESSMENT}}

## 9. Data Retention Schedule

| Data Category | Retention Period | Legal Basis for Retention | Deletion Process |
|---|---|---|---|
| {{DATA_CATEGORY_1}} | {{RETENTION_PERIOD_1}} | {{RETENTION_BASIS_1}} | {{DELETION_PROCESS_1}} |
| {{DATA_CATEGORY_2}} | {{RETENTION_PERIOD_2}} | {{RETENTION_BASIS_2}} | {{DELETION_PROCESS_2}} |

### 9.1 Retention Review Process
{{RETENTION_REVIEW_PROCESS}}

## 10. International Data Transfers

### 10.1 Transfer Mapping
{{TRANSFER_MAP}}

### 10.2 Transfer Mechanism Assessment
{{TRANSFER_MECHANISM}}

### 10.3 Supplementary Measures (post-Schrems II)
{{SUPPLEMENTARY_MEASURES}}

---

*This DPIA was generated by LaunchClear. All content should be reviewed by qualified legal counsel before submission to supervisory authorities. Legal basis determinations and risk assessments require professional legal judgement.*
