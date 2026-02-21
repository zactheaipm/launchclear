---
id: "eu-ai-act-financial-services"
law: "financial-services"
articles: []
effectiveDate: null
generatedBy: "claude-opus-4"
sources:
  - id: "eurlex-ai-act"
verification:
  status: "unverified"
  lastAuditDate: null
  auditor: null
  issues: []
---
# EU AI Act — Financial Services (Annex III §5)

## Overview

Annex III, point 5 of the EU AI Act classifies certain AI systems used in
access to essential private and public services — including financial
services — as **high-risk**. This section details the specific financial
services use cases that trigger high-risk classification.

## Annex III, Point 5: Access to Essential Private and Public Services

### 5(a) — Credit Scoring and Creditworthiness Assessment

**Classification**: HIGH-RISK

AI systems intended to be used to **evaluate the creditworthiness of natural
persons** or **establish their credit score**, with the exception of AI
systems used for the purpose of detecting financial fraud.

**What this covers**:
- Automated credit scoring models
- AI-based creditworthiness assessment for loan applications
- AI systems that determine credit limits
- Automated pre-approval/denial of credit applications
- AI systems that assess repayment probability

**What this excludes**:
- AI systems used solely for detecting financial fraud (these are NOT
  classified as high-risk under this point)
- Credit scoring of legal entities (only natural persons trigger high-risk)

**Key obligations**:
- Full conformity assessment (Articles 43-44)
- Risk management system (Article 9)
- Data governance — training data must be representative and free from
  bias that could lead to discriminatory credit decisions (Article 10)
- Human oversight — human reviewers must be able to override automated
  credit decisions (Article 14)
- Transparency — deployers must inform individuals that they are subject
  to AI-based credit assessment (Article 13)
- Technical documentation (Article 11)
- Automatic event logging with 6-month retention (Article 12)
- Accuracy, robustness, and cybersecurity measures (Article 15)

**Sectoral supervision**:
- European Banking Authority (EBA) — coordinates supervisory expectations
  for AI in banking
- National competent authorities under the Capital Requirements framework
  (CRD/CRR) — primary supervisors for credit institutions
- Consumer protection authorities — enforce fair lending requirements

### 5(b) — Life and Health Insurance Risk Assessment and Pricing

**Classification**: HIGH-RISK

AI systems intended to be used for **risk assessment and pricing** in
relation to natural persons in the case of **life and health insurance**.

**What this covers**:
- Automated risk assessment for life insurance applications
- AI-based health insurance pricing/premium calculation
- Underwriting models that assess insurability for life/health policies
- AI systems that determine policy terms based on health risk profiles
- Predictive models for life expectancy or morbidity risk used in insurance

**What this excludes**:
- Property and casualty insurance pricing (NOT classified as high-risk
  under this point)
- Vehicle insurance pricing (NOT classified under this point)
- Reinsurance risk modelling (NOT classified under this point, unless it
  directly affects individual life/health policy pricing)

**Key obligations**:
- Full conformity assessment (Articles 43-44)
- Risk management system — particular attention to bias in health data
  that could lead to discriminatory pricing (Article 9)
- Data governance — health and genetic data require heightened protections;
  training data must not embed biases related to pre-existing conditions,
  gender, age, or ethnicity that are not actuarially justified (Article 10)
- Human oversight — meaningful human review of risk assessments that
  result in denial or significantly higher pricing (Article 14)
- Transparency — individuals must be informed about AI-based risk
  assessment in their insurance application process (Article 13)
- Technical documentation (Article 11)
- Automatic event logging (Article 12)

**Sectoral supervision**:
- European Insurance and Occupational Pensions Authority (EIOPA) —
  coordinates supervisory approach for AI in insurance
- National insurance supervisory authorities — primary supervisors
- Solvency II framework — existing prudential requirements apply
  alongside AI Act obligations

### 5(c) — Emergency Services Call Assessment

**Classification**: HIGH-RISK

AI systems intended to be used to **evaluate and classify emergency calls**
by emergency services, including to establish priority for dispatching.

### 5(d) — Public Assistance and Benefits Eligibility

**Classification**: HIGH-RISK

AI systems intended to be used by public authorities to **evaluate
eligibility** for public assistance benefits, services, or other essential
government services, and to **grant, reduce, revoke, or reclaim** such
benefits.

## Conformity Assessment for Financial Services AI

Financial services AI systems classified as high-risk under Annex III §5
undergo conformity assessment through **internal control** (Annex VI —
self-assessment), not third-party assessment. This is the same procedure
as most other Annex III high-risk systems (with the exception of biometric
identification under §1, which requires notified body assessment).

### Steps for conformity assessment:
1. Verify compliance with all requirements in Articles 8-15
2. Establish and maintain a quality management system (Article 17)
3. Draw up technical documentation (Article 11)
4. Keep logs generated by the system (Article 12)
5. Undergo relevant conformity assessment procedure (Annex VI)
6. Draw up EU declaration of conformity (Article 47)
7. Affix CE marking (Article 48)
8. Register in EU database (Article 49)

## Interaction with Existing Financial Regulation

The EU AI Act operates **alongside** existing financial sector regulation,
not as a replacement:

- **GDPR Article 22**: Right not to be subject to solely automated
  decision-making (including profiling) — applies independently of AI Act
  classification. Credit decisions based solely on AI require either explicit
  consent or a legal basis, and must include the right to obtain human
  intervention.
- **Consumer Credit Directive (2008/48/EC)**: Existing obligations on
  creditworthiness assessment are supplemented, not replaced, by AI Act
  requirements.
- **Insurance Distribution Directive (2016/97/EU)**: Product governance
  and conduct of business rules apply alongside AI Act obligations.
- **Capital Requirements Regulation/Directive (CRR/CRD)**: Model risk
  management expectations from EBA guidelines supplement AI Act
  requirements for credit institutions using AI models.

## Timeline

- **2 August 2026**: High-risk system obligations take effect. All AI
  systems used for credit scoring, creditworthiness assessment, and
  life/health insurance risk assessment/pricing must be compliant.
- Financial institutions should begin conformity assessment preparation
  well in advance, given the complexity of legacy model documentation.

## Citations

- EU AI Act, Annex III, Point 5(a)-(d)
- EU AI Act, Articles 6-7 (high-risk classification)
- EU AI Act, Articles 8-15 (high-risk requirements)
- EU AI Act, Articles 43-44, Annex VI (conformity assessment)
- EU AI Act, Articles 47-49 (declaration, CE marking, registration)
- GDPR, Article 22 (automated decision-making)
- Consumer Credit Directive 2008/48/EC
- Insurance Distribution Directive 2016/97/EU
- EBA Guidelines on loan origination and monitoring (EBA/GL/2020/06)
- EIOPA Discussion Paper on AI governance (EIOPA-BoS-21/198)
