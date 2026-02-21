# LaunchClear

> **Describe your AI product. Pick your markets. Get draft-ready compliance documents for Legal.**

[![CI](https://github.com/launchclear/launchclear/actions/workflows/ci.yml/badge.svg)](https://github.com/launchclear/launchclear/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

---

## What LaunchClear Does

You're shipping an AI feature. Legal needs a DPIA. Product wants to know which
markets are safe to launch in. Your PM Googles "EU AI Act requirements" and
gets 50 pages of legalese.

**LaunchClear turns that into a structured workflow:**

1. Answer questions about your AI product (what it does, what data it uses, who it affects)
2. Select your target markets
3. Get back:
   - **Risk classifications** per jurisdiction
   - **Draft compliance artifacts** (DPIAs, risk assessments, model cards, transparency notices, GPAI documentation, content labeling policies)
   - **Prioritized action plans** with specific steps, deadlines, and verification criteria

The output is structured, citable, and designed to hand directly to your legal team for review.

---

## Quick Start

```bash
npm install -g launchclear

# Interactive mode — guided intake interview
launchclear

# Quick mode — one-liner
launchclear check "AI-powered resume screening that auto-rejects bottom 50%" \
  --markets eu,gdpr,us-ca,uk,sg
```

### Requirements

- **Node.js 20+**
- (Optional) An LLM API key for artifact generation:
  `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or a local Ollama instance

Without an API key, LaunchClear still runs the full deterministic analysis
(risk classification, requirement mapping, action plans). The LLM is only
used to fill in artifact templates with product-specific language.

---

## Supported Jurisdictions

| ID | Jurisdiction | Region | Coverage |
|----|-------------|--------|----------|
| `eu-ai-act` | EU AI Act | EU | Risk classification (all tiers), Annex III high-risk categories, prohibited practices, GPAI/systemic risk, transparency obligations, compliance timelines |
| `eu-gdpr` | EU GDPR | EU | Legal basis assessment, DPIA triggers, Article 22 automated decisions, data subject rights, cross-border transfers, training data processing |
| `us-federal` | US Federal | US | FTC enforcement framework, NIST AI RMF, NIST GenAI profile, FTC GenAI guidance, federal financial AI (SR 11-7) |
| `us-ca` | California | US | CCPA/CPRA, SB 942 GenAI transparency, deepfake laws |
| `us-co` | Colorado | US | Colorado AI Act (SB 24-205) |
| `us-il` | Illinois | US | BIPA, AI Video Interview Act, HRA AI amendment |
| `us-ny` | New York | US | NYC Local Law 144 (AEDT bias audits) |
| `us-tx` | Texas | US | TRAIGA, deepfake laws |
| `uk` | United Kingdom | UK | ICO AI guidance, AISI frontier models, DSIT foundation model principles, FCA AI guidance |
| `singapore` | Singapore | APAC | PDPA (Parts III-VIA), PDPC AI governance, IMDA GenAI guidelines, IMDA Agentic AI framework, MAS AI risk management, ASEAN CBPR |
| `china` | China | APAC | PIPL, CAC GenAI measures, algorithm filing, deep synthesis regulations, recommendation algorithms |
| `brazil` | Brazil | LATAM | LGPD, AI Bill (PL 2338/2023) GenAI/foundation model provisions |

Use shorthand aliases with `--markets`: `eu`, `gdpr`, `us`, `uk`, `sg`, `cn`, `br`, `ca`, `co`, `il`, `ny`, `tx`

---

## Two Modes

### Mode 1: CLI / API (Model-Agnostic)

The standard workflow. Describe your product, answer intake questions, select
markets, get your compliance report. Works with any LLM provider (Anthropic,
OpenAI, Ollama) or no LLM at all.

```bash
launchclear check "GenAI chatbot for customer service" --markets eu,cn,uk,sg
```

### Mode 2: Claude Skill (Zero-Friction, Codebase-Aware)

The killer feature. Claude Code reads your repository and auto-infers answers
to intake questions from the codebase -- data collection endpoints, database
schemas, model inference code, user auth flows, third-party integrations.

A 12-question intake interview becomes 3-4 questions because the codebase is
the source of truth for most technical facts a regulatory lawyer would ask about.

```
Claude reads your repo
  -> Detects data collection, PII, LLM API calls, consent flows, agentic patterns
  -> Asks only what it can't infer (business context, target markets, human review)
  -> Generates full compliance report
```

---

## What You Get

### Compliance Artifacts

Draft documents generated from jurisdiction-specific templates:

| Artifact | When Generated |
|---|---|
| Data Protection Impact Assessment (DPIA) | GDPR -- automated decisions, sensitive data, large-scale processing |
| AI Act Risk Assessment | EU AI Act -- high-risk classification |
| Conformity Assessment Outline | EU AI Act -- high-risk systems |
| Model Card | EU AI Act -- transparency obligations |
| Transparency Notice | GDPR Art. 13-14, EU AI Act Art. 50 |
| GPAI Technical Documentation | EU AI Act -- GPAI model providers (Art. 53) |
| GenAI Content Labeling Policy | Cross-jurisdictional -- AI-generated content labeling |
| Training Data Disclosure | EU AI Act Art. 53, China CAC, Brazil AI Bill |
| China Algorithm Filing | China CAC -- algorithm registration |
| China GenAI Safety Assessment | China CAC -- pre-launch safety assessment |
| GPAI Systemic Risk Assessment | EU AI Act -- GPAI models with systemic risk |
| Agentic AI Governance | Singapore IMDA -- agentic AI risk bounding |
| Post-Market Monitoring Plan | EU AI Act -- high-risk ongoing monitoring |
| Singapore PDPC Risk Assessment | Singapore -- PDPA data protection |
| Bias Audit Template | NYC LL144 -- AEDT bias audits |

### Action Plans

Prioritized, jurisdiction-specific actions with legal basis, estimated effort,
deadlines, and verification checklists:

```
Critical (Must do before launch):
  1. Implement risk management system
     Jurisdictions: eu-ai-act
     Legal basis: Article 9
     Deadline: 2026-08-02

  2. Implement human oversight mechanisms
     Jurisdictions: eu-ai-act
     Legal basis: Article 14

  3. Conduct DPIA before processing begins
     Jurisdictions: eu-gdpr
     Legal basis: Article 35
```

### Cross-Jurisdictional Analysis

When you target multiple markets, LaunchClear goes beyond per-jurisdiction checklists:

- **Conflict detection** -- identifies regulatory tensions between jurisdictions (e.g., GDPR right to erasure vs. China's mandatory data retention, EU AI Act open-source exemptions vs. China's filing requirements regardless of open-source status). 10 tension patterns covering EU-China, GDPR-China, US-EU, and more.
- **Enforcement precedent** -- contextualizes recommendations with real enforcement actions (30 cases across CNIL, Italian Garante, ICO, PDPC, FTC, CAC, ANPD, and more).
- **Citation validation** -- every legal citation generated by the LLM is cross-checked against known article ranges for 30+ laws. Hallucinated citations are flagged before they reach your legal team.
- **Overdue deadline detection** -- past-due compliance deadlines are flagged as `[OVERDUE]` and auto-escalated to critical priority instead of being silently presented as upcoming.
- **Regulatory force classification** -- each provision is tagged with its legal weight (`binding-law`, `binding-regulation`, `supervisory-guidance`, `voluntary-framework`, `pending-legislation`) so your team can distinguish hard legal requirements from best-practice guidance.

---

## Why Not Just Ask ChatGPT?

A generic LLM prompt can give you a decent regulatory overview. But it cannot:

- **Ask the right follow-up questions** for your specific product type and markets
- **Generate properly structured compliance documents** with jurisdiction-specific required sections (a DPIA for GDPR has different required sections than a risk assessment under the EU AI Act)
- **Maintain a version-controlled regulatory knowledge base** that updates when laws change and shows you what changed since your last check
- **Produce consistent, auditable output** that your legal team can actually review against a known template
- **Handle cross-jurisdictional complexity** -- a GenAI product targeting EU + China + UK + Singapore needs jurisdiction-specific requirements for each, not a generic summary. LaunchClear also detects regulatory conflicts between jurisdictions and flags them.
- **Validate its own citations** -- LLMs hallucinate legal citations. LaunchClear cross-checks every citation against known article ranges for 30+ laws before it reaches your legal team.

LaunchClear's value is the **structured workflow and knowledge base**, not the LLM reasoning. The LLM fills in the templates; LaunchClear ensures the right templates exist, the right questions get asked, and the right provisions get cited.

---

## How It Works

LaunchClear is **not** a wrapper around an LLM prompt. The compliance logic is deterministic:

```
Product description + data practices + target markets
        |
   Intake interview (conditional questions based on your answers)
        |
   ProductContext (structured representation of your product)
        |
   Jurisdiction modules (deterministic requirement mapping)
        |
   Risk classifications + applicable provisions + required artifacts + action items
        |
   Cross-jurisdictional conflict detection + enforcement precedent matching
        |
   (Optional) LLM fills artifact templates with product-specific details
        |
   Citation validation + overdue deadline detection
        |
   Compliance report (Markdown + JSON)
```

The jurisdiction modules encode the legal logic. The LLM's job is limited to
filling in templates. This makes the output reproducible and auditable.

### Knowledge Base

The regulatory knowledge base in `knowledge/` is the core asset:

- **Provisions** -- structured legal provisions per jurisdiction, tagged by topic, with article references
- **Templates** -- compliance document templates with required sections per jurisdiction
- **Questions** -- intake question bank organized by topic (core, data practices, automated decisions, GenAI, agentic AI, financial services, GPAI)

All legal content references specific articles and sections. Every claim in the output is traceable to a provision in the knowledge base.

---

## CLI Commands

```bash
# Interactive intake interview (default)
launchclear

# Quick check from description
launchclear check "your AI product description" --markets eu,gdpr,us

# Options
  -m, --markets <markets>   Comma-separated target markets
  -o, --output <dir>        Output directory (default: ./launchclear-report)
  -f, --format <format>     Output format: markdown, json, both (default: both)
  -p, --provider <name>     LLM provider: anthropic, openai, ollama

# List supported jurisdictions
launchclear jurisdictions

# List available artifact templates
launchclear artifacts

# Update regulation knowledge base
launchclear update-regulations

# Show regulation changes since a date
launchclear diff --since 2025-12-01
```

---

## LLM Providers

LaunchClear is model-agnostic. Configure via environment variables:

```bash
# Anthropic (Claude)
export ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (or any OpenAI-compatible API)
export OPENAI_API_KEY=sk-...

# Alibaba Cloud (Qwen via DashScope)
export DASHSCOPE_API_KEY=sk-...

# Local models via Ollama (no API key needed)
export OLLAMA_BASE_URL=http://localhost:11434
```

LaunchClear auto-detects which provider to use from your environment.
Override with `--provider` or `LAUNCHCLEAR_DEFAULT_PROVIDER`.

---

## Architecture

```
src/
  core/           TypeScript types and Zod schemas
  intake/         Intake interview system (question routing, context building)
  jurisdictions/  Jurisdiction modules (12 jurisdictions), conflict detection, shared helpers
  artifacts/      Compliance artifact generation (15 templates), citation validation
  actions/        Action plan generation and prioritization
  providers/      LLM provider adapters (Anthropic, OpenAI, Ollama)
  regulations/    Regulation auto-ingestion pipeline
  codebase/       Codebase analysis (Claude Skill mode)
  output/         Report formatters (Markdown, JSON)
  cli/            CLI entry point and interactive interview

knowledge/
  provisions/     Structured legal provisions per jurisdiction
  templates/      Compliance document templates
  questions/      Intake question bank (JSON)
  enforcement/    Enforcement precedent database
  snapshots/      Versioned regulatory snapshots

skill/
  SKILL.md              Claude Skill definition
  codebase-signals.md   What to look for in code
  intake-fallback.md    Questions when code is ambiguous
```

### Tech Stack

- TypeScript 5 (strict mode, no `any`)
- Zod for all input/output validation
- Commander.js + Inquirer.js for the CLI
- Hono for the HTTP API
- Vitest for testing
- Biome for linting and formatting

---

## Development

```bash
git clone https://github.com/launchclear/launchclear.git
cd launchclear
npm install

# Run in development
npm run dev

# Run tests
npm test

# Typecheck + lint
npm run check

# Format
npm run lint:fix
```

911 tests across 24 test files cover jurisdiction mapping, artifact generation,
action prioritization, provider adapters, codebase analysis, regulation
ingestion, and end-to-end scenarios.

---

## Contributing

Contributions welcome -- especially from legal professionals who can improve
jurisdiction coverage.

### For Developers

- TypeScript strict mode, no `any`
- Biome formatting (tabs, not spaces) -- run `npm run lint:fix`
- All input/output validated with Zod
- Functional core, imperative shell -- pure functions for business logic

### For Legal Professionals

You don't need to write regulation summaries from scratch. The regulation
pipeline auto-ingests and structures legal text. Lawyers review, correct,
and add jurisdiction-specific nuance via pull requests. See
[knowledge/README.md](knowledge/README.md) for the contribution guide.

---

## License

Code is [MIT](LICENSE). The regulatory knowledge base (`knowledge/`) is
[CC BY-SA 4.0](knowledge/LICENSE) -- use it, adapt it, but attribute
contributors and keep derivatives open.

---

## Disclaimer

LaunchClear generates **draft** documents and checklists to help AI product
teams prepare for conversations with qualified legal counsel. It does **not**
provide legal advice and does **not** replace professional legal consultation.
All outputs should be reviewed by a qualified lawyer before being relied upon
for compliance decisions.
