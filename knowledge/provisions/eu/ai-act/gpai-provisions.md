---
id: "eu-ai-act-gpai-provisions"
law: "Regulation (EU) 2024/1689 (EU Artificial Intelligence Act)"
articles: ["Articles 51-56"]
effectiveDate: "2 August 2025"
generatedBy: "claude-opus-4"
sources:
  - id: "eurlex-ai-act"
    articles: ["Articles 51-56"]
  - id: "eurlex-dsm-directive"
    articles: ["Articles 51-56"]
verification:
  status: "unverified"
  lastAuditDate: null
  auditor: null
  issues: []
---
# EU AI Act — General-Purpose AI (GPAI) Model Obligations

**Law**: Regulation (EU) 2024/1689 (EU Artificial Intelligence Act)
**Articles**: Articles 51-56
**Effective**: 2 August 2025 (GPAI provisions now in force)

## Overview

The EU AI Act establishes a dedicated regulatory track for General-Purpose AI
(GPAI) models — AI models trained with a large amount of data using
self-supervision at scale, that display significant generality and are capable
of competently performing a wide range of distinct tasks. This track runs
parallel to the risk-based classification (prohibited/high/limited/minimal)
and applies regardless of a system's risk tier.

A product can simultaneously be classified as high-risk under Annex III AND
subject to GPAI obligations. The GPAI obligations primarily target model
**providers** (those who develop and place the model on the market), but also
impose downstream requirements on **deployers** who integrate GPAI models.

## Article 51 — Classification of GPAI Models

### 51(1) — General Classification

A GPAI model is classified as having **systemic risk** if it:

- Was trained using a total computing power of more than **10^25 FLOPs**
  (floating point operations), or
- Is **designated by the European Commission** as having systemic risk based
  on criteria including: number of parameters, quality/size of training data,
  input/output modalities, benchmarks, impact on the internal market, number
  of registered users

### 51(2) — Commission Designation

The Commission may designate a GPAI model as presenting systemic risk, by
means of a decision, ex officio or following a qualified alert from the
scientific panel, on the basis of the criteria set out in Annex XIII.

A provider whose model has been designated may present arguments to
demonstrate that the model does not present systemic risks.

## Article 53 — Obligations for All GPAI Model Providers

All providers of GPAI models must:

### 53(1) — Core Provider Obligations

**(a) Technical documentation**: Draw up and keep up-to-date the technical
documentation of the model, including its training and testing process and
the results of its evaluation, which shall contain, at a minimum, the
information set out in Annex XI.

**(b) Downstream documentation**: Draw up, keep up-to-date and make available
information and documentation to providers of AI systems who intend to
integrate the GPAI model into their AI systems. The information shall enable
those providers to have a good understanding of the capabilities and
limitations of the GPAI model and to comply with their own obligations.

**(c) Copyright compliance**: Put in place a policy to comply with Union
copyright law, in particular to identify and comply with a reservation of
rights expressed pursuant to Article 4(3) of Directive (EU) 2019/790
(text and data mining opt-out).

**(d) Training data summary**: Draw up and make publicly available a
sufficiently detailed summary of the content used for training the GPAI
model, according to a template provided by the AI Office.

### 53(2) — Open-Source Exemption

The obligations in points (a) and (b) of paragraph 1 shall not apply to
providers of GPAI models that are released under a **free and open-source
licence** that allows for the access, usage, modification, and distribution
of the model, and whose parameters, including the weights, the information
on the model architecture, and the information on model usage, are made
publicly available.

**Important**: This exemption does NOT apply if the GPAI model is classified
as having systemic risk under Article 51. Systemic risk models must comply
with all obligations regardless of open-source status.

The copyright compliance obligation (point c) and training data summary
obligation (point d) apply to all GPAI providers including open-source.

## Article 54 — Authorised Representatives

Providers of GPAI models that are established in third countries must appoint
an **authorised representative** established in the Union before placing their
model on the Union market.

