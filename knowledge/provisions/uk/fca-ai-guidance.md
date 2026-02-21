---
id: "uk-fca-ai-guidance"
law: "Financial Services and Markets Act 2000 (FSMA), FCA Handbook (PRIN, SYSC, COBS, ICOBS), PRA Rulebook, Consumer Duty (PS22/9). No AI-specific financial services legislation — existing regulatory framework applied to AI."
articles: []
effectiveDate: null
generatedBy: "claude-opus-4"
sources:
  - id: "fca-ai-guidance"
verification:
  status: "unverified"
  lastAuditDate: null
  auditor: null
  issues: []
---
# UK — FCA AI Guidance for Financial Services

**Authority**: Financial Conduct Authority (FCA); Prudential Regulation Authority (PRA)
**Legal Basis**: Financial Services and Markets Act 2000 (FSMA), FCA Handbook (PRIN, SYSC, COBS, ICOBS), PRA Rulebook, Consumer Duty (PS22/9). No AI-specific financial services legislation — existing regulatory framework applied to AI.
**Status**: Active guidance — FCA and PRA applying existing principles and rules to AI; sector-specific AI guidance published and evolving. Consumer Duty fully in force since July 2024.

## Overview

The FCA and PRA regulate AI use in financial services through the UK's existing
outcomes-based regulatory framework. Unlike jurisdictions that have enacted
AI-specific financial regulation (e.g., the EU AI Act's Annex III high-risk
classification for credit scoring), the UK applies its general principles of
consumer protection, market integrity, and prudential soundness to AI systems.

This approach means there is no single "AI compliance checklist" for UK
financial services. Instead, firms must demonstrate that their AI systems
meet the same regulatory outcomes as non-AI systems — fair treatment of
customers, effective risk management, adequate governance, and transparency
— while addressing AI-specific risks such as bias, opacity, and model drift.

The FCA has signalled that AI is a supervisory priority. Firms deploying AI
in consumer-facing decisions, risk assessment, or market activities should
expect increasing regulatory scrutiny.

## Consumer Duty and AI

### PS22/9 — The Consumer Duty

The Consumer Duty, fully in force since 31 July 2024 for all products and
services, imposes an overarching obligation on firms to deliver good outcomes
for retail customers. The Duty has four outcomes, each with AI-specific
implications:

**Outcome 1: Products and Services**
- AI-designed or AI-recommended financial products must be designed to meet
  the needs of the target market
- AI-driven product personalisation must not exploit customer vulnerabilities
  or behavioural biases
- Product governance must account for how AI systems may cause product
  performance to drift from original target market expectations

**Outcome 2: Price and Value**
- AI-based pricing (dynamic pricing, personalised pricing, risk-based pricing)
  must deliver fair value to customers
- Firms must demonstrate that AI pricing models do not systematically charge
  higher prices to customers with protected characteristics or vulnerable
  customers who would not benefit from the higher-priced product
- Price optimisation using AI that exploits inertia or behavioural biases
  is inconsistent with the Duty

**Outcome 3: Consumer Understanding**
- Communications about AI-driven products, services, and decisions must be
  clear, fair, and not misleading
- Where AI contributes to a financial decision (e.g., lending, insurance
  underwriting), customers must receive information they need to understand
  the outcome and challenge it if appropriate
- AI-generated communications (e.g., robo-advice, chatbot interactions) must
  meet the same clarity standards as human-generated communications

**Outcome 4: Consumer Support**
- AI-powered customer service must not create barriers to support, switching,
  or complaints
- Where AI is used in complaints handling, it must not systematically deny or
  delay valid complaints
- Customers must be able to escalate from AI to human support when needed

### Vulnerability and AI

The FCA's Guidance on the Fair Treatment of Vulnerable Customers (FG21/1)
applies to AI systems. AI must:
- Not systematically disadvantage vulnerable customers
- Be able to identify and accommodate vulnerability signals
- Not assume that average-case model performance implies fair treatment of
  all customer segments, including vulnerable groups

## Senior Managers & Certification Regime (SM&CR)

### Application to AI

The SM&CR holds designated Senior Managers personally accountable for the
activities within their area of responsibility. For AI, this means:

- A **Senior Manager must be identifiable** as responsible for AI systems
  within their business area
