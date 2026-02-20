# GDPR — International Data Transfers

**Law**: Regulation (EU) 2016/679 (General Data Protection Regulation)
**Articles**: Articles 44-49
**Effective**: 25 May 2018

## Overview

Personal data may only be transferred to third countries (outside the EU/EEA)
if adequate safeguards are in place. For AI systems, this is particularly
relevant when using cloud-based AI services, third-party AI APIs, or
processing data in non-EU jurisdictions.

## Article 45 — Adequacy Decisions

The European Commission may determine that a third country ensures an adequate
level of data protection. Transfers to adequate countries require no additional
safeguards.

Current adequacy decisions include (among others): Andorra, Argentina, Canada
(commercial organisations), Faroe Islands, Guernsey, Israel, Isle of Man,
Japan, Jersey, New Zealand, Republic of Korea, Switzerland, the United Kingdom,
Uruguay, and the United States (under the EU-US Data Privacy Framework).

### EU-US Data Privacy Framework

The EU-US DPF was adopted in July 2023 (following the Schrems II invalidation
of the Privacy Shield). US companies must self-certify to the DPF. Transfers
to certified companies are permitted without additional safeguards, but the
framework's durability remains under scrutiny.

## Article 46 — Appropriate Safeguards

In the absence of an adequacy decision, transfers require appropriate
safeguards:

### Standard Contractual Clauses (SCCs)

- Most commonly used mechanism
- New SCCs adopted June 2021 (replaced previous versions)
- Must be supplemented with a Transfer Impact Assessment (TIA)
- Must assess whether the laws of the recipient country ensure adequate
  protection in practice

### Binding Corporate Rules (BCRs)

- For intra-group transfers within multinational organisations
- Must be approved by a supervisory authority
- Extensive requirements for data protection policies and auditing

## Schrems II Implications

The CJEU's Schrems II judgment (July 2020) requires:

1. A case-by-case assessment of the legal framework in the recipient country
2. Supplementary measures if the standard safeguards are insufficient
3. Practical assessment of whether government surveillance laws in the
   recipient country undermine the safeguards

## AI-Specific Transfer Considerations

### Cloud AI Services

When using cloud-based AI services (e.g., OpenAI, Google AI, AWS):
- Personal data sent as API input is a transfer if processed outside the EEA
- Model outputs containing personal data may constitute a return transfer
- Service providers' sub-processor locations must be assessed

### Foundation Model APIs

When calling third-party foundation model APIs:
- Prompts containing personal data constitute data transfers
- The AI service provider is typically a processor
- Standard Contractual Clauses or other transfer mechanisms must be in place
- Data processing agreements should specify how prompts/responses are handled

### Training Data

If training data containing personal data from EU subjects is transferred
to non-EU jurisdictions for model training:
- A valid transfer mechanism must be in place
- The training data processing must itself have a valid legal basis
- Erasure requests may need to be honoured across jurisdictions

## Citations

- Regulation (EU) 2016/679, Articles 44-49
- CJEU Case C-311/18 (Schrems II)
- Commission Implementing Decision (EU) 2021/914 (new SCCs)
- Commission Implementing Decision (EU) 2023/1795 (EU-US DPF)
- EDPB Recommendations 01/2020 on supplementary measures
- Recitals 101-116
