---
id: "singapore-mas-ai-risk-management"
law: "MAS Act, Banking Act, Securities and Futures Act, Insurance Act, Payment Services Act"
articles: []
effectiveDate: null
generatedBy: "claude-opus-4"
sources:
  - id: "sg-mas-ai-risk"
verification:
  status: "unverified"
  lastAuditDate: null
  auditor: null
  issues: []
---
# Singapore — MAS Guidelines on AI Risk Management for Financial Institutions

**Authority**: Monetary Authority of Singapore (MAS)
**Document**: Guidelines on the Use of Artificial Intelligence and Data Analytics by Financial Institutions (2025 edition)
**Legal Basis**: MAS Act, Banking Act, Securities and Futures Act, Insurance Act, Payment Services Act
**Status**: Supervisory expectations; non-compliance may result in supervisory action

## Overview

The MAS Guidelines on AI Risk Management establish supervisory expectations
for financial institutions (FIs) in Singapore that develop, deploy, or
procure AI and data analytics (AIDA) solutions. Originally issued as the
Fairness, Ethics, Accountability, and Transparency (FEAT) principles in 2018,
and updated through the Veritas initiative and subsequent guidance, the 2025
guidelines consolidate AI risk management expectations into a comprehensive
framework.

The guidelines apply to all MAS-regulated entities — banks, insurers, capital
market intermediaries, payment service providers, and financial holding
companies — and cover the entire AI lifecycle from development through
deployment, monitoring, and retirement.

The guidelines adopt a proportionality principle: governance measures should
scale with the risk materiality of the AI use case and the size and complexity
of the financial institution.

## Board and Senior Management Governance

### Board-Level Oversight

The board of directors of a financial institution should:
- Approve the institution's AI strategy and risk appetite for AI use
- Ensure adequate resources are allocated for AI governance
- Receive regular reporting on material AI risks, incidents, and audit findings
- Ensure that AI governance is integrated into the institution's overall
  risk management framework, not treated as a standalone initiative

### Senior Management Responsibilities

Senior management should:
- Establish clear roles and responsibilities for AI governance, including
  designation of a senior executive accountable for AI risk
- Implement policies and procedures for AI development, deployment, and
  procurement
- Ensure staff involved in AI have appropriate skills and training
- Foster a culture of responsible AI use throughout the organisation
- Report material AI risks and incidents to the board in a timely manner

### Three Lines of Defence

AI governance should follow the three-lines-of-defence model:
1. **First line**: Business units and AI development teams — own AI risks,
   implement controls, conduct initial testing and validation
2. **Second line**: Risk management and compliance functions — provide
   independent oversight, challenge AI risk assessments, set standards
3. **Third line**: Internal audit — provide independent assurance on AI
   governance, assess effectiveness of controls

## AI Risk Materiality Assessment

### Tiered Approach

The MAS guidelines require financial institutions to assess the risk
materiality of each AI use case and apply governance measures proportionately.

Materiality is determined by:

1. **Impact on customers**: Does the AI system make or influence decisions
   that materially affect customers' access to financial products, pricing,
   service levels, or financial well-being?
2. **Financial impact**: What is the potential financial loss to the
   institution or customers if the AI system fails or produces erroneous
   outputs?
3. **Reputational impact**: Could failures or biased outputs cause
   significant reputational damage?
4. **Regulatory impact**: Does the AI use case fall within a regulated
   activity (e.g., credit assessment, insurance underwriting, AML/KYC
   screening, investment advice)?
5. **Systemic impact**: Could failures in the AI system affect the stability
   of the financial system or multiple institutions?

### Materiality Tiers

| Tier | Criteria | Governance Level |
|---|---|---|
| **High** | Directly affects customer rights, financial outcomes, or regulatory compliance; irreversible or difficult-to-reverse decisions; large-scale impact | Full lifecycle controls, independent validation, board reporting, regular audit |
| **Medium** | Influences but does not directly determine customer outcomes; moderate financial or reputational impact; reversible with some effort | Documented development process, periodic validation, management reporting |
| **Low** | Internal operational tools; no direct customer impact; easily reversible; limited financial exposure | Basic documentation, standard IT controls, periodic review |

### Examples by Materiality

- **High materiality**: Credit scoring, loan approval, insurance underwriting
  and pricing, AML/KYC screening, fraud detection affecting customer accounts,
  algorithmic trading, investment recommendation
