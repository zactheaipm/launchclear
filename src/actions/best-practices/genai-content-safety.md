# Content Safety Filters for AI-Generated Output

## Overview

Content safety filtering prevents AI systems from generating harmful, illegal,
or policy-violating content. This is a regulatory requirement in several
jurisdictions (especially China), an expectation in others (EU, US), and a
baseline responsible AI practice everywhere.

## Regulatory Context

- **China (CAC GenAI Measures)**: Most prescriptive. Content must not incite
  subversion of state power, undermine national unity, promote terrorism or
  extremism, contain false information, or violate other content laws.
  Mandatory content review before output delivery.
- **EU AI Act (Article 55)**: GPAI providers with systemic risk must evaluate
  and mitigate systemic risks including generation of harmful content.
- **US Federal (FTC)**: Deceptive or harmful AI-generated content may violate
  FTC Act Section 5. No specific filter mandate, but responsibility for
  harmful output is emerging.
- **UK**: AISI evaluates frontier models for harmful output capability.
  Voluntary commitments on safety filtering.

## Implementation Approaches

### 1. Input Filtering (Pre-Generation)

Filter or modify user prompts before they reach the AI model:

- **Keyword and pattern matching**: Block known harmful prompt patterns
  (instructions for illegal activity, exploitation content, etc.)
- **Prompt classification**: Use a lightweight classifier to categorise
  prompts by risk level before generation
- **Jailbreak detection**: Detect and block prompt injection attempts
  designed to bypass safety measures
- **Rate limiting**: Limit generation volume from individual users to
  prevent large-scale misuse

### 2. Output Filtering (Post-Generation)

Analyse and filter generated content before delivery to users:

- **Content moderation APIs**: Use hosted moderation services
  (OpenAI Moderation API, Google Perspective API, AWS Comprehend,
  Azure Content Safety) to classify generated content
- **Custom classifiers**: Train domain-specific classifiers for
  categories not covered by general moderation APIs
- **Rule-based filters**: Regular expressions and keyword lists for
  high-precision blocking of specific content patterns
- **Threshold configuration**: Configure sensitivity thresholds per
  content category based on product use case and audience

### 3. Human Review Escalation

Route borderline content to human reviewers:

- Define escalation triggers (low-confidence moderation scores,
  flagged categories, high-risk content types)
- Implement review queue with SLAs
- Provide reviewers with context (prompt, full output, classification
  scores)
- Feedback loop: reviewer decisions improve automated filters

### 4. Multi-Layer Safety

Deploy multiple layers for defence in depth:

```
User prompt
    → Input filter (block obvious violations)
    → Model safety training (RLHF/Constitutional AI)
    → Output filter (catch remaining issues)
    → Human review (for borderline cases)
    → User reporting (post-delivery catch)
```

## Content Categories to Address

At minimum, implement detection and filtering for:

1. **Violence and gore**: Graphic depictions of violence, instructions
   for harm
2. **Sexual content**: Explicit sexual content, especially involving minors
3. **Hate speech**: Content targeting protected groups
4. **Harassment**: Content targeting specific individuals
5. **Self-harm**: Content promoting or instructing self-harm or suicide
6. **Illegal activity**: Instructions for illegal acts, fraud, hacking
7. **Misinformation**: Demonstrably false claims about elections, health,
   safety, or public figures
8. **PII exposure**: Generated content that reveals personal information
9. **Copyright violation**: Verbatim reproduction of copyrighted material

For China market, additionally address:
- Content that undermines state sovereignty or national unity
- Content that damages national honour or interests
- Content promoting terrorism or extremism
- Content spreading rumours or disrupting social order

## Monitoring and Improvement

- **Track filter activations**: Monitor which categories are triggered
  most frequently
- **False positive analysis**: Review blocked content for false positives;
  adjust thresholds to maintain usability
- **Adversarial testing**: Regularly red-team the safety system to find
  bypasses
- **User reporting**: Implement feedback mechanism for users to flag
  harmful content that passed filters
- **Incident response**: Process for handling safety incidents (harmful
  content that reached users)
- **Metrics**: Track safety metrics (block rate, false positive rate,
  user report rate, time to remediation)

## Common Pitfalls

- **Over-filtering**: Excessively aggressive filters that block legitimate
  content frustrate users and reduce product utility
- **Under-filtering**: Insufficient filters that allow harmful content
  expose the organisation to legal and reputational risk
- **Static filters**: Safety landscape evolves; filters need regular
  updates for new attack patterns and emerging risks
- **English-only**: Safety filters must work in all languages the product
  supports; adversarial users will switch languages to bypass filters
- **Ignoring multimodal**: If the system generates images, audio, or video,
  safety filters must cover those modalities too
- **No monitoring**: Deploying filters without monitoring their effectiveness
  creates a false sense of security
