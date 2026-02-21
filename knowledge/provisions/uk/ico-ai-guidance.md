# UK — ICO AI and Data Protection Guidance

**Authority**: Information Commissioner's Office (ICO)
**Legal Basis**: UK GDPR (retained EU law), Data Protection Act 2018 (DPA 2018)
**Status**: Active guidance — regularly updated; legally binding obligations derive from UK GDPR and DPA 2018

## Overview

The ICO is the UK's independent data protection regulator. Its AI and data
protection guidance provides detailed, practical direction on how the UK GDPR
and DPA 2018 apply to AI systems that process personal data. Unlike the EU AI
Act (which the UK has not adopted), the UK relies on its existing data
protection framework as the primary legal instrument governing AI that involves
personal data.

The ICO's guidance suite covers the entire AI lifecycle — from design and
training through deployment and ongoing monitoring — and is structured around
the data protection principles in UK GDPR Article 5.

## Lawful Basis for AI Processing

### UK GDPR Article 6 — Lawful Basis

AI systems that process personal data must establish a valid lawful basis under
Article 6(1). The ICO has issued specific guidance on lawful basis selection
for AI:

**(a) Consent** — Valid for AI processing only if it is freely given, specific,
informed, and unambiguous. The ICO notes that consent is often difficult to
rely on for AI because:
- Individuals may not understand how their data will be used in AI training
- Withdrawing consent from a trained model may be technically infeasible
- Power imbalances (employer-employee, service provider-consumer) may
  undermine "freely given"

**(f) Legitimate interests** — The most commonly relied-upon basis for AI.
Requires a three-part test:
1. Purpose test: Is there a legitimate interest being pursued?
2. Necessity test: Is the AI processing necessary for that purpose?
3. Balancing test: Do the individual's interests, rights, or freedoms override?

The ICO emphasises that the balancing test must account for AI-specific factors:
reasonable expectations of the data subject, the intrusiveness of the
processing, the potential for AI to produce unexpected inferences, and whether
individuals can opt out.

### Special Category Data (Article 9)

AI systems processing special category data (racial/ethnic origin, health,
biometric data for identification, etc.) must satisfy both Article 6 AND
an Article 9 condition. The ICO flags that AI may inadvertently process or
infer special category data even when not explicitly collected — for example,
proxy variables that correlate with ethnicity or health status.

## Data Protection Impact Assessments (DPIAs) for AI

### UK GDPR Article 35 — When a DPIA Is Required

The ICO requires a DPIA when AI processing is likely to result in a **high
risk** to the rights and freedoms of individuals. The ICO's screening criteria
include:

- **Systematic and extensive profiling** with significant effects (Article 35(3)(a))
- **Large-scale processing of special category data** (Article 35(3)(b))
- **Systematic monitoring** of a publicly accessible area (Article 35(3)(c))
- **New technologies** — the ICO considers AI/ML to be "new technologies"
  triggering DPIA consideration in most contexts
- **Automated decision-making with legal or similarly significant effects**

### ICO DPIA Requirements for AI

The ICO expects AI DPIAs to address:

1. **Nature, scope, context, and purposes** of the AI processing
2. **Necessity and proportionality** — why AI is needed vs. less intrusive methods
3. **Risks to individuals** — including risks from inaccurate predictions,
   bias/discrimination, lack of transparency, and unexpected inferences
4. **Measures to mitigate risks** — technical (accuracy testing, bias audits)
   and organisational (human review, appeal mechanisms)
5. **Consultation with the DPO** (if appointed) and affected groups where
   appropriate

### ICO Guidance: AI-as-a-Service DPIAs

When using third-party AI services (e.g., cloud-based ML APIs), the ICO
expects organisations to assess:
- Data sharing with the AI service provider
- Whether the provider retains or uses submitted data for model improvement
- The provider's data processing agreements and sub-processors
- Transfer safeguards (if the provider processes data outside the UK)

## Fairness in AI

### UK GDPR Article 5(1)(a) — Fairness Principle

The ICO's AI fairness guidance goes beyond non-discrimination. It defines
three dimensions of AI fairness:

1. **Fairness towards individuals** — AI decisions should not be unjustifiably
   detrimental, unexpected, or misleading to the individuals concerned
2. **Statistical fairness** — AI systems should not produce systematically
   biased outcomes across protected characteristics (ICO aligns with the
   Equality Act 2010 protected characteristics)
3. **Process fairness** — Individuals should have appropriate information about
   and involvement in AI decisions that affect them

### Bias Testing and Monitoring

The ICO recommends:
- Testing for bias across protected characteristics before deployment
- Ongoing monitoring of AI system outputs for discriminatory patterns
- Documenting bias testing methodology and results
- Maintaining human oversight with the ability to override AI decisions that
  produce unfair outcomes

