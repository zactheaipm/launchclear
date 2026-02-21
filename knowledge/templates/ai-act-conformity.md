---
id: ai-act-conformity
name: EU AI Act Conformity Assessment Outline
jurisdiction: eu-ai-act
legalBasis: "EU AI Act Articles 43-44, Annex VI/VII"
requiredSections:
  - system-identification
  - conformity-procedure
  - risk-management-compliance
  - data-governance-compliance
  - technical-documentation
  - logging-compliance
  - transparency-compliance
  - human-oversight-compliance
  - accuracy-robustness
  - declaration-of-conformity
---

# EU AI Act Conformity Assessment Outline

**Regulation**: EU AI Act (Regulation (EU) 2024/1689), Articles 43-44, Annex VI and Annex VII
**System name**: {{system_name}}
**System version**: {{system_version}}
**Provider**: {{provider_name}}
**Risk classification**: {{risk_classification}}
**Date prepared**: {{date_prepared}}
**Prepared by**: {{prepared_by}}
**Status**: DRAFT — Requires legal review

---

## 1. System Identification

### 1.1 AI System Description

{{system_description}}

### 1.2 Intended Purpose

<!-- Article 6: The intended purpose determines the risk classification and applicable conformity procedure. -->

{{intended_purpose}}

### 1.3 Risk Classification

| Field | Value |
|-------|-------|
| Risk tier | {{risk_tier}} |
| Annex III category | {{annex_iii_category}} |
| Annex III area | {{annex_iii_area}} |
| Justification | {{classification_justification}} |

### 1.4 Provider Information

| Field | Value |
|-------|-------|
| Legal name | {{provider_legal_name}} |
| Registered address | {{provider_address}} |
| Authorised representative (if non-EU) | {{authorised_representative}} |
| Contact person | {{contact_person}} |
| EU database registration number | {{eu_database_registration}} |

### 1.5 Applicable Conformity Procedure

<!-- Article 43: High-risk AI systems referred to in Annex III generally follow internal control (Annex VI). Systems intended for biometric identification (Annex III point 1) require third-party conformity assessment (Annex VII) unless harmonised standards or common specifications are applied. -->

| Field | Value |
|-------|-------|
| Applicable procedure | {{conformity_procedure}} |
| Self-assessment (Annex VI) | {{annex_vi_applicable}} |
| Third-party assessment (Annex VII) | {{annex_vii_applicable}} |
| Notified body (if Annex VII) | {{notified_body}} |
| Harmonised standards applied | {{harmonised_standards}} |
| Common specifications applied | {{common_specifications}} |

---

## 2. Conformity Procedure Details

### 2.1 Internal Control (Annex VI)

<!-- Annex VI: The provider verifies that the established quality management system is in compliance with the requirements of this Regulation, and examines the information in the technical documentation to assess the compliance of the AI system with the relevant essential requirements. -->

