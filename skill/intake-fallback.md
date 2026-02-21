# LaunchClear — Intake Fallback Questions

These are the questions to ask after codebase analysis has been completed. They cover facts that code analysis can **never** answer — business context, legal relationships, organizational status, and operational practices that exist outside the repository.

Questions are organized into two groups:

1. **Always-required** — Ask these every time, regardless of what signals were detected.
2. **Conditionally-triggered** — Ask these only when specific signal categories are detected in the codebase.

For each question, the regulatory relevance explanation tells Claude *why* the question matters, so Claude can explain this to the user when asking.

---

## Always-Required Questions

These questions must always be asked. The codebase cannot answer them.

### 1. Business Purpose and Context

> **What is the business purpose of this application? What problem does it solve for its users?**

**Type:** Free text

**Why this matters:** Business context determines risk classification under the EU AI Act (a scoring system could be credit scoring, hiring, insurance, or healthcare — each with vastly different regulatory treatment), applicability of sector-specific regulations (MAS guidelines, FCA guidance, SR 11-7), and the scope of required compliance artifacts. Code reveals technical capabilities, not business intent.

**What code tells you:** The application uses OpenAI's API, stores user data in Postgres, and has a scoring function.
**What code does NOT tell you:** Whether the scoring function is for credit decisions (high-risk under EU AI Act Annex III), job candidate ranking (high-risk under EU AI Act Annex III), content recommendations (limited risk), or internal analytics (minimal risk).

---

### 2. Target Markets / Jurisdictions

> **Which markets or jurisdictions are you targeting for launch?**

**Options:** EU (AI Act), EU (GDPR), US Federal, US — California, US — Colorado, US — Illinois, US — New York, US — Texas, United Kingdom, Singapore, China, Brazil

**Type:** Multi-select

**Why this matters:** Target markets determine which regulations apply. This is never present in the codebase and must always be asked. The regulatory landscape varies dramatically — a GenAI product targeting only the US has a very different compliance burden than one targeting EU + China + Singapore.

---

### 3. Human Review Processes

> **Does your application have human review processes for AI-generated outputs or decisions? If so, how are reviews conducted in practice — are they substantive (reviewer can override and has time to evaluate) or procedural (rubber-stamp)?**

**Type:** Yes/No with elaboration

**Why this matters:** Meaningful human oversight is a key requirement under the EU AI Act (Article 14), Singapore's IMDA frameworks, and US state laws like the Colorado AI Act. Code may show a review queue or approval endpoint exists, but cannot reveal whether reviews are meaningful in practice. A "rubber-stamp" review process does not satisfy regulatory requirements for human oversight.

---

## Conditionally-Triggered Questions

Ask these only when the specified signals are detected in the codebase.

### When GenAI / LLM Usage Is Detected

Triggered when: LLM SDK imports, chat/text completion calls, prompt templates, image/audio generation calls, or model identifiers are found.

#### 4. Provider vs. Deployer Role

> **What is your role in the AI model supply chain? Are you the foundation model provider, a deployer using a third-party model via API, or both (e.g., you fine-tune and redistribute)?**

**Options:** Model provider (trained/host the model) | Deployer (use third-party model via API) | Both (fine-tune and serve)

**Type:** Single-select

**Why this matters:** The provider vs. deployer distinction drives fundamentally different obligations under the EU AI Act (GPAI Articles 51-56), China's CAC GenAI measures, and the UK framework. Providers have documentation, transparency, and copyright compliance obligations. Deployers have usage-based obligations. The distinction is a legal relationship, not visible in code — an API call to OpenAI could be either deployment or part of a provider pipeline.

#### 5. Content Disclosure Practices

> **How do you disclose to users that content is AI-generated? Do your disclosure practices meet the specific requirements of your target jurisdictions?**

**Type:** Yes/No with elaboration

**Why this matters:** Almost every jurisdiction now requires AI-generated content disclosure, but the specific requirements vary:
- **China** — Mandatory labeling of all AI-generated content (CAC GenAI Measures)
- **EU** — AI Act Article 50 requires disclosure when content is AI-generated
- **California** — SB 942 requires specific disclosure format for GenAI outputs
- **Singapore** — IMDA GenAI governance framework recommends content provenance

Code may show watermarking libraries or metadata headers exist, but not whether the implementation meets jurisdiction-specific format and placement requirements.

#### 6. Training Data Provenance and Rights

> **What is the provenance of your training data? Do you have copyright licenses for copyrighted material? Are there opt-out mechanisms for data subjects? Was consent obtained for personal data in training sets?**

**Type:** Free text

**Why this matters:**
- **EU AI Act** Article 53(1)(c) requires copyright compliance summaries for GPAI models
- **China** CAC measures require training data legality verification
- **Brazil** AI Bill requires training data disclosure
- **UK** ICO guidance requires lawful basis for personal data in training

Code shows data loading scripts, fine-tuning configurations, and dataset references, but not whether rights have been secured, consent was obtained, or opt-out mechanisms are offered to data subjects.

---

### When Agentic Capabilities Are Detected

Triggered when: Tool/function definitions for LLMs, agent framework imports, action execution functions, or multi-step execution loops are found.

#### 7. Human Checkpoint Practices

> **How do human checkpoints work in practice for your AI agent? When the agent reaches a checkpoint, what happens? Can the human reviewer meaningfully evaluate and override the agent's proposed action?**

**Type:** Free text

