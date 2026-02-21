# LaunchClear — Codebase Signal Reference

This document tells you exactly what to look for when analyzing a user's codebase for compliance-relevant signals. Each section describes a signal category with specific things to search for, where to find them, and what confidence level to assign.

## Data Collection Signals

**What you're looking for:** Evidence that the application collects data from users.

**Where to look:**

- **Route handlers** — Express, Fastify, Hono, or Next.js API route files that parse request bodies (`req.body`, `request.json()`, `c.req.json()`)
- **Form components** — React/Vue/Svelte components with `<form>`, `onSubmit`, `handleSubmit`, `useForm` hooks
- **GraphQL definitions** — `input` types and `mutation` definitions that accept user data
- **Validation schemas** — Zod (`z.object()`), Joi (`Joi.object()`), or Yup (`yup.object()`) schemas defining expected input structure
- **REST write endpoints** — Route definitions using `.post()`, `.put()`, `.patch()` methods
- **Multipart/form-data** — Imports of `multer`, `busboy`, `FormData`, or multipart handling middleware

**Confidence:** High for request body parsing, form data handling, and GraphQL inputs. Medium for validation schemas and REST endpoints (they confirm data structure but not always user-facing collection).

## Data Storage Signals

**What you're looking for:** Evidence of database schemas and data persistence, especially models that store user data.

**Where to look:**

- **Prisma schemas** — `model` definitions in `.prisma` files (e.g., `model User { ... }`)
- **Drizzle ORM** — `pgTable()`, `mysqlTable()`, `sqliteTable()` calls defining table schemas
- **TypeORM** — `@Entity()` decorators on class definitions
- **Sequelize** — `sequelize.define()` or `Model.init()` calls
- **Mongoose** — `new Schema()` or `new mongoose.Schema()` definitions
- **Migration files** — SQL `CREATE TABLE`, `ALTER TABLE`, `addColumn` statements
- **Knex.js** — `knex.schema.createTable()` or `knex.schema.alterTable()` calls

**Confidence:** High for all ORM/schema definitions and migration files. These directly reveal what data the application persists.

## PII (Personally Identifiable Information) Signals

**What you're looking for:** Field names and patterns that indicate personally identifiable or sensitive data.

**Where to look — scan field names, column names, variable names, and schema properties for:**

- **Email** — `email`, `emailAddress`, `email_address`, `userEmail`
- **Phone** — `phone`, `phoneNumber`, `phone_number`, `mobileNumber`, `telephone`
- **SSN / National ID** — `ssn`, `socialSecurity`, `social_security_number`, `nationalId`, `passport`, `driverLicense`
- **Date of birth** — `dateOfBirth`, `date_of_birth`, `dob`, `birthDate`, `birthday`
- **Physical address** — `streetAddress`, `homeAddress`, `postalCode`, `zipCode`
- **IP address** — `ipAddress`, `ip_address`, `clientIp`, `userIp`
- **Device identifiers** — `deviceId`, `device_identifier`, `udid`, `imei`
- **Biometric data** — `biometric`, `fingerprint`, `faceId`, `faceData`, `voicePrint`, `retina`, `iris`
- **Geolocation** — `geolocation`, `latitude`, `longitude`, `gpsCoordinates`, `userLocation`
- **Personal names** — `firstName`, `lastName`, `fullName`, `legalName`
- **Encryption of specific fields** — `encrypt()`, `hash()`, `bcrypt()`, `argon2()` applied to specific fields indicates those fields are sensitive
- **GDPR terminology** — `dataSubject`, `data_controller`, `data_processor`, `legitimateInterest` — indicates GDPR awareness

**Confidence:** High for specific PII field names (email, SSN, biometric, DOB). Medium for personal names (common but less sensitive) and encryption patterns (indicates sensitivity without specifying what).

## Third-Party Data Sharing Signals

**What you're looking for:** Evidence that user data is sent to external services.

**Where to look:**

- **Analytics SDKs:**
  - Segment — `@segment/analytics`, `analytics-node`, `analytics.track()`, `analytics.identify()`, `analytics.page()`
  - Mixpanel — `mixpanel`, `mixpanel.track()`, `mixpanel.people`
  - Google Analytics — `gtag`, `google-analytics`, `ga('send')`
  - Amplitude — `@amplitude/analytics`, `amplitude.track()`

- **Advertising SDKs:**
  - Facebook/Meta Pixel — `facebook-pixel`, `fbq()`, `Meta Pixel`
  - Google Ads — `google-ads`, `gtag` with conversion tracking

- **Cloud AI APIs (user data sent to LLM providers):**
  - OpenAI — `import` from `openai`, `new OpenAI()`, `openai.` method calls
  - Anthropic — `@anthropic-ai/sdk`, `new Anthropic()`
  - Google AI — `@google/generative-ai`, `GoogleGenerativeAI`

