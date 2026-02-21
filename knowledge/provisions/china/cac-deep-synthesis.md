# China — Deep Synthesis Technology Regulations

**Authority**: Cyberspace Administration of China (CAC), Ministry of Industry
and Information Technology (MIIT), Ministry of Public Security (MPS)
**Legal Basis**: Provisions on the Management of Deep Synthesis of Internet
Information Services (互联网信息服务深度合成管理规定)
**Status**: Effective January 10, 2023
**Scope**: Regulation of AI-generated synthetic media, including face
generation, face replacement, voice synthesis, text generation, and scene
generation

## Overview

The Provisions on the Management of Deep Synthesis of Internet Information
Services are China's dedicated regulation for AI-generated synthetic media,
commonly referred to as deepfake technology. They establish comprehensive
obligations for providers and users of deep synthesis services, with a
particular focus on mandatory labeling of synthetic content, consent
requirements for the use of personal biometric features, real-time content
monitoring, and user reporting mechanisms. These provisions predated and
informed the broader Interim Measures for Generative AI Services.

## Article 2 — Definition of Deep Synthesis

Deep synthesis technology (深度合成技术) is defined as technology that uses
deep learning, virtual reality, or other synthesis algorithms to generate
text, images, audio, video, virtual scenes, or other information. This
includes but is not limited to:

### Covered Technologies

1. **Text generation** (篇章生成): Technology that generates or edits text
   content, including article generation, text style transfer, and
   question-answering systems
2. **Text-to-speech synthesis** (语音合成): Technology that generates speech
   from text or clones voices, including speech synthesis, speech
   conversion, and voice cloning
3. **Face generation** (人脸生成): Technology that generates or edits human
   face images, including face synthesis, face replacement (face-swap),
   face attribute editing, and face reenactment
4. **Face replacement** (人脸替换): Technology that replaces one person's
   face with another's in images or video
5. **Scene generation** (图像生成): Technology that generates or edits
   images, video, or virtual three-dimensional scenes, including image
   generation, image enhancement, video generation, and virtual scene
   generation
6. **Other synthesis technologies**: Any other technology that generates
   or edits information content using generative or synthesis algorithms

## Article 6 — Provider General Obligations

Providers of deep synthesis services must:

- Establish and improve management systems and technical measures for
  algorithm mechanism review, scientific and technological ethics review,
  user registration, information release review, data security, personal
  information protection, anti-telecom fraud, and emergency response
- Formulate and publicly disclose management rules and platform conventions
  for the service
- Implement content review mechanisms that operate in real time

## Article 7 — Provider Technical Obligations

Providers must implement the following technical measures:

- **Content review** (内容审核): Real-time review of generated content to
  detect prohibited material, with mechanisms to prevent, detect, and
  address violations
- **Training data management**: Ensure training data complies with
  applicable laws, particularly regarding personal information and
  intellectual property
- **Technical security**: Implement security measures to prevent
  unauthorised access to or tampering with the deep synthesis system

## Article 9 — Consent for Biometric Features

When deep synthesis services involve the generation, editing, or use of
**personal biometric features** (个人生物特征), providers must:

- Obtain the **separate consent** (单独同意) of the individual whose
  biometric features are used
- Comply with PIPL requirements for sensitive personal information
  processing (Article 28 of PIPL requires separate consent for biometric
  data processing)
- Not generate, edit, or disseminate synthetic content using biometric
  features without the subject's explicit authorisation

This is particularly relevant for:

- Face-swap applications
- Voice cloning services
- Full-body deepfake generation
- Realistic avatars based on real individuals

## Article 10 — Prohibition on Deceptive Use

Users of deep synthesis services must not use the technology to:

- Produce or disseminate false information
- Infringe upon the personal rights, reputation, or privacy of others
- Engage in activities that endanger national security or social stability
- Create content that could deceive or mislead the public
- Impersonate others without authorisation

## Articles 16-18 — Mandatory Labeling Requirements

### Article 16 — Machine-Readable Labeling

Providers of deep synthesis services must add **identifiable marks**
(标识) to deep synthesis content. These marks must be:

- **Machine-readable**: Embedded in the metadata or digital watermark of
  the content, detectable by automated systems
- **Persistent**: Not easily removable by ordinary users
- **Standardised**: Conforming to technical standards issued by the
  relevant authorities

### Article 17 — Visible Labeling

