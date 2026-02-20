# Consent Collection Mechanisms

## Overview

Consent is one of several legal bases for processing personal data and using
AI systems. When consent is the chosen legal basis, it must meet
jurisdiction-specific requirements for validity. This guide covers
implementation patterns for consent collection in AI products.

## GDPR Consent Requirements

Under GDPR Article 7, valid consent must be:

- **Freely given**: Not bundled with other terms; no detriment for refusing;
  genuine choice (power imbalance between controller and data subject should
  be considered)
- **Specific**: Consent for each distinct processing purpose; granular
  consent options (not a single "agree to all")
- **Informed**: Clear description of what data is collected, how it will be
  used, who has access, retention periods, and data subject rights
- **Unambiguous**: Clear affirmative act (no pre-ticked boxes, no silence
  or inactivity as consent)

Additional GDPR requirements:
- Consent must be as easy to withdraw as to give (Article 7(3))
- Consent records must be maintained (controller must demonstrate consent)
- For special category data (health, biometric, etc.), explicit consent
  required (Article 9(2)(a))
- For children, parental/guardian consent required (Article 8)

## Implementation Patterns

### Granular Consent Forms

- Separate consent toggles for each processing purpose
- Clear description next to each toggle explaining the purpose
- No pre-enabled toggles
- "Accept all" / "Reject all" buttons for convenience, but individual
  toggles remain accessible

### Layered Notices

- **Layer 1** (banner/modal): Brief summary of what you're asking for
- **Layer 2** (linked page): Full privacy notice with detailed information
- **Layer 3** (on request): Specific technical details about AI processing

### Consent for AI-Specific Processing

AI systems often have processing purposes beyond the obvious:

- **Model training**: If user data may be used to train or fine-tune models,
  this requires separate consent from providing the service
- **Automated decision-making**: If AI makes decisions with significant
  effects, explicit consent may be needed (GDPR Article 22(2)(c))
- **Profiling**: Building user profiles from behaviour patterns
- **Cross-context use**: Using data collected for one purpose to personalise
  or improve a different product

### Withdrawal Mechanism

- Prominent "manage consent" link in product settings
- One-click withdrawal for each purpose
- Technical implementation to stop processing promptly after withdrawal
- Data deletion or anonymisation workflow triggered by withdrawal
- Confirmation to user that withdrawal has been processed

## Jurisdiction-Specific Variations

### US (CCPA/CPRA)

- Opt-out model (not opt-in): "Do Not Sell/Share My Personal Information" link
- Financial incentive disclosures if offering benefits for data sharing
- Right to limit use of sensitive personal information
- Recognise Global Privacy Control (GPC) browser signal

### Brazil (LGPD)

- Similar to GDPR consent requirements
- Consent must be in writing or by other means demonstrating the will of
  the data subject
- Specific consent for international data transfers
- Separate consent for sensitive data processing

### Singapore (PDPA)

- Consent can be express or deemed (implied in certain circumstances)
- Notification obligation: organisation must inform individual of purposes
  before or at the time of collection
- Consent for transfer outside Singapore

### China

- Separate consent required for processing sensitive personal information
- Informed consent before personal information is provided to third parties
- Separate consent for cross-border transfer of personal information

## Technical Implementation

### Consent Storage

- Store consent records with: timestamp, version of notice consented to,
  specific purposes consented to, method of consent (click, signature),
  IP address (where legally required)
- Maintain consent version history (when notice text changes, existing
  consents may need refreshing)
- Consent records must be queryable (for responding to regulatory inquiries)

### Consent Propagation

- Consent status must propagate to all downstream systems that process data
- If consent is withdrawn, propagation must be timely
- Third-party data processors must respect consent withdrawal

### A/B Testing Consent Flows

- Be careful with A/B testing consent UIs — dark patterns that increase
  consent rates may invalidate consent
- Ensure all variants meet legal requirements
- Track opt-in rates per variant; unusually high rates may indicate
  manipulative design

## Common Pitfalls

- **Cookie wall**: Requiring consent to access a service may mean consent
  is not freely given
- **Buried withdrawal**: Making withdrawal difficult invalidates consent
- **Stale consent**: Consent collected years ago for a different product
  version may no longer be valid
- **Consent fatigue**: Asking for consent too frequently leads to users
  ignoring all requests
- **Over-reliance on consent**: Consent is not always the best legal basis
  — legitimate interest or contractual necessity may be more appropriate
  and less burdensome for users
