# LaunchClear

Compliance artifact and action generator for AI product teams.

Describe your AI product feature. Pick your target markets.
Get the compliance documents you need to file and the actions you need to take.

## The Problem

You're shipping an AI feature. Legal says you need a DPIA. Product asks which
markets are safe to launch in. Your PM Googles "EU AI Act requirements" and
gets 50 pages of legalese.

LaunchClear turns that into a structured workflow:

1. Answer questions about your AI product (what it does, what data it uses,
   who it affects)
2. Select your target markets (EU, US, UK, Singapore, China, Brazil, ...)
3. Get back:
   - **Risk classifications** per jurisdiction
   - **Draft compliance artifacts** (DPIAs, risk assessments, model cards,
     transparency notices)
   - **Prioritized action plans** with specific steps, deadlines, and
     verification criteria

The output is structured, citable, and designed to hand to your legal team
for review.

## Quick Start

```bash
npm install -g launchclear

# Interactive mode — guided intake interview
launchclear

# Quick mode — one-liner
launchclear check "AI-powered resume screening that auto-rejects bottom 50%" \
  --markets eu,gdpr,us
```

### Requirements

- Node.js 20+
- (Optional) An LLM API key for artifact generation:
  `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or a local Ollama instance

Without an API key, LaunchClear still runs the full deterministic analysis
(risk classification, requirement mapping, action plans). The LLM is only
used to fill in artifact templates with product-specific language.

## What You Get

### Risk Classification

LaunchClear maps your product characteristics to risk tiers under each
jurisdiction's framework. An AI resume screener targeting the EU gets
classified as **high-risk under EU AI Act Annex III** (employment category)
before you even finish the interview.

### Compliance Artifacts (with LLM)

Draft documents generated from jurisdiction-specific templates:

| Artifact | When Generated |
|---|---|
| Data Protection Impact Assessment (DPIA) | GDPR — automated decisions, sensitive data, large-scale processing |
| AI Act Risk Assessment | EU AI Act — high-risk classification |
| Conformity Assessment Outline | EU AI Act — high-risk systems |
| Model Card | EU AI Act — transparency obligations |
| Transparency Notice | GDPR Art. 13-14, EU AI Act Art. 50 |
| GPAI Technical Documentation | EU AI Act — GPAI model providers (Art. 53) |
| GenAI Content Policy | Cross-jurisdictional — AI-generated content labeling |

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

## Supported Jurisdictions

| Jurisdiction | Status | Coverage |
|---|---|---|
| **EU AI Act** | Implemented | Risk classification (all tiers), Annex III high-risk categories, prohibited practices, GPAI/systemic risk, transparency obligations, compliance timelines |
| **EU GDPR** | Implemented | Legal basis assessment, DPIA triggers, Article 22 automated decisions, data subject rights, cross-border transfers, training data processing |
| **US Federal** | Implemented | FTC enforcement framework, NIST AI RMF, NIST GenAI profile, FTC GenAI guidance, federal financial AI (SR 11-7) |
| US States | Planned | California (CCPA/CPRA, SB 942), Colorado AI Act, Illinois (BIPA), NYC LL144, Texas TRAIGA |
| UK | Planned | ICO AI guidance, AISI frontier models, DSIT foundation model principles, FCA AI guidance |
| Singapore | Planned | PDPC AI governance, IMDA GenAI guidelines, IMDA Agentic AI framework, MAS AI risk management |
| China | Planned | CAC GenAI measures, algorithm filing, deep synthesis regulations |
| Brazil | Planned | LGPD, AI Bill GenAI/foundation model provisions |

## How It Works

LaunchClear is **not** a wrapper around an LLM prompt. The compliance logic is
deterministic:

```
Product description + data practices + target markets
        ↓
   Intake interview (conditional questions based on your answers)
        ↓
   ProductContext (structured representation of your product)
        ↓
   Jurisdiction modules (deterministic requirement mapping)
        ↓
   Risk classifications + applicable provisions + required artifacts + action items
        ↓
   (Optional) LLM fills artifact templates with product-specific details
        ↓
   Compliance report (Markdown + JSON)
```

The jurisdiction modules encode the legal logic — which provisions apply to
which product types, which risk tier applies given your data practices and
use case, which artifacts are legally required vs. recommended. The LLM's
job is limited to filling in templates. This makes the output reproducible
and auditable.

### Knowledge Base

The regulatory knowledge base in `knowledge/` is the core asset:

- **Provisions** — structured legal provisions per jurisdiction, tagged by
  topic, with article references
- **Templates** — compliance document templates with required sections per
  jurisdiction
- **Questions** — intake question bank organized by topic (core, data
  practices, automated decisions, GenAI, agentic AI, financial services, GPAI)

All legal content references specific articles and sections. Every claim
in the output is traceable to a provision in the knowledge base.

## CLI Commands

```bash
# Interactive intake interview (default)
launchclear

# Quick check from description
launchclear check "your AI product description" --markets eu,gdpr,us

# Options
  -m, --markets <markets>   Comma-separated target markets (eu, gdpr, us, uk, sg, cn, br)
  -o, --output <dir>        Output directory (default: ./launchclear-report)
  -f, --format <format>     Output format: markdown, json, both (default: both)
  -p, --provider <name>     LLM provider: anthropic, openai, ollama

# List supported jurisdictions
launchclear jurisdictions

# List available artifact templates
launchclear artifacts
```

### Market Aliases

Use shorthand in `--markets`:

| Alias | Jurisdiction |
|---|---|
| `eu` | EU AI Act |
| `gdpr` | EU GDPR |
| `us` | US Federal (FTC, NIST) |
| `uk` | UK |
| `sg` | Singapore |
| `cn` | China |
| `br` | Brazil |

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

## Development

```bash
git clone https://github.com/<your-org>/launchclear.git
cd launchclear
npm install

# Run in development
npm run dev

# Run tests (342 tests across 8 test suites)
npm test

# Typecheck
npm run typecheck

# Lint
npm run lint
```

### Project Structure

```
src/
  core/           TypeScript types and Zod schemas
  intake/         Intake interview system (question routing, context building)
  jurisdictions/  Jurisdiction modules (EU AI Act, GDPR, US Federal)
  artifacts/      Compliance artifact generation (template loading + LLM filling)
  actions/        Action plan generation and prioritization
  providers/      LLM provider adapters (Anthropic, OpenAI, Ollama)
  output/         Report formatters (Markdown, JSON)
  cli/            CLI entry point and interactive interview

knowledge/
  provisions/     Structured legal provisions per jurisdiction
  templates/      Compliance document templates
  questions/      Intake question bank (JSON)
```

### Tech Stack

- TypeScript 5 (strict mode, no `any`)
- Zod for all input/output validation
- Commander.js + Inquirer.js for the CLI
- Vitest for testing
- Biome for linting and formatting

## Disclaimer

LaunchClear generates **draft** documents and checklists to help AI product
teams prepare for conversations with qualified legal counsel. It does not
provide legal advice and does not replace professional legal consultation.
All outputs should be reviewed by a qualified lawyer before being relied
upon for compliance decisions.

## License

Code is [MIT](LICENSE). The regulatory knowledge base (`knowledge/`) is
[CC BY-SA 4.0](knowledge/LICENSE) — use it, adapt it, but attribute
contributors and keep derivatives open.

See [knowledge/MAINTAINERS.md](knowledge/MAINTAINERS.md) for contributing
firms and individuals per jurisdiction.