## Transparency Requirements

### UK GDPR Articles 13-14 — Right to Be Informed

When AI processes personal data, individuals must be told:
- That AI/automated processing is being used
- The logic involved in the processing (meaningful information about the logic)
- The significance and envisaged consequences of the processing for the
  individual

### ICO Explainability Guidance

The ICO published dedicated guidance on explaining AI decisions, recommending:

1. **Rationale explanation** — Why a particular decision was reached
2. **Responsibility explanation** — Who is responsible for the decision
3. **Data explanation** — What data was used and how it was obtained
4. **Fairness explanation** — Steps taken to ensure fairness and accuracy
5. **Safety and performance explanation** — Steps taken to ensure the AI
   system works as intended
6. **Impact explanation** — What the decision means for the individual

The level of explanation should be proportionate to the impact of the decision
and the audience. Consumer-facing explanations should be in plain language.

## Automated Decision-Making (Article 22 Equivalent)

### DPA 2018, Section 14 — Automated Decision-Making

Section 14 of the DPA 2018 implements the UK equivalent of GDPR Article 22.
Individuals have the right not to be subject to decisions based solely on
automated processing (including profiling) that produce legal effects or
similarly significant effects.

**Exceptions**:
- Necessary for entering into or performing a contract
- Authorised by law
- Based on explicit consent

Where an exception applies, the controller must still implement suitable
safeguards including:
- The right to obtain human intervention
- The right to express their point of view
- The right to contest the decision

### ICO Guidance on "Solely Automated"

The ICO clarifies that a decision is "solely automated" if there is no
meaningful human involvement. A rubber-stamp review does not constitute
meaningful human involvement. The human reviewer must:
- Have the authority and competence to change the decision
- Actually consider the individual's circumstances
- Not be bound to follow the automated recommendation

## Data Minimisation in AI/ML

### UK GDPR Article 5(1)(c) — Data Minimisation

The ICO acknowledges the tension between ML's need for large datasets and
the data minimisation principle. Its guidance states:

- Organisations must justify the volume and variety of data used for AI
  training — "more data makes a better model" is not sufficient justification
- Purpose limitation applies: data collected for one purpose cannot be repurposed
  for AI training without a compatible legal basis
- Anonymisation and pseudonymisation should be used where feasible, but the
  ICO notes that truly anonymous data is outside UK GDPR scope — data that
  can be re-identified (including through AI inference) remains personal data

## Accuracy

### UK GDPR Article 5(1)(d) — Accuracy Principle

The ICO applies the accuracy principle to AI outputs:

- AI predictions and inferences about individuals are "personal data" about
  those individuals and must be accurate
- Statistical accuracy (model-level performance metrics) does not satisfy the
  accuracy principle — individual-level accuracy matters
- Organisations must have processes to identify and correct inaccurate AI
  outputs, including complaint mechanisms for individuals

## Data Subject Rights and AI

Individuals retain all UK GDPR data subject rights in the context of AI:

- **Right of access** (Article 15) — includes the right to obtain meaningful
  information about the logic of automated processing
- **Right to rectification** (Article 16) — if AI processes inaccurate data
  or produces inaccurate inferences
- **Right to erasure** (Article 17) — may extend to requiring deletion of
  data from trained models in some circumstances
- **Right to object** (Article 21) — individuals can object to AI processing
  based on legitimate interests
- **Right to data portability** (Article 20) — applicable to AI outputs
  derived from data provided by the individual

## ICO Enforcement Approach

The ICO has signalled an increasingly active posture on AI enforcement:

- Published AI audit framework for organisations to self-assess compliance
- Conducted audits of AI systems in recruitment, healthcare, and policing
- Issued guidance specifically on AI in recruitment (noting high-risk nature)
- The ICO Regulatory Sandbox has supported AI projects to develop compliant
  approaches before deployment

### Penalty Framework

Under the DPA 2018:
- Standard maximum: GBP 8.7 million or 2% of annual worldwide turnover
- Higher maximum: GBP 17.5 million or 4% of annual worldwide turnover
- The higher maximum applies to infringements of the data protection
  principles, data subject rights, and international transfer provisions

## Citations

- UK GDPR, Articles 5, 6, 9, 13-14, 15-22, 35-36
- Data Protection Act 2018, Sections 14, 49-50, 155-157
- ICO Guidance on AI and Data Protection (2023, updated 2025)
- ICO Explaining Decisions Made with AI guidance (2020, updated 2024)
- ICO AI Audit Framework (2020)
- ICO Guidance on DPIAs (2018, updated 2024)
- ICO Guidance on Lawful Basis for Processing (2018, updated 2024)
- ICO Guidance on Automated Decision-Making and Profiling (2018, updated 2024)
- Equality Act 2010 (protected characteristics)
