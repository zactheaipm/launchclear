---
id: agentic-ai-governance
name: Agentic AI Governance Documentation
jurisdiction: multi
legalBasis: "IMDA Model AI Governance Framework for Agentic AI (2026)"
requiredSections:
  - system-overview
  - risk-bounding
  - human-accountability
  - technical-controls
  - end-user-responsibility
  - deployment-plan
  - monitoring
---

# Agentic AI Governance Documentation

**Framework**: IMDA Model AI Governance Framework for Agentic AI (January 2026)
**Supporting references**: EU AI Act Article 14 (Human Oversight), NIST AI RMF, PDPA
**Organisation**: {{organisation_name}}
**System name**: {{system_name}}
**Date prepared**: {{date_prepared}}
**Prepared by**: {{prepared_by}}
**Target markets**: {{target_markets}}
**Status**: DRAFT — Requires legal review

---

## 1. System Overview

### 1.1 Agentic AI System Description

{{system_description}}

### 1.2 System Architecture

{{system_architecture}}

### 1.3 Autonomy Classification

<!-- The IMDA framework distinguishes agentic AI by the degree of autonomy and scope of actions the system can take. -->

| Field | Value |
|-------|-------|
| Autonomy level | {{autonomy_level}} |
| Autonomy level justification | {{autonomy_justification}} |
| Number of agents (if multi-agent) | {{agent_count}} |
| Orchestration model | {{orchestration_model}} |

### 1.4 Capabilities and Actions

| Capability | Description | Real-World Impact |
|-----------|-------------|-------------------|
{{capabilities_table}}

### 1.5 Tool and System Access

| Tool / External System | Access Type | Permissions | Justification |
|-----------------------|------------|-------------|---------------|
{{tool_access_table}}

### 1.6 Action Scope

| Action Category | Examples | Can Modify External State | Reversible |
|----------------|----------|--------------------------|------------|
| Data access | {{data_access_actions}} | {{data_access_modifies}} | {{data_access_reversible}} |
| Data modification | {{data_mod_actions}} | {{data_mod_modifies}} | {{data_mod_reversible}} |
| Communication | {{comms_actions}} | {{comms_modifies}} | {{comms_reversible}} |
| Financial | {{financial_actions}} | {{financial_modifies}} | {{financial_reversible}} |
| Code execution | {{code_actions}} | {{code_modifies}} | {{code_reversible}} |
| Physical systems | {{physical_actions}} | {{physical_modifies}} | {{physical_reversible}} |

---

## 2. Dimension 1: Assess and Bound Risks Upfront

<!-- IMDA Dimension 1: Before deployment, organisations should assess the risks from agentic AI and establish boundaries to limit the AI system's autonomy, tool access, and data access to what is necessary for the intended purpose. -->

### 2.1 Pre-Deployment Risk Assessment

| Risk | Description | Likelihood | Severity | Risk Level |
|------|-------------|-----------|----------|------------|
{{risk_assessment_table}}

### 2.2 Autonomy Boundaries

<!-- Define the maximum scope of autonomous action. The principle of least privilege should apply: grant only the minimum autonomy needed for the intended purpose. -->

{{autonomy_boundaries}}

### 2.3 Tool Access Restrictions

<!-- Restrict which tools/APIs/systems the agent can access. Each tool access should be justified by the intended purpose. -->

| Tool | Permitted Actions | Prohibited Actions | Rate Limits |
|------|------------------|-------------------|-------------|
{{tool_restrictions_table}}

### 2.4 Data Access Restrictions

<!-- Restrict the data the agent can access to what is necessary. Apply data minimisation principles. -->

{{data_access_restrictions}}

### 2.5 Output Scope Limits

<!-- Define boundaries on what the agent can produce or commit to. For example: maximum transaction value, maximum number of emails per hour, scope of code changes. -->

| Constraint | Limit | Enforcement Mechanism |
|-----------|-------|----------------------|
{{output_scope_limits_table}}

### 2.6 Multi-Agent Interaction Boundaries

<!-- If the system involves multiple agents, define how they interact and what limits exist on inter-agent delegation. -->

{{multi_agent_boundaries}}

---

## 3. Dimension 2: Make Humans Meaningfully Accountable

<!-- IMDA Dimension 2: Organisations should define clear lines of human accountability. This includes identifying who is accountable for the agent's actions, when humans should intervene, and how to combat automation bias. -->

### 3.1 Accountability Framework

| Role | Person / Team | Accountability Scope |
|------|-------------|---------------------|
| System owner | {{system_owner}} | {{system_owner_scope}} |
| Operational oversight | {{operational_oversight}} | {{operational_scope}} |
| Technical maintenance | {{technical_maintenance}} | {{technical_scope}} |
| Escalation authority | {{escalation_authority}} | {{escalation_scope}} |