## Article 55 — Obligations for GPAI Models with Systemic Risk

In addition to the obligations under Article 53, providers of GPAI models
with systemic risk must:

### 55(1) — Additional Systemic Risk Obligations

**(a) Model evaluation**: Perform model evaluation in accordance with
standardised protocols and tools reflecting the state of the art, including
conducting and documenting adversarial testing of the model.

**(b) Systemic risk assessment**: Assess and mitigate possible systemic risks
at Union level, including their sources, that may stem from the development,
the placing on the market, or the use of GPAI models with systemic risk.

**(c) Incident reporting**: Keep track of, document, and report to the AI
Office and, as appropriate, to national competent authorities, serious
incidents and possible corrective measures.

**(d) Cybersecurity**: Ensure an adequate level of cybersecurity protection
for the GPAI model with systemic risk and the physical infrastructure of
the model.

## Article 56 — Codes of Practice

The AI Office shall encourage and facilitate the drawing up of **codes of
practice** at Union level to contribute to the proper application of GPAI
obligations. Providers of GPAI models may rely on adherence to a code of
practice to demonstrate compliance with obligations under Articles 53 and 55.

## Obligations for GPAI Deployers

Deployers who integrate GPAI models into their AI systems must:

- Verify that the upstream GPAI provider has met their documentation and
  transparency obligations under Article 53
- Ensure their downstream AI system complies with applicable transparency
  obligations under Article 50 (chatbot disclosure, deepfake labelling, etc.)
- When deploying systems with systemic risk models, implement appropriate
  safeguards and monitoring

## Practical Implementation

### For GPAI Model Providers

1. **Technical documentation** (Annex XI): Model architecture, training
   methodology, data sources, compute resources, evaluation results,
   capability limitations, safety testing results
2. **Downstream documentation**: Model card or system card with capabilities,
   limitations, intended uses, known risks, integration guidance
3. **Copyright policy**: Document text/data mining opt-out compliance process,
   maintain records of rights reservations respected
4. **Training data summary**: Publicly available summary of training data
   sources, categories, and scope (using AI Office template when available)
5. **Acceptable use policy**: Define prohibited and restricted uses

### For GPAI Model Providers with Systemic Risk (Additional)

6. **Model evaluation protocol**: Standardised benchmarks, red-teaming results
7. **Adversarial testing**: Document methodology and findings
8. **Systemic risk assessment**: Identify and mitigate Union-level risks
9. **Incident tracking**: Establish reporting process with AI Office
10. **Cybersecurity measures**: Physical and digital security of model
    infrastructure

### For GPAI Deployers

1. **Provider verification**: Confirm upstream provider compliance
2. **Transparency compliance**: Article 50 obligations for end-user-facing
   systems
3. **Risk monitoring**: Monitor for issues specific to the deployment context

## Penalties

Non-compliance with GPAI obligations can result in administrative fines:
- Up to **EUR 15 million** or **3% of total worldwide annual turnover**,
  whichever is higher
- For systemic risk obligations, penalties may be higher

## Key Dates

- **2 August 2025**: GPAI model obligations under Articles 51-56 apply
  (NOW IN FORCE)
- Providers of GPAI models already on the market before 2 August 2025 had
  until that date to comply

## Systemic Risk Threshold

The **10^25 FLOPs** threshold is the quantitative benchmark. For reference:
- GPT-4 is estimated at approximately 10^25 FLOPs
- Models at or above this scale are presumed to carry systemic risk
- The Commission may update this threshold via delegated acts

## Citations

- Regulation (EU) 2024/1689, Articles 51-56
- Regulation (EU) 2024/1689, Annex XI (Technical documentation for GPAI)
- Regulation (EU) 2024/1689, Annex XIII (Criteria for systemic risk designation)
- Recitals 97-115
- Directive (EU) 2019/790, Article 4(3) (Text and data mining)
