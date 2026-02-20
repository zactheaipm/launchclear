# Human Oversight for AI Systems

## Overview

Human oversight ensures that AI systems operate within intended boundaries and
that humans can intervene when the system produces incorrect, biased, or
harmful outputs. Meaningful oversight is not a checkbox — it requires
organisational design, technical affordances, and ongoing training.

## Key Principles

1. **Proportionality**: Oversight intensity should match the risk level and
   impact of AI decisions. Determinative decisions (loan approvals, hiring)
   require more rigorous oversight than advisory recommendations.

2. **Meaningful review**: Oversight must be substantive, not rubber-stamp.
   Reviewers need sufficient time, information, and authority to actually
   override the system.

3. **Automation bias mitigation**: Design processes that counteract the
   tendency for humans to over-rely on AI outputs. Present confidence scores,
   flag edge cases, and require independent human assessment before showing
   AI recommendations.

## Implementation Patterns

### Human-in-the-Loop (HITL)

The AI system produces a recommendation, but a human makes the final decision.

- **When to use**: Material or determinative decisions (credit scoring,
  medical diagnosis, employment screening, content moderation of sensitive
  categories).
- **Implementation**:
  - Queue system for human review of AI outputs
  - Decision interface showing AI recommendation, confidence score, and
    supporting evidence
  - Override mechanism with mandatory reason capture
  - SLA for review completion (prevents bottleneck)
  - Sampling and audit of reviewer decisions for quality

### Human-on-the-Loop (HOTL)

The AI system acts autonomously but a human monitors and can intervene.

- **When to use**: Advisory decisions, real-time systems where HITL latency
  is impractical (fraud detection, content recommendation).
- **Implementation**:
  - Dashboard for real-time monitoring of AI outputs and metrics
  - Alert thresholds for anomalous patterns (sudden accuracy drop, bias
    drift, unexpected output distribution)
  - Kill switch / pause mechanism accessible to monitoring personnel
  - Periodic batch review of decisions (random sampling)
  - Escalation triggers for edge cases

### Emergency Stop Mechanisms

- **Kill switch**: Ability to immediately disable the AI system
- **Graceful degradation**: Fallback to rules-based or manual processing
- **Rollback capability**: Revert to previous model version
- **Scope restriction**: Ability to narrow the system's operating parameters

## Staffing and Training

- Oversight personnel must understand the AI system's capabilities and
  limitations (not just how to click "approve")
- Training should cover: what the system does, known failure modes, how to
  identify bias, when to escalate, how to use override mechanisms
- Regular refresher training as the system evolves
- Sufficient staffing to maintain review quality — understaffing leads to
  rubber-stamp reviews

## Documentation Requirements

- Who has oversight authority and what decisions they can override
- Escalation procedures and response time expectations
- Override logging (every override recorded with timestamp, reviewer, reason)
- Regular review of oversight effectiveness (are overrides happening? are
  they catching real issues?)
- Accountability chain from oversight personnel to senior management

## Common Pitfalls

- **Rubber-stamp oversight**: If reviewers approve 99.9% of AI decisions
  without examination, the oversight is not meaningful
- **Alert fatigue**: Too many alerts lead to all alerts being ignored
- **Insufficient context**: Reviewers can't make good decisions without
  understanding what the AI considered
- **No feedback loop**: Override decisions should feed back into model
  improvement
- **Speed pressure**: Setting aggressive SLAs that force reviewers to
  prioritise speed over quality
