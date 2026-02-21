---
id: "uk-aisi-frontier-models"
law: "Voluntary framework; no statutory basis. However, commitments are increasingly treated as de facto mandatory for major model providers operating in the UK market."
articles: []
effectiveDate: null
generatedBy: "claude-opus-4"
sources:
  - id: "aisi-framework"
verification:
  status: "unverified"
  lastAuditDate: null
  auditor: null
  issues: []
---
# UK — AI Safety Institute Frontier Model Framework

**Authority**: UK AI Safety Institute (AISI), formerly the Frontier AI Taskforce
**Legal Basis**: Voluntary framework; no statutory basis. However, commitments are increasingly treated as de facto mandatory for major model providers operating in the UK market.
**Status**: Active and evolving — safety evaluation protocols operational since 2024; international cooperation commitments from Seoul and Bletchley Park AI Safety Summits in effect

## Overview

The UK AI Safety Institute (AISI) was established in November 2023 following the
Bletchley Park AI Safety Summit. Its mandate is to evaluate frontier AI models
for dangerous capabilities and societal risks before and after deployment. AISI
operates through voluntary agreements with leading AI companies, but its
evaluations are increasingly expected by government, regulators, and the public
as a precondition for responsible deployment in the UK market.

The AISI framework is distinct from the EU AI Act's GPAI/systemic risk approach.
While the EU uses a quantitative threshold (10^25 FLOPs) and legal obligations,
the UK relies on capability-based evaluation and voluntary commitments backed
by soft regulatory pressure. For frontier model providers, AISI engagement is
a practical necessity for UK market access even without statutory force.

## Scope — What Constitutes a "Frontier Model"

AISI defines frontier models based on capabilities rather than compute
thresholds. A model is considered frontier if it:

- Represents the most capable AI systems at the time of evaluation
- Could possess dangerous capabilities not present in prior model generations
- Is trained at a scale that makes novel emergent capabilities plausible
- Is intended for general-purpose deployment (not narrow, task-specific systems)

The determination is capability-driven, not purely size-driven. A smaller
model with novel dangerous capabilities may be assessed as frontier, while
a larger model without such capabilities may not trigger AISI engagement.

## Pre-Deployment Safety Evaluations

### Evaluation Protocol

AISI conducts structured safety evaluations of frontier models before they
are deployed or significantly updated. The evaluation covers:

**1. Dangerous Capabilities Assessment**

Testing for capabilities that could enable serious harm:

- **Cyber-offensive capabilities** — ability to discover vulnerabilities,
  write exploit code, conduct social engineering attacks
- **Biological and chemical weapons** — ability to provide actionable
  synthesis routes or uplift for non-experts in CBRN (chemical, biological,
  radiological, nuclear) weapon creation
- **Autonomous replication and adaptation (ARA)** — ability to acquire
  resources, create copies of itself, or resist being shut down
- **Persuasion and manipulation** — ability to generate highly persuasive
  disinformation, manipulate individuals, or undermine democratic processes
- **Deception** — ability to deceive evaluators about its capabilities or
  intent (including sandbagging — deliberately underperforming on safety tests)

**2. Societal Impact Assessment**

Evaluating broader effects of model deployment:

- Impact on information ecosystems (misinformation, deepfakes at scale)
- Labour market disruption and economic concentration risks
- Effects on democratic processes and civic discourse
- Potential for enabling mass surveillance or rights violations
- Environmental impact of training and inference

**3. Controllability Assessment**

Evaluating whether the model can be effectively controlled:

- Alignment with developer intent (does it follow instructions reliably?)
- Robustness to jailbreaking and adversarial prompts
- Effectiveness of safety training (RLHF, constitutional AI, etc.)
- Monitoring capabilities for post-deployment behaviour detection

### Red-Teaming Requirements

AISI conducts and expects model providers to conduct comprehensive red-teaming:

- **Internal red teams** — the model provider's own adversarial testing team
- **External red teams** — independent third-party evaluators, including
  domain experts in biosecurity, cybersecurity, and CBRN
- **AISI red team** — AISI's own evaluation team conducts independent testing
  using proprietary evaluation tools and benchmarks
- **Structured access** — AISI evaluators receive access to model weights,
  system prompts, and safety mechanisms for thorough assessment

Red-teaming must cover:
- Known attack vectors (prompt injection, jailbreaking, role-playing exploits)
- Novel attack vectors (multi-turn manipulation, tool-use chains, indirect
  prompt injection through retrieval)
- Domain-specific threats (CBRN uplift, cyber-offence, autonomous agent risks)

## Post-Deployment Monitoring

AISI expects frontier model providers to maintain ongoing monitoring:

### Incident Reporting

- Report significant safety incidents to AISI within defined timeframes
- Share information about novel misuse patterns or unexpected capabilities
  discovered post-deployment
