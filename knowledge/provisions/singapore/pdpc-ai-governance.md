---
id: "singapore-pdpc-ai-governance"
law: "Personal Data Protection Act 2012 (PDPA), as amended 2020"
articles: []
effectiveDate: null
generatedBy: "claude-opus-4"
sources:
  - id: "sg-pdpc-ai-governance"
  - id: "sg-pdpa"
verification:
  status: "unverified"
  lastAuditDate: null
  auditor: null
  issues: []
---
# Singapore — PDPC Model AI Governance Framework

**Authority**: Personal Data Protection Commission (PDPC), Singapore
**Document**: Model AI Governance Framework (2nd Edition, January 2020)
**Legal Basis**: Personal Data Protection Act 2012 (PDPA), as amended 2020
**Status**: Voluntary framework; PDPA requirements are mandatory

## Overview

The PDPC Model AI Governance Framework provides guidance to private-sector
organisations on responsible AI deployment in Singapore. While the framework
itself is voluntary, it operationalises principles that align with mandatory
PDPA obligations — particularly around consent, purpose limitation, and
accountability for automated processing of personal data.

The framework is structured around two guiding principles and four focus areas.
It is technology-neutral and applies to all AI systems, including machine
learning, rule-based systems, and hybrid approaches.

## Guiding Principles

### Principle 1 — AI Decision-Making Should Be Explainable, Transparent, and Fair

Organisations deploying AI should ensure that:
- Decisions made by or assisted by AI can be explained in a manner appropriate
  to the context and stakeholders involved
- The use of AI is transparent to affected individuals, particularly where AI
  significantly affects their rights or interests
- AI systems are designed and monitored to minimise unintended bias and
  discrimination

### Principle 2 — AI Systems Should Be Human-Centric

AI should be deployed in a manner that:
- Protects the interests and well-being of individuals
- Ensures meaningful human oversight is maintained where the impact of AI
  decisions on individuals is significant
- Allows affected individuals to seek recourse

## Focus Area 1 — Internal Governance Structures and Measures

### 1.1 — Roles and Responsibilities

Organisations should designate clear roles and responsibilities for AI
governance, including:
- Board-level or senior management oversight of AI strategy and risk
- A designated individual or team responsible for AI governance (analogous
  to a Data Protection Officer under the PDPA)
- Clear accountability for AI system performance, fairness, and safety

### 1.2 — Risk Assessment and Management

Organisations should establish:
- AI risk assessment processes before deployment
- Classification of AI use cases by risk level (considering impact on
  individuals, autonomy of the system, and reversibility of decisions)
- Regular review and re-assessment as AI systems evolve

### 1.3 — Policies and Procedures

Documented policies covering:
- Data management for AI (collection, use, retention, disposal)
- Model development, testing, and validation standards
- Incident response for AI failures or unintended outcomes
- Ethical guidelines for AI design and use

## Focus Area 2 — Determining AI Decision-Making Model

### 2.1 — Degree of Human Involvement

The framework recommends that organisations assess the appropriate degree of
human involvement based on:
- **Severity of impact** — decisions with greater consequences for individuals
  warrant higher human oversight
- **Probability of harm** — systems with higher error rates or operating in
  novel contexts require more human involvement
- **Reversibility** — irreversible decisions (e.g., denial of credit, medical
  diagnosis) demand stronger human oversight

### 2.2 — Decision-Making Models

Three models of human-AI interaction:
1. **Human-in-the-loop**: Human makes the final decision, AI provides
   recommendation or analysis
2. **Human-on-the-loop**: AI makes the decision, human monitors and can
   intervene or override
3. **Human-out-of-the-loop**: AI makes decisions autonomously; appropriate
   only for low-risk, reversible decisions

### 2.3 — Algorithm Auditing

Organisations should consider:
- Internal auditing of algorithms for accuracy, bias, and fairness
- Independent third-party audits for high-risk AI systems
- Regular auditing cycles aligned with model retraining and updates
- Documentation of audit methodology, findings, and remediation actions

## Focus Area 3 — Operations Management

### 3.1 — Data Management

Aligned with PDPA data protection obligations:
- **Data quality**: Ensure training and operational data is accurate,
  complete, and representative of the intended population
- **Data lineage**: Maintain records of data sources, transformations,
  and processing history
- **Data minimisation**: Collect and process only the data necessary for
  the AI system's purpose (PDPA Section 18)