- **Medium materiality**: Customer segmentation for marketing, chatbots for
  customer service, document processing for claims, internal risk reporting
- **Low materiality**: Internal productivity tools, IT operations analytics,
  meeting scheduling, code assistance for developers

## Lifecycle Controls

### Data Management

- **Data quality**: Ensure data used for AI model development and operation
  is accurate, complete, timely, and relevant to the use case
- **Data representativeness**: Training data should be representative of the
  population the model will serve; assess and document potential gaps or biases
  in data composition
- **Data lineage**: Maintain records of data sources, transformations,
  and processing steps throughout the AI lifecycle
- **Data privacy**: Comply with PDPA requirements and MAS-specific data
  governance expectations; anonymisation and aggregation should be used
  where possible
- **Data retention**: Retain training data, validation data, and operational
  data for a period sufficient for audit, model revalidation, and regulatory
  review

### Model Development and Validation

- **Documentation**: Document model purpose, design choices, methodology,
  assumptions, limitations, and known risks
- **Development standards**: Follow documented model development standards
  appropriate to the materiality tier
- **Testing**: Test models rigorously before deployment, including:
  - Performance testing against established accuracy benchmarks
  - Stress testing under adverse or extreme scenarios
  - Sensitivity analysis to assess model robustness
- **Independent validation**: For high-materiality AI use cases, model
  validation should be conducted by parties independent from the development
  team (consistent with SR 11-7 principles adopted in Singapore's context)
- **Approval process**: Formal approval for deployment by appropriate
  management level, documented with rationale

### Fairness Testing

Financial institutions must assess AI systems for fairness:
- Test for discriminatory outcomes across protected characteristics
  (race, gender, age, religion, nationality) where relevant to the use case
- Document fairness metrics used and justification for their selection
- Conduct fairness testing both pre-deployment and in ongoing monitoring
- Where unfair outcomes are detected, document the root cause analysis and
  remediation measures taken

MAS FEAT Fairness Principles:
- AI-driven decisions should not systematically disadvantage specific
  groups of individuals on the basis of personal attributes that are not
  relevant to the decision
- Where differential treatment exists, it should be explainable and
  justified by legitimate business or actuarial reasons
- Fairness assessments should consider both individual and group fairness
  metrics appropriate to the use case

### Explainability

AI systems used in customer-facing decisions should be explainable:
- **To customers**: Provide meaningful explanations of AI-driven decisions,
  particularly adverse decisions (loan denial, higher premiums, account
  restrictions). Explanations should cite the principal factors in terms
  the customer can understand.
- **To internal stakeholders**: Risk managers, auditors, and management
  should be able to understand the model's logic, key drivers, and
  limitations
- **To regulators**: Be prepared to explain the model's design, validation
  results, and performance to MAS examiners

Explainability techniques should be proportionate to materiality:
- High materiality: Feature importance, counterfactual explanations,
  decision audit trails
- Medium materiality: Summary-level explanations, key driver reports
- Low materiality: General model documentation

### Human Oversight

- Define the appropriate level of human involvement for each AI use case
  based on materiality and impact
- For high-materiality decisions (credit, insurance, compliance screening),
  meaningful human oversight is expected — not rubber-stamp approval
- Human reviewers should have access to sufficient information, including
  the AI model's reasoning, to exercise genuine judgement
- Track and report human override rates as an indicator of oversight quality
- Ensure adequate staffing and training for human oversight functions

### Post-Deployment Monitoring

- Monitor model performance in production against established KPIs and
  thresholds
- Track model accuracy, stability, fairness metrics, and error rates
  over time
- Implement alerting for performance degradation, data drift, or anomalous
  behaviour
- Establish triggers for model revalidation (e.g., performance below
  threshold, significant data drift, regulatory or market changes)
- Conduct periodic model reviews on a schedule appropriate to the
  materiality tier

## Third-Party AI Management

### Vendor Assessment

Financial institutions that procure AI solutions from third-party vendors
must:
- Conduct due diligence on the vendor's AI development practices, data
  governance, and security measures before procurement
- Assess the vendor's ability to provide sufficient transparency into
  model design, training data, and validation results
- Evaluate vendor concentration risk — over-reliance on a single AI vendor
  may create systemic vulnerability

### Contractual Requirements

Contracts with AI vendors should include:
- Access to model documentation, validation reports, and performance data
- Audit rights — the ability to examine or have a third party examine the
  vendor's AI systems and practices
- Incident notification — timely notification of model failures, data
  breaches, or material changes
- Change management — advance notification and assessment of material
  model updates
- Exit strategy — ability to migrate or replace the AI solution if needed

### Ongoing Monitoring of Third-Party AI

- Monitor the performance of third-party AI systems against established
  benchmarks, just as with internally developed models
- Conduct periodic reviews of vendor compliance with contractual and
  regulatory requirements
- Participate in industry-level monitoring initiatives (e.g., Veritas
  consortium) where relevant

## MAS FEAT Principles

The FEAT principles underpin all MAS AI governance expectations:

### Fairness

AI-driven decisions should be fair and not discriminate against individuals
or groups on the basis of personal attributes unrelated to the decision.
Where differential outcomes exist, they should be explainable, justifiable,
and consistent with applicable laws and regulations.

### Ethics

Financial institutions should have ethical standards governing AI use,
embedded in corporate governance and culture. AI use should be consistent
with the institution's values and societal expectations.

### Accountability

Clear accountability must exist for AI-driven decisions. Financial
institutions must be able to identify who is responsible for AI system
design, deployment, and outcomes. The use of AI does not diminish the
accountability of the institution's board and senior management.

### Transparency

Financial institutions should be transparent about their use of AI,
particularly where it affects customers. Transparency obligations cover:
- Disclosure to customers that AI is used in decisions affecting them
- Provision of meaningful explanations for AI-driven decisions
- Availability of information to regulators about AI systems and their
  governance

## Interaction with Other Frameworks

- **PDPA / PDPC Model AI Governance Framework**: PDPA data protection
  obligations apply mandatorily; PDPC AI governance framework principles
  apply as baseline
- **IMDA GenAI Governance Framework**: Financial institutions using GenAI
  should also comply with IMDA GenAI governance guidance (content
  provenance, safety, disclosure) in addition to MAS-specific requirements
- **IMDA Agentic AI Framework**: Financial institutions deploying agentic
  AI (e.g., autonomous trading agents, AI-powered customer service agents
  that take actions) must comply with agentic AI governance requirements
- **Basel Committee Principles**: MAS guidelines are consistent with Basel
  Committee on Banking Supervision guidance on operational resilience and
  third-party risk management
- **US SR 11-7**: The MAS model risk management expectations are broadly
  consistent with US SR 11-7 / OCC 2011-12, facilitating compliance for
  institutions operating in both jurisdictions

## Supervisory Approach

MAS adopts a supervisory (not prescriptive) approach:
- AI governance practices are assessed during regular supervisory
  examinations
- Deficiencies may result in supervisory guidance letters, directions,
  or enforcement actions under the relevant financial legislation
- MAS participates in thematic reviews and industry-wide assessments
  of AI practices in the financial sector
- MAS encourages industry self-regulation through initiatives like the
  Veritas consortium and AI Verify Foundation participation

## Penalties and Enforcement

Non-compliance with MAS supervisory expectations may result in:
- Supervisory guidance letters requiring remediation
- Directions under the Banking Act, Insurance Act, Securities and Futures
  Act, or Payment Services Act
- Restrictions on the use of specific AI systems until governance deficiencies
  are resolved
- Monetary penalties under applicable financial legislation
- Public reprimands or revocation of licences in severe cases

## Citations

- MAS, Principles to Promote Fairness, Ethics, Accountability and
  Transparency (FEAT) in the Use of Artificial Intelligence and Data
  Analytics in Singapore's Financial Sector (2018, updated 2024)
- MAS, Veritas Document 1: FEAT Fairness Principles Assessment Methodology
- MAS, Veritas Document 2: FEAT Principles Assessment Case Studies
- MAS, Technology Risk Management Guidelines (January 2021)
- MAS, Guidelines on Outsourcing (October 2018, revised 2022)
- MAS, Guidelines on the Use of Artificial Intelligence and Data Analytics
  by Financial Institutions (2025)
- Banking Act (Cap. 19), Insurance Act (Cap. 142), Securities and Futures
  Act (Cap. 289), Payment Services Act 2019
- Personal Data Protection Act 2012, as amended 2020
- Basel Committee on Banking Supervision, Principles for the Sound
  Management of Operational Risk (2021)
