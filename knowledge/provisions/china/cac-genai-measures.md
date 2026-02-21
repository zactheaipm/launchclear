# China — CAC Interim Measures for Generative AI Services

**Authority**: Cyberspace Administration of China (CAC), jointly with the
National Development and Reform Commission (NDRC), Ministry of Education,
Ministry of Science and Technology, Ministry of Industry and Information
Technology, Ministry of Public Security, and the State Administration of
Radio and Television
**Legal Basis**: Cybersecurity Law of the People's Republic of China,
Data Security Law of the People's Republic of China, Personal Information
Protection Law (PIPL), Provisions on the Management of Internet Information
Services
**Status**: Effective August 15, 2023
**Official Title**: Interim Measures for the Management of Generative
Artificial Intelligence Services (生成式人工智能服务管理暂行办法)

## Overview

The Interim Measures for Generative AI Services are the world's most
prescriptive regulation specifically targeting generative AI. They establish
comprehensive requirements for providers of generative AI services available
to the public within China, covering algorithm filing, content review,
training data governance, output labeling, user management, and safety
assessments. The measures apply to any entity providing generative AI
services to the public within the territory of the People's Republic of
China, including foreign providers offering services accessible in China.

## Article 3 — Guiding Principles

The State supports the development and application of generative AI
technology on the condition that it adheres to **socialist core values**
(社会主义核心价值观). Generative AI services must not be used to:

- Subvert state power or overthrow the socialist system
- Endanger national security or interests
- Damage the image of the State
- Incite secession or undermine national unity
- Promote terrorism, extremism, ethnic hatred, or discrimination
- Promote violence, obscenity, or false information
- Discriminate against individuals on the basis of ethnicity, race,
  gender, or other characteristics
- Generate content that violates economic or social order

## Article 4 — Provider Responsibility

Providers of generative AI services bear the responsibility of a **network
information content producer** (网络信息内容生产者). Providers must:

- Take effective measures to prevent the generation of content prohibited
  by laws and regulations
- Implement content review mechanisms for generated output
- Establish complaint reporting channels for users and the public
- Maintain records of generated content and user interactions

## Article 7 — Training Data Requirements

Providers must ensure the legality of training data sources and comply with
the following requirements:

### 7(1) — Data Source Legality

Training data must be obtained through lawful means. Providers must:

- Use data obtained with proper authorisation and consent
- Not infringe upon intellectual property rights of third parties
- Not use data obtained through illegal means (scraping without
  authorisation, circumventing technical measures, etc.)

### 7(2) — Data Quality and Accuracy

Providers must take measures to improve the quality of training data,
including:

- Ensuring the truthfulness, accuracy, objectivity, and diversity of
  training data
- Implementing data labeling rules that comply with the Measures
- Conducting data quality assessments

### 7(3) — Personal Information Protection

When training data includes personal information, providers must comply
with the Personal Information Protection Law (PIPL), including:

- Obtaining consent from personal information subjects, or having another
  lawful basis for processing
- Conducting a personal information impact assessment when processing
  sensitive personal information

## Article 8 — Algorithm Filing Requirement

Providers must file their generative AI algorithms with the Cyberspace
Administration of China before providing services to the public. The
filing must include:

- Algorithm name and type
- Basic principles of the algorithm
- Application scenarios and intended purposes
- Self-assessment report on the algorithm's security
- Contact information of the responsible person

This filing is required under the **Provisions on the Management of
Algorithmic Recommendations in Internet Information Services** and is a
precondition for lawful public deployment.

## Article 9 — Safety Assessment

Before providing generative AI services to the public, providers must
conduct a **safety assessment** (安全评估) and submit it to the relevant
competent authority. The safety assessment must cover:

- Potential risks of the generative AI service
- Measures taken to mitigate identified risks
- Emergency response plans for incidents
- Content review and filtering mechanisms

## Article 11 — AI-Generated Content Labeling

Providers must label AI-generated content in accordance with the
**Provisions on the Management of Deep Synthesis of Internet Information
Services**. Specifically:

- AI-generated images, audio, video, and other synthetic content must
  contain **machine-readable watermarks** or metadata identifying the
  content as AI-generated
- Providers must not provide services that delete, tamper with, or
  conceal AI-generated content labels
