---
id: gpai-systemic-risk
name: GPAI Model Systemic Risk Assessment
jurisdiction: eu-ai-act
legalBasis: "EU AI Act Article 55, Articles 51-52"
requiredSections:
  - model-identification
  - systemic-risk-classification
  - risk-sources
  - model-evaluation
  - adversarial-testing
  - risk-mitigation
  - incident-reporting
  - cybersecurity
---

# GPAI Model with Systemic Risk — Risk Assessment and Mitigation Plan

**Regulation**: EU AI Act (Regulation (EU) 2024/1689), Article 55, Articles 51-52
**Model name**: {{model_name}}
**Model version**: {{model_version}}
**Provider**: {{provider_name}}
**Date prepared**: {{date_prepared}}
**Prepared by**: {{prepared_by}}
**Status**: DRAFT — Requires legal review

---

## 1. Model Identification

### 1.1 Model Description

{{model_description}}

### 1.2 Model Characteristics

| Field | Value |
|-------|-------|
| Model name | {{model_name}} |
| Model version | {{model_version}} |
| Model architecture | {{model_architecture}} |
| Parameter count | {{parameter_count}} |
| Input modalities | {{input_modalities}} |
| Output modalities | {{output_modalities}} |
| Release date | {{release_date}} |
| Distribution method | {{distribution_method}} |
| Open-source / open-weight | {{open_source_status}} |
| License | {{model_license}} |

### 1.3 Provider Information

| Field | Value |
|-------|-------|
| Provider legal name | {{provider_legal_name}} |
| Registered address | {{provider_address}} |
| EU representative (if non-EU) | {{eu_representative}} |
| AI Office contact | {{ai_office_contact}} |

---

## 2. Systemic Risk Classification

<!-- Article 51(1): A GPAI model shall be classified as a GPAI model with systemic risk if it has high impact capabilities. High impact capabilities shall be presumed when the cumulative compute used for training exceeds 10^25 FLOPs. A GPAI model may also be classified as having systemic risk by Commission decision. -->

### 2.1 Classification Basis

| Criterion | Assessment | Evidence |
|-----------|------------|----------|
| Training compute (FLOPs) | {{training_flops}} | {{flops_evidence}} |
| Exceeds 10^25 FLOPs threshold | {{exceeds_threshold}} | {{threshold_evidence}} |
| Commission designation (Article 51(1)(b)) | {{commission_designated}} | {{designation_evidence}} |
| High impact capabilities assessment | {{high_impact_assessment}} | {{impact_evidence}} |

### 2.2 Threshold Analysis

<!-- Article 51(2): The Commission shall amend the FLOPs threshold in light of evolving technological developments. The current threshold is 10^25 FLOPs. -->

{{threshold_analysis}}

### 2.3 Classification Determination

| Field | Value |
|-------|-------|
| Classification | {{systemic_risk_classification}} |
| Effective date of classification | {{classification_date}} |
| AI Office notification date | {{ai_office_notification_date}} |
| Classification justification | {{classification_justification}} |

### 2.4 Open-Source Considerations

<!-- Article 53(2): Open-source GPAI providers have reduced obligations, but Article 55 systemic risk obligations apply regardless of open-source status per Article 55(1). -->

{{open_source_considerations}}

---

## 3. Sources of Systemic Risk

<!-- Article 55(1)(a): Providers shall perform model evaluation, including conducting and documenting adversarial testing, with a view to identifying and mitigating systemic risk. -->

### 3.1 Risk Taxonomy