For content that is disseminated or published, providers must also ensure
that deep synthesis content carries **visible labels** (显著标识) that
inform viewers that the content has been generated or edited using deep
synthesis technology.

The visible label must:

- Be clear and prominent
- Be positioned so that it is reasonably noticeable
- Not be easily cropped, obscured, or removed
- State that the content is AI-generated or uses deep synthesis technology

### Article 18 — Anti-Tampering

Providers must not:

- Provide technology, tools, or services specifically designed to remove,
  tamper with, or conceal the marks or labels required under Articles
  16-17
- Assist users in removing or circumventing content labels
- Delete metadata or watermarks that identify content as AI-generated

## Article 11 — User Real-Name Verification

Providers must implement real-name identity verification for users in
accordance with the Cybersecurity Law. Users who have not completed
identity verification must not be provided with information publication
or content generation functions.

## Article 13 — User Reporting Mechanisms

Providers must establish convenient user reporting mechanisms. When a user
reports that deep synthesis content violates laws, regulations, or their
legitimate rights:

- The provider must promptly verify and address the report
- Illegal content must be removed or restricted within the timeframe
  specified by law
- The provider must notify the reporting user of the outcome

## Article 14 — Record Keeping

Providers must maintain logs of deep synthesis content generation and
dissemination, including:

- Input data used to generate the content
- The generated output
- User identity information (linked to real-name verification)
- Timestamps of generation and publication

Log retention period: Not less than **six months** from the date of
generation.

## Article 19 — Algorithm Filing

Deep synthesis service providers whose services have public opinion
properties or social mobilization capabilities must file their algorithms
with the CAC under the algorithm filing system established by the
Provisions on the Management of Algorithmic Recommendations. See
`cac-algorithm-registry.md` for the detailed filing process.

## Enforcement and Penalties

### Article 20 — Regulatory Supervision

The CAC, MIIT, and MPS have authority to conduct inspections and
investigations of deep synthesis service providers.

### Article 21 — Penalties

Violations of the Provisions may result in:

- **Warning and order to rectify** within a specified deadline
- **Fines** in accordance with the Cybersecurity Law (up to RMB 1 million
  for serious violations), Data Security Law, PIPL (up to RMB 50 million
  or 5% of annual revenue for serious PIPL violations), and other
  applicable laws
- **Suspension of services** for serious or repeated violations
- **Criminal liability** where conduct constitutes a crime under the
  Criminal Law (e.g., defamation, fraud, producing/disseminating false
  information)

## Practical Implications for AI Product Teams

### Products That Generate Synthetic Media

1. **Implement dual labeling**: Both machine-readable watermarks (metadata/
   digital watermark) and visible labels on all generated content
2. **Obtain biometric consent**: If the product can generate or edit
   content using real individuals' biometric features, implement explicit
   consent flows that meet PIPL "separate consent" requirements
3. **Content filtering**: Deploy real-time content moderation to prevent
   generation of prohibited synthetic media (impersonation, disinformation,
   defamatory content)
4. **Record keeping**: Log all generation requests, inputs, outputs, and
   user identity for a minimum of six months
5. **User reporting**: Establish public-facing channels for reporting
   misuse of synthesised content

### Products That Detect or Moderate Synthetic Media

6. **Interoperability**: Ensure detection systems can read the
   machine-readable marks required by Article 16
7. **Standards compliance**: Monitor evolving Chinese national standards
   for deep synthesis labeling formats

### Integration with Generative AI Measures

The deep synthesis provisions apply alongside the Interim Measures for
Generative AI Services. A generative AI product that produces images,
audio, or video must comply with both regulatory frameworks simultaneously.
The labeling requirements under Article 11 of the GenAI Measures
cross-reference the Deep Synthesis Provisions.

## Citations

- Provisions on the Management of Deep Synthesis of Internet Information
  Services (互联网信息服务深度合成管理规定), Articles 1-25
- Cybersecurity Law of the People's Republic of China, Articles 12, 47
- Personal Information Protection Law (PIPL), Articles 26, 28, 29
  (biometric data as sensitive personal information requiring separate
  consent)
- Interim Measures for the Management of Generative Artificial Intelligence
  Services, Article 11 (cross-reference to deep synthesis labeling)
- Criminal Law of the People's Republic of China, Articles 246 (defamation),
  266 (fraud), 291 (fabricating/disseminating false information)
