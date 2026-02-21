---
id: "eu-gdpr-dpia-requirements"
law: "Regulation (EU) 2016/679 (General Data Protection Regulation)"
articles: ["Articles 35-36"]
effectiveDate: "25 May 2018"
generatedBy: "claude-opus-4"
sources:
  - id: "eurlex-gdpr"
    articles: ["Articles 35-36"]
verification:
  status: "unverified"
  lastAuditDate: null
  auditor: null
  issues: []
---
# GDPR — Data Protection Impact Assessment Requirements

**Law**: Regulation (EU) 2016/679 (General Data Protection Regulation)
**Articles**: Articles 35-36
**Effective**: 25 May 2018

## Overview

A Data Protection Impact Assessment (DPIA) must be carried out before processing
that is "likely to result in a high risk to the rights and freedoms of natural
persons." For AI systems, DPIAs are frequently required due to the systematic
evaluation, profiling, and automated decision-making inherent in many AI
applications.

## Article 35(1) — When a DPIA Is Required

A DPIA is required when processing, "in particular using new technologies,"
is likely to result in a high risk to the rights and freedoms of natural persons.
The controller must carry out an assessment of the impact of the envisaged
processing operations before the processing begins.

## Article 35(3) — Mandatory DPIA Triggers

A DPIA is specifically required for:

### (a) Systematic and Extensive Evaluation (Profiling)

Systematic and extensive evaluation of personal aspects relating to natural
persons, based on automated processing including profiling, on which decisions
are based that produce legal effects or similarly significantly affect the
natural person.

**AI Relevance**: Most AI classification, scoring, and recommendation systems
that produce decisions affecting individuals trigger this provision.

### (b) Large-Scale Processing of Special Category Data

Processing on a large scale of special categories of data (Article 9) or
personal data relating to criminal convictions and offences (Article 10).

**AI Relevance**: AI systems processing biometric data, health data, or
genetic data at scale trigger this provision.

### (c) Systematic Monitoring of Publicly Accessible Area

Systematic monitoring of a publicly accessible area on a large scale.

**AI Relevance**: CCTV with AI analytics, facial recognition in public
spaces, and other surveillance AI systems trigger this provision.

## Article 35(7) — DPIA Contents

The assessment must contain at minimum:

1. **Systematic description** of the envisaged processing operations and
   purposes, including where applicable the legitimate interest pursued
2. **Assessment of necessity and proportionality** of the processing in
   relation to the purposes
3. **Assessment of risks** to the rights and freedoms of data subjects
4. **Measures** envisaged to address the risks, including safeguards,
   security measures, and mechanisms to ensure protection and demonstrate
   compliance

## Article 36 — Prior Consultation

If the DPIA indicates that processing would result in a high risk in the
absence of measures taken by the controller to mitigate the risk, the
controller must consult the supervisory authority before processing begins.

The supervisory authority must respond within 8 weeks (extendable to 14 weeks
for complex cases).

## AI-Specific DPIA Considerations

### Training Data Processing

When personal data is used for AI model training:
- The DPIA must assess the legal basis for training data processing
- Risks from web-scraped personal data must be specifically addressed
- Measures to handle data subject rights (especially erasure) in the
  context of trained models must be documented

### Automated Decision-Making

For AI systems making automated decisions:
- The DPIA must assess the accuracy and fairness of the decision system
- Bias testing results and mitigation measures should be documented
- Human oversight mechanisms must be described

### Foundation Models / GenAI

For systems using or providing foundation models:
- The DPIA must address personal data in training corpora
- Risks of generating outputs containing personal data must be assessed
- Measures to prevent unauthorized disclosure of training data through
  model outputs (e.g., memorization) should be documented

## DPA Blacklists

Supervisory authorities publish lists of processing operations that require
a DPIA (Article 35(4)). These lists often explicitly include:
- AI/ML systems that evaluate or score individuals
- Large-scale profiling
- Innovative technologies processing personal data
- Systematic monitoring using new technologies

## Citations

- Regulation (EU) 2016/679, Articles 35-36
- EDPB Guidelines on DPIAs (WP248 rev.01)
- Recitals 84, 89-96