- The responsible Senior Manager must have **sufficient understanding** of
  the AI systems they are accountable for — not necessarily technical
  expertise, but understanding of the system's purpose, risks, and governance
- **Prescribed responsibilities** may encompass AI — for example, the Chief
  Risk Officer's responsibility for risk management extends to AI model risk
- Firms should document **which Senior Manager is accountable** for each
  significant AI system in their Responsibilities Map

### Certification Regime

Staff who manage or oversee AI systems that could cause significant harm to
the firm or its customers may fall within the Certification Regime, requiring
firms to certify their fitness and propriety annually.

## Model Risk Management

### FCA/PRA Expectations

While the UK does not have a direct equivalent of the US SR 11-7 Model Risk
Management guidance, the FCA and PRA expect firms to manage AI model risk
through existing frameworks:

**PRA Supervisory Statement SS1/23 — Model Risk Management Principles**

The PRA published dedicated model risk management principles applicable to
banks and insurers:

1. **Model identification and classification** — maintain an inventory of all
   models, including AI/ML models, classified by materiality and risk
2. **Governance** — board-level oversight of model risk; clear ownership and
   accountability for each model
3. **Model development** — documented development process including data
   selection, feature engineering, model selection, and validation
4. **Model validation** — independent validation by qualified staff who were
   not involved in model development
5. **Model monitoring** — ongoing performance monitoring, drift detection,
   and revalidation triggers
6. **Model change management** — controlled process for model updates,
   retraining, and decommissioning

**AI-Specific Model Risk Considerations**:
- **Explainability** — the FCA expects firms to be able to explain AI model
  outputs to supervisors and, where relevant, to customers. Black-box models
  are not prohibited but require enhanced governance and monitoring.
- **Data quality** — AI models trained on biased, incomplete, or
  unrepresentative data may produce outcomes that breach the Consumer Duty
  or discrimination law
- **Model drift** — AI models that learn from new data or adapt over time
  require continuous monitoring for performance degradation and bias drift
- **Third-party model risk** — firms using third-party AI models (including
  foundation models via API) remain fully accountable for model outputs. The
  FCA does not accept "we used a vendor model" as a defence for poor outcomes.

## Fairness and Bias in Financial AI

### Equality Act 2010

Financial services firms must comply with the Equality Act 2010, which
prohibits discrimination on the basis of protected characteristics. AI systems
must not:

- Directly discriminate — make decisions based on protected characteristics
- Indirectly discriminate — use apparently neutral criteria that
  disproportionately disadvantage people with a protected characteristic,
  unless objectively justified

### FCA Expectations on AI Fairness

The FCA has published expectations for AI fairness in financial services:

1. **Bias testing before deployment** — test AI models across protected
   characteristics (where data is available) before deployment
2. **Ongoing bias monitoring** — monitor for discriminatory outcomes on an
   ongoing basis, using appropriate statistical methods
3. **Disparate impact analysis** — assess whether AI decisions produce
   significantly different outcomes for different demographic groups
4. **Proxy variable assessment** — identify and assess variables that may
   serve as proxies for protected characteristics (e.g., postcode as a proxy
   for ethnicity)
5. **Remediation** — have processes in place to address identified bias,
   including model retraining, feature removal, or deployment restrictions

### Insurance-Specific Fairness

For insurance pricing models using AI:
- Firms must be able to justify risk factors used in AI pricing models
- The FCA's General Insurance Pricing Practices rules (PS21/5) restrict the
  use of AI pricing models that penalise loyal customers or exploit inertia
- Health and life insurers must ensure AI pricing does not discriminate on
  grounds prohibited by the Equality Act (gender, disability, genetic
  information for certain product types)

## Explainability Requirements

### Consumer-Facing Explainability

Under the Consumer Duty and existing conduct rules (COBS, ICOBS), firms must
explain AI-driven decisions to consumers:

- **Lending decisions** — consumers denied credit or offered less favourable
  terms must receive meaningful reasons. "The algorithm decided" is not
  sufficient. The explanation must identify the principal reasons.
- **Insurance underwriting** — individuals who are declined insurance or
  charged higher premiums based on AI risk assessment must receive
  explanation of the factors that contributed to the decision.
- **Investment recommendations** — AI-driven or robo-advice must explain the
  basis for recommendations in terms the customer can understand.
- **Claims decisions** — AI-assisted claims assessment must provide
  transparent reasons for decisions, particularly denials.