**Why this matters:** Singapore's IMDA Agentic AI Framework (January 2026 — the world's first dedicated agentic AI governance framework) requires "meaningful human accountability" — not just technical approval gates but substantive oversight. The EU AI Act human oversight requirements (Article 14) also depend on actual operational practices. Code shows approval functions exist but not whether they represent genuine oversight or automated rubber-stamps.

#### 8. Autonomy Boundaries in Production

> **What are the actual autonomy boundaries for your AI agent in production? Are there actions it can take in development/testing that are restricted in production? What is the maximum impact of an unsupervised action?**

**Type:** Free text

**Why this matters:** Risk bounding — limiting autonomy, tool access, and data access — is the first dimension of Singapore's IMDA Agentic AI Framework. The EU AI Act human oversight requirements (Article 14) also depend on actual production autonomy, not development-time capabilities. Code shows what tools and APIs an agent *can* call, but not what it's *allowed* to call in production or what the real-world consequences are.

---

### When Financial Services Signals Are Detected

Triggered when: Payment SDK imports, credit scoring logic, insurance rating engines, AML/KYC services, trading APIs, or lending decision functions are found.

#### 9. Financial Regulatory Status

> **What is your organization's financial sector regulatory status? Which financial regulators supervise your operations (e.g., MAS, FCA, OCC, BaFin, SEC)?**

**Type:** Free text

**Why this matters:** Regulated financial institutions face additional AI obligations from their financial supervisors beyond general AI regulations:
- **Singapore** — MAS Guidelines on AI Risk Management apply specifically to MAS-supervised financial institutions
- **UK** — FCA guidance applies to FCA-authorized firms; PRA has separate expectations
- **US** — OCC/Fed SR 11-7 model risk management applies to banking organizations
- **EU** — EBA, ESMA, EIOPA supervisory expectations layer on top of AI Act

Code shows payment and credit APIs but not whether the organization is a licensed financial institution or which regulators supervise it.

#### 10. Model Risk Governance

> **Do you have existing model risk governance in place? Have you conducted a model risk materiality assessment (required by MAS for Singapore)? Do you follow SR 11-7 model risk management practices (required for US banking)?**

**Type:** Yes/No with elaboration

**Why this matters:**
- **Singapore** MAS AI Risk Management Guidelines require a materiality assessment for all AI use cases, proportionate governance structures, and lifecycle controls
- **US** OCC/Fed SR 11-7 requires comprehensive model risk management including independent validation for AI models used in banking
- **EU** AI Act high-risk requirements (Articles 8-15) include quality management systems

These are organizational governance facts not present in code.

#### 11. Consumer Impact

> **Do your AI decisions directly affect consumers' access to credit, insurance, housing, or employment? Can an AI decision result in denial of service to a consumer?**

**Type:** Yes/No with elaboration

**Why this matters:**
- **EU** — AI credit scoring and insurance pricing are classified as HIGH-RISK under AI Act Annex III section 5, triggering full conformity assessment, human oversight, bias testing, and documentation
- **US** — CFPB enforces fair lending laws (ECOA/Regulation B) against AI discrimination in credit decisions; adverse action notices are required
- **Singapore** — MAS expects fairness and explainability for customer-facing AI decisions

The impact on consumers is a business-context question — code shows a scoring function, but not whether its output directly determines a consumer's access to a financial service.

---

### When GenAI Is Detected AND China May Be a Target

Triggered when: GenAI signals are detected in the codebase. Present this question after the user selects target markets, and only if China is among them.

#### 12. China Algorithm Filing Status

> **Has your algorithm been filed with China's Cyberspace Administration (CAC)? What is the current filing/approval status?**

**Options:** Not filed | Filed, pending approval | Filed and approved | Not applicable

**Type:** Single-select

**Why this matters:** China's CAC Interim Measures for GenAI Services require algorithm filing for all GenAI services offered within China. This is an organizational/administrative status that is never present in the codebase. Non-compliance can result in service being blocked or penalized.

---

## Question Presentation Guidelines

When asking these questions, follow these rules:

1. **Explain the regulatory relevance** — Don't just ask the question. Briefly explain *why* it matters. Example: "Which markets are you targeting? This determines which regulations apply — the EU AI Act, China's CAC GenAI measures, and Singapore's IMDA framework each have different requirements."

2. **Reference code findings** — Connect the question to what you found. Example: "I detected OpenAI API calls and Pinecone integration in your codebase. What is your role in the model supply chain — are you the model provider, a deployer using OpenAI via API, or both?"

3. **Group related questions** — Don't ask 12 questions one at a time. Group them logically:
   - Core context (questions 1-3) as a first batch
   - GenAI-specific (questions 4-6) as a second batch if applicable
   - Agentic-specific (questions 7-8) if applicable
   - Financial-specific (questions 9-11) if applicable
   - Jurisdiction-specific (question 12) after markets are selected

4. **Don't ask what you already know** — If the codebase clearly shows LLM usage with OpenAI, don't ask "Do you use generative AI?" Instead ask the questions that code *can't* answer (provider role, disclosure practices, training data rights).

5. **Typical question counts by scenario:**
   - Simple web app with some personal data: 3 questions (always-required only)
   - GenAI product: 6 questions (always-required + GenAI-triggered)
   - Agentic AI product: 5-8 questions (always-required + GenAI + agentic)
   - Financial services AI: 6-11 questions (always-required + financial + possibly GenAI)
   - GenAI product targeting China: 7 questions (always-required + GenAI + China-specific)
