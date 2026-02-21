# Brazil — AI Bill Foundation Model and GenAI Transparency

**Authority**: Brazilian Congress (Congresso Nacional) — Senate (Senado
Federal) and Chamber of Deputies (Câmara dos Deputados)
**Legal Basis**: PL 2338/2023 (Projeto de Lei No. 2338/2023), also known
as the Marco Legal da Inteligência Artificial (AI Legal Framework)
**Status**: Approved by the Brazilian Senate on December 10, 2024; under
consideration by the Chamber of Deputies as of early 2026. Not yet enacted
into law, but widely expected to pass with potential amendments.
**Scope**: Comprehensive AI regulation, including specific provisions for
foundation models, generative AI transparency, and high-risk AI systems

## Overview

Brazil's AI Bill (PL 2338/2023) is the most significant AI-specific
legislation in Latin America. Originally introduced by Senator Rodrigo
Pacheco, the bill underwent extensive revision by a commission of jurists
and was approved by the Senate in December 2024. It establishes a risk-based
regulatory framework for AI systems inspired by the EU AI Act but adapted
to the Brazilian legal context, with notable additions including specific
provisions for foundation models, generative AI transparency, and training
data disclosure requirements. The bill designates the ANPD (National Data
Protection Authority) as the lead AI regulatory authority, building on the
LGPD enforcement infrastructure.

**Important**: As of February 2026, PL 2338/2023 is not yet enacted law.
However, it is included in LaunchClear's knowledge base because (a) it is
the most advanced AI bill in Latin America with strong political momentum,
(b) its provisions are already influencing corporate compliance planning
for the Brazilian market, and (c) AI product teams targeting Brazil should
prepare for its likely enactment.

## Risk-Based Classification System

### Article 14 — Risk Categories

The AI Bill establishes a tiered risk classification system:

1. **Excessive risk** (risco excessivo): AI systems that are prohibited
2. **High risk** (alto risco): AI systems subject to enhanced obligations
3. **General risk**: AI systems not classified as excessive or high risk,
   subject to baseline transparency obligations

### Article 15 — Prohibited AI Systems (Excessive Risk)

The following AI systems are prohibited:

- Systems that employ subliminal techniques to distort behaviour in a
  manner likely to cause harm
- Systems that exploit vulnerabilities of specific groups (age, disability,
  social or economic situation)
- Social scoring systems by public authorities for generalized purposes
- Real-time remote biometric identification in publicly accessible spaces
  by public security forces (with limited exceptions)

### Article 17 — High-Risk AI Systems

AI systems are classified as high risk when used in the following domains:

- **Public security and criminal justice**: Risk assessment, recidivism
  prediction, polygraph systems
- **Education**: Student assessment, admission decisions, allocation of
  educational resources
- **Employment**: Recruitment, screening, hiring, promotion, dismissal,
  performance evaluation, task allocation
- **Essential public and private services**: Access to credit, insurance,
  social assistance, healthcare prioritisation
- **Critical infrastructure**: Autonomous vehicles, traffic management,
  energy grid management, water supply
- **Biometric identification**: Remote biometric identification in publicly
  accessible spaces (where not prohibited)
- **Administration of justice**: Case management, legal research support,
  judicial decision support

## Foundation Model Provisions

### Article 23 — Foundation Model Provider Obligations

Providers of foundation models (modelos de fundação) — defined as AI models
trained on broad data at scale that can be adapted for a wide range of
downstream tasks — must comply with the following obligations:

#### Transparency Documentation

Foundation model providers must publish and maintain:

1. **Model documentation** (documentação do modelo): A comprehensive
   description of the model's capabilities, limitations, intended uses,
   and known risks
2. **Training data summary**: A sufficiently detailed description of the
   data used to train the model, including:
   - Categories and sources of training data
   - Data governance measures applied during training
   - Whether copyrighted works were included in the training data
   - Measures taken to respect intellectual property rights
3. **Evaluation results**: Results of internal and external evaluations
   of the model's performance, safety, and potential for discriminatory
   outputs

