# Brazil — LGPD Automated Decision Provisions

**Authority**: Autoridade Nacional de Proteção de Dados (ANPD — National
Data Protection Authority)
**Legal Basis**: Lei Geral de Proteção de Dados (LGPD, Law No. 13.709/2018),
as amended by Law No. 13.853/2019
**Status**: Effective September 18, 2020 (enforcement provisions effective
August 1, 2021)
**Scope**: Processing of personal data by natural persons or legal entities,
public or private, including automated processing and profiling

## Overview

The LGPD is Brazil's comprehensive data protection law, modelled in part on
the GDPR but with distinct provisions reflecting the Brazilian legal context.
For AI product teams, the most critical provisions are Article 20 (right to
review of automated decisions), the legal bases for processing (Article 7),
sensitive data processing rules (Article 11), and the ANPD's evolving
regulatory guidance on AI and automated decision-making. The LGPD applies to
any processing of personal data carried out in Brazil, any processing aimed
at offering goods or services in Brazil, or any processing of data collected
in Brazil, regardless of where the data controller is established.

## Article 7 — Legal Bases for Processing Personal Data

Processing of personal data may only be carried out under one of the
following legal bases:

1. **Consent** (Art 7(I)): Consent by the data subject, which must be
   free, informed, and unambiguous, provided in writing or by other means
   demonstrating the data subject's will
2. **Legal obligation** (Art 7(II)): Compliance with a legal or regulatory
   obligation by the controller
3. **Public administration** (Art 7(III)): Execution of public policies
   provided for in law or regulation
4. **Research** (Art 7(IV)): Carrying out studies by a research body,
   ensuring anonymisation of personal data whenever possible
5. **Contract performance** (Art 7(V)): When necessary for the execution
   of a contract to which the data subject is a party
6. **Exercise of rights** (Art 7(VI)): For the regular exercise of rights
   in judicial, administrative, or arbitration proceedings
7. **Protection of life** (Art 7(VII)): For the protection of the life or
   physical safety of the data subject or third party
8. **Health protection** (Art 7(VIII)): For the protection of health, in
   a procedure carried out by health professionals or health entities
9. **Legitimate interest** (Art 7(IX)): When necessary for the legitimate
   interests of the controller or third party, except where the data
   subject's fundamental rights and freedoms prevail
10. **Credit protection** (Art 7(X)): For the protection of credit,
    including provisions of relevant legislation

### AI-Specific Considerations for Legal Bases

- **Consent** is often impractical for large-scale AI training, but may be
  required when training data includes sensitive personal data (Article 11)
- **Legitimate interest** is the most commonly invoked basis for AI
  processing, but requires a balancing test (Legitimate Interest Assessment)
  documented by the controller
- **Credit protection** is a legal basis specific to Brazil's LGPD (not
  found in GDPR), reflecting the importance of credit scoring in the
  Brazilian context — directly relevant for AI credit scoring products

## Article 11 — Sensitive Personal Data

Sensitive personal data may only be processed:

- With the **specific and prominent consent** of the data subject, or
- Without consent, when indispensable for:
  - Legal or regulatory obligation
  - Public administration policies
  - Research (with anonymisation)
  - Protection of life or physical safety
  - Health protection
  - Fraud prevention and security of the data subject

### Categories of Sensitive Data

The LGPD defines sensitive personal data as data concerning:

- **Racial or ethnic origin**
- **Religious belief**
- **Political opinion**
- **Trade union membership**
- **Religious, philosophical, or political organisation membership**
- **Health or sexual life data**
- **Genetic or biometric data**

AI products processing any of these categories must ensure a valid legal
basis under Article 11 and implement enhanced protections.

## Article 12 — Anonymisation

Anonymised data is not considered personal data under the LGPD, provided
the anonymisation process is not reversible using reasonable technical
means. If anonymised data can be re-identified, it is treated as personal
data.

For AI products, this means:

- Training data that has been properly anonymised is not subject to LGPD
- If anonymisation can be reversed (e.g., through linkage attacks, model
  memorisation, or re-identification techniques), the data retains its
  status as personal data
- The ANPD may determine the standard of "reasonable technical means"

## Article 18 — Data Subject Rights

Data subjects have the following rights with respect to their personal
data processed by AI systems:

1. **Confirmation of processing** (Art 18(I)): Right to confirm whether
   processing is being carried out
2. **Access** (Art 18(II)): Right to access the data being processed
3. **Correction** (Art 18(III)): Right to correct incomplete, inaccurate,
   or outdated data
4. **Anonymisation, blocking, or deletion** (Art 18(IV)): Right to have
   unnecessary, excessive, or non-compliant data anonymised, blocked, or
   deleted
5. **Portability** (Art 18(V)): Right to data portability to another
   service provider
6. **Deletion** (Art 18(VI)): Right to deletion of data processed with
   consent, upon revocation
7. **Information on sharing** (Art 18(VII)): Right to information about
   public and private entities with which the controller has shared data
8. **Information on consent denial** (Art 18(VIII)): Right to information
   about the possibility of denying consent and the consequences thereof
9. **Revocation of consent** (Art 18(IX)): Right to revoke consent at
   any time

## Article 20 — Right to Review of Automated Decisions

### Article 20(1) — Right to Review

