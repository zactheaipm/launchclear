# Singapore — IMDA Model AI Governance Framework for Agentic AI

**Authority**: Infocomm Media Development Authority (IMDA), Singapore
**Document**: Model AI Governance Framework for Agentic AI (January 2026)
**Legal Basis**: Extension of PDPC Model AI Governance Framework
**Status**: World's first dedicated agentic AI governance framework; voluntary but industry-referenced

## Overview

The IMDA Model AI Governance Framework for Agentic AI is the world's first
governance framework specifically designed for AI systems that can plan,
reason, and take autonomous actions in the real world. Published in January
2026, it addresses a governance gap: existing AI frameworks were designed for
systems that produce outputs (predictions, recommendations, generated content),
not for systems that take actions with real-world consequences.

Agentic AI systems — including autonomous customer service agents, coding
agents, research agents, and multi-agent orchestration systems — can execute
multi-step plans, call tools and APIs, modify data, make financial
transactions, and interact with external systems. These capabilities introduce
risks that differ fundamentally from traditional AI or even generative AI:
the harm comes not from biased outputs but from autonomous actions.

The framework is structured around four governance dimensions, each with
specific recommendations for developers, deployers, and end users.

## Scope and Definitions

### What Constitutes Agentic AI

The framework applies to AI systems that:
- Can take autonomous actions beyond generating content (e.g., sending emails,
  making purchases, modifying databases, executing code, browsing the web)
- Operate with some degree of planning and reasoning to achieve goals
- May interact with external tools, APIs, or other systems
- May involve multiple agents coordinating to accomplish tasks

### Autonomy Levels

The framework recognises three levels of agentic autonomy:

1. **Narrow agentic AI**: Single-tool, single-step actions within a
   tightly constrained scope (e.g., auto-replying to emails based on
   templates, scheduling a meeting)
2. **Bounded agentic AI**: Multi-step execution with defined guardrails
   (e.g., customer service agent that can look up orders, process refunds
   within limits, escalate complex cases)
3. **Broad agentic AI**: Open-ended planning and execution with wide tool
   access (e.g., research agents, coding agents, autonomous workflow
   systems)

Governance expectations scale with autonomy level.

## Dimension 1 — Assess and Bound Risks

### 1.1 — Pre-Deployment Risk Assessment

Before deploying agentic AI, organisations should:
- Identify all tools, APIs, and systems the agent can access
- Map the scope of actions the agent can take and their potential consequences
- Assess worst-case scenarios for each action type (financial loss,
  data corruption, privacy breach, reputational harm)
- Evaluate whether the autonomy level is proportionate to the use case

### 1.2 — Limiting Autonomy Scope

Organisations should implement:
- **Tool access restrictions**: Agents should only have access to tools
  and APIs necessary for their designated tasks. Principle of least privilege
  applies to agentic AI just as it does to human users.
- **Action scope boundaries**: Define explicit whitelists of permitted
  actions. Actions outside the whitelist should be blocked, not just logged.
- **Data access controls**: Limit the data the agent can read, write, or
  modify. Personal data access should be minimised and logged.
- **Financial limits**: Cap transaction amounts, set spending budgets, require
  approval above thresholds.
- **Rate limiting**: Prevent runaway execution by capping the number of
  actions per time window.

### 1.3 — Graduated Autonomy

The framework recommends starting with the minimum necessary autonomy and
expanding only when monitoring demonstrates safe operation:
- Begin with narrow scope and human-in-the-loop for consequential actions
- Expand tool access and action scope incrementally based on observed safety
- Maintain the ability to reduce autonomy if monitoring detects issues

## Dimension 2 — Make Humans Meaningfully Accountable

### 2.1 — Defining Human Checkpoints

Organisations must define specific points in agentic workflows where human
approval is required:
- **High-consequence actions**: Actions that are irreversible, affect
  individuals' rights, involve financial transactions above defined
  thresholds, or modify critical data must require human approval
