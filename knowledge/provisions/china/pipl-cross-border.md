# China PIPL — Cross-Border Personal Information Transfer

## Overview
The Personal Information Protection Law (PIPL) of the People's Republic of China imposes strict requirements on cross-border transfers of personal information.

## Key Provisions

### Article 38 — Transfer Mechanisms
Personal information processors must satisfy one of the following conditions for cross-border transfer:
1. Pass a security assessment organized by the CAC (mandatory for critical information infrastructure operators or processors handling large volumes)
2. Obtain personal information protection certification from a specialized institution
3. Enter into standard contracts formulated by the CAC with the overseas recipient
4. Meet other conditions prescribed by laws or regulations

### Article 39 — Notification and Consent
Before transferring personal information outside China, the processor must:
- Inform the individual of the overseas recipient's identity, contact information, processing purposes, processing methods, and categories of personal information
- Inform the individual of the method and procedure for exercising their rights with the overseas recipient
- Obtain the individual's separate consent

### Article 40 — Critical Information Infrastructure and Volume Thresholds
Critical information infrastructure operators and processors handling personal information above a certain volume must store personal information within China. Where cross-border transfer is necessary, a security assessment by the CAC is required.

### Practical Implications for AI Products
- AI products that collect or process personal information of individuals in China and transfer data to overseas servers (including for model training or inference) must comply with these provisions
- Cloud-based AI services where data may be processed outside China trigger cross-border transfer requirements
- Standard Contract Clauses (China SCCs) are the most common mechanism for non-CIIO entities
- Security assessment is mandatory if processing personal information of more than 1 million individuals or transferring personal information of more than 100,000 individuals cumulatively

## Enforcement
PIPL violations can result in fines up to 50 million RMB or 5% of the previous year's turnover, plus potential suspension of services.