The data subject has the right to **request the review of decisions made
solely on the basis of automated processing** of personal data that affect
their interests, including decisions intended to define their personal,
professional, consumer, or credit profile, or aspects of their personality.

This right applies to:

- AI-driven credit scoring decisions
- Automated hiring/screening decisions
- Insurance risk assessment decisions
- Automated content moderation decisions affecting user accounts
- Any automated decision that materially affects the data subject

### Article 20(2) — Right to Explanation

The controller must provide **clear and adequate information regarding the
criteria and procedures used for the automated decision**, upon request by
the data subject.

**Important**: Unlike GDPR Article 22, which frames automated decision-making
as a general prohibition with exceptions, LGPD Article 20 frames it as a
right to review. There is no general prohibition on automated decisions under
the LGPD — instead, data subjects have the right to request review and
explanation after the decision is made.

### Article 20(3) — ANPD Audit Authority

When the controller declines to provide information under Article 20(2)
citing trade secrets or intellectual property protection, the ANPD may
conduct an audit to verify whether discriminatory aspects are present in
the automated processing.

This provision is significant for AI products because:

- Controllers cannot simply refuse to explain AI decisions by citing
  trade secrets
- The ANPD has the authority to independently audit AI systems for
  discrimination
- This creates an accountability mechanism even when full transparency
  is commercially sensitive

## Article 33 — International Data Transfers

Personal data may only be transferred to other countries or international
organisations when:

- The receiving country or organisation provides an **adequate level** of
  data protection (Art 33(I))
- The controller offers **adequate guarantees** through standard
  contractual clauses, binding corporate rules, or certifications
  (Art 33(II))
- **Specific consent** is obtained from the data subject (Art 33(VIII))
- Other conditions specified in Article 33 are met

For AI products that process data across borders (e.g., sending data to
cloud-hosted AI models outside Brazil), transfer mechanisms must be
established.

## Article 38 — Data Protection Impact Assessment (RIPD)

The ANPD may require the controller to prepare a **Data Protection Impact
Report** (Relatório de Impacto à Proteção de Dados Pessoais — RIPD) in
cases of processing that may generate risks to the fundamental rights and
freedoms of data subjects.

A RIPD must contain:

- Description of the types of data collected
- Methodology used for collection and security measures
- Analysis of the controller's adoption of measures, safeguards, and
  risk mitigation mechanisms

AI processing that involves profiling, automated decisions, or large-scale
processing of sensitive data is highly likely to trigger the RIPD
requirement.

## Article 41 — Data Protection Officer (DPO / Encarregado)

The controller must appoint a **Data Protection Officer** (Encarregado
pelo Tratamento de Dados Pessoais) whose identity and contact information
must be publicly disclosed. The ANPD may establish supplementary rules on
DPO requirements, including circumstances under which a DPO appointment
is mandatory.

## Article 52 — Administrative Sanctions

The ANPD may impose the following sanctions for LGPD violations:

- **Warning** with indication of a deadline for corrective measures
- **Simple fine** of up to **2% of the revenue** of the private legal
  entity, group, or conglomerate in Brazil for the prior fiscal year,
  limited to **BRL 50 million per violation** (approximately USD 10
  million)
- **Daily fine** for ongoing violations
- **Publicisation** of the infringement (public disclosure of the
  violation)
- **Blocking** of the personal data involved until the violation is
  remedied
- **Deletion** of the personal data involved
- **Partial or total suspension** of the database operation for up to
  6 months
- **Partial or total suspension** of data processing activities for up
  to 6 months
- **Prohibition** of processing activities

## Practical Implications for AI Product Teams

1. **Identify legal basis**: Determine the appropriate legal basis under
   Article 7 (or Article 11 for sensitive data) for each AI processing
   activity
2. **Implement review mechanism**: Build a process for data subjects to
   request review of automated decisions under Article 20
3. **Prepare explanations**: Document the criteria and procedures used in
   automated decision-making so explanations can be provided upon request
4. **Assess discrimination risk**: AI systems making decisions that affect
   data subjects' interests should be audited for discriminatory outcomes,
   given the ANPD's audit authority under Article 20(3)
5. **Data transfer compliance**: If AI processing involves cross-border
   data transfers (e.g., to model providers outside Brazil), establish
   appropriate transfer mechanisms under Article 33
6. **RIPD preparation**: For high-risk AI processing, prepare a Data
   Protection Impact Report (RIPD) proactively, even if not yet formally
   required by the ANPD
7. **DPO appointment**: Appoint a Data Protection Officer and ensure their
   contact details are publicly accessible

## Citations

- Lei Geral de Proteção de Dados (LGPD), Law No. 13.709/2018, as amended
  by Law No. 13.853/2019 — Articles 7, 11, 12, 18, 20, 33, 38, 41, 52
- ANPD Regulation CD/ANPD No. 2/2022 (Dosimetry and Application of
  Administrative Sanctions)
- ANPD Regulation CD/ANPD No. 4/2023 (Data Protection Impact Assessment)
- ANPD Study on AI and Data Protection (2024)
- Brazilian Civil Code, Articles 186-187 (civil liability for damages)
- Brazilian Consumer Defense Code (CDC), Law No. 8.078/1990, Articles 6,
  43 (consumer rights in credit scoring and automated profiling)