- **Novel situations**: When an agent encounters scenarios outside its
  training or defined parameters, it should escalate to a human rather
  than improvise
- **Batch operations**: When an agent takes actions affecting many
  individuals simultaneously, human review of a sample or the batch
  criteria should be required

### 2.2 — Combating Automation Bias

Human checkpoints are only meaningful if humans exercise genuine judgement:
- Human reviewers must have sufficient context to evaluate agent decisions
  (not just a "confirm/deny" button with no supporting information)
- Training programs for human reviewers should address automation bias —
  the tendency to uncritically accept AI recommendations
- Metrics should track human override rates; consistently near-zero
  override rates may indicate rubber-stamping rather than genuine review
- Time pressure and incentive structures should not discourage meaningful
  human review

### 2.3 — Accountability in Multi-Agent Systems

When multiple agents interact:
- Clear accountability assignment for each agent in the chain. An
  orchestrating agent's developer bears responsibility for the actions
  of agents it coordinates.
- Cross-agent interactions should be logged and auditable
- Failure in one agent should not cascade unchecked through the system
- The human accountable for the overall system must have visibility into
  each agent's actions and decisions

### 2.4 — Escalation Protocols

- Define clear escalation paths from agent to human for each use case
- Ensure escalation channels are monitored and responsive (not just a
  support email that goes unread)
- Document and review escalation frequency, reasons, and outcomes
- Agents should not retry failed or escalated actions without human
  authorisation

## Dimension 3 — Implement Technical Controls

### 3.1 — Comprehensive Action Logging

All agentic actions must be logged with:
- Timestamp and unique action identifier
- The agent's reasoning chain or plan that led to the action
- The specific action taken (tool called, parameters used, data accessed)
- The outcome of the action (success/failure, response received)
- Any user inputs that triggered the action chain
- The identity of the human accountable for the agent's deployment

Logs must be retained for a period sufficient for audit and dispute resolution,
and must be tamper-resistant.

### 3.2 — Sandboxed Testing

Before production deployment:
- Test agentic systems in sandboxed environments that simulate real-world
  conditions but prevent real consequences
- Simulate edge cases, adversarial inputs, and failure scenarios
- Verify that guardrails (tool restrictions, action limits, escalation
  triggers) function correctly under stress
- Test rollback mechanisms to confirm they can undo agent actions

### 3.3 — Failsafe Mechanisms

Organisations must implement:
- **Kill switches**: Ability to immediately halt all agent actions. Kill
  switches must be accessible to designated humans and should not require
  technical expertise to activate.
- **Rollback capabilities**: Where possible, agent actions should be
  reversible. Design actions to be idempotent or implement compensating
  transactions.
- **Circuit breakers**: Automatic halting when anomalous behaviour is
  detected (e.g., unusual number of actions, unexpected error patterns,
  budget threshold reached)
- **Graceful degradation**: When an agent is halted, the system should
  degrade gracefully, informing users and preserving system state

### 3.4 — Gradual Rollout

- Deploy agentic AI to a limited user group initially
- Monitor closely during early deployment for unexpected behaviours
- Expand scope and user base incrementally based on monitoring data
- Maintain rollback plans for each expansion phase

### 3.5 — Monitoring for Drift

- Track agent behaviour patterns over time to detect drift from intended
  operation
- Monitor for changes in action distribution, error rates, escalation
  frequency, and user satisfaction
- Implement alerting for anomalous patterns
- Regularly re-evaluate whether the agent's autonomy level remains
  appropriate as the operating environment changes

## Dimension 4 — Enable End-User Responsibility

### 4.1 — Transparency About Capabilities and Limitations

End users of agentic AI systems should be informed about:
- What actions the agent can take on their behalf
- What the agent cannot do and what its known limitations are
- How the agent makes decisions (at an appropriate level of abstraction)
- What data the agent accesses and how it uses that data
- What happens when the agent encounters an error or uncertain situation

### 4.2 — User Training Requirements

For organisational deployment of agentic AI:
- Users should receive training on the agent's capabilities, limitations,
  and appropriate use
