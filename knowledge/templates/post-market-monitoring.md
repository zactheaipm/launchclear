---
id: post-market-monitoring
name: EU AI Act Post-Market Monitoring Plan
jurisdiction: eu-ai-act
legalBasis: "EU AI Act Articles 72-73"
requiredSections:
  - monitoring-objectives
  - performance-metrics
  - data-collection
  - incident-detection
  - incident-reporting
  - review-cycle
  - corrective-actions
---

# Post-Market Monitoring Plan for High-Risk AI System

**Regulation**: EU AI Act (Regulation (EU) 2024/1689), Articles 72-73
**System name**: {{system_name}}
**System version**: {{system_version}}
**Provider**: {{provider_name}}
**Date prepared**: {{date_prepared}}
**Prepared by**: {{prepared_by}}
**Status**: DRAFT — Requires legal review

---

## 1. Monitoring Objectives

<!-- Article 72(1): Providers shall establish and document a post-market monitoring system in a manner that is proportionate to the nature of the AI technologies and the risks of the high-risk AI system. -->

### 1.1 Purpose

This post-market monitoring plan establishes a systematic process for actively collecting and reviewing data on the performance and compliance of {{system_name}} throughout its operational lifetime. The plan is designed to satisfy the obligations of EU AI Act Article 72, ensuring that the provider can evaluate the continuous compliance of the AI system with the requirements set out in Chapter III, Section 2.

### 1.2 Scope

| Field | Value |
|-------|-------|
| AI system | {{system_name}} |
| Risk classification | {{risk_classification}} |
| Deployment markets | {{deployment_markets}} |
| Deployers covered | {{deployers_covered}} |
| Monitoring period | {{monitoring_period}} |

### 1.3 Objectives

{{monitoring_objectives}}

### 1.4 Relationship to Quality Management System

<!-- Article 72(1): The post-market monitoring system shall be part of the quality management system referred to in Article 17. -->

{{qms_relationship}}

---

## 2. Performance Metrics

### 2.1 Key Performance Indicators

<!-- The plan shall define metrics that allow ongoing assessment of accuracy, robustness, cybersecurity, and compliance with transparency and human oversight requirements. -->

| Metric | Baseline Value | Acceptable Range | Monitoring Frequency | Alert Threshold |
|--------|---------------|-----------------|---------------------|-----------------|
{{performance_metrics_table}}

### 2.2 Accuracy Monitoring

{{accuracy_monitoring}}

### 2.3 Fairness and Bias Monitoring

{{fairness_monitoring}}

### 2.4 Robustness Monitoring

{{robustness_monitoring}}

### 2.5 Cybersecurity Monitoring

{{cybersecurity_monitoring}}

---

## 3. Data Collection Strategy

<!-- Article 72(2): The post-market monitoring system shall actively and systematically collect, document and analyse relevant data which may be provided by deployers or which may be collected through other sources on the performance of high-risk AI systems throughout their lifetime. -->

### 3.1 Data Sources

| Source | Data Type | Collection Method | Frequency |
|--------|----------|------------------|-----------|
| System logs | {{log_data_type}} | {{log_collection_method}} | {{log_frequency}} |
| Deployer feedback | {{deployer_data_type}} | {{deployer_collection_method}} | {{deployer_frequency}} |
| User complaints | {{complaint_data_type}} | {{complaint_collection_method}} | {{complaint_frequency}} |
| Performance telemetry | {{telemetry_data_type}} | {{telemetry_collection_method}} | {{telemetry_frequency}} |
| External reports | {{external_data_type}} | {{external_collection_method}} | {{external_frequency}} |

### 3.2 Data from Deployers

<!-- Article 72(2): Providers shall allow deployers to provide relevant data, including on the performance of the system in their specific context. -->

{{deployer_data_collection}}

### 3.3 Data Processing and Storage

{{data_processing_storage}}

### 3.4 Data Protection Considerations

<!-- Post-market monitoring data collection must comply with GDPR. -->

{{data_protection_considerations}}

---

## 4. Incident Detection

### 4.1 Monitoring Mechanisms

| Mechanism | Description | Responsible |
|-----------|-------------|-------------|
| Automated performance monitoring | {{auto_monitoring_description}} | {{auto_monitoring_owner}} |
| Anomaly detection | {{anomaly_detection_description}} | {{anomaly_detection_owner}} |
| Deployer incident reports | {{deployer_incident_description}} | {{deployer_incident_owner}} |
| User complaint analysis | {{complaint_analysis_description}} | {{complaint_analysis_owner}} |
| External surveillance | {{external_surveillance_description}} | {{external_surveillance_owner}} |

### 4.2 Incident Classification

| Severity Level | Definition | Response Time | Escalation |
|---------------|-----------|---------------|-----------|
| Critical | {{critical_definition}} | {{critical_response}} | {{critical_escalation}} |
| High | {{high_definition}} | {{high_response}} | {{high_escalation}} |
| Medium | {{medium_definition}} | {{medium_response}} | {{medium_escalation}} |
| Low | {{low_definition}} | {{low_response}} | {{low_escalation}} |

### 4.3 Detection of Non-Compliance