| Risk Category | Description | Likelihood | Severity | Risk Level |
|--------------|-------------|-----------|----------|------------|
| Large-scale societal harm | {{societal_harm_description}} | {{societal_harm_likelihood}} | {{societal_harm_severity}} | {{societal_harm_level}} |
| Critical infrastructure disruption | {{infrastructure_description}} | {{infrastructure_likelihood}} | {{infrastructure_severity}} | {{infrastructure_level}} |
| Mass manipulation / disinformation | {{manipulation_description}} | {{manipulation_likelihood}} | {{manipulation_severity}} | {{manipulation_level}} |
| CBRN risks | {{cbrn_description}} | {{cbrn_likelihood}} | {{cbrn_severity}} | {{cbrn_level}} |
| Autonomous offensive cyber capabilities | {{cyber_offense_description}} | {{cyber_offense_likelihood}} | {{cyber_offense_severity}} | {{cyber_offense_level}} |
| Unintended capability emergence | {{emergent_description}} | {{emergent_likelihood}} | {{emergent_severity}} | {{emergent_level}} |

### 3.2 Risk Source Analysis

{{risk_source_analysis}}

### 3.3 Cross-Border and Cascading Risk Assessment

<!-- Systemic risk in AI Act context refers to risks that can have significant impact on the Union market due to the reach of the model and potential for cascading effects across the value chain. -->

{{cross_border_risk_assessment}}

### 3.4 Dual-Use and Misuse Potential

{{dual_use_assessment}}

---

## 4. Model Evaluation

<!-- Article 55(1)(a): Perform model evaluation in accordance with standardised protocols and tools reflecting the state of the art, including conducting and documenting adversarial testing of the model. -->

### 4.1 Evaluation Framework

{{evaluation_framework}}

### 4.2 Standardised Protocols Applied

| Protocol / Benchmark | Version | Scope | Results |
|---------------------|---------|-------|---------|
{{standardised_protocols_table}}

### 4.3 Capability Evaluations

| Capability Domain | Evaluation Method | Result | Risk Implication |
|------------------|------------------|--------|-----------------|
{{capability_evaluations_table}}

### 4.4 Safety Evaluations

{{safety_evaluations}}

### 4.5 Bias and Fairness Evaluations

{{bias_fairness_evaluations}}

### 4.6 Limitations Identified Through Evaluation

{{evaluation_limitations}}

---

## 5. Adversarial Testing

<!-- Article 55(1)(a): Conducting and documenting adversarial testing of the model, including as appropriate through internal or independent external testing, to identify and mitigate systemic risk. -->

### 5.1 Adversarial Testing Methodology

{{adversarial_methodology}}

### 5.2 Testing Scope

| Test Category | Description | Internal / External | Status |
|--------------|-------------|-------------------|--------|
| Jailbreak and prompt injection resistance | {{jailbreak_testing}} | {{jailbreak_scope}} | {{jailbreak_status}} |
| Harmful content generation | {{harmful_content_testing}} | {{harmful_content_scope}} | {{harmful_content_status}} |
| CBRN knowledge extraction | {{cbrn_testing}} | {{cbrn_scope}} | {{cbrn_status}} |
| Cyber capability assessment | {{cyber_testing}} | {{cyber_scope}} | {{cyber_status}} |
| Deception and manipulation | {{deception_testing}} | {{deception_scope}} | {{deception_status}} |
| Synthetic media generation quality | {{synthetic_media_testing}} | {{synthetic_media_scope}} | {{synthetic_media_status}} |
| Autonomous action capabilities | {{autonomous_testing}} | {{autonomous_scope}} | {{autonomous_status}} |

### 5.3 Red Team Composition

{{red_team_composition}}

### 5.4 Adversarial Testing Results

{{adversarial_results}}

### 5.5 Vulnerabilities Identified

{{vulnerabilities_identified}}

---

## 6. Risk Mitigation Measures

<!-- Article 55(1)(c): Take appropriate measures to mitigate the systemic risks identified, including through technical means such as post-market monitoring. -->

### 6.1 Mitigation Strategy

{{mitigation_strategy}}

### 6.2 Technical Mitigation Measures

| Risk | Mitigation Measure | Implementation Status | Effectiveness |
|------|-------------------|----------------------|---------------|
{{technical_mitigation_table}}

### 6.3 Safety Filters and Guardrails

{{safety_filters}}

### 6.4 Usage Restrictions and Acceptable Use Policy

