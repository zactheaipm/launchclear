# LaunchClear — Claude Skill

## When To Use

Use this skill when a user:

- Asks about **AI compliance requirements** for a product or feature
- Wants to know **what regulations apply** to their AI product in specific markets
- Needs help **preparing compliance documents** (DPIAs, risk assessments, model cards, transparency notices, bias audits, content labeling policies)
- Asks "what do we need to do to launch this in [market]?"
- Wants a **compliance action plan** with prioritized steps
- Asks about EU AI Act, GDPR, CCPA, China CAC, UK AISI, Singapore PDPC/IMDA/MAS, or other AI-specific regulations

Do **not** use this skill for general legal questions unrelated to AI product compliance, or for questions about regulations that LaunchClear does not cover.

## Workflow

Follow these steps in order. Do not skip steps.

### Step 1: Check for Codebase

Determine whether you have access to the user's codebase in the current context.

- **If a codebase is available** (you can read files in a repository): proceed to Step 2 (Codebase Analysis).
- **If no codebase is available** (the user is describing their product in conversation): skip to Step 3 (Standard Intake Interview).

### Step 2: Codebase Analysis (Skill Mode)

When you have access to a codebase, analyze it before asking questions. This is the key advantage of the Skill mode — the codebase is the source of truth for most technical facts.

#### 2a. Read Key Files

Start by reading these files to understand the project structure:

1. **`package.json`** (or equivalent) — dependencies reveal SDKs, frameworks, third-party services
2. **Database schemas** — Prisma schemas, migration files, ORM model definitions
3. **API route handlers** — Express/Fastify/Hono routes, GraphQL resolvers, Next.js API routes
4. **Authentication configuration** — Auth middleware, OAuth configs, session management
5. **Environment variable files** — `.env.example` for service integrations
6. **Source directory structure** — `ls src/` to understand the application architecture

#### 2b. Look for Compliance-Relevant Signals

Scan the codebase for signals in these categories. Refer to `skill/codebase-signals.md` for the complete reference of what to look for.

| Category | What To Look For |
|---|---|
| **Data collection** | API endpoints accepting user input, form components, request body parsing |
| **Data storage & PII** | Database schemas with personal data fields (email, phone, SSN, DOB, address, biometrics) |
| **Third-party data sharing** | Analytics SDKs (Segment, Mixpanel, GA), advertising pixels, external API calls, error tracking |
| **Automated decisions** | ML model inference calls, scoring/ranking functions, threshold-based accept/reject logic |
| **User authentication** | Auth libraries (Passport, NextAuth, Auth0, Clerk), JWT, OAuth, session management |
| **Consent mechanisms** | Consent forms, cookie banners, opt-in/out toggles, GDPR consent storage |
| **Training data** | Dataset loading scripts, fine-tuning code, HuggingFace references, training loops |
| **Generative AI / LLM** | LLM SDK imports (OpenAI, Anthropic, Google AI, Cohere), chat completion calls, prompt templates, streaming handlers |
| **RAG pipelines** | Vector database clients (Pinecone, Weaviate, ChromaDB, pgvector), embedding generation, document chunking |
| **Content safety** | Moderation API calls, content filters, profanity filters, guardrails frameworks |
| **AI watermarking** | C2PA libraries, content provenance tracking, AI-generated metadata headers |
| **Agentic capabilities** | Tool/function definitions for LLMs, agent frameworks (LangChain, CrewAI, AutoGen), action execution functions, kill switches |
| **Financial services** | Payment SDKs (Stripe, Plaid), credit scoring logic, insurance rating engines, AML/KYC services, trading APIs |

#### 2c. Assign Confidence Levels

For each inference, assign a confidence level:

- **High** — Direct evidence (SDK import + API call, database schema with named PII field). Auto-fill in the product context.
- **Medium** — Indirect evidence (variable naming suggests PII, generic scoring function). Present to user for confirmation.
- **Low** — Weak signal (could be coincidental pattern match). Flag but don't auto-fill.

#### 2d. Present Inferences Transparently

**This is critical.** Always present what you found and let the user correct before proceeding.

Format your findings like this:

```
Based on your codebase, I've identified the following:

**Data Collection & Storage**
- Your Prisma schema stores user email, phone, date of birth, and IP address (high confidence)
- [file path + line reference]

**Third-Party Integrations**
- Segment analytics SDK for user tracking (high confidence)
- OpenAI API for LLM inference — user data is sent to OpenAI (high confidence)
- [file paths]

**Generative AI**
- OpenAI chat completions API with GPT-4 (high confidence)
- Retrieval-augmented generation via Pinecone vector database (high confidence)
- Content moderation via OpenAI Moderation API (high confidence)
- Streaming response handler for LLM output (medium confidence)
- [file paths]

**I could not determine from the code:**
- What is the business purpose of this application?
- Which markets are you targeting?
- [remaining questions]

Are these inferences correct? Please correct anything I got wrong before we proceed.
```

**Never silently assume.** The user must have the opportunity to correct every inference.

#### 2e. Ask Remaining Questions

After presenting inferences and getting corrections, ask only the questions that the codebase cannot answer. See `skill/intake-fallback.md` for the full list.

The questions fall into two groups:

1. **Always-required** (code can never answer these):
   - Business purpose and context
   - Target markets/jurisdictions
   - Human review process details

2. **Conditionally-triggered** (only when relevant signals are detected):
   - GenAI provider vs. deployer role (when LLM usage detected)
   - Content disclosure practices (when GenAI detected)
   - Training data provenance and rights (when training/fine-tuning detected)
   - Agentic AI oversight practices (when agentic capabilities detected)
   - Financial regulatory status (when financial services detected)
   - China algorithm filing status (when GenAI detected and China is a target market)

### Step 3: Standard Intake Interview (No Codebase)

When no codebase is available, ask the full intake interview:

1. **Core questions** (always ask):
   - What does your AI product/feature do?
   - What data does it collect/process?
   - Who are the end users?
   - Does it make or influence decisions that affect people?
   - What markets do you want to launch in?

2. **Conditional questions** (triggered by core answers):
   - Personal data → consent mechanism questions
   - Minors as users → age verification, parental consent
   - Automated decisions → human oversight, contestability
   - Biometric data → specific biometric processing questions
   - Employment context → bias audit, disparate impact
   - Health context → medical device classification
   - Generative AI / foundation model → output modalities, content filtering, watermarking, deepfake capabilities, model sourcing, training data
   - Agentic AI → autonomy level, tool access, action scope, human checkpoints, multi-agent interactions, failsafe mechanisms
   - Financial services → credit scoring, insurance pricing, trading, AML/KYC, model risk governance
   - EU selected → AI Act risk classification questions
   - EU + foundation model → GPAI role, systemic risk, open-source, copyright compliance
   - China + GenAI → CAC algorithm filing, content moderation, training data legality
   - UK + frontier model → AISI framework, DSIT principles
   - Singapore + GenAI → IMDA GenAI guidelines
   - Singapore + agentic AI → IMDA Agentic AI framework (risk bounding, human accountability, technical controls, end-user responsibility)
   - Singapore + financial services → MAS AI Risk Management Guidelines
   - Financial services + EU → AI Act Annex III section 5 high-risk classification
   - Financial services + US → SR 11-7 model risk management, CFPB fair lending

### Step 4: Build Product Context

Compile all answers (from codebase inferences + user responses) into a structured product context covering:

- Product description and type
- Data categories processed
- User populations
- Decision impact level
- Automation level
- Training data information
- Target markets
- Existing compliance measures
- Generative AI context (if applicable)
- Agentic AI context (if applicable)
- Sector context (if applicable)
- GPAI information (if EU AI Act + foundation model)

### Step 5: Load Relevant Provisions

Based on the product context and selected jurisdictions, identify which legal provisions apply. Key mappings:

