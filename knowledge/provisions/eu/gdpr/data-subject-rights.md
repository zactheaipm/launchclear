# GDPR — Data Subject Rights

**Law**: Regulation (EU) 2016/679 (General Data Protection Regulation)
**Articles**: Articles 12-23
**Effective**: 25 May 2018

## Overview

Data subjects have extensive rights regarding the processing of their personal
data. These rights are particularly important for AI systems that process
personal data for profiling, automated decisions, or model training.

## Article 12 — Transparent Communication

Controllers must provide information in a concise, transparent, intelligible,
and easily accessible form, using clear and plain language. Responses to data
subject requests must be provided within one month (extendable to three months
for complex requests).

## Article 13-14 — Right to Information

Data subjects must be informed about:
1. Identity and contact details of the controller
2. Purposes and legal basis of processing
3. Legitimate interests pursued (if applicable)
4. Recipients or categories of recipients
5. International transfers and safeguards
6. Retention periods
7. Existence of automated decision-making (including profiling) and
   meaningful information about the logic involved
8. Data subject rights

For data not collected directly from the subject (Article 14), including
web-scraped training data, information must be provided within a reasonable
period (max one month).

## Article 15 — Right of Access

Data subjects can request:
- Confirmation of processing
- A copy of their personal data
- Information about purposes, categories, recipients, retention, rights
- For automated decisions: meaningful information about logic, significance,
  and envisaged consequences

### AI-Specific: Access requests may require providing information about
what inferences or predictions have been made about the individual, what
data was used as input, and the logic of the AI system.

## Article 16 — Right to Rectification

Data subjects can require correction of inaccurate personal data. For AI
systems, this may include correcting input data that led to inaccurate
predictions or classifications.

## Article 17 — Right to Erasure ("Right to be Forgotten")

Data subjects can request deletion when:
- Data is no longer necessary for its purpose
- Consent is withdrawn
- Data subject objects and no overriding grounds exist
- Processing was unlawful
- Legal obligation requires deletion

### AI-Specific: Right to erasure for trained models

When personal data has been used to train an AI model, erasure requests
raise complex questions:
- Whether model weights "contain" personal data is debated
- Some DPAs have required retraining or unlearning
- Others accept input/output filtering as proportionate measure
- Controllers should document their approach and consult guidance

## Article 18 — Right to Restriction

Processing can be restricted while accuracy is contested, processing is
unlawful, data is no longer needed but required by the subject, or the
subject has objected pending verification.

## Article 20 — Right to Data Portability

Data subjects can receive their data in a structured, commonly used,
machine-readable format and transmit it to another controller. Applies
to data provided by the subject, processed by automated means, based
on consent or contract.

## Article 21 — Right to Object

Data subjects can object to processing based on legitimate interests
or public interest, including profiling. The controller must stop
processing unless demonstrating compelling legitimate grounds.

### AI-Specific: Right to object is particularly relevant for AI profiling.
Controllers relying on legitimate interest for AI processing must be
prepared to stop processing for individuals who object.

## Article 22 — Automated Decision-Making

See dedicated provision file: automated-decisions.md

## Citations

- Regulation (EU) 2016/679, Articles 12-23
- EDPB Guidelines on Transparency (WP260)
- EDPB Guidelines on Automated Decision-Making and Profiling (WP251)
- Recitals 58-73
