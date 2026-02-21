---
id: "eu-gdpr-automated-decisions"
law: "Regulation (EU) 2016/679 (General Data Protection Regulation)"
articles: ["Article 22"]
effectiveDate: "25 May 2018"
generatedBy: "claude-opus-4"
sources:
  - id: "eurlex-gdpr"
    articles: ["Article 22"]
verification:
  status: "unverified"
  lastAuditDate: null
  auditor: null
  issues: []
---
# GDPR — Automated Individual Decision-Making

**Law**: Regulation (EU) 2016/679 (General Data Protection Regulation)
**Article**: Article 22
**Effective**: 25 May 2018

## Overview

Article 22 provides data subjects with the right not to be subject to a
decision based solely on automated processing, including profiling, which
produces legal effects or similarly significantly affects them.

## Article 22(1) — General Prohibition

The data subject shall have the right not to be subject to a decision based
solely on automated processing, including profiling, which produces legal
effects concerning him or her or similarly significantly affects him or her.

## Article 22(2) — Exceptions

The prohibition does not apply if the decision is:

1. **Necessary for a contract** (Art 22(2)(a)) — necessary for entering
   into or performance of a contract between the data subject and controller
2. **Authorised by law** (Art 22(2)(b)) — authorised by Union or Member State
   law which also lays down suitable measures to safeguard data subject rights
3. **Based on explicit consent** (Art 22(2)(c)) — based on the data subject's
   explicit consent

## Article 22(3) — Safeguards

When automated decisions are permitted under Article 22(2)(a) or (c), the
controller must implement suitable measures to safeguard the data subject's
rights, including at a minimum:

1. The right to **obtain human intervention** from the controller
2. The right to **express their point of view**
3. The right to **contest the decision**

## AI System Implications

### What Constitutes "Solely Automated"

A decision is "solely automated" when there is no meaningful human involvement
in the decision. The EDPB has clarified that:

- A human merely rubber-stamping an automated decision does not constitute
  meaningful human involvement
- The human must have the authority and competence to change the decision
- The human must actually consider the individual case, not just follow the
  machine recommendation

### "Legal Effects or Similarly Significant Effects"

Legal effects include: denial of credit, refusal of employment, rejection of
asylum application, denial of insurance coverage.

Similarly significant effects include: decisions that significantly affect
circumstances, behaviour, or choices (e.g., targeted advertising that affects
pricing, automated denial of services, credit scoring).

### Profiling

Profiling is defined as any form of automated processing of personal data
consisting of the use of personal data to evaluate certain personal aspects
relating to a natural person, including analysing or predicting aspects
concerning performance at work, economic situation, health, personal
preferences, interests, reliability, behaviour, location, or movements.

### Right to Explanation

While Article 22 does not explicitly mention a "right to explanation," GDPR
requires providing "meaningful information about the logic involved" (Articles
13(2)(f), 14(2)(g), 15(1)(h)). This has been interpreted by the Article 29
Working Party as requiring:

- Categories of data used
- Why these categories are relevant
- How the profile is built and used
- The significance and envisaged consequences of profiling

## GenAI-Specific Considerations

For AI systems using foundation models:
- If the AI makes decisions that produce legal/significant effects (e.g., an
  LLM-powered credit assessment tool), Article 22 applies
- The requirement for human intervention may be challenging for real-time
  AI decision systems
- Explainability requirements may be difficult to meet for complex models,
  but the obligation remains — the controller must find ways to provide
  meaningful information

## Citations

- Regulation (EU) 2016/679, Article 22
- EDPB Guidelines on Automated Decision-Making and Profiling (WP251 rev.01)
- Recitals 71-72