### 3.2 Human Checkpoint Design

<!-- Define specific points in the agentic workflow where human approval is required before the agent can proceed. Checkpoints should be proportionate to risk. -->

| Checkpoint | Trigger Condition | Required Approver | Maximum Wait | Fallback |
|-----------|------------------|------------------|-------------|----------|
{{human_checkpoints_table}}

### 3.3 Automation Bias Mitigation

<!-- Humans overseeing agents may develop automation bias (over-reliance on agent recommendations). Measures should be in place to ensure human review is meaningful, not rubber-stamp. -->

{{automation_bias_mitigation}}

### 3.4 Contestability and Recourse

<!-- Individuals affected by agentic AI decisions should have a clear path to challenge outcomes and seek human review. -->

{{contestability_measures}}

### 3.5 Liability and Responsibility Assignment

{{liability_assignment}}

{{#if_jurisdiction eu-ai-act}}

### 3.6 EU AI Act Human Oversight Compliance (Article 14)

<!-- Article 14: High-risk AI systems shall be designed to be effectively overseen by natural persons. For agentic AI classified as high-risk, this includes the ability to understand, monitor, and override. -->

{{eu_human_oversight_compliance}}

{{/if_jurisdiction}}

---

## 4. Dimension 3: Implement Technical Controls

<!-- IMDA Dimension 3: Technical safeguards must be built into the agentic AI system covering logging, testing, failsafes, and gradual rollout. -->

### 4.1 Action Logging and Audit Trail

<!-- All agent actions must be logged in a complete, immutable, and auditable manner. Logs should capture the full chain of reasoning and action. -->

| Log Field | Description | Retention Period |
|----------|-------------|-----------------|
| Timestamp | {{timestamp_format}} | {{timestamp_retention}} |
| Agent identity | {{agent_id_format}} | {{agent_id_retention}} |
| Action taken | {{action_log_format}} | {{action_log_retention}} |
| Reasoning chain | {{reasoning_log_format}} | {{reasoning_retention}} |
| Tool calls | {{tool_call_format}} | {{tool_call_retention}} |
| Inputs and outputs | {{io_log_format}} | {{io_retention}} |
| Human approvals | {{approval_log_format}} | {{approval_retention}} |
| Errors and exceptions | {{error_log_format}} | {{error_retention}} |

### 4.2 Testing Regime

| Test Type | Scope | Frequency | Last Conducted |
|----------|-------|-----------|---------------|
| Functional testing | {{functional_scope}} | {{functional_frequency}} | {{functional_last}} |
| Safety boundary testing | {{safety_scope}} | {{safety_frequency}} | {{safety_last}} |
| Adversarial testing | {{adversarial_scope}} | {{adversarial_frequency}} | {{adversarial_last}} |
| Edge case and failure mode testing | {{edge_case_scope}} | {{edge_case_frequency}} | {{edge_case_last}} |
| Multi-agent interaction testing | {{multi_agent_test_scope}} | {{multi_agent_frequency}} | {{multi_agent_last}} |
| Load and stress testing | {{load_scope}} | {{load_frequency}} | {{load_last}} |

### 4.3 Failsafe Mechanisms

<!-- Kill switches, circuit breakers, and rollback capabilities that can halt the agent immediately when needed. -->

| Failsafe | Trigger | Effect | Recovery Process |
|----------|---------|--------|-----------------|
{{failsafe_table}}

### 4.4 Sandboxing and Isolation

<!-- Agentic AI systems should operate in environments that limit blast radius if something goes wrong. -->

{{sandboxing_measures}}

### 4.5 Rate Limiting and Budget Controls

<!-- Prevent runaway agent behaviour through resource and action rate limits. -->

| Resource | Limit | Time Window | Enforcement |
|----------|-------|-------------|-------------|
{{rate_limiting_table}}

### 4.6 Gradual Rollout Strategy

<!-- IMDA recommends gradual deployment to identify issues before full-scale release. -->

{{gradual_rollout_strategy}}

---

## 5. Dimension 4: Enable End-User Responsibility

<!-- IMDA Dimension 4: End users of agentic AI should understand the system's capabilities and limitations, and be equipped to use it responsibly. Transparency and training are key. -->

### 5.1 End-User Transparency

| Disclosure | Content | Delivery Mechanism |
|-----------|---------|-------------------|
| AI system disclosure | {{ai_system_disclosure}} | {{system_disclosure_method}} |
| Autonomy level disclosure | {{autonomy_disclosure}} | {{autonomy_disclosure_method}} |
| Action scope disclosure | {{action_scope_disclosure}} | {{action_disclosure_method}} |
| Limitation disclosure | {{limitation_disclosure}} | {{limitation_disclosure_method}} |
| Data usage disclosure | {{data_usage_disclosure}} | {{data_disclosure_method}} |

### 5.2 User Controls

<!-- End users should have appropriate controls over the agent's behaviour. -->

| Control | Description | Default Setting |
|---------|-------------|-----------------|
| Pause/stop agent | {{pause_control}} | {{pause_default}} |
| Approval requirements | {{approval_control}} | {{approval_default}} |
| Scope restriction | {{scope_control}} | {{scope_default}} |
| Notification preferences | {{notification_control}} | {{notification_default}} |

### 5.3 User Training and Documentation

{{user_training}}

### 5.4 Feedback and Reporting Channels

{{feedback_channels}}

---

## 6. Deployment Plan

### 6.1 Pre-Deployment Checklist

| Item | Status | Verified By |
|------|--------|-------------|
| Risk assessment completed | {{risk_assessment_done}} | {{risk_verifier}} |
| Human checkpoints defined and tested | {{checkpoints_done}} | {{checkpoints_verifier}} |
| Logging and audit trail operational | {{logging_done}} | {{logging_verifier}} |
| Failsafe mechanisms tested | {{failsafe_done}} | {{failsafe_verifier}} |
| User documentation complete | {{docs_done}} | {{docs_verifier}} |
| Adversarial testing completed | {{adversarial_done}} | {{adversarial_verifier}} |
| Sandbox testing completed | {{sandbox_done}} | {{sandbox_verifier}} |
| Regulatory compliance verified | {{compliance_done}} | {{compliance_verifier}} |

### 6.2 Rollout Phases

{{rollout_phases}}

### 6.3 Rollback Plan

{{rollback_plan}}

---

## 7. Ongoing Monitoring

### 7.1 Monitoring Metrics

| Metric | Target | Alert Threshold | Monitoring Frequency |
|--------|--------|-----------------|---------------------|
{{monitoring_metrics_table}}

### 7.2 Incident Management

{{incident_management}}

### 7.3 Review Schedule

| Review Type | Frequency | Next Review | Owner |
|------------|-----------|-------------|-------|
| Governance review | {{governance_review_freq}} | {{governance_review_next}} | {{governance_review_owner}} |
| Technical controls audit | {{tech_audit_freq}} | {{tech_audit_next}} | {{tech_audit_owner}} |
| Risk reassessment | {{risk_reassess_freq}} | {{risk_reassess_next}} | {{risk_reassess_owner}} |
| User feedback review | {{feedback_review_freq}} | {{feedback_review_next}} | {{feedback_review_owner}} |

---

## 8. Jurisdiction-Specific Requirements

{{#if_jurisdiction singapore}}

### 8.1 Singapore — IMDA Agentic AI Framework Compliance

| IMDA Dimension | Compliance Status | Evidence |
|----------------|------------------|----------|
| Assess and bound risks | {{sg_risk_bounding_status}} | {{sg_risk_bounding_evidence}} |
| Human accountability | {{sg_accountability_status}} | {{sg_accountability_evidence}} |
| Technical controls | {{sg_technical_status}} | {{sg_technical_evidence}} |
| End-user responsibility | {{sg_enduser_status}} | {{sg_enduser_evidence}} |

{{/if_jurisdiction}}

{{#if_jurisdiction eu-ai-act}}

### 8.2 EU — AI Act Compliance for Agentic Systems

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Risk classification (Annex III) | {{eu_risk_class_status}} | {{eu_risk_class_evidence}} |
| Human oversight (Article 14) | {{eu_oversight_status}} | {{eu_oversight_evidence}} |
| Transparency (Article 13) | {{eu_transparency_status}} | {{eu_transparency_evidence}} |
| Logging (Article 12) | {{eu_logging_status}} | {{eu_logging_evidence}} |

{{/if_jurisdiction}}

{{#if_jurisdiction uk}}

### 8.3 UK — Regulatory Compliance

{{uk_agentic_compliance}}

{{/if_jurisdiction}}

---

## 9. Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| System Owner | {{system_owner_name}} | {{system_owner_date}} | |
| AI Governance Lead | {{governance_lead_name}} | {{governance_lead_date}} | |
| Technical Lead | {{technical_lead_name}} | {{technical_lead_date}} | |
| Legal / Compliance | {{legal_name}} | {{legal_date}} | |

---

**REVIEW NOTES FOR LEGAL TEAM**:

{{review_notes}}

---

*This agentic AI governance document was generated by LaunchClear. It is primarily aligned with the IMDA Model AI Governance Framework for Agentic AI (January 2026), the world's first dedicated governance framework for agentic AI systems. Agentic AI systems that operate in regulated sectors or high-risk domains may be subject to additional obligations under the EU AI Act, UK regulatory frameworks, or other jurisdictions. All governance measures should be reviewed by qualified legal counsel familiar with AI governance in each target market. This is a rapidly evolving regulatory area — regular review is essential.*
