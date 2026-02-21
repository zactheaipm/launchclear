---
id: "us-federal-nist-genai-profile"
law: "nist-genai-profile"
articles: []
effectiveDate: null
generatedBy: "claude-opus-4"
sources:
  - id: "nist-genai-profile"
verification:
  status: "unverified"
  lastAuditDate: null
  auditor: null
  issues: []
---
# US Federal — NIST Generative AI Risk Profile

**Authority**: National Institute of Standards and Technology (NIST)
**Document**: NIST AI 600-1 (Generative AI Profile)
**Published**: July 2024
**Status**: Voluntary companion to AI RMF

## Overview

NIST AI 600-1 is a companion resource to the AI RMF (AI 100-1) that
specifically addresses risks unique to or exacerbated by generative AI (GAI).
It identifies 12 risk areas and maps them to the AI RMF's Govern, Map,
Measure, and Manage functions.

## 12 GenAI Risk Areas

### 1. CBRN Information

Risk that GAI systems can be used to generate or access information about
chemical, biological, radiological, or nuclear weapons.

### 2. Confabulation (Hallucination)

GAI systems can generate content that is factually incorrect, fabricated,
or nonsensical while appearing confident and plausible. This is an inherent
characteristic of current GAI architecture.

### 3. Data Privacy

GAI training data may contain personal information, and models may memorise
and reproduce personal data in outputs. Fine-tuning and RAG systems may
inadvertently expose private information.

### 4. Environmental Impact

Training and running large GAI models requires significant compute resources
with associated energy consumption and environmental impact.

### 5. Harmful Bias and Homogenisation

GAI systems can perpetuate and amplify societal biases present in training
data. Homogenisation occurs when a small number of models are widely used,
potentially reducing diversity of outputs and perspectives.

### 6. Human-AI Configuration

Risks from how humans interact with and rely on GAI systems, including
over-reliance, automation complacency, and failure to verify outputs.

### 7. Information Integrity

GAI can be used to create and spread disinformation, manipulated media,
and misleading content at scale. This threatens public discourse and
democratic processes.

### 8. Information Security

GAI introduces new attack vectors including prompt injection, data
poisoning, model extraction, and adversarial manipulation of outputs.

### 9. Intellectual Property

GAI training on copyrighted material raises IP questions. Generated outputs
may infringe existing copyrights or create uncertainty about ownership of
AI-generated works.

### 10. Obscene, Degrading, and/or Abusive Content

GAI systems may generate harmful content including hate speech, sexually
explicit material, violent content, or content that targets vulnerable
populations.

### 11. Value Chain and Component Integration

Risks arising from the complex supply chain of GAI systems, including
reliance on third-party models, datasets, and infrastructure. Downstream
users may lack visibility into upstream risks.

### 12. Synthetic Content Provenance

Difficulty in distinguishing AI-generated content from human-created
content, and challenges in tracking the origin and modification history
of synthetic content.

## Risk Management Actions

For each risk area, NIST AI 600-1 maps specific actions to the four
AI RMF functions:

- **Govern**: Establish policies for GAI use, define acceptable use
  boundaries, allocate resources for GAI oversight
- **Map**: Identify GAI-specific risks in context, document model
  provenance and training data sources
- **Measure**: Test for confabulation, bias, privacy leaks, content
  safety; evaluate model performance across demographics
- **Manage**: Implement content filtering, human oversight, incident
  response for GAI failures, provenance tracking for outputs

## Citations

- NIST AI 600-1: Artificial Intelligence Risk Management Framework:
  Generative Artificial Intelligence Profile
- NIST AI 100-1: AI Risk Management Framework 1.0
- NIST AI 100-4: Reducing Risks Posed by Synthetic Content