#### Safety and Testing

Foundation model providers must:

- Conduct **safety testing** to identify and mitigate foreseeable risks
  before making the model available
- Implement **ongoing monitoring** of the model's performance and safety
  after deployment
- Establish **incident reporting** mechanisms for safety-relevant events

#### Downstream Obligations

Foundation model providers must provide downstream deployers with:

- Sufficient technical documentation to enable compliance with the
  deployer's own obligations under the AI Bill
- Information about the model's capabilities, limitations, and known
  risks relevant to the deployer's use case
- Guidance on appropriate use and foreseeable misuse scenarios

## Generative AI Transparency Provisions

### Article 24 — GenAI Content Disclosure

Providers and deployers of generative AI systems — AI systems that
generate text, images, audio, video, or other content — must:

1. **Disclose AI-generated nature**: Clearly inform users that the content
   they are interacting with or receiving has been generated by an AI
   system
2. **Label AI-generated content**: Implement measures to label or mark
   AI-generated content in a manner that is:
   - Accessible and understandable to end users
   - Machine-readable where technically feasible
   - Persistent (not easily removable)
3. **Deepfake disclosure**: When generative AI is used to create realistic
   synthetic media depicting real persons (deepfakes), additional
   disclosure obligations apply:
   - The synthetic nature of the content must be prominently disclosed
   - Consent of the depicted person is required, except for satire,
     parody, and other protected expression
4. **Prohibition on deceptive use**: Generative AI must not be used to
   produce content that deceives the public on matters of public interest,
   particularly in election periods

### Article 25 — Training Data Disclosure

Providers of generative AI systems must disclose:

1. **Data sources**: A summary of the categories and sources of data used
   for training, including whether the training data includes:
   - Publicly available data (web scrapes, open datasets)
   - Licensed or purchased datasets
   - User-generated content
   - Copyrighted works
2. **Copyright compliance**: Measures taken to comply with Brazilian
   copyright law (Lei de Direitos Autorais, Law No. 9.610/1998),
   including:
   - Whether opt-out mechanisms are available for copyright holders
   - How rights reservations are respected
   - Whether fair use/fair dealing defences apply to training data use
3. **Personal data in training**: Whether personal data (as defined by
   the LGPD) is included in the training data, and if so, the legal
   basis for such processing

## Algorithmic Impact Assessment

### Article 19 — Algorithmic Impact Assessment (AIA)

Deployers of high-risk AI systems must conduct an **Algorithmic Impact
Assessment** (Avaliação de Impacto Algorítmico — AIA) before deployment.
The AIA must include:

1. **System description**: Description of the AI system, its purpose, and
   the context of deployment
2. **Risk analysis**: Identification and assessment of risks to
   fundamental rights, including:
   - Discrimination and bias risks
   - Privacy and data protection risks
   - Safety risks
   - Transparency and explainability gaps
3. **Mitigation measures**: Measures adopted to prevent, mitigate, or
   remediate identified risks
4. **Human oversight**: Description of human oversight mechanisms and
   their effectiveness
5. **Monitoring plan**: Plan for ongoing monitoring and periodic review
   of the AI system's performance and impact

The AIA must be updated when significant changes are made to the AI system
or its deployment context.

## Governance Requirements

### Article 20 — AI Governance

Organisations deploying high-risk AI systems or providing foundation models
must establish:

- **AI governance structures**: Internal policies, procedures, and
  responsible persons for AI oversight
- **Risk management processes**: Systematic processes for identifying,
  assessing, and mitigating AI-related risks
- **Record keeping**: Documentation of AI system design decisions,
  evaluations, and deployment contexts
- **Training and awareness**: Ensuring personnel involved in AI
  development and deployment are adequately trained

### Article 21 — Human Oversight

High-risk AI systems must incorporate appropriate human oversight measures,
including:

- Mechanisms for human intervention in AI-driven decisions
- Clear escalation procedures for uncertain or contested decisions
- Training for human overseers on the AI system's capabilities and
  limitations

## Regulatory Authority and Sandbox

