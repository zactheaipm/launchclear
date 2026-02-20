# GDPR — Legal Basis for Processing

**Law**: Regulation (EU) 2016/679 (General Data Protection Regulation)
**Articles**: Articles 6-7
**Effective**: 25 May 2018

## Overview

All processing of personal data must have a valid legal basis under Article 6(1).
The six legal bases are:

1. **Consent** (Article 6(1)(a)) — Freely given, specific, informed, and
   unambiguous indication of the data subject's wishes
2. **Contract** (Article 6(1)(b)) — Processing necessary for performance of a
   contract or pre-contractual steps
3. **Legal obligation** (Article 6(1)(c)) — Processing necessary for compliance
   with a legal obligation
4. **Vital interests** (Article 6(1)(d)) — Processing necessary to protect vital
   interests of the data subject or another person
5. **Public interest** (Article 6(1)(e)) — Processing necessary for a task
   carried out in the public interest
6. **Legitimate interests** (Article 6(1)(f)) — Processing necessary for
   legitimate interests pursued by the controller or a third party, except where
   overridden by the interests or fundamental rights of the data subject

## Consent Requirements (Article 7)

For consent to be valid under GDPR:

- Must be **freely given**: the data subject must have a genuine choice and be
  able to refuse or withdraw without detriment
- Must be **specific**: consent must relate to one or more specified purposes
- Must be **informed**: the data subject must be told at minimum the controller's
  identity and the purposes of processing
- Must be **unambiguous**: requires a clear affirmative act (no pre-ticked boxes)
- **Withdrawable**: data subjects must be able to withdraw consent as easily as
  they gave it
- **Documented**: the controller must be able to demonstrate consent was obtained

## AI-Specific Considerations

### Training Data Processing

For AI model training using personal data, controllers commonly rely on:

- **Legitimate interest** (Art 6(1)(f)): Requires a three-part balancing test:
  (1) legitimate interest exists, (2) processing is necessary, (3) interests
  are not overridden by data subject rights. The EDPB has noted that large-scale
  web scraping of personal data for AI training faces significant challenges
  under this basis.
- **Consent**: Difficult for training data at scale, but applicable for
  user-contributed data where clear consent scope includes AI training.

### Web-Scraped Data

When personal data is obtained from publicly available sources (web scraping)
for AI training:

- Article 14 transparency obligations apply (information must be provided
  within a reasonable period, not longer than one month)
- The "disproportionate effort" exemption (Art 14(5)(b)) may apply for very
  large datasets, but is narrowly interpreted
- Data subjects retain all rights including erasure and objection

### Inference Data

AI-generated inferences about individuals (predictions, scores, classifications)
may themselves constitute personal data if they relate to an identified or
identifiable individual.

## Citations

- Regulation (EU) 2016/679, Articles 6-7
- EDPB Guidelines 05/2020 on Consent
- EDPB Guidelines on legitimate interests (Art 6(1)(f))
- Recitals 32, 40-49