### Regulator-Facing Explainability

Firms must be able to explain AI models to supervisors:

- The FCA expects firms to demonstrate understanding of how their AI models
  work, what drives their outputs, and what their limitations are
- "Model documentation" must be sufficient for the FCA to assess the model's
  fitness for purpose and compliance with regulatory requirements
- Where models are opaque (deep learning, ensemble methods), firms must
  employ interpretability techniques (SHAP, LIME, attention analysis, etc.)
  and document their limitations

## AI Sandboxing and Innovation Support

### FCA Regulatory Sandbox

The FCA Regulatory Sandbox allows firms to test innovative AI products with
real customers in a controlled environment:

- Reduced regulatory requirements during the testing phase
- Dedicated FCA supervision and guidance
- Structured testing with clear success metrics and consumer protection
  safeguards
- Previous sandbox cohorts have included AI-driven credit scoring, insurance
  pricing, and customer service applications

### FCA TechSprint

The FCA runs TechSprint events focusing on AI challenges in financial services,
including:
- AI explainability in consumer lending
- AI fairness in insurance pricing
- AI-powered anti-money laundering

### Innovation Pathways

For firms whose AI products do not fit neatly into existing regulatory
categories, the FCA's Innovation Pathways service provides guidance on the
regulatory framework applicable to specific AI use cases.

## PRA Expectations for AI in Insurance and Banking

### Insurance (Solvency II Firms)

The PRA expects insurers to:
- Include AI models in their model risk management framework
- Validate AI pricing and reserving models independently
- Ensure actuarial oversight of AI models used in underwriting and pricing
- Document AI model limitations and uncertainty in Own Risk and Solvency
  Assessment (ORSA) reports

### Banking (CRD/CRR Firms)

The PRA expects banks to:
- Include AI models in their Internal Capital Adequacy Assessment Process
  (ICAAP) model inventory
- Apply model validation standards to AI/ML models used in credit risk,
  market risk, and operational risk
- Ensure that AI models used for regulatory capital calculations meet the
  same validation standards as traditional models
- Report significant AI model failures to the PRA

## Key Enforcement and Supervision Approach

The FCA and PRA have signalled their enforcement approach to AI:

- **Outcomes-focused** — regulators will assess whether AI produces good
  outcomes, not whether specific technical processes were followed
- **Proportionate** — expectations scale with the risk and impact of the AI
  system. A chatbot for FAQs attracts less scrutiny than AI credit scoring.
- **Technology-neutral** — the same rules apply whether decisions are made by
  AI, simple algorithms, or humans. AI does not get a lower (or higher)
  standard.
- **Senior accountability** — enforcement may target the Senior Manager
  responsible for the AI system, not just the firm

### Potential Penalties

- FCA: unlimited fines for firms; fines, public censure, and prohibition
  orders for individuals under SM&CR
- PRA: fines and public censure; power to require remediation of AI systems
  that pose prudential risk
- Financial Ombudsman Service: consumer redress including compensation for
  AI-driven decisions that caused detriment

## Citations

- Financial Services and Markets Act 2000 (FSMA)
- FCA Handbook: PRIN (Principles for Businesses), SYSC (Senior Management
  Arrangements, Systems and Controls), COBS (Conduct of Business Sourcebook),
  ICOBS (Insurance: Conduct of Business Sourcebook)
- FCA PS22/9: A New Consumer Duty (July 2022; fully in force July 2024)
- FCA FG21/1: Guidance for Firms on the Fair Treatment of Vulnerable
  Customers (February 2021)
- PRA SS1/23: Model Risk Management Principles for Banks (May 2023)
- FCA PS21/5: General Insurance Pricing Practices (September 2021)
- FCA DP5/22: Discussion Paper on Artificial Intelligence (October 2022)
- FCA Feedback Statement FS2/23: AI and Machine Learning (2023)
- PRA Supervisory Statement SS3/19: Enhancing Banks' and Insurers'
  Approaches to Managing the Financial Risks from Climate Change
  (references AI model risk in climate scenario analysis)
- Equality Act 2010, Part 2 (Protected Characteristics), Part 3 (Services)
- DSIT "A Pro-Innovation Approach to AI Regulation" (Cm 9809, March 2023)
- SM&CR: FSMA 2000, Part V and FCA/PRA rules in SYSC, DEPP, and SUP
