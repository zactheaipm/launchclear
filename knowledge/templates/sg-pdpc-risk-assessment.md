---
id: sg-pdpc-risk-assessment
name: Singapore AI Risk Assessment (Model AI Governance Framework)
jurisdiction: singapore
legalBasis: "PDPA, Model AI Governance Framework (2nd Ed, 2020), IMDA GenAI Governance Framework"
requiredSections:
  - system-overview
  - data-protection-assessment
  - governance-structure
  - human-oversight
  - transparency-measures
  - risk-assessment
  - mitigation-measures
---

# AI Risk Assessment — Singapore Model AI Governance Framework

**Framework**: PDPC/IMDA Model AI Governance Framework (2nd Edition, 2020)
**Supporting reference**: PDPA (Personal Data Protection Act 2012), IMDA GenAI Governance Framework
**Organisation**: {{organisation_name}}
**AI system name**: {{system_name}}
**Date prepared**: {{date_prepared}}
**Prepared by**: {{prepared_by}}
**Status**: DRAFT — Requires legal review

---

## 1. System Overview

### 1.1 AI System Description

{{system_description}}

### 1.2 Business Objective

{{business_objective}}

### 1.3 Deployment Context

| Field | Value |
|-------|-------|
| Industry / sector | {{industry_sector}} |
| Target users | {{target_users}} |
| Deployment scope (Singapore / regional) | {{deployment_scope}} |
| Operational since | {{operational_since}} |
| AI techniques used | {{ai_techniques}} |

### 1.4 Probability and Severity of Harm

<!-- Model AI Governance Framework principle: organisations deploying AI should assess the probability and severity of harm that the AI decision/prediction may cause, and calibrate governance measures accordingly. -->

| Dimension | Assessment |
|-----------|------------|
| Probability of harm | {{probability_of_harm}} |
| Severity of harm | {{severity_of_harm}} |
| Reversibility of decisions | {{reversibility}} |
| Extent of human autonomy affected | {{human_autonomy_impact}} |
| Vulnerability of affected population | {{population_vulnerability}} |

### 1.5 Risk Tier Determination

<!-- The Model AI Governance Framework recommends proportionate governance based on risk. Higher probability and severity of harm warrant more stringent governance. -->

{{risk_tier_determination}}

---

## 2. Internal Governance Structures and Measures

<!-- Principle 1: Organisations using AI in decision-making should ensure that the governance structures and measures in place are appropriate for the nature and risk profile of the AI deployment. -->

### 2.1 Organisational Accountability

| Field | Value |
|-------|-------|
| Responsible senior management | {{responsible_management}} |
| AI governance committee/function | {{governance_committee}} |
| Clear roles and responsibilities defined | {{roles_defined}} |
| Board/C-suite oversight mechanism | {{board_oversight}} |

### 2.2 AI Ethics Principles

{{ai_ethics_principles}}

### 2.3 Risk Management Framework

{{risk_management_framework}}

### 2.4 Staff Training and Awareness

{{staff_training}}

### 2.5 Internal Policies and Procedures

| Policy | Exists | Last Reviewed |
|--------|--------|---------------|
| AI governance policy | {{ai_gov_policy_exists}} | {{ai_gov_policy_reviewed}} |
| Data management policy | {{data_mgmt_policy_exists}} | {{data_mgmt_policy_reviewed}} |
| Model development standards | {{model_dev_exists}} | {{model_dev_reviewed}} |
| Incident response plan | {{incident_plan_exists}} | {{incident_plan_reviewed}} |

---

## 3. Determining the AI Decision-Making Model

<!-- Principle 2: Organisations should determine the level of human involvement in AI-augmented decision-making, taking into account the nature of the decision, the risk context, and available resources. -->

### 3.1 Level of Human Involvement

<!-- The Framework describes three models: (a) Human-in-the-loop: human makes final decision, AI provides recommendation; (b) Human-on-the-loop: AI makes decision, human monitors and can intervene; (c) Human-out-of-the-loop: AI makes decision with no human involvement. -->

| Field | Value |
|-------|-------|
| Decision-making model | {{decision_making_model}} |
| Justification for level of autonomy | {{autonomy_justification}} |
| Escalation criteria | {{escalation_criteria}} |
| Override mechanism | {{override_mechanism}} |

### 3.2 Decision-Making Impact Assessment

{{decision_impact_assessment}}

### 3.3 Human Oversight Design

{{human_oversight_design}}

### 3.4 Appeal / Recourse Mechanism

<!-- For decisions that significantly affect individuals, individuals should have a way to seek recourse. -->

{{appeal_mechanism}}

---

## 4. Operations Management

<!-- Principle 3: Organisations should adopt the necessary measures to ensure that AI systems perform as intended, covering data management, model development, deployment, monitoring, and incident management. -->

### 4.1 Data Management

#### 4.1.1 Data Quality

{{data_quality_assessment}}

#### 4.1.2 Data Provenance

{{data_provenance}}

#### 4.1.3 Personal Data Protection (PDPA Compliance)