- The labeling must be technically robust and not easily removable by
  end users

## Article 12 — User Real-Name Verification

Providers must implement **real-name identity verification** for users
of generative AI services, in accordance with the Cybersecurity Law. This
includes:

- Verifying user identity through mobile phone numbers, national identity
  cards, or other approved methods
- Maintaining records of user identity information
- Not providing services to users who have not completed identity
  verification

## Article 14 — User Complaint Mechanisms

Providers must establish and publicise complaint and reporting channels.
When a user or member of the public reports that generated content violates
laws or regulations, the provider must:

- Promptly process the complaint
- Take measures to address the reported content (deletion, correction,
  restriction of dissemination)
- Record the complaint and processing result

## Article 15 — Supervision and Inspection

The CAC and relevant competent authorities may conduct supervision and
inspection of generative AI service providers, including:

- Reviewing algorithm filing materials
- Inspecting training data sources and quality measures
- Evaluating content review and filtering mechanisms
- Reviewing user complaint handling records
- Testing the service for compliance with content requirements

## Article 17 — Foreign Provider Restrictions

Generative AI services provided to users within the People's Republic of
China must comply with these Measures. Foreign entities providing generative
AI services accessible within China must:

- Comply with all requirements of the Measures
- Appoint a domestic representative or establish a domestic entity
- File algorithms with the CAC

In practice, many foreign generative AI services (ChatGPT, Claude, etc.)
are not accessible within mainland China without VPN circumvention.

## Penalties

### Article 21 — Administrative Penalties

Violations of the Measures may result in:

- **Warnings and orders to rectify** within a specified timeframe
- **Fines** in accordance with the Cybersecurity Law, Data Security Law,
  PIPL, and other applicable laws (amounts determined by the specific
  provision violated; PIPL penalties can reach RMB 50 million or 5% of
  annual revenue)
- **Suspension of services** for serious violations
- **Revocation of business licences** for the most serious violations
- **Criminal liability** where conduct constitutes a crime

## Articles 17-18 — Compliance Personnel and Supervision

### Article 17 — Compliance and Security Personnel
GenAI service providers must designate dedicated compliance and security personnel. These personnel are responsible for:
- Overseeing content review and safety assessment processes
- Managing user complaint handling and dispute resolution
- Coordinating with regulatory authorities
- Maintaining training data legality verification records

### Article 18 — Acceptance of Supervision
GenAI service providers must accept supervision and inspection by relevant authorities, and cooperate in providing necessary technical and data support for regulatory review.

### Practical Timeline
The full CAC compliance process, including security assessment, typically takes 2-4 months. Service providers should begin the process well before their planned service launch date.

## Practical Implications for AI Product Teams

### Before Launch in China

1. **Algorithm filing**: File the generative AI algorithm with the CAC
   and obtain acknowledgment before public deployment
2. **Safety assessment**: Complete and submit a safety assessment to the
   relevant authority
3. **Content filtering**: Implement robust content review and filtering
   mechanisms aligned with prohibited content categories
4. **Training data audit**: Document all training data sources and verify
   their legality; address IP and personal information compliance
5. **Labeling infrastructure**: Implement AI-generated content watermarking
   and metadata labeling that meets technical standards
6. **Real-name verification**: Integrate identity verification for all users
7. **Complaint handling**: Establish public-facing complaint channels with
   documented processing workflows

### Ongoing Obligations

8. **Content monitoring**: Continuously monitor generated output for
   prohibited content
9. **Record keeping**: Maintain logs of generated content, user interactions,
   and complaint processing
10. **Regulatory reporting**: Respond promptly to CAC inspection requests
    and report serious incidents
11. **Algorithm updates**: Re-file with CAC when material changes are made
    to the algorithm

## Citations

- Interim Measures for the Management of Generative Artificial Intelligence
  Services (生成式人工智能服务管理暂行办法), Articles 1-24
- Cybersecurity Law of the People's Republic of China, Articles 21-25, 47
- Data Security Law of the People's Republic of China, Articles 27-32
- Personal Information Protection Law (PIPL), Articles 13-18, 55-56
- Provisions on the Management of Deep Synthesis of Internet Information
  Services, Articles 6-7, 16-18
- Provisions on the Management of Algorithmic Recommendations in Internet
  Information Services, Article 24