| Product Characteristic | Triggered Provisions |
|---|---|
| Personal data + EU | GDPR Articles 6-7, 12-23, 35-36 |
| Automated decisions + EU | GDPR Article 22, AI Act risk classification |
| High-risk AI + EU | AI Act Articles 8-15 (full requirements) |
| Foundation model + EU | AI Act Articles 51-56 (GPAI) |
| GenAI + China | CAC GenAI measures, deep synthesis regs, algorithm filing |
| GenAI + UK | AISI frontier model framework, DSIT principles, ICO guidance |
| GenAI + Singapore | IMDA GenAI governance framework |
| Agentic AI + Singapore | IMDA Agentic AI Framework (Jan 2026) |
| Financial services + Singapore | MAS AI Risk Management Guidelines (2025) |
| Financial services + EU | AI Act Annex III section 5 (credit/insurance = high-risk) |
| Financial services + US | SR 11-7, CFPB, SEC guidance |
| Financial services + UK | FCA AI guidance |
| GenAI + US Federal | NIST AI 600-1 GenAI profile, FTC GenAI guidance |
| GenAI + US States | California SB 942, state deepfake laws |

### Step 6: Map Requirements

For each applicable jurisdiction, determine:

1. **Risk classification** — What tier does this product fall into?
2. **Required artifacts** — Which compliance documents must be created?
3. **Required actions** — What steps must the team take?
4. **Recommended actions** — Best practices beyond legal minimums
5. **Compliance timeline** — Deadlines and effective dates

### Step 7: Generate Artifacts

Produce draft compliance documents based on the applicable templates:

- **DPIA** (GDPR / UK ICO) — Data Protection Impact Assessment
- **AI Act Risk Assessment** — EU AI Act risk classification and conformity
- **Model Card** — Technical documentation of the AI system
- **Transparency Notice** — User-facing disclosure
- **Bias Audit Template** — NYC LL144 style, or general bias testing plan
- **GPAI Technical Documentation** — EU AI Act Article 53 documentation
- **GenAI Content Policy** — Cross-jurisdictional content labeling/watermarking policy
- **Training Data Disclosure** — Training data sourcing and copyright compliance
- **China Algorithm Filing** — CAC algorithm registration template
- **China GenAI Assessment** — CAC safety assessment template

Each artifact must:
- Follow the jurisdiction-specific required sections
- Include citations to specific legal provisions
- Flag sections that require legal review
- Provide review notes explaining what the legal team should verify

### Step 8: Generate Action Plan

Produce a prioritized action plan:

- **Critical** — Must complete before launch (legal blockers)
- **Important** — Should complete before launch (significant risk reduction)
- **Recommended** — Best practices (not legally required but advisable)

Each action item includes:
- Description of what to do
- Which jurisdiction requires it
- Legal basis (specific article/section)
- Best-practice implementation guidance
- Verification criteria (how to confirm it's done)

### Step 9: Output Report

Present the complete report with:

1. **Executive summary** — Per-market readiness (ready / action-required / blocked)
2. **Jurisdiction-by-jurisdiction breakdown** — Applicable laws, risk level, required artifacts, required actions
3. **Generated artifacts** — Draft compliance documents
4. **Action plan** — Prioritized steps with guidance
5. **Citations** — Every legal claim references specific provisions

## Key Instructions

### Transparency is Non-Negotiable

- Always present codebase inferences before using them
- Say "I inferred X from your code — is that correct?" not "Your product does X"
- Let the user correct any inference before it drives compliance output
- Mark each inference with its confidence level

### Every Legal Claim Must Be Citable

- Never state a regulatory requirement without citing the specific provision
- Use format: "[Regulation] Article/Section X" (e.g., "EU AI Act Article 50", "GDPR Article 35", "CAC GenAI Measures Article 4")
- If you cannot cite a specific provision, say so explicitly

### Draft Documents, Not Legal Advice

- All outputs are drafts for the user's legal team to review
- Include review notes flagging sections that need legal verification
- State clearly: "This is a draft document. Have your legal counsel review before relying on it for compliance decisions."

### Cross-Jurisdictional Awareness

- The same product characteristic triggers different requirements in different jurisdictions
- Do not apply EU AI Act GPAI provisions to non-EU jurisdictions
- China, UK, Singapore, US, and Brazil each have distinct GenAI requirements
- Always produce jurisdiction-specific outputs, not generic "AI compliance" advice

### Explain Why You Ask

- Each question should briefly state its regulatory relevance
- Example: "Which markets are you targeting? (This determines which regulations apply — the EU AI Act, China's CAC GenAI measures, and Singapore's IMDA framework each have different requirements.)"
- Never ask what the code already tells you
- Never ask what the LLM can infer from existing answers
