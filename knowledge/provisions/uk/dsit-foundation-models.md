---
id: "uk-dsit-foundation-models"
law: "AI Regulation White Paper (Cm 9809, March 2023; updated February 2024). Non-statutory framework implemented through existing regulators' powers. No AI-specific primary legislation."
articles: []
effectiveDate: null
generatedBy: "claude-opus-4"
sources:
  - id: "dsit-foundation-models"
verification:
  status: "unverified"
  lastAuditDate: null
  auditor: null
  issues: []
---
# UK — DSIT Foundation Model Principles and Regulatory Approach

**Authority**: Department for Science, Innovation and Technology (DSIT)
**Legal Basis**: AI Regulation White Paper (Cm 9809, March 2023; updated February 2024). Non-statutory framework implemented through existing regulators' powers. No AI-specific primary legislation.
**Status**: Active policy framework — regulators required to apply these principles within their existing mandates. Strategic regulatory review underway as of early 2026.

## Overview

The UK's approach to AI regulation is fundamentally different from the EU's.
Rather than enacting comprehensive AI-specific legislation (like the EU AI Act),
the UK adopts a **pro-innovation, principles-based, cross-sectoral** framework.
DSIT sets five overarching principles that existing sectoral regulators (ICO,
FCA, Ofcom, CMA, MHRA, etc.) apply within their own domains using their
existing powers.

For foundation model providers and deployers, this means there is no single
UK AI Act to comply with. Instead, compliance requires understanding how
multiple regulators apply the same five principles to AI within their
respective sectors.

DSIT's Foundation Model Taskforce (now evolved into the AI Safety Institute)
has produced additional recommendations specifically addressing the unique
challenges of foundation models, including their general-purpose nature, the
provider-deployer split, and the difficulty of predicting downstream uses.

## The Five Regulatory Principles

### Principle 1: Safety, Security, and Robustness

AI systems should function in a robust, secure, and safe way throughout
their lifecycle. Appropriate safeguards should exist to identify risks and
prevent harm.

**For foundation models, this requires**:
- Pre-deployment safety testing, including red-teaming for dangerous
  capabilities (coordinated with AISI for frontier models)
- Robustness to adversarial attacks, including prompt injection, jailbreaking,
  and indirect prompt injection through retrieval
- Security of model weights, training infrastructure, and inference systems
- Ongoing monitoring of model behaviour post-deployment
- Incident response processes for when models produce harmful outputs
- Safe default behaviours — models should refuse harmful requests without
  requiring complex safety prompting

**Regulators applying this principle**:
- AISI — frontier model safety evaluations
- MHRA — AI in medical devices must meet safety requirements
- HSE — AI in safety-critical industrial systems
- Ofcom — safety of AI-generated content under the Online Safety Act

### Principle 2: Transparency and Explainability

Organisations developing and deploying AI should be able to communicate
appropriate information about their AI systems to affected stakeholders.
This includes communicating when AI is being used and explaining how it
contributes to outcomes.

**For foundation models, this requires**:
- Disclosure to end users that they are interacting with AI (chatbot
  disclosure obligations under multiple regulators)
- Model documentation — model cards, system cards, or equivalent
  documentation describing capabilities, limitations, training data, and
  known risks
- Transparency about AI-generated content — labeling or watermarking where
  AI has generated text, images, audio, or video
- Downstream documentation — foundation model providers must give deployers
  sufficient information to understand the model's capabilities and
  limitations for their use case
- Explanation of AI decisions where they materially affect individuals,
  proportionate to the context and impact

**Regulators applying this principle**:
- ICO — transparency obligations under UK GDPR Articles 13-14; explainability
  guidance for AI decisions affecting individuals
- FCA — firms must explain AI-driven financial decisions to consumers
- Ofcom — transparency requirements for AI in content recommendation and
  moderation
- ASA — AI-generated advertising must not mislead consumers

### Principle 3: Fairness

AI systems should not discriminate unlawfully, and organisations should take
proactive steps to manage the risk of AI producing unfair outcomes.

**For foundation models, this requires**:
- Bias testing across protected characteristics (Equality Act 2010:
  age, disability, gender reassignment, marriage/civil partnership,
  pregnancy/maternity, race, religion/belief, sex, sexual orientation)
- Assessment of training data for representativeness and bias
- Monitoring deployed models for discriminatory output patterns
- Mechanisms for individuals to challenge AI decisions and seek redress
- Consideration of fairness across different deployment contexts — a
  foundation model may be fair for one use case but produce discriminatory
  outcomes in another

**Regulators applying this principle**:
- EHRC — enforcement of the Equality Act 2010 in AI contexts
- ICO — fairness principle under UK GDPR Article 5(1)(a)
- FCA — fair treatment of customers under Consumer Duty; prohibition of
  discriminatory pricing or service decisions
- Ofcom — fairness in AI-driven content moderation and recommendation

### Principle 4: Accountability and Governance

Organisations should have appropriate governance structures and clear lines
of accountability for AI systems. A human should always be identifiable as
responsible for AI-driven decisions.

**For foundation models, this requires**:
- Clear allocation of responsibility between foundation model providers and
  deployers — who is accountable when things go wrong?
- Internal governance structures for AI risk management (board-level
  oversight where appropriate)
- Record-keeping and audit trails for AI decision-making
- Designated responsible individuals for AI systems (existing regulatory
  regimes like the FCA's Senior Managers Regime may designate specific
  individuals)
- Risk assessment processes before deploying AI in high-stakes domains
- Supply chain accountability — deployers cannot fully outsource
  accountability to the model provider