<!-- Situations where the AI system may no longer meet the requirements of Chapter III, Section 2, including performance degradation, bias drift, or new risks discovered. -->

{{non_compliance_detection}}

---

## 5. Serious Incident Reporting

<!-- Article 73: Providers of high-risk AI systems placed on the Union market shall report any serious incident to the market surveillance authorities of the Member States where that incident occurred. -->

### 5.1 Definition of Serious Incident

<!-- Article 3(49): "serious incident" means any incident or malfunctioning of an AI system that directly or indirectly leads to: (a) the death of a person, or serious damage to the health of a person; (b) a serious and irreversible disruption of the management or operation of critical infrastructure; (c) the infringement of obligations under Union law intended to protect fundamental rights; (d) serious damage to property or the environment. -->

{{serious_incident_definition}}

### 5.2 Reporting Obligations

| Requirement | Details |
|-------------|---------|
| Reporting authority | {{reporting_authority}} |
| Reporting deadline (death/serious health damage) | Immediately, no later than 2 days after awareness |
| Reporting deadline (other serious incidents) | No later than 15 days after awareness |
| Reporting format | {{reporting_format}} |
| Contact information | {{reporting_contact}} |

### 5.3 Reporting Process

{{reporting_process}}

### 5.4 Investigation Procedures

{{investigation_procedures}}

### 5.5 Notification to Deployers

<!-- The provider must inform all affected deployers of serious incidents without undue delay. -->

{{deployer_notification_process}}

---

## 6. Review Cycle

### 6.1 Periodic Review Schedule

| Review Type | Frequency | Scope | Responsible |
|------------|-----------|-------|-------------|
| Operational performance review | {{operational_review_frequency}} | {{operational_review_scope}} | {{operational_review_owner}} |
| Compliance review | {{compliance_review_frequency}} | {{compliance_review_scope}} | {{compliance_review_owner}} |
| Risk assessment review | {{risk_review_frequency}} | {{risk_review_scope}} | {{risk_review_owner}} |
| Post-market monitoring plan review | {{plan_review_frequency}} | {{plan_review_scope}} | {{plan_review_owner}} |

### 6.2 Trigger-Based Reviews

<!-- In addition to periodic reviews, reviews should be triggered by specific events. -->

| Trigger | Review Scope | Timeline |
|---------|-------------|----------|
| Serious incident | {{incident_review_scope}} | {{incident_review_timeline}} |
| Significant performance degradation | {{degradation_review_scope}} | {{degradation_review_timeline}} |
| Regulatory change | {{regulatory_review_scope}} | {{regulatory_review_timeline}} |
| System update or modification | {{update_review_scope}} | {{update_review_timeline}} |
| Deployer complaint | {{complaint_review_scope}} | {{complaint_review_timeline}} |

### 6.3 Review Documentation

{{review_documentation}}

---

## 7. Corrective Actions

### 7.1 Corrective Action Framework

<!-- Article 72(3): Where the post-market monitoring system identifies any need for corrective action, the provider shall take appropriate corrective action without undue delay. -->

{{corrective_action_framework}}

### 7.2 Action Types

| Action Level | Description | Examples | Approval Required |
|-------------|-------------|----------|-------------------|
| Immediate | {{immediate_description}} | {{immediate_examples}} | {{immediate_approval}} |
| Short-term | {{short_term_description}} | {{short_term_examples}} | {{short_term_approval}} |
| Long-term | {{long_term_description}} | {{long_term_examples}} | {{long_term_approval}} |

### 7.3 Recall and Withdrawal

<!-- Where the system presents a risk within the meaning of Article 79, the provider shall take corrective action including withdrawal, disabling, or recall. -->

{{recall_withdrawal_procedures}}

### 7.4 Communication of Corrective Actions

<!-- The provider shall inform all deployers, authorised representatives, importers, and distributors of corrective actions taken. -->

{{corrective_action_communication}}

### 7.5 Effectiveness Verification

{{corrective_action_verification}}

---

## 8. Roles and Responsibilities

| Role | Name | Responsibilities |
|------|------|-----------------|
| Post-market monitoring owner | {{pms_owner}} | {{pms_owner_responsibilities}} |
| Technical monitoring lead | {{tech_lead}} | {{tech_lead_responsibilities}} |
| Compliance officer | {{compliance_officer}} | {{compliance_officer_responsibilities}} |
| Incident response lead | {{incident_lead}} | {{incident_lead_responsibilities}} |

---

## 9. Record-Keeping

<!-- The post-market monitoring plan and all data collected, analyses performed, corrective actions taken, and reports filed must be retained for at least 10 years. -->

### 9.1 Retention Requirements

{{retention_requirements}}

### 9.2 Documentation Standards

{{documentation_standards}}

---

**REVIEW NOTES FOR LEGAL TEAM**:

{{review_notes}}

---

*This post-market monitoring plan was generated by LaunchClear. Article 72 of the EU AI Act requires providers of high-risk AI systems to establish a post-market monitoring system proportionate to the nature and risks of the system. Article 73 imposes strict serious incident reporting obligations with defined timelines. All monitoring procedures and reporting obligations should be reviewed by qualified legal counsel. The AI Act post-market monitoring obligations apply from 2 August 2026.*
