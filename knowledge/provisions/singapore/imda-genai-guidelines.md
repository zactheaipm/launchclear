---
id: "singapore-imda-genai-guidelines"
law: "Companion framework to PDPC Model AI Governance Framework"
articles: []
effectiveDate: null
generatedBy: "claude-opus-4"
sources:
  - id: "sg-imda-genai"
verification:
  status: "unverified"
  lastAuditDate: null
  auditor: null
  issues: []
---
# Singapore — IMDA GenAI Governance Framework

**Authority**: Infocomm Media Development Authority (IMDA), Singapore
**Document**: Proposed Model AI Governance Framework for Generative AI (2024)
**Legal Basis**: Companion framework to PDPC Model AI Governance Framework
**Status**: Voluntary but industry-endorsed; referenced by regulators

## Overview

The IMDA GenAI Governance Framework is a companion document to the PDPC Model
AI Governance Framework (2nd Edition), specifically addressing governance
challenges introduced by generative AI and foundation models. It provides
practical guidance for organisations developing, deploying, or integrating
GenAI systems in Singapore.

The framework adopts a proportionate, risk-based approach and distinguishes
between obligations for model developers (those who train or fine-tune
foundation models), application developers (those who build applications on
top of foundation models), and end-user organisations (those who deploy GenAI
applications in their operations).

## Trusted AI Principles Applied to GenAI

The framework applies Singapore's established Trusted AI principles to the
specific challenges of generative AI:

### Accountability

- Model developers must document model capabilities, limitations, and known
  failure modes
- Application developers are accountable for how they integrate and deploy
  foundation models, including prompt engineering, fine-tuning, and RAG
  configurations
- End-user organisations retain accountability for outcomes of GenAI use in
  their operations, even when using third-party models

### Transparency

- Users and affected individuals must be informed when they are interacting
  with or affected by GenAI-generated content
- Model cards or equivalent documentation must be maintained and shared with
  downstream developers
- Disclosure of AI-generated content is expected where the content could be
  mistaken for human-created content

### Fairness

- GenAI systems should be tested for bias across demographic groups relevant
  to the deployment context
- Training data composition should be documented and assessed for
  representativeness
- Monitoring for emergent biases in generated outputs should be ongoing

## Testing and Evaluation Requirements

### Pre-Deployment Testing

Organisations deploying GenAI should conduct:

1. **Red-teaming exercises** — adversarial testing to identify potential
   misuse, harmful outputs, and safety vulnerabilities. Testing should cover:
   - Jailbreaking and prompt injection attempts
   - Generation of harmful, biased, or misleading content
   - Privacy leakage (extraction of training data)
   - Misuse for disinformation or impersonation

2. **Benchmarking** — evaluation against established benchmarks for:
   - Accuracy and factual grounding in the target domain
   - Consistency and reliability of outputs
   - Performance across demographic groups and languages
   - Safety and toxicity metrics

3. **Domain-specific evaluation** — testing in the specific context of
   intended deployment, not just general capability benchmarks

### Ongoing Monitoring

- Track output quality, safety, and relevance in production
- Monitor for model degradation or drift over time
- Implement automated safety classifiers on generated outputs where
  appropriate
- Maintain feedback channels for users to report problematic outputs

## Incident Reporting

### Reporting Expectations

Organisations should establish incident reporting processes for GenAI-related
events, including:
- Generation of harmful, illegal, or unsafe content that reaches end users
- Privacy breaches involving personal data in GenAI outputs
- Systematic failures in content safety or moderation systems
- Security incidents such as successful prompt injection attacks

### Reporting Channels

- Internal escalation procedures from operational teams to governance leads
- Notification to IMDA and relevant sector regulators for significant incidents
- Communication to affected individuals where personal data is compromised
  (aligned with PDPA breach notification requirements)

## Content Provenance and Watermarking

### AI-Generated Content Disclosure

Organisations using GenAI should:
- Label AI-generated content clearly where it may be mistaken for human-created
  content (text, images, audio, video)
- Implement technical measures for content provenance tracking where feasible
  (e.g., C2PA metadata, digital watermarking)
