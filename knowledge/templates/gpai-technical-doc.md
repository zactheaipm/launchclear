---
id: gpai-technical-doc
name: GPAI Provider Technical Documentation
jurisdiction: eu-ai-act
legalBasis: "EU AI Act Article 53(1)(a), Annex XI"
requiredSections:
  - general-description
  - training-testing
  - compute-resources
  - limitations-risks
  - downstream-information
  - copyright-compliance
---

# GPAI Model Technical Documentation

**Regulation**: EU AI Act Article 53(1)(a), Annex XI
**Model name**: {{model_name}}
**Model version**: {{model_version}}
**Provider**: {{provider_name}}
**Date prepared**: {{date_prepared}}
**Status**: DRAFT — Requires legal review

---

## 1. General Description of the GPAI Model

<!-- Annex XI, Section 1: General description including task(s), type and nature of AI systems in which it can be integrated, acceptable use policy, release date, distribution methods, model architecture, modalities used. -->

### 1.1 Model Description

{{model_description}}

### 1.2 Task and General Capabilities

{{model_tasks_and_capabilities}}

### 1.3 Model Architecture

{{model_architecture}}

### 1.4 Input and Output Modalities

{{input_output_modalities}}

### 1.5 Release and Distribution

| Field | Value |
|-------|-------|
| Release date | {{release_date}} |
| Distribution method | {{distribution_method}} |
| License | {{model_license}} |
| Open-source status | {{open_source_status}} |
| Open-weight status | {{open_weight_status}} |

### 1.6 Acceptable Use Policy

{{acceptable_use_policy}}

### 1.7 AI Systems Integration

{{ai_systems_integration}}

---

## 2. Training and Testing Processes and Evaluation Results

<!-- Annex XI, Section 2: Description of training methodologies and techniques, training and testing data (including sources), data curation methods, and evaluation results. -->

### 2.1 Training Methodology

{{training_methodology}}

### 2.2 Training Data

#### 2.2.1 Data Sources

{{training_data_sources}}

#### 2.2.2 Data Volume and Composition

{{training_data_volume}}

#### 2.2.3 Data Curation and Filtering

{{data_curation_methods}}

#### 2.2.4 Personal Data in Training Data

{{personal_data_in_training}}

### 2.3 Fine-Tuning (If Applicable)

{{fine_tuning_details}}

### 2.4 Testing Methodology

{{testing_methodology}}

### 2.5 Evaluation Results

| Benchmark | Metric | Score | Notes |
|-----------|--------|-------|-------|
{{evaluation_results_table}}

### 2.6 Red-Teaming and Safety Evaluations

{{red_teaming_results}}

---

## 3. Computational Resources Used

<!-- Annex XI, Section 3: Relevant information about the compute used for training, including FLOPs, training time, and other relevant details about the training methodology. Known or estimated energy consumption. -->

### 3.1 Compute for Training

| Resource | Value |
|----------|-------|
| Total training FLOPs | {{training_flops}} |
| Training duration | {{training_duration}} |
| Hardware used | {{training_hardware}} |
| Number of GPUs/TPUs | {{gpu_count}} |
| Cloud provider (if applicable) | {{cloud_provider}} |

### 3.2 Energy Consumption

| Metric | Value |
|--------|-------|
| Estimated energy consumption (kWh) | {{energy_consumption}} |
| Carbon emissions (tCO2eq) | {{carbon_emissions}} |
| Energy source | {{energy_source}} |

### 3.3 Systemic Risk Threshold Assessment

<!-- Article 51(2): A GPAI model shall be presumed to have high impact capabilities when the cumulative amount of compute used for its training measured in FLOPs is greater than 10^25. -->

| Criterion | Assessment |
|-----------|------------|
| Training FLOPs ≥ 10^25 | {{exceeds_flops_threshold}} |
| Commission designation | {{commission_designated}} |
| **Systemic risk classification** | {{systemic_risk_classification}} |

---

## 4. Known Limitations and Risks

<!-- Annex XI, Section 4: Known or estimable limitations of the model, including reasonably foreseeable risks and mitigation measures taken. -->

### 4.1 Known Limitations

{{known_limitations}}

### 4.2 Known Risks

| Risk Category | Description | Severity | Mitigation |
|---------------|------------|----------|------------|
{{risks_table}}

### 4.3 Misuse Potential

{{misuse_potential}}

### 4.4 Bias and Fairness

{{bias_and_fairness}}

### 4.5 Safety Measures Implemented

{{safety_measures}}

---

## 5. Information for Downstream Providers

<!-- Annex XI, Section 5: Description of capabilities and limitations, intended and non-intended use, and information necessary for downstream providers to comply with their own obligations. -->

### 5.1 Capabilities and Intended Use

{{capabilities_for_downstream}}

### 5.2 Limitations Relevant to Downstream Use

{{limitations_for_downstream}}

### 5.3 Integration Requirements

{{integration_requirements}}

### 5.4 Risk Information for Deployers

{{risk_information_deployers}}

### 5.5 Downstream Compliance Obligations

{{downstream_compliance}}

---

## 6. Copyright Compliance Policy and Training Data Summary

<!-- Article 53(1)(c): Put in place a policy to comply with Union copyright law (Directive 2019/790), including identification and compliance with rights reservations (Article 4(3)). -->
<!-- Article 53(1)(d): Draw up and make publicly available a sufficiently detailed summary about the content used for training. -->

### 6.1 Copyright Compliance Policy

{{copyright_policy}}

### 6.2 Rights Reservation Compliance (Text and Data Mining)

{{rights_reservation_compliance}}

### 6.3 Training Data Summary (Public Disclosure)

<!-- Required to be publicly available per Article 53(1)(d). The AI Office shall provide a template. -->

{{training_data_summary}}

### 6.4 Opt-Out Mechanisms

{{opt_out_mechanisms}}

---

## 7. Systemic Risk Mitigation (If Applicable)

<!-- Article 55: Additional obligations for providers of GPAI models with systemic risk. -->

### 7.1 Model Evaluation

{{model_evaluation}}

### 7.2 Systemic Risk Assessment

{{systemic_risk_assessment}}

### 7.3 Risk Mitigation Measures

{{systemic_risk_mitigation}}

### 7.4 Serious Incident Reporting

{{incident_reporting_plan}}

### 7.5 Cybersecurity Protections

{{cybersecurity_protections}}

---

**REVIEW NOTES FOR LEGAL TEAM**:

{{review_notes}}

---

*This technical documentation was generated by LaunchClear. GPAI provider obligations under the EU AI Act are complex and evolving (effective 2 August 2025). All content should be reviewed by qualified legal counsel familiar with the AI Act GPAI provisions, and technical claims should be verified by the engineering team. The AI Office may issue additional guidance and templates.*