**Regulators applying this principle**:
- FCA/PRA — Senior Managers & Certification Regime holds individuals
  accountable for AI decisions in financial services
- ICO — controllers remain accountable for AI processing of personal data
  even when using third-party AI services
- CMA — organisations remain responsible for competition law compliance
  when using AI for pricing, market allocation, etc.
- Professional regulators — medical, legal, and accounting professionals
  remain accountable for AI-assisted professional judgments

### Principle 5: Contestability and Redress

Where appropriate, individuals should be able to contest AI-driven decisions
and seek effective redress. This includes the ability to have a human review
of AI decisions.

**For foundation models, this requires**:
- Appeal and review mechanisms for AI decisions with significant impact
- Access to human review — not a rubber-stamp process but meaningful
  consideration by a competent person with authority to override
- Clear information to individuals about how to challenge AI decisions
- Effective remedies when AI causes harm — including compensation, correction,
  and changes to the AI system
- Consideration of whether the speed and scale of AI decision-making
  undermines existing redress mechanisms

**Regulators applying this principle**:
- Financial Ombudsman Service — redress for AI-driven financial decisions
- ICO — data subject rights including right to human intervention in
  automated decisions (DPA 2018, Section 14)
- Courts — existing tort, contract, and equality law provide redress routes
- Sector-specific ombudsmen and complaint mechanisms

## How the Framework Operates in Practice

### Regulatory Coordination

DSIT has established the **Digital Regulation Cooperation Forum (DRCF)** to
coordinate AI regulation across regulators. Members include the ICO, FCA, CMA,
and Ofcom. The DRCF ensures that:

- Regulators apply the five principles consistently across sectors
- Regulatory overlaps are managed (e.g., an AI system regulated by both ICO
  for data protection and FCA for financial services)
- Gaps are identified where no existing regulator has clear jurisdiction
- Best practices and guidance are shared across regulatory domains

### Central Functions

DSIT provides central functions to support the framework:

- Horizon scanning for new AI risks and capabilities
- Cross-sectoral risk assessment coordinated through the DRCF
- Monitoring international regulatory developments (EU AI Act, US executive
  orders, multilateral agreements)
- Guidance for organisations on which regulators apply to their AI systems

### Regulatory Sandboxing

Multiple UK regulators offer sandbox or innovation support programmes for AI:

- **ICO Regulatory Sandbox** — supports organisations developing AI products
  that involve novel data protection questions
- **FCA Regulatory Sandbox** — supports financial services AI innovation
- **MHRA AI Airlock** — supports AI-enabled medical device developers
- **CMA Open Banking / Digital Markets** — sandbox for AI in digital markets

## Foundation Model Taskforce Recommendations

The Foundation Model Taskforce (precursor to AISI) produced specific
recommendations for foundation models:

### Provider Responsibilities

1. **Safety testing** — conduct thorough safety evaluations before release
2. **Documentation** — publish model cards with capabilities, limitations,
   and known risks
3. **Downstream support** — provide deployers with adequate information and
   tooling to use models safely
4. **Ongoing monitoring** — track model behaviour and emerging risks
   post-release
5. **Responsible release** — implement staged deployment and access controls
   for models with potentially dangerous capabilities

### Deployer Responsibilities

1. **Context-appropriate evaluation** — test the model for the specific
   deployment context (a model safe for creative writing may not be safe
   for medical advice)
2. **User-facing safeguards** — implement guardrails appropriate to the
   deployment context
3. **Transparency** — disclose AI use to end users
4. **Monitoring** — track model behaviour in the deployed context
5. **Feedback mechanisms** — allow users to report problematic outputs

### Gap Analysis — Where the Framework May Evolve

DSIT has acknowledged potential gaps in the current approach:

- **No statutory duty on regulators** — regulators are "expected" to apply
  the principles but have no legal obligation to do so (a statutory duty
  was proposed in the 2024 update and remains under consideration)
- **General-purpose AI challenges** — the sectoral approach struggles with
  AI systems that operate across multiple regulated sectors simultaneously
- **Liability gaps** — unclear allocation of liability between foundation
  model providers and deployers when harm occurs
- **International interoperability** — UK firms operating in the EU must
  still comply with the EU AI Act, creating dual compliance requirements

## Key Dates and Timeline

- **March 2023** — AI Regulation White Paper published (Cm 9809)
- **November 2023** — Bletchley Park AI Safety Summit; AISI established
- **February 2024** — Updated White Paper response; regulators issued
  initial guidance on applying the five principles
- **May 2024** — Seoul AI Safety Summit commitments
- **2025** — Regulators expected to have fully integrated the five principles
  into their regulatory approaches
- **2026** — Strategic review of the framework; decision on whether to move
  to a statutory footing

## Citations

- DSIT "A Pro-Innovation Approach to AI Regulation" (Cm 9809, March 2023)
- DSIT "A Pro-Innovation Approach to AI Regulation: Government Response" (February 2024)
- Digital Regulation Cooperation Forum (DRCF) "AI and Digital Hub Pilot" (2024)
- DSIT "Foundation Models: Initial Policy Position" (March 2023)
- DSIT "Frontier AI: Capabilities and Risks — Discussion Paper" (October 2023)
- UK Government "National AI Strategy" (September 2021)
- Bletchley Declaration on AI Safety (1 November 2023)
- Equality Act 2010, Part 2 (Protected Characteristics)
- UK GDPR, Articles 5, 13-14, 22
- Data Protection Act 2018, Sections 14, 49-50