- Provide AISI with access to monitor deployed models for emerging risks

### Capability Monitoring

- Track whether deployed models develop unexpected capabilities through
  fine-tuning or in-context learning
- Monitor for capability elicitation techniques that bypass safety measures
- Report significant changes in model behaviour post-deployment

### Update and Iteration Protocol

- Significant model updates (new capabilities, expanded context windows,
  multimodal additions) may trigger re-evaluation
- Safety evaluations should be repeated when models are fine-tuned for
  new domains or capabilities
- Responsible capability scaling — do not release capabilities that fail
  safety evaluations without adequate mitigations

## Voluntary Commitments

### Bletchley Declaration (November 2023)

The Bletchley Declaration, signed by 28 countries plus the EU, established
the principle that frontier AI models should be subject to safety testing
before deployment. Key commitments:

- Support for the establishment of AI safety institutes internationally
- Agreement to collaborate on safety evaluation methodologies
- Commitment to transparency about frontier model capabilities and risks

### Seoul AI Safety Summit Commitments (May 2024)

Major AI companies made specific voluntary commitments:

- **Pre-deployment safety testing** — share results with AISI before public
  deployment of frontier models
- **Responsible scaling** — implement internal policies that govern capability
  release based on safety evaluation outcomes
- **Incident sharing** — share information about safety incidents with AISI
  and peer companies where appropriate
- **Transparency** — publish safety assessments, model cards, and system
  cards for frontier models
- **Research access** — provide safety researchers with model access for
  external evaluation

### Frontier AI Safety Commitments (Ongoing)

Companies that have committed to AISI engagement include major foundation
model providers. These commitments, while voluntary, create practical
obligations:

- Provide AISI with pre-deployment access to frontier models
- Share safety evaluation results and red-teaming findings
- Implement AISI recommendations or explain non-adoption
- Participate in developing shared safety evaluation standards

## International Cooperation

AISI cooperates with peer institutions globally:

- **US AI Safety Institute (NIST)** — bilateral agreement on shared safety
  evaluation methodologies and mutual recognition of evaluations
- **EU AI Office** — coordination on systemic risk assessment for GPAI models
  (Article 55 of the EU AI Act)
- **Japan AISI** — bilateral safety testing cooperation
- **Network of AI Safety Institutes** — multilateral coordination on
  evaluation standards and information sharing

## Practical Implications for AI Companies

### For Frontier Model Providers

1. **Engage with AISI early** — contact AISI well before planned deployment
   of new frontier models or significant capability updates
2. **Conduct internal safety evaluations** — AISI expects providers to have
   robust internal evaluation processes before AISI conducts its own testing
3. **Provide structured access** — be prepared to share model weights, safety
   documentation, and evaluation results with AISI
4. **Implement responsible scaling policies** — document internal thresholds
   for capability release and safety gates
5. **Maintain incident reporting** — establish processes for reporting safety
   incidents to AISI post-deployment
6. **Publish safety documentation** — model cards, system cards, and safety
   evaluation summaries for deployed models

### For Deployers of Frontier Models

1. **Verify provider safety compliance** — confirm that the upstream model
   provider has engaged with AISI and completed safety evaluations
2. **Conduct deployment-specific evaluations** — AISI evaluates the base model,
   but deployment context introduces additional risks (domain-specific misuse,
   user population vulnerabilities, application-specific attack vectors)
3. **Monitor for emerging risks** — ongoing monitoring of model behaviour in
   the specific deployment context
4. **Report incidents upstream** — ensure that safety incidents reach both
   the model provider and AISI

## Relationship to Other UK Frameworks

- **DSIT Foundation Model Principles** — AISI evaluations provide the evidence
  base for DSIT's safety and security principle
- **ICO AI Guidance** — AISI focuses on safety/dangerous capabilities; ICO
  focuses on data protection. Both apply to frontier models.
- **FCA/PRA** — Financial regulators may rely on AISI evaluations when
  assessing frontier model use in financial services
- **Ofcom** — For AI used in content generation/distribution, Ofcom's Online
  Safety Act obligations intersect with AISI frontier model assessments

## Citations

- Bletchley Declaration on AI Safety (1 November 2023)
- Seoul AI Safety Summit — Frontier AI Safety Commitments (21 May 2024)
- AISI "Approach to Evaluations" (May 2024)
- AISI Inspect framework — open-source evaluation toolkit (2024)
- DSIT "A Pro-Innovation Approach to AI Regulation" White Paper (Cm 9809, March 2023, updated February 2024)
- UK Government "Frontier AI: Capabilities and Risks" Discussion Paper (October 2023)
- AISI "International Scientific Report on the Safety of Advanced AI" (May 2024)
- UK-US Bilateral Agreement on AI Safety (April 2024)