- **Error tracking:** Sentry (`@sentry/node`, `Sentry.init()`, `Sentry.captureException()`)
- **Customer support tools:** Intercom (`Intercom.boot()`, `intercomSettings`)
- **Webhooks:** `webhook`, `webhookUrl`, `WEBHOOK_URL` — data sent to external endpoints

**Confidence:** High for all named SDK imports and API client instantiations. Medium for webhook configurations (may be internal).

## Automated Decision Signals

**What you're looking for:** Evidence that the application makes or influences decisions that affect people using AI/ML models.

**Where to look:**

- **ML model calls** — `model.predict()`, `model.infer()`, `.predict()`, `.inference()`, `runInference()`
- **Threshold-based decisions** — Comparisons like `if (score > threshold)`, `if (confidence >= 0.8)`, `if (risk > THRESHOLD)` that trigger actions
- **Scoring/ranking functions** — Functions named `calculateScore`, `computeScore`, `riskScore`, `creditScore`, `rankCandidates`, `sortByScore`
- **Accept/reject logic** — Variables or responses using `approved`, `rejected`, `denied`, `accepted`, `flagged`, `blocked`
- **Classification logic** — Functions named `classify()`, `categorize()`, `labelAs()`, `assignCategory()`, `determineRisk()`

**Confidence:** High for ML model prediction calls. Medium for scoring functions, threshold comparisons, and classification logic (these are strong indicators but could be non-AI logic).

## User Authentication Signals

**What you're looking for:** How users authenticate, whether age verification exists, and whether consent mechanisms are implemented.

**Where to look:**

- **Auth libraries:**
  - Passport.js — `passport.use()`, `passport.authenticate()`, `passport.initialize()`
  - NextAuth — `next-auth`, `NextAuth`, `getServerSession()`, `getSession()`
  - Auth0 — `@auth0`, `Auth0Client`, `AUTH0_`
  - Clerk — `@clerk/`, `ClerkProvider`, `useAuth()`, `currentUser()`
  - JWT — `jsonwebtoken`, `jwt.sign()`, `jwt.verify()`, `JWT_SECRET`
  - OAuth — `OAuth2Client`, `OAuthProvider`, `clientId` + `clientSecret`
  - Sessions — `express-session`, `cookie-session`, `req.session`

- **Age verification:** `ageVerif`, `minimumAge`, `isMinor`, `ageGate`, `COPPA`

- **Consent mechanisms:** `userConsent`, `consentGiven`, `acceptTerms`, `cookieConsent`, `gdprConsent`