<!-- PDPA obligations apply to AI systems processing personal data of individuals in Singapore. Key obligations: consent, purpose limitation, access and correction, data protection. -->

| PDPA Obligation | Status | Details |
|----------------|--------|---------|
| Consent obtained (Section 13) | {{consent_status}} | {{consent_details}} |
| Purpose of collection notified (Section 20) | {{purpose_notified}} | {{purpose_details}} |
| Access obligation (Section 21) | {{access_obligation}} | {{access_details}} |
| Correction obligation (Section 22) | {{correction_obligation}} | {{correction_details}} |
| Data protection policies (Section 12) | {{protection_policies}} | {{protection_details}} |
| Cross-border transfers (Section 26) | {{transfer_compliance}} | {{transfer_details}} |
| Data breach notification (Section 26D) | {{breach_notification}} | {{breach_details}} |

#### 4.1.4 Automated Decision-Making (PDPA Section 35)

<!-- PDPA amendments allow individuals to request explanations for automated decisions that significantly affect them. -->

{{automated_decision_explanation}}

### 4.2 Model Development and Validation

#### 4.2.1 Model Development Process

{{model_development_process}}

#### 4.2.2 Testing and Validation

{{testing_validation}}

#### 4.2.3 Bias and Fairness Assessment

{{bias_fairness_assessment}}

#### 4.2.4 Explainability Assessment

{{explainability_assessment}}

### 4.3 Deployment and Monitoring

#### 4.3.1 Deployment Controls

{{deployment_controls}}

#### 4.3.2 Performance Monitoring

{{performance_monitoring}}

#### 4.3.3 Drift Detection

{{drift_detection}}

#### 4.3.4 Incident Management

{{incident_management}}

---

## 5. Stakeholder Interaction and Communication

<!-- Principle 4: Organisations should be transparent about how AI systems are used and communicate with affected stakeholders to build understanding and trust. -->

### 5.1 Transparency Measures

| Measure | Implemented | Details |
|---------|------------|---------|
| Disclosure of AI use to affected individuals | {{ai_use_disclosed}} | {{disclosure_details}} |
| Explanation of AI decision-making process | {{explanation_provided}} | {{explanation_details}} |
| Disclosure of data used by AI system | {{data_use_disclosed}} | {{data_disclosure_details}} |
| Publication of AI governance practices | {{governance_published}} | {{governance_pub_details}} |

### 5.2 Stakeholder Engagement

{{stakeholder_engagement}}

### 5.3 Communication Strategy

{{communication_strategy}}

### 5.4 Feedback Mechanisms

{{feedback_mechanisms}}

---

## 6. Risk Assessment Summary

### 6.1 Identified Risks

| Risk | Category | Likelihood | Impact | Risk Level | Mitigation |
|------|----------|-----------|--------|------------|------------|
{{risk_summary_table}}

### 6.2 PDPA-Specific Risks

{{pdpa_specific_risks}}

### 6.3 Residual Risks

{{residual_risks}}

---

## 7. Mitigation Measures

### 7.1 Technical Measures

{{technical_mitigation}}

### 7.2 Organisational Measures

{{organisational_mitigation}}

### 7.3 Contractual Measures (Third-Party AI)

<!-- If AI is sourced from third parties, appropriate contractual provisions should be in place. -->

{{contractual_measures}}

---

## 8. GenAI-Specific Assessment

{{#if_jurisdiction singapore-genai}}

<!-- IMDA GenAI Governance Framework: additional governance measures for organisations deploying generative AI. -->

### 8.1 GenAI Governance Measures

| IMDA Dimension | Status | Details |
|----------------|--------|---------|
| Safety — Testing and evaluation | {{genai_testing}} | {{genai_testing_details}} |
| Safety — Incident reporting | {{genai_incident}} | {{genai_incident_details}} |
| Accountability — Content provenance | {{genai_provenance}} | {{genai_provenance_details}} |
| Accountability — Disclosure | {{genai_disclosure}} | {{genai_disclosure_details}} |

### 8.2 Content Safety Measures

{{genai_content_safety}}

{{/if_jurisdiction}}

---

## 9. Review and Sign-Off

### 9.1 Review Schedule

{{review_schedule}}

### 9.2 Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Senior Management | {{senior_mgmt_name}} | {{senior_mgmt_date}} | |
| AI Governance Lead | {{governance_lead_name}} | {{governance_lead_date}} | |
| Data Protection Officer | {{dpo_name}} | {{dpo_date}} | |

---

**REVIEW NOTES FOR LEGAL TEAM**:

{{review_notes}}

---

*This risk assessment was generated by LaunchClear and is aligned with the PDPC/IMDA Model AI Governance Framework (2nd Edition). The Framework is voluntary but represents Singapore's recommended approach to responsible AI governance. PDPA obligations are mandatory. All assessments should be reviewed by qualified legal counsel familiar with Singapore data protection and AI governance requirements. For financial institutions, additional MAS AI risk management guidelines may apply.*