{{usage_restrictions}}

### 6.5 Downstream Provider Controls

<!-- Measures to help downstream providers mitigate systemic risk in their deployments. -->

{{downstream_controls}}

### 6.6 Ongoing Monitoring for New Risks

{{ongoing_risk_monitoring}}

### 6.7 Residual Risk Assessment

{{residual_risk_assessment}}

---

## 7. Serious Incident Reporting

<!-- Article 55(1)(d): Without undue delay, report to the AI Office and, where relevant, to national competent authorities, any serious incident and possible corrective measures to address it. -->

### 7.1 Incident Reporting Obligations

| Requirement | Details |
|-------------|---------|
| Reporting authority | AI Office (European Commission) |
| Additional authority (if applicable) | {{additional_reporting_authority}} |
| Reporting trigger | Serious incident involving the GPAI model or serious incidents reported by downstream deployers attributable to the model |
| Reporting deadline | Without undue delay |
| Reporting format | {{reporting_format}} |
| Contact details | {{ai_office_contact_details}} |

### 7.2 Incident Definition

<!-- For GPAI models with systemic risk, serious incidents include events attributable to the model that pose systemic risk, not just those falling under Article 3(49). -->

{{incident_definition}}

### 7.3 Incident Detection Mechanisms

{{incident_detection}}

### 7.4 Reporting Process

{{reporting_process}}

### 7.5 Corrective Measures

{{corrective_measures}}

---

## 8. Cybersecurity Protections

<!-- Article 55(1)(e): Ensure an adequate level of cybersecurity protection for the GPAI model with systemic risk and the physical infrastructure of the model. -->

### 8.1 Cybersecurity Assessment

{{cybersecurity_assessment}}

### 8.2 Model Security

| Security Domain | Measures | Status |
|----------------|----------|--------|
| Model weight protection | {{weight_protection}} | {{weight_protection_status}} |
| Training pipeline security | {{pipeline_security}} | {{pipeline_security_status}} |
| Inference infrastructure security | {{inference_security}} | {{inference_security_status}} |
| Access control | {{access_control}} | {{access_control_status}} |
| API security | {{api_security}} | {{api_security_status}} |

### 8.3 Physical Infrastructure Security

{{physical_security}}

### 8.4 Supply Chain Security

{{supply_chain_security}}

### 8.5 Vulnerability Management

{{vulnerability_management}}

---

## 9. Codes of Practice and AI Office Engagement

<!-- Article 56: The AI Office shall encourage and facilitate the drawing up of codes of practice. Providers of GPAI models with systemic risk may rely on codes of practice to demonstrate compliance. -->

### 9.1 Codes of Practice Compliance

| Code of Practice | Adherence Status | Details |
|-----------------|-----------------|---------|
{{codes_of_practice_table}}

### 9.2 AI Office Engagement

{{ai_office_engagement}}

---

## 10. Review and Update Schedule

| Review Type | Frequency | Next Review |
|------------|-----------|-------------|
| Full systemic risk assessment | {{full_review_frequency}} | {{full_review_next}} |
| Adversarial testing | {{adversarial_review_frequency}} | {{adversarial_review_next}} |
| Mitigation effectiveness review | {{mitigation_review_frequency}} | {{mitigation_review_next}} |
| Cybersecurity audit | {{cyber_review_frequency}} | {{cyber_review_next}} |

---

**REVIEW NOTES FOR LEGAL TEAM**:

{{review_notes}}

---

*This systemic risk assessment was generated by LaunchClear. Article 55 of the EU AI Act imposes additional obligations on providers of GPAI models with systemic risk (those exceeding 10^25 training FLOPs or designated by the Commission). These obligations are in addition to the standard GPAI provider obligations under Article 53. The AI Office may request access to the model and additional documentation. All risk assessments and mitigation measures should be reviewed by qualified legal counsel, cybersecurity experts, and AI safety researchers. GPAI systemic risk obligations apply from 2 August 2025.*