- Training should cover how to monitor agent actions, how to intervene,
  and when to escalate concerns
- Training should be updated as agent capabilities change

### 4.3 — Clear Action Attribution

- Users should be able to see what actions the agent has taken, when,
  and why (action history/audit trail available to the user)
- Where an agent acts on behalf of a user, it should be clear to third
  parties that the action was taken by an AI agent (e.g., an email sent
  by an agent should disclose this)
- Users should not be held responsible for agent actions that exceeded
  the scope they authorised

### 4.4 — User Controls Over Agent Behaviour

End users should have access to:
- Configuration controls to adjust agent autonomy within deployment-defined
  limits (e.g., approval requirements, spending limits)
- The ability to pause, stop, or undo agent actions
- Preferences for notification frequency and level of detail about agent
  activities
- Opt-out mechanisms for specific agent capabilities

## Application to Multi-Agent Systems

Multi-agent systems — where multiple AI agents interact, delegate tasks,
or coordinate to achieve a shared goal — require additional governance:

### Orchestration Governance

- The entity that orchestrates or deploys the multi-agent system bears
  overall accountability for system-level outcomes
- Individual agent developers bear responsibility for their agent's
  compliance with agreed interfaces and safety specifications
- Inter-agent communication protocols should be documented and monitored

### Supply Chain Considerations

- When agents from different vendors or organisations interact, contractual
  arrangements must define responsibilities for safety, logging, and
  incident response
- Third-party agents integrated into a system must meet the deploying
  organisation's governance standards
- Organisations should maintain visibility into the behaviour and reliability
  of third-party agents through monitoring and audit rights

### Emergent Behaviour

- Multi-agent systems may exhibit emergent behaviours not present in
  individual agents. Monitoring must account for system-level patterns.
- Testing should include multi-agent interaction scenarios, not just
  individual agent testing
- Circuit breakers should operate at both the individual agent and system
  level

## Practical Implementation Checklist

1. **Classify autonomy level** — determine whether the system is narrow,
   bounded, or broad agentic AI
2. **Inventory tools and actions** — document all tools, APIs, and action
   types the agent can access
3. **Define action boundaries** — implement whitelists, financial caps,
   data access controls
4. **Establish human checkpoints** — identify which actions require human
   approval and how approvals are conducted
5. **Implement logging** — comprehensive action logging with reasoning
   chains and outcomes
6. **Build failsafes** — kill switches, circuit breakers, rollback mechanisms
7. **Test in sandbox** — adversarial testing, edge cases, failsafe verification
8. **Deploy gradually** — limited rollout with close monitoring before expansion
9. **Train users** — ensure end users understand capabilities, limitations,
   and controls
10. **Monitor continuously** — track behaviour, drift, escalation rates, and
    user satisfaction

## Interaction with Other Frameworks

- **PDPC Model AI Governance Framework**: The agentic AI framework extends
  the general framework; all PDPC principles and PDPA requirements apply
- **IMDA GenAI Governance Framework**: Agentic AI systems that generate
  content must also comply with GenAI governance requirements (content
  provenance, disclosure, safety)
- **MAS AI Risk Management Guidelines**: Agentic AI in financial services
  must additionally comply with MAS-specific governance, materiality
  assessment, and lifecycle controls
- **EU AI Act**: Agentic AI systems deployed in the EU are assessed under
  existing risk tiers; the Singapore framework provides complementary
  agentic-specific guidance that exceeds EU requirements in specificity

## Citations

- IMDA, Model AI Governance Framework for Agentic AI (January 2026)
- IMDA & AI Verify Foundation, Agentic AI Governance Discussion Paper (2025)
- PDPC, Model AI Governance Framework (2nd Edition, January 2020)
- Singapore National AI Strategy 2.0 (December 2023)
- IMDA, Proposed Model AI Governance Framework for Generative AI (2024)
- AI Verify Foundation, Testing Framework for Agentic AI Systems (2026)
- Personal Data Protection Act 2012, as amended 2020