- **Consent**: Obtain consent for collection, use, and disclosure of
  personal data for AI processing (PDPA Sections 13-17), unless a
  recognised exception applies (e.g., legitimate interests under the
  2020 PDPA amendments)

### 3.2 — Explainability

Organisations should provide explanations of AI decisions that are:
- Appropriate to the audience (technical vs. non-technical stakeholders)
- Proportionate to the impact of the decision
- Available in a timely manner

Techniques include: feature importance, decision trees, LIME/SHAP values,
counterfactual explanations, or simplified rule-based approximations of
complex models.

### 3.3 — Accuracy and Reliability

- Establish accuracy benchmarks appropriate to the use case
- Test models across demographic groups to detect disparate performance
- Monitor production performance against established benchmarks
- Define thresholds for model retraining or decommissioning

## Focus Area 4 — Stakeholder Interaction and Communication

### 4.1 — Disclosure to Affected Individuals

Organisations should inform individuals when:
- AI is being used to make or assist decisions that affect them
- Their personal data is being processed by AI systems
- They have the right to seek human review of AI-driven decisions

Disclosure should be provided in clear, accessible language.

### 4.2 — Human Oversight and Escalation

- Provide accessible channels for individuals to request human review
  of AI-driven decisions
- Ensure human reviewers have sufficient context, training, and authority
  to override AI decisions
- Document escalation procedures and resolution outcomes

### 4.3 — Feedback Mechanisms

- Collect and incorporate feedback from affected individuals and stakeholders
- Use feedback to improve AI system performance and fairness
- Report publicly on AI governance practices where appropriate

## PDPA Requirements Applicable to AI

The following PDPA provisions apply mandatorily to AI processing of personal data:

### Consent Obligation (Sections 13-17)

Organisations must obtain consent before collecting, using, or disclosing
personal data for AI processing, unless an exception applies:
- **Legitimate interests exception** (Section 13(a), introduced 2020):
  Organisations may process personal data without consent where the
  processing is in the legitimate interests of the organisation, provided
  that any adverse effect on the individual is not greater than the benefit
- **Business improvement exception** (Section 17A): Processing for improving
  or developing products/services, provided reasonable steps are taken to
  anonymise or aggregate the data before use

### Purpose Limitation (Section 18)

Personal data collected for one purpose may not be used for a substantially
different AI purpose without obtaining fresh consent or relying on a valid
exception.

### Access and Correction (Sections 21-22)

Individuals have the right to:
- Request access to personal data held by the organisation, including data
  used in AI processing
- Request correction of inaccurate personal data
- These rights apply to data used as AI inputs and to AI-generated profiles
  or scores associated with the individual

### Data Breach Notification (Section 26A-26E)

Data breaches involving AI systems that meet the notification threshold
(significant harm to individuals or affecting 500+ individuals) must be
reported to the PDPC within 3 calendar days of assessment.

## AI Ethics Framework

The PDPC also published "A Proposed Model Artificial Intelligence Governance
Framework" with an accompanying AI Ethics Framework that recommends
organisations:
- Adopt ethical principles as part of their corporate governance
- Consider the societal impact of AI deployment beyond legal compliance
- Engage with stakeholders, including affected communities, in AI governance

## Practical Implementation

1. **Designate AI governance roles** — appoint responsible individuals at
   board and operational levels
2. **Risk-classify AI use cases** — categorise by impact severity and
   human involvement requirement
3. **Audit algorithms** — conduct internal and, for high-risk systems,
   independent audits for bias and accuracy
4. **Ensure PDPA compliance** — review consent, purpose limitation, and
   data quality for all AI data pipelines
5. **Disclose AI use** — inform affected individuals, provide human review
   channels
6. **Monitor and iterate** — track production performance, collect feedback,
   retrain responsibly

## Citations

- PDPC, Model AI Governance Framework (2nd Edition, January 2020)
- PDPC, Companion to the Model AI Governance Framework — Implementation
  and Self-Assessment Guide for Organisations (ISAGO), January 2020
- Personal Data Protection Act 2012 (No. 26 of 2012), as amended by
  Personal Data Protection (Amendment) Act 2020
- PDPA Sections 13-17 (Consent Obligation)
- PDPA Section 18 (Purpose Limitation Obligation)
- PDPA Sections 21-22 (Access and Correction Obligations)
- PDPA Sections 26A-26E (Data Breach Notification)
- PDPC, A Proposed Model Artificial Intelligence Governance Framework (2019)
- PDPC Advisory Guidelines on the PDPA for AI and Automated Decision-Making