- Maintain records of AI-generated content for audit and accountability

### Watermarking Guidance

- IMDA encourages adoption of industry-standard watermarking and provenance
  technologies, particularly for synthetic media (images, audio, video)
- Watermarking should be robust against common transformations (cropping,
  compression, re-encoding)
- Where technical watermarking is not feasible (e.g., text), disclosure
  through other means (metadata, labeling, user interface indicators) is
  expected

## Disclosure to End Users

### Minimum Disclosure Requirements

Organisations deploying GenAI-powered applications should disclose:
- That the application uses AI to generate or assist in generating content
- Known limitations of the AI system (e.g., potential for hallucination,
  factual inaccuracies, bias)
- Whether user inputs may be used for model training or improvement
- How users can provide feedback or report problematic outputs

### Context-Appropriate Disclosure

The depth of disclosure should be proportionate to:
- The risk level of the application and its domain
- The sophistication of the user base
- Whether the generated content will be used for consequential decisions

## Model Cards and Documentation

### For Model Developers

Model developers should prepare and share documentation including:
- Model architecture and training methodology (at appropriate level of detail)
- Training data sources and composition (categories, scale, known gaps)
- Evaluation results across safety, accuracy, and fairness metrics
- Known limitations, failure modes, and out-of-distribution behaviour
- Intended use cases and out-of-scope applications
- Content safety mechanisms built into the model

### For Application Developers

Application developers should document:
- Which foundation model(s) are used and version information
- Customisations applied (fine-tuning, RAG, prompt engineering)
- Additional safety layers implemented (content filtering, output validation)
- Testing and evaluation results specific to the application context
- Data handling practices for user inputs and generated outputs

## Responsible Deployment

### Graduated Rollout

The framework recommends:
- Pilot deployments with limited user groups before broad release
- Monitoring and evaluation during pilot phase before scaling
- Incremental expansion with continuous assessment of safety and performance

### Content Safety

- Implement input filtering to detect and block adversarial or harmful prompts
- Implement output filtering to detect and suppress harmful, illegal, or
  policy-violating generated content
- Maintain human review processes for edge cases and high-risk content
- Keep safety systems updated as new attack vectors emerge

### Supply Chain Considerations

- Conduct due diligence on foundation model providers (training data
  practices, safety evaluations, terms of service)
- Establish contractual protections for data handling and liability
- Monitor upstream model updates for changes that may affect downstream
  safety or performance

## Proportionate Governance

The framework emphasises proportionality — governance measures should scale
with the risk profile of the GenAI use case:

| Risk Level | Examples | Governance Measures |
|---|---|---|
| **Low** | Internal productivity tools, code assistance, content drafts with human review | Basic disclosure, standard monitoring |
| **Medium** | Customer-facing chatbots, content generation for publication, recommendation systems | Red-teaming, content safety filters, regular auditing, user disclosure |
| **High** | Healthcare advice, financial guidance, legal analysis, decisions affecting individual rights | Comprehensive testing, independent audits, robust human oversight, detailed disclosure, incident reporting |

## Interaction with Other Singapore Frameworks

- **PDPA**: Mandatory data protection obligations apply to all personal data
  processed by GenAI systems (consent, purpose limitation, access/correction,
  breach notification)
- **PDPC Model AI Governance Framework**: The GenAI framework extends and
  supplements the general AI governance framework, not replaces it
- **MAS AI Guidelines**: Financial institutions must comply with MAS-specific
  AI risk management requirements in addition to IMDA GenAI guidance
- **IMDA Agentic AI Framework**: GenAI systems with agentic capabilities
  must also comply with the dedicated agentic AI governance framework

## Citations

- IMDA, Proposed Model AI Governance Framework for Generative AI (2024)
- IMDA & AI Verify Foundation, Cataloguing LLM Evaluations (2024)
- IMDA, AI Verify — AI Governance Testing Framework and Toolkit
- PDPC, Model AI Governance Framework (2nd Edition, January 2020)
- Personal Data Protection Act 2012, as amended 2020
- Singapore National AI Strategy 2.0 (December 2023)
- AI Verify Foundation, Generative AI Evaluation Catalogue