{{#if_jurisdiction annex-vi}}

#### 2.1.1 Quality Management System Verification

{{qms_verification}}

#### 2.1.2 Technical Documentation Examination

{{technical_documentation_examination}}

#### 2.1.3 Internal Assessment Conclusion

{{internal_assessment_conclusion}}

{{/if_jurisdiction}}

### 2.2 Third-Party Conformity Assessment (Annex VII)

<!-- Annex VII: Required for biometric identification systems (Annex III point 1). A notified body assesses the quality management system and the technical documentation. -->

{{#if_jurisdiction annex-vii}}

#### 2.2.1 Notified Body Selection

{{notified_body_selection}}

#### 2.2.2 Quality Management System Audit

{{qms_audit}}

#### 2.2.3 Technical Documentation Assessment

{{technical_documentation_assessment}}

#### 2.2.4 Notified Body Decision

{{notified_body_decision}}

{{/if_jurisdiction}}

---

## 3. Risk Management System Compliance (Article 9)

<!-- Article 9: A risk management system shall be established, implemented, documented and maintained in relation to high-risk AI systems. -->

### 3.1 Risk Management Process

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Risk management system established | {{rms_established}} | {{rms_established_evidence}} |
| Continuous iterative process throughout lifecycle | {{rms_iterative}} | {{rms_iterative_evidence}} |
| Known and reasonably foreseeable risks identified | {{risks_identified}} | {{risks_identified_evidence}} |
| Risks estimated and evaluated | {{risks_evaluated}} | {{risks_evaluated_evidence}} |
| Risk mitigation measures adopted | {{mitigation_adopted}} | {{mitigation_evidence}} |
| Residual risk acceptable | {{residual_risk_acceptable}} | {{residual_risk_evidence}} |
| Testing procedures adequate | {{testing_adequate}} | {{testing_evidence}} |

### 3.2 Risk Assessment Summary

{{risk_assessment_summary}}

---

## 4. Data and Data Governance Compliance (Article 10)

<!-- Article 10: Training, validation and testing data sets shall be subject to appropriate data governance and management practices. -->

### 4.1 Data Governance Assessment

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Data governance practices in place | {{data_governance_status}} | {{data_governance_evidence}} |
| Training data relevant and representative | {{data_representative}} | {{data_representative_evidence}} |
| Data examined for bias | {{bias_examination}} | {{bias_examination_evidence}} |
| Statistical properties documented | {{statistical_properties}} | {{statistical_evidence}} |
| Data gaps and shortcomings identified | {{data_gaps}} | {{data_gaps_evidence}} |
| Appropriate measures for bias mitigation | {{bias_mitigation}} | {{bias_mitigation_evidence}} |

### 4.2 Data Governance Details

{{data_governance_details}}

---

## 5. Technical Documentation Compliance (Article 11)

<!-- Article 11: The technical documentation shall be drawn up before the AI system is placed on the market or put into service and shall be kept up to date. -->

### 5.1 Documentation Completeness

| Annex IV Requirement | Documented | Reference |
|---------------------|-----------|-----------|
| General description of the AI system | {{gen_desc_status}} | {{gen_desc_ref}} |
| Detailed description of development process | {{dev_process_status}} | {{dev_process_ref}} |
| Detailed description of monitoring, functioning, control | {{monitoring_status}} | {{monitoring_ref}} |
| Description of risk management system | {{rms_doc_status}} | {{rms_doc_ref}} |
| Description of changes through lifecycle | {{changes_status}} | {{changes_ref}} |
| List of harmonised standards applied | {{standards_status}} | {{standards_ref}} |
| EU Declaration of Conformity | {{doc_status}} | {{doc_ref}} |
| Description of post-market monitoring system | {{pms_status}} | {{pms_ref}} |

### 5.2 Documentation Assessment

{{documentation_assessment}}

---

## 6. Record-Keeping and Logging Compliance (Article 12)

<!-- Article 12: High-risk AI systems shall technically allow for the automatic recording of events (logs) over the lifetime of the system. -->

### 6.1 Logging Capabilities

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Automatic event logging enabled | {{logging_enabled}} | {{logging_enabled_evidence}} |
| Traceability of AI system functioning | {{traceability}} | {{traceability_evidence}} |
| Logs include periods of use | {{usage_periods}} | {{usage_evidence}} |
| Logs include reference database information | {{reference_db}} | {{reference_db_evidence}} |
| Logs include input data for which search was run | {{input_data_logs}} | {{input_data_evidence}} |
| Logs include identification of natural persons involved in verification | {{person_identification}} | {{person_id_evidence}} |
| Log retention adequate | {{log_retention}} | {{log_retention_evidence}} |

### 6.2 Logging Assessment

{{logging_assessment}}

---

## 7. Transparency and Information Provision Compliance (Article 13)

<!-- Article 13: High-risk AI systems shall be designed and developed in such a way to ensure that their operation is sufficiently transparent to enable deployers to interpret the system's output and use it appropriately. -->

### 7.1 Transparency Measures

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Instructions for use provided | {{instructions_provided}} | {{instructions_evidence}} |
| System capabilities and limitations described | {{capabilities_described}} | {{capabilities_evidence}} |
| Performance characteristics disclosed | {{performance_disclosed}} | {{performance_evidence}} |
| Known foreseeable misuse scenarios documented | {{misuse_documented}} | {{misuse_evidence}} |
| Human oversight measures described | {{oversight_described}} | {{oversight_evidence}} |
| Expected lifetime and maintenance documented | {{lifetime_documented}} | {{lifetime_evidence}} |

### 7.2 Transparency Assessment

{{transparency_assessment}}

---

## 8. Human Oversight Compliance (Article 14)

<!-- Article 14: High-risk AI systems shall be designed and developed in such a way, including with appropriate human-machine interface tools, that they can be effectively overseen by natural persons during the period in which they are in use. -->

### 8.1 Human Oversight Measures

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Oversight measures identified and built into system | {{oversight_built_in}} | {{oversight_built_evidence}} |
| Oversight individuals can understand capabilities/limitations | {{oversight_understanding}} | {{oversight_understanding_evidence}} |
| Oversight individuals can monitor operation | {{oversight_monitoring}} | {{oversight_monitoring_evidence}} |
| Ability to decide not to use / disregard / override output | {{override_capability}} | {{override_evidence}} |
| Ability to intervene or interrupt system | {{intervention_capability}} | {{intervention_evidence}} |
| Automation bias safeguards | {{automation_bias}} | {{automation_bias_evidence}} |

### 8.2 Human Oversight Assessment

{{human_oversight_assessment}}

---

## 9. Accuracy, Robustness and Cybersecurity Compliance (Article 15)

<!-- Article 15: High-risk AI systems shall be designed and developed in such a way that they achieve an appropriate level of accuracy, robustness, and cybersecurity, and perform consistently in those respects throughout their lifecycle. -->

### 9.1 Accuracy

| Metric | Value | Threshold | Passes |
|--------|-------|-----------|--------|
{{accuracy_metrics_table}}

### 9.2 Robustness

{{robustness_assessment}}

### 9.3 Cybersecurity

{{cybersecurity_assessment}}

### 9.4 Bias and Fairness Testing

{{bias_fairness_testing}}

---

## 10. Declaration of Conformity (Article 47)

<!-- Article 47: The provider shall draw up a written EU declaration of conformity for each AI system and keep it at the disposal of the national competent authorities for 10 years after the AI system has been placed on the market or put into service. -->

### 10.1 Declaration Content

| Field | Value |
|-------|-------|
| AI system name and type | {{system_name_type}} |
| Provider name and address | {{provider_name_address}} |
| Statement of sole responsibility | {{sole_responsibility_statement}} |
| Reference to harmonised standards/common specifications | {{standards_references}} |
| Notified body (if applicable) | {{notified_body_name}} |
| Notified body certificate (if applicable) | {{notified_body_certificate}} |
| Place and date of issue | {{declaration_place_date}} |
| Signatory | {{declaration_signatory}} |

### 10.2 CE Marking

<!-- Article 48: The CE marking shall be affixed visibly, legibly and indelibly to the high-risk AI system. Where not possible, it shall be affixed to the packaging or accompanying documentation. -->

| Field | Value |
|-------|-------|
| CE marking applied | {{ce_marking_applied}} |
| CE marking location | {{ce_marking_location}} |
| CE marking format | {{ce_marking_format}} |

---

## 11. Post-Conformity Obligations

### 11.1 Quality Management System (Article 17)

{{qms_summary}}

### 11.2 Post-Market Monitoring (Article 72)

{{post_market_monitoring_plan}}

### 11.3 EU Database Registration (Article 71)

{{eu_database_registration_status}}

---

**REVIEW NOTES FOR LEGAL TEAM**:

{{review_notes}}

---

*This conformity assessment outline was generated by LaunchClear. EU AI Act conformity assessment requirements are complex and depend on the specific risk classification and use case of the AI system. This document is an outline to facilitate the conformity assessment process, not a completed assessment. All compliance determinations should be verified by qualified legal counsel and, where applicable, by a notified body. The AI Act applies from 2 August 2026 for most high-risk obligations.*