**Confidence:** High for named auth library imports. Medium for age verification patterns (could be incomplete), consent mechanisms (code shows they exist but not whether they're sufficient).

## Training Data Signals

**What you're looking for:** Evidence that the application loads, processes, or fine-tunes on training data.

**Where to look:**

- **Dataset loading** — `load_dataset()`, `loadDataset()`, `datasets.load()`, `from_pretrained()`, `read_csv()`, `pd.read_`
- **HuggingFace** — `huggingface`, `transformers`, `@huggingface`, `hf_hub`, `huggingface.co` URLs
- **Fine-tuning** — `fine-tune`, `LoRA`, `peft`, `PEFT`, `trainer.train()`, `TrainingArguments`, `finetune`
- **Training loops** — `train_epoch`, `training_step`, `backward()`, `optimizer.step()`, `loss.backward()`
- **Data pipelines** — `DataLoader`, `DataPipeline`, `preprocessing`, `tokenize`, `tokenizer`

**Confidence:** High for fine-tuning frameworks (LoRA, PEFT, HuggingFace Trainer) and training loops. Medium for dataset loading and data pipelines (could be inference-time data loading).

## Generative AI / Foundation Model Signals

**What you're looking for:** Evidence that the application uses LLMs or other generative AI models to produce content.

**Where to look:**

- **LLM SDK imports:**
  - OpenAI — `import` from `openai`, `require('openai')`
  - Anthropic — `@anthropic-ai/sdk`, `import` from `@anthropic-ai`
  - Google AI — `@google/generative-ai`, `GoogleGenerativeAI`
  - Cohere — `import` from `cohere`, `cohere-ai`
  - Replicate — `import` from `replicate`
  - Together AI — `together-ai`, `import` from `together`

- **Chat/text completion calls:**
  - `chat.completions.create()` (OpenAI)
  - `messages.create()` (Anthropic)
  - `generateContent()` (Google)
  - `createChatCompletion()`, `completions.create()`

- **Prompt templates** — Files or string constants with `role: "system"`, `role: "user"`, `role: "assistant"` message structures. Variables named `systemPrompt`, `system_prompt`.

- **Streaming response handlers** — `stream: true` in API calls, `for await (const chunk of stream)` patterns, `ReadableStream` used with chat/completion responses

- **Image generation** — `images.generate()`, `createImage()`, `DALL-E`, `dall-e`, `stable-diffusion`, `StableDiffusion`, `midjourney`

- **Audio/speech generation** — `audio.speech`, `text-to-speech`, `tts`, `synthesizeSpeech`, `ElevenLabs`

- **Model identifiers** — String literals like `gpt-4`, `gpt-3.5`, `claude-3`, `claude-2`, `gemini-pro`, `llama-3`, `mixtral`, `command-r`, `text-embedding`

**Confidence:** High for SDK imports, API calls, model identifiers, and prompt templates. Medium for streaming handlers (could be non-LLM streaming).

## RAG (Retrieval-Augmented Generation) Signals

**What you're looking for:** Evidence that the application retrieves external data to augment LLM responses.

**Where to look:**

- **Vector database clients:**
  - Pinecone — `@pinecone-database/pinecone`, `Pinecone()`, `pinecone.Index()`
  - Weaviate — `weaviate-ts-client`, `WeaviateClient`
  - ChromaDB — `chromadb`, `ChromaClient`, `chroma.Client()`
  - pgvector — `pgvector`, `vector(1536)`, `CREATE EXTENSION vector`
  - Qdrant — `@qdrant/js-client`, `QdrantClient`
  - Milvus — `@zilliz/milvus-sdk`, `MilvusClient`

- **Embedding generation** — `embeddings.create()`, `createEmbedding()`, `text-embedding`, `generateEmbedding()`

- **Document chunking** — `RecursiveCharacterTextSplitter`, `TextSplitter`, `chunkSize`, `chunkOverlap`, `splitDocuments`, `documentLoader`

**Confidence:** High for vector database clients and embedding generation calls. Medium for document chunking (could be used outside RAG).

## Content Safety Signals

**What you're looking for:** Evidence that the application filters or moderates AI-generated output.

**Where to look:**

- **Moderation APIs:**
  - OpenAI Moderation — `moderations.create()`, `createModeration()`, `openai` + `moderation`
  - Google Perspective — `Perspective`, `TOXICITY`, `SEVERE_TOXICITY`, `commentanalyzer`

- **Content filtering logic** — Functions or variables named `contentFilter`, `moderateContent`, `safetyFilter`, `isContentSafe`, `filterOutput`

- **NSFW detection** — `nsfw`, `nsfwDetect`, `adultContent`, `explicitContent`

- **Profanity filters** — `profanity`, `badWords`, `profanityFilter`, `cleanText`, `censorText`

- **Guardrails frameworks** — `guardrails`, `NeMoGuardrails`, `guardrails-ai`, `llm-guard`, `rebuff`

**Confidence:** High for named moderation API calls and guardrails frameworks. Medium for generic content filtering functions and profanity filters.

## AI Watermarking / Content Provenance Signals

**What you're looking for:** Evidence that the application labels or watermarks AI-generated content.

**Where to look:**

- **C2PA** — `c2pa`, `C2PA`, `content-credential`, `ContentCredential`, `c2pa-node`, `c2pa-js`
- **AI metadata headers** — `ai-generated`, `AI-Generated`, `x-ai-generated`, `artificialContent`, `synthetic-content`, `ai-watermark`
- **Provenance tracking** — `provenance`, `contentProvenance`, `originVerif`, `digitalProvenance`
- **Steganographic watermarking** — `steganograph`, `watermarkEmbed`, `embed-watermark`, `invisible-watermark`

**Confidence:** High for C2PA libraries and steganographic watermarking. Medium for metadata headers and provenance tracking (may be partial implementations).

## Agentic AI Signals

**What you're looking for:** Evidence that the AI system can take autonomous actions (not just generate content).

**Where to look:**

- **Tool/function definitions for LLMs:**
  - `tools: [` or `functions: [` arrays passed to LLM API calls
  - `tool_choice`, `function_call`, `tool_use` parameters

- **Agent orchestration frameworks:**
  - LangChain — `langchain`, `@langchain/core`, `AgentExecutor`, `createReactAgent`
  - LlamaIndex — `llamaindex`, `LlamaIndex`, `llama-index`
  - CrewAI — `crewai`, `CrewAI`, `Crew()`
  - AutoGen — `autogen`, `AutoGen`, `AssistantAgent`, `UserProxyAgent`
  - Semantic Kernel — `semantic-kernel`, `@microsoft/semantic-kernel`

- **Action execution functions:**
  - Email — `sendEmail()`, `sendMail()`
  - Payments — `makePayment()`, `processPayment()`, `transferFunds()`
  - Database writes — `updateDatabase()`, `deleteRecord()`, `insertRecord()`
  - Code execution — `executeCode()`, `runCode()`, `sandbox.run()`, `CodeSandbox`
  - Web browsing — `browseWeb()`, `puppeteer`, `playwright`, `selenium`

- **Safety mechanisms:**
  - Kill switches — `killSwitch`, `circuitBreaker`, `maxIterations`, `emergencyStop`
  - Approval gates — `requireApproval`, `humanApproval`, `confirmAction`, `awaitConfirmation`
  - Execution loops — `agentLoop`, `runAgent`, `executeStep`, `planAndExecute`
  - Action logging — `logAction`, `actionLog`, `auditTrail`, `agentLog`

**Confidence:** High for tool definition arrays, agent framework imports, payment/code execution actions. Medium for email sending, database writes (could be non-agentic), kill switches, approval gates, and action logging (these are safety mechanisms, not proof of agentic behavior on their own — they corroborate it).

## Financial Services Signals

**What you're looking for:** Evidence that the application operates in a regulated financial services sector.

**Where to look:**

- **Payment SDKs:**
  - Stripe — `stripe`, `@stripe/stripe-js`, `Stripe()`, `stripe.paymentIntents`
  - Plaid — `plaid`, `PlaidClient`, `plaid-node`, `plaid.link`
  - Adyen — `@adyen`, `AdyenCheckout`
  - Square — `square`, `Square()`, `@square/web-sdk`

- **Credit scoring:**
  - Score calculations — `creditScore`, `creditWorth`, `ficoScore`, `creditRating`, `creditRisk`
  - Credit bureaus — `experian`, `equifax`, `transunion`, `creditBureau`
  - Lending — `loanApproval`, `loanDecision`, `lendingDecision`, `mortgageRate`, `interestRate` (with calculation)

- **Insurance:**
  - Rating/pricing — `insuranceRate`, `premiumCalc`, `underwriting`, `actuarial`, `riskPricing`, `insurancePricing`

- **Trading:**
  - `tradingApi`, `orderExecution`, `portfolioOptimiz`, `algoTrading`, `marketData`

- **AML/KYC:**
  - Compliance services — `ComplyAdvantage`, `Onfido`, `Jumio`
  - Screening — `sanctionsScreen`, `amlCheck`, `kycVerif`, `antiMoneyLaunder`, `transactionMonitor`

- **Regulatory reporting:**
  - `regulatoryReport`, `complianceReport`, `auditSubmit`, `sarFiling`

**Confidence:** High for payment SDK imports, credit bureau integrations, AML/KYC services, and credit scoring logic. Medium for regulatory reporting endpoints (could be internal compliance tooling).

## Signal Correlation Rules

Some signals are more meaningful when found together. Apply these correlation rules:

| Signals Found Together | Inference | Confidence Boost |
|---|---|---|
| LLM SDK + prompt templates + streaming | Active GenAI product, not just experimental | High |
| Vector DB + embedding calls + LLM SDK | RAG pipeline in use | High |
| Tool definitions + agent framework + action functions | Agentic AI system | High |
| Credit scoring + payment SDK + lending logic | Financial services AI with credit decisions | High |
| PII fields + analytics SDK | Personal data shared with third parties | High |
| Age verification + consent mechanisms | Awareness of minor/consent requirements | Medium (code exists, but may be incomplete) |
| Moderation API + content filter + guardrails | Active content safety measures | High |
| Approval gates + kill switch + action logging | Agentic AI with safety mechanisms | Medium (mechanisms exist, but operational effectiveness unknown) |

## What Codebase Analysis Cannot Tell You

Even after thorough analysis, these facts must always be asked — they are never in the code:

1. **Business purpose** — Code that scores and ranks could be hiring, credit, insurance, or healthcare. The business context determines the regulatory classification.
2. **Target markets** — No code artifact reveals launch geography.
3. **Human review quality** — Code shows review queues exist, not whether reviews are meaningful.
4. **Provider vs. deployer role** — API calls don't reveal the legal relationship with the model provider.
5. **Training data rights** — Dataset loading doesn't prove copyright licenses or consent.
6. **Organizational context** — Company size, DPO appointment, existing compliance infrastructure.
7. **China algorithm filing status** — Administrative status, not a code artifact.
8. **Agentic oversight in practice** — Approval functions don't prove meaningful human oversight.
9. **Financial regulatory status** — Payment APIs don't prove financial institution licensing.

See `skill/intake-fallback.md` for the complete list of questions that must always be asked.