### Article 31 — ANPD as Lead Authority

The ANPD (Autoridade Nacional de Proteção de Dados) is designated as the
lead regulatory authority for AI, responsible for:

- Implementing and enforcing the AI Bill
- Issuing regulations and guidance
- Conducting investigations and audits
- Imposing administrative sanctions
- Coordinating with sector-specific regulators (Central Bank, ANVISA,
  CVM, etc.)

### Article 33 — Regulatory Sandbox

The AI Bill establishes a **regulatory sandbox** (ambiente regulatório
experimental) to allow controlled testing of innovative AI systems under
regulatory supervision. The sandbox:

- Provides temporary relaxation of certain regulatory requirements
- Enables experimentation with novel AI applications
- Requires participant reporting on outcomes and risks
- Is overseen by the ANPD in coordination with relevant sector regulators

## Penalties

### Article 35 — Administrative Sanctions

Violations of the AI Bill may result in:

- **Warning** with indication of a deadline for corrective measures
- **Fine** of up to **2% of the revenue** of the private legal entity,
  group, or conglomerate in Brazil for the prior fiscal year, limited to
  **BRL 50 million per violation** (approximately USD 10 million) —
  mirroring the LGPD penalty structure
- **Daily fine** for ongoing violations
- **Public disclosure** of the infringement
- **Suspension** of the AI system's operation
- **Prohibition** of the AI system's operation

## Practical Implications for AI Product Teams

### For Foundation Model Providers

1. **Prepare model documentation**: Create comprehensive model cards
   with capabilities, limitations, known risks, and evaluation results
2. **Training data transparency**: Document training data sources,
   categories, and copyright compliance measures
3. **Downstream documentation**: Provide integration guidance and risk
   information to deployers
4. **Safety testing**: Conduct and document pre-release safety evaluations

### For Generative AI Deployers

5. **Content labeling**: Implement AI-generated content disclosure
   mechanisms (visible and machine-readable)
6. **Deepfake safeguards**: If the system can generate realistic synthetic
   media, implement consent mechanisms and disclosure requirements
7. **Training data disclosure**: Publish information about training data
   categories and copyright compliance

### For High-Risk AI Deployers

8. **Algorithmic Impact Assessment**: Conduct an AIA before deployment
9. **Human oversight**: Implement meaningful human oversight mechanisms
10. **Governance**: Establish AI governance structures, risk management
    processes, and record keeping

### Timeline Considerations

- The bill is expected to be enacted in 2026, with a likely
  **implementation grace period** of 12-24 months
- AI product teams targeting Brazil should begin compliance preparation
  now, particularly for foundation model documentation and content
  labeling requirements
- The ANPD's existing LGPD enforcement infrastructure will be leveraged,
  meaning organisations already subject to LGPD will have a head start

## Relationship to LGPD

The AI Bill is designed to complement, not replace, the LGPD. AI products
processing personal data in Brazil must comply with both frameworks:

- **LGPD** governs the personal data processing aspects (legal basis,
  data subject rights, transfers, impact assessments)
- **AI Bill** governs the AI-specific aspects (risk classification,
  transparency, foundation model obligations, algorithmic impact
  assessments)

Article 20 of the LGPD (right to review of automated decisions) continues
to apply alongside the AI Bill's provisions. The AI Bill's AIA requirement
is additive to, not a replacement for, the LGPD's RIPD requirement.

## Citations

- PL 2338/2023 (Marco Legal da Inteligência Artificial), Articles 14-35
  as approved by the Brazilian Senate, December 10, 2024
- Senate Committee Report on PL 2338/2023 (Relatório da Comissão
  Temporária Interna sobre Inteligência Artificial)
- LGPD (Law No. 13.709/2018), Articles 20, 38 (complementary provisions)
- Lei de Direitos Autorais (Law No. 9.610/1998), Articles 7, 46 (copyright
  in the context of training data)
- ANPD Technical Note on AI and Data Protection (2024)
- Brazilian Constitution, Article 5 (fundamental rights, relevant to AI
  impact on rights and freedoms)
