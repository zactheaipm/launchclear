import type { ConfidenceLevel, SignalCategory } from "../core/types.js";

// ─── Signal Pattern Definition ──────────────────────────────────────────────

export interface SignalPatternDef {
	readonly id: string;
	readonly category: SignalCategory;
	readonly description: string;
	readonly pattern: RegExp;
	readonly confidence: ConfidenceLevel;
	/** Only apply this pattern to files matching these globs */
	readonly fileExtensions?: readonly string[];
}

// ─── Data Collection Patterns ───────────────────────────────────────────────

export const dataCollectionPatterns: readonly SignalPatternDef[] = [
	// Express / Fastify / Hono route handlers with body parsing
	{
		id: "dc-express-body",
		category: "data-collection",
		description: "Express/Fastify/Hono request body parsing",
		pattern: /req(?:uest)?\.body\b/,
		confidence: "high",
	},
	{
		id: "dc-form-data",
		category: "data-collection",
		description: "Form data / multipart handling",
		pattern: /(?:formData|FormData|multer|multipart|busboy)/,
		confidence: "high",
	},
	// GraphQL input types / mutations
	{
		id: "dc-graphql-input",
		category: "data-collection",
		description: "GraphQL input type definition",
		pattern: /input\s+\w+Input\s*\{/,
		confidence: "high",
		fileExtensions: [".graphql", ".gql", ".ts", ".js"],
	},
	{
		id: "dc-graphql-mutation",
		category: "data-collection",
		description: "GraphQL mutation definition",
		pattern: /(?:type\s+Mutation|mutation\s+\w+)/,
		confidence: "medium",
	},
	// React form components
	{
		id: "dc-react-form",
		category: "data-collection",
		description: "React form with onChange handlers",
		pattern: /(?:<form|<Form|useForm|onSubmit|handleSubmit)\b/,
		confidence: "medium",
		fileExtensions: [".tsx", ".jsx", ".ts", ".js"],
	},
	// API request validation schemas (Zod, Joi, Yup)
	{
		id: "dc-zod-schema",
		category: "data-collection",
		description: "Zod input validation schema",
		pattern: /z\.object\(\{[\s\S]*?\}\)/,
		confidence: "medium",
	},
	{
		id: "dc-joi-schema",
		category: "data-collection",
		description: "Joi input validation schema",
		pattern: /Joi\.object\(\{/,
		confidence: "medium",
	},
	{
		id: "dc-yup-schema",
		category: "data-collection",
		description: "Yup input validation schema",
		pattern: /yup\.object\(\{/,
		confidence: "medium",
	},
	// REST API POST/PUT/PATCH endpoints
	{
		id: "dc-rest-write",
		category: "data-collection",
		description: "REST API write endpoint",
		pattern: /\.(post|put|patch)\s*\(\s*['"`]/,
		confidence: "medium",
	},
];

// ─── Data Storage Patterns ──────────────────────────────────────────────────

export const dataStoragePatterns: readonly SignalPatternDef[] = [
	// Prisma schema model definitions
	{
		id: "ds-prisma-model",
		category: "data-storage",
		description: "Prisma database model definition",
		pattern: /model\s+\w+\s*\{/,
		confidence: "high",
		fileExtensions: [".prisma"],
	},
	// Drizzle table definitions
	{
		id: "ds-drizzle-table",
		category: "data-storage",
		description: "Drizzle ORM table definition",
		pattern: /(?:pgTable|mysqlTable|sqliteTable)\s*\(\s*['"`]\w+['"`]/,
		confidence: "high",
	},
	// TypeORM entity decorators
	{
		id: "ds-typeorm-entity",
		category: "data-storage",
		description: "TypeORM entity definition",
		pattern: /@Entity\(\)/,
		confidence: "high",
	},
	// Sequelize model definitions
	{
		id: "ds-sequelize-model",
		category: "data-storage",
		description: "Sequelize model definition",
		pattern: /(?:sequelize\.define|Model\.init)\s*\(/,
		confidence: "high",
	},
	// Mongoose schema definitions
	{
		id: "ds-mongoose-schema",
		category: "data-storage",
		description: "Mongoose schema definition",
		pattern: /new\s+(?:mongoose\.)?Schema\s*\(\s*\{/,
		confidence: "high",
	},
	// Migration files
	{
		id: "ds-migration",
		category: "data-storage",
		description: "Database migration file",
		pattern: /(?:createTable|addColumn|CREATE\s+TABLE|ALTER\s+TABLE)/i,
		confidence: "high",
	},
	// Knex table builder
	{
		id: "ds-knex-table",
		category: "data-storage",
		description: "Knex.js table definition",
		pattern: /knex\.schema\.(?:createTable|alterTable)\s*\(/,
		confidence: "high",
	},
];

// ─── PII Detection Patterns ────────────────────────────────────────────────

export const piiPatterns: readonly SignalPatternDef[] = [
	{
		id: "pii-email",
		category: "pii",
		description: "Email field detected",
		pattern: /(?:^|[\s{,.(])(?:email|emailAddress|email_address|userEmail|user_email)\b/i,
		confidence: "high",
	},
	{
		id: "pii-phone",
		category: "pii",
		description: "Phone number field detected",
		pattern:
			/(?:^|[\s{,.(])(?:phone|phoneNumber|phone_number|mobileNumber|mobile_number|telephone)\b/i,
		confidence: "high",
	},
	{
		id: "pii-ssn",
		category: "pii",
		description: "Social Security Number field detected",
		pattern:
			/(?:^|[\s{,.(])(?:ssn|socialSecurity|social_security|socialSecurityNumber|social_security_number)\b/i,
		confidence: "high",
	},
	{
		id: "pii-dob",
		category: "pii",
		description: "Date of birth field detected",
		pattern: /(?:^|[\s{,.(])(?:dateOfBirth|date_of_birth|dob|birthDate|birth_date|birthday)\b/i,
		confidence: "high",
	},
	{
		id: "pii-address",
		category: "pii",
		description: "Physical address field detected",
		pattern:
			/(?:^|[\s{,.(])(?:streetAddress|street_address|homeAddress|home_address|mailingAddress|mailing_address|postalCode|postal_code|zipCode|zip_code)\b/i,
		confidence: "high",
	},
	{
		id: "pii-ip",
		category: "pii",
		description: "IP address field detected",
		pattern: /(?:^|[\s{,.(])(?:ipAddress|ip_address|clientIp|client_ip|userIp|user_ip)\b/i,
		confidence: "high",
	},
	{
		id: "pii-device-id",
		category: "pii",
		description: "Device identifier field detected",
		pattern: /(?:^|[\s{,.(])(?:deviceId|device_id|deviceIdentifier|device_identifier|udid|imei)\b/i,
		confidence: "high",
	},
	{
		id: "pii-biometric",
		category: "pii",
		description: "Biometric data field detected",
		pattern:
			/(?:^|[\s{,.(])(?:biometric|fingerprint|faceId|face_id|faceData|face_data|voicePrint|voice_print|retina|iris)\b/i,
		confidence: "high",
	},
	{
		id: "pii-location",
		category: "pii",
		description: "Geolocation data field detected",
		pattern:
			/(?:^|[\s{,.(])(?:geolocation|latitude|longitude|gpsCoordinates|gps_coordinates|userLocation|user_location)\b/i,
		confidence: "high",
	},
	{
		id: "pii-name",
		category: "pii",
		description: "Personal name field detected",
		pattern:
			/(?:^|[\s{,.(])(?:firstName|first_name|lastName|last_name|fullName|full_name|legalName|legal_name)\b/i,
		confidence: "medium",
	},
	{
		id: "pii-passport",
		category: "pii",
		description: "Passport / national ID field detected",
		pattern:
			/(?:^|[\s{,.(])(?:passport|passportNumber|passport_number|nationalId|national_id|driverLicense|driver_license)\b/i,
		confidence: "high",
	},
	{
		id: "pii-encryption",
		category: "pii",
		description: "Encryption/hashing applied to field (indicates sensitivity)",
		pattern: /(?:encrypt|hash|bcrypt|argon2|scrypt|pbkdf2)\s*\(/i,
		confidence: "medium",
	},
	{
		id: "pii-gdpr-term",
		category: "pii",
		description: "GDPR-suggestive terminology",
		pattern:
			/(?:dataSubject|data_subject|legitimateInterest|legitimate_interest|dataController|data_controller|dataProcessor|data_processor)\b/i,
		confidence: "medium",
	},
];

// ─── Third-Party Sharing Patterns ───────────────────────────────────────────

export const thirdPartyPatterns: readonly SignalPatternDef[] = [
	// Analytics SDKs
	{
		id: "tp-segment",
		category: "third-party",
		description: "Segment analytics SDK",
		pattern:
			/(?:@segment\/analytics|analytics-node|analytics\.track|analytics\.identify|analytics\.page)/,
		confidence: "high",
	},
	{
		id: "tp-mixpanel",
		category: "third-party",
		description: "Mixpanel analytics SDK",
		pattern: /(?:mixpanel|Mixpanel|mixpanel\.track|mixpanel\.people)/,
		confidence: "high",
	},
	{
		id: "tp-google-analytics",
		category: "third-party",
		description: "Google Analytics SDK",
		pattern: /(?:google-analytics|gtag|GoogleAnalytics|ga\s*\(\s*['"]send|@google-analytics)/,
		confidence: "high",
	},
	{
		id: "tp-amplitude",
		category: "third-party",
		description: "Amplitude analytics SDK",
		pattern: /(?:@amplitude\/analytics|amplitude\.track|amplitude\.logEvent)/,
		confidence: "high",
	},
	// Advertising SDKs
	{
		id: "tp-facebook-pixel",
		category: "third-party",
		description: "Facebook/Meta pixel SDK",
		pattern: /(?:facebook-pixel|fbq\s*\(|Meta\s*Pixel|fb-pixel)/,
		confidence: "high",
	},
	{
		id: "tp-google-ads",
		category: "third-party",
		description: "Google Ads SDK",
		pattern: /(?:google-ads|googleads|adwords|gads|gtag.*conversion)/,
		confidence: "high",
	},
	// External API calls
	{
		id: "tp-webhook",
		category: "third-party",
		description: "Webhook configuration sending data externally",
		pattern: /(?:webhook|webhookUrl|webhook_url|WEBHOOK_URL)\b/i,
		confidence: "medium",
	},
	// Cloud AI API calls (data sent to providers)
	{
		id: "tp-openai-api",
		category: "third-party",
		description: "OpenAI API (data sent to OpenAI)",
		pattern: /(?:from\s+['"]openai['"]|require\s*\(\s*['"]openai['"]|new\s+OpenAI\b|openai\.)/,
		confidence: "high",
	},
	{
		id: "tp-anthropic-api",
		category: "third-party",
		description: "Anthropic API (data sent to Anthropic)",
		pattern: /(?:@anthropic-ai\/sdk|from\s+['"]@anthropic-ai|new\s+Anthropic\b)/,
		confidence: "high",
	},
	{
		id: "tp-google-ai-api",
		category: "third-party",
		description: "Google AI API (data sent to Google)",
		pattern: /(?:@google\/generative-ai|GoogleGenerativeAI|google-generativeai)/,
		confidence: "high",
	},
	// Sentry / error tracking
	{
		id: "tp-sentry",
		category: "third-party",
		description: "Sentry error tracking (sends error data externally)",
		pattern: /(?:@sentry\/node|@sentry\/browser|Sentry\.init|Sentry\.captureException)/,
		confidence: "high",
	},
	// Intercom, Zendesk, etc.
	{
		id: "tp-intercom",
		category: "third-party",
		description: "Intercom customer data sharing",
		pattern: /(?:intercom|Intercom\.boot|intercomSettings)/,
		confidence: "high",
	},
];

// ─── Automated Decision Patterns ────────────────────────────────────────────

export const automatedDecisionPatterns: readonly SignalPatternDef[] = [
	{
		id: "ad-model-predict",
		category: "automated-decision",
		description: "ML model prediction/inference call",
		pattern: /(?:model\.predict|model\.infer|\.predict\(|\.inference\(|runInference)\b/,
		confidence: "high",
	},
	{
		id: "ad-threshold",
		category: "automated-decision",
		description: "Threshold comparison triggering action",
		pattern:
			/(?:score|confidence|probability|risk)\s*(?:>=?|<=?|===?|!==?)\s*(?:\d|threshold|THRESHOLD)/,
		confidence: "medium",
	},
	{
		id: "ad-scoring",
		category: "automated-decision",
		description: "Scoring/ranking function",
		pattern: /(?:calculateScore|computeScore|riskScore|creditScore|rankCandidates|sortByScore)\b/,
		confidence: "medium",
	},
	{
		id: "ad-accept-reject",
		category: "automated-decision",
		description: "Accept/reject endpoint or response",
		pattern: /(?:approved|rejected|denied|accepted|flagged|blocked)\s*[:=]/i,
		confidence: "medium",
	},
	{
		id: "ad-classification",
		category: "automated-decision",
		description: "Classification/categorization logic",
		pattern: /(?:classify|categorize|labelAs|assignCategory|determineRisk)\s*\(/,
		confidence: "medium",
	},
];

// ─── User Auth Patterns ────────────────────────────────────────────────────

export const userAuthPatterns: readonly SignalPatternDef[] = [
	{
		id: "ua-passport-js",
		category: "user-auth",
		description: "Passport.js authentication middleware",
		pattern: /(?:passport\.use|passport\.authenticate|passport\.initialize)/,
		confidence: "high",
	},
	{
		id: "ua-nextauth",
		category: "user-auth",
		description: "NextAuth.js authentication",
		pattern: /(?:next-auth|NextAuth|getServerSession|getSession)/,
		confidence: "high",
	},
	{
		id: "ua-oauth",
		category: "user-auth",
		description: "OAuth configuration",
		pattern: /(?:OAuth2Client|oauth2|OAuthProvider|clientId.*clientSecret|OAUTH_)/i,
		confidence: "high",
	},
	{
		id: "ua-jwt",
		category: "user-auth",
		description: "JWT token authentication",
		pattern: /(?:jsonwebtoken|jwt\.sign|jwt\.verify|JWT_SECRET|JwtModule)/,
		confidence: "high",
	},
	{
		id: "ua-session",
		category: "user-auth",
		description: "Session-based authentication",
		pattern: /(?:express-session|cookie-session|session\.userId|req\.session)/,
		confidence: "medium",
	},
	{
		id: "ua-age-verify",
		category: "user-auth",
		description: "Age verification mechanism",
		pattern:
			/(?:ageVerif|age_verif|minimumAge|minimum_age|isMinor|is_minor|ageGate|age_gate|COPPA|coppa)\b/i,
		confidence: "medium",
	},
	{
		id: "ua-auth0",
		category: "user-auth",
		description: "Auth0 authentication service",
		pattern: /(?:@auth0|auth0-js|Auth0Client|AUTH0_)/,
		confidence: "high",
	},
	{
		id: "ua-clerk",
		category: "user-auth",
		description: "Clerk authentication service",
		pattern: /(?:@clerk\/|ClerkProvider|useAuth|currentUser)/,
		confidence: "high",
	},
	{
		id: "ua-consent",
		category: "consent",
		description: "Consent collection mechanism",
		pattern:
			/(?:userConsent|user_consent|consentGiven|consent_given|acceptTerms|accept_terms|cookieConsent|cookie_consent|gdprConsent|gdpr_consent)\b/i,
		confidence: "medium",
	},
];

// ─── Training Data Patterns ────────────────────────────────────────────────

export const trainingDataPatterns: readonly SignalPatternDef[] = [
	{
		id: "td-dataset-loading",
		category: "training-data",
		description: "Dataset loading/import",
		pattern: /(?:load_dataset|loadDataset|datasets\.load|from_pretrained|read_csv|pd\.read_)/,
		confidence: "medium",
	},
	{
		id: "td-huggingface",
		category: "training-data",
		description: "HuggingFace dataset/model reference",
		pattern: /(?:huggingface|HuggingFace|transformers|@huggingface|hf_hub|huggingface\.co)/,
		confidence: "high",
	},
	{
		id: "td-finetuning",
		category: "training-data",
		description: "Fine-tuning / training code",
		pattern:
			/(?:fine.?tun|LoRA|peft|PEFT|trainer\.train|training_args|TrainingArguments|finetune)/i,
		confidence: "high",
	},
	{
		id: "td-training-loop",
		category: "training-data",
		description: "Training loop pattern",
		pattern: /(?:train_epoch|training_step|backward\(\)|optimizer\.step|loss\.backward)/,
		confidence: "high",
	},
	{
		id: "td-data-pipeline",
		category: "training-data",
		description: "Data pipeline / preprocessing",
		pattern: /(?:DataLoader|data_loader|DataPipeline|preprocessing|tokenize|tokenizer)/,
		confidence: "medium",
	},
];

// ─── GenAI / Foundation Model Patterns ─────────────────────────────────────

export const genAiPatterns: readonly SignalPatternDef[] = [
	// LLM SDK imports
	{
		id: "genai-openai-sdk",
		category: "genai",
		description: "OpenAI SDK import",
		pattern:
			/(?:from\s+['"]openai['"]|require\s*\(\s*['"]openai['"]|import\s+.*\s+from\s+['"]openai['"])/,
		confidence: "high",
	},
	{
		id: "genai-anthropic-sdk",
		category: "genai",
		description: "Anthropic SDK import",
		pattern: /(?:@anthropic-ai\/sdk|from\s+['"]@anthropic-ai)/,
		confidence: "high",
	},
	{
		id: "genai-google-sdk",
		category: "genai",
		description: "Google Generative AI SDK import",
		pattern: /(?:@google\/generative-ai|GoogleGenerativeAI|google-generativeai)/,
		confidence: "high",
	},
	{
		id: "genai-cohere-sdk",
		category: "genai",
		description: "Cohere SDK import",
		pattern: /(?:from\s+['"]cohere['"]|require\s*\(\s*['"]cohere['"]|cohere-ai)/,
		confidence: "high",
	},
	{
		id: "genai-replicate-sdk",
		category: "genai",
		description: "Replicate SDK import",
		pattern: /(?:from\s+['"]replicate['"]|require\s*\(\s*['"]replicate['"])/,
		confidence: "high",
	},
	{
		id: "genai-together-sdk",
		category: "genai",
		description: "Together AI SDK import",
		pattern: /(?:together-ai|from\s+['"]together['"])/,
		confidence: "high",
	},
	// Chat completion / text generation calls
	{
		id: "genai-chat-completion",
		category: "genai",
		description: "Chat completion API call",
		pattern:
			/(?:chat\.completions\.create|createChatCompletion|messages\.create|generateContent)\b/,
		confidence: "high",
	},
	{
		id: "genai-text-completion",
		category: "genai",
		description: "Text completion API call",
		pattern: /(?:completions\.create|createCompletion|generate\(\{[\s\S]*?model)/,
		confidence: "high",
	},
	// Prompt templates
	{
		id: "genai-prompt-template",
		category: "genai",
		description: "Prompt template with system/user message structure",
		pattern:
			/(?:system\s*:\s*['"`]|role\s*:\s*['"`](?:system|user|assistant)['"`]|systemPrompt\b|system_prompt\b)/,
		confidence: "high",
	},
	// Streaming response handlers
	{
		id: "genai-streaming",
		category: "genai",
		description: "LLM streaming response handler",
		pattern:
			/(?:stream:\s*true|createStream|for\s+await\s*\(.*(?:chunk|delta|stream)|ReadableStream.*(?:chat|completion))/,
		confidence: "medium",
	},
	// Image generation
	{
		id: "genai-image-gen",
		category: "genai",
		description: "Image generation API call",
		pattern:
			/(?:images\.generate|createImage|DALL.?E|dall-e|stable.?diffusion|StableDiffusion|midjourney)/i,
		confidence: "high",
	},
	// Audio / TTS generation
	{
		id: "genai-audio-gen",
		category: "genai",
		description: "Audio/speech generation API call",
		pattern:
			/(?:audio\.speech|text.to.speech|tts|synthesize(?:Speech|Audio)|ElevenLabs|elevenlabs)/i,
		confidence: "high",
	},
	// Model identifier references
	{
		id: "genai-model-id",
		category: "genai",
		description: "Known LLM model identifier",
		pattern:
			/(?:gpt-4|gpt-3\.5|claude-3|claude-2|gemini-pro|llama-3|mixtral|command-r|text-embedding)/,
		confidence: "high",
	},
];

// ─── RAG (Retrieval-Augmented Generation) Patterns ──────────────────────────

export const ragPatterns: readonly SignalPatternDef[] = [
	{
		id: "rag-pinecone",
		category: "rag",
		description: "Pinecone vector database client",
		pattern: /(?:@pinecone-database\/pinecone|Pinecone\(|pinecone\.Index|PineconeClient)/,
		confidence: "high",
	},
	{
		id: "rag-weaviate",
		category: "rag",
		description: "Weaviate vector database client",
		pattern: /(?:weaviate-ts-client|weaviate-client|weaviate\.Client|WeaviateClient)/,
		confidence: "high",
	},
	{
		id: "rag-chromadb",
		category: "rag",
		description: "ChromaDB vector database client",
		pattern: /(?:chromadb|ChromaClient|chroma\.Client|chromadb-default-embed)/,
		confidence: "high",
	},
	{
		id: "rag-pgvector",
		category: "rag",
		description: "pgvector PostgreSQL extension",
		pattern: /(?:pgvector|pg_vector|vector\(\d+\)|CREATE\s+EXTENSION.*vector)/i,
		confidence: "high",
	},
	{
		id: "rag-qdrant",
		category: "rag",
		description: "Qdrant vector database client",
		pattern: /(?:@qdrant\/js-client|QdrantClient|qdrant-client)/,
		confidence: "high",
	},
	{
		id: "rag-milvus",
		category: "rag",
		description: "Milvus vector database client",
		pattern: /(?:@zilliz\/milvus-sdk|MilvusClient|milvus-sdk)/,
		confidence: "high",
	},
	{
		id: "rag-embedding",
		category: "rag",
		description: "Embedding generation call",
		pattern: /(?:embeddings\.create|createEmbedding|text-embedding|embed\(\{|generateEmbedding)/,
		confidence: "high",
	},
	{
		id: "rag-chunking",
		category: "rag",
		description: "Document chunking/splitting pipeline",
		pattern:
			/(?:RecursiveCharacterTextSplitter|TextSplitter|chunk(?:Size|Overlap|Document)|splitDocuments|documentLoader)/,
		confidence: "medium",
	},
];

// ─── Content Safety Patterns ────────────────────────────────────────────────

export const contentSafetyPatterns: readonly SignalPatternDef[] = [
	{
		id: "cs-openai-moderation",
		category: "content-safety",
		description: "OpenAI Moderation API call",
		pattern: /(?:moderations\.create|createModeration|openai.*moderation)/,
		confidence: "high",
	},
	{
		id: "cs-perspective-api",
		category: "content-safety",
		description: "Google Perspective API (toxicity detection)",
		pattern: /(?:perspective|Perspective|TOXICITY|SEVERE_TOXICITY|commentanalyzer)/i,
		confidence: "high",
	},
	{
		id: "cs-content-filter",
		category: "content-safety",
		description: "Content filtering / moderation logic",
		pattern:
			/(?:contentFilter|content_filter|moderateContent|moderate_content|safetyFilter|safety_filter|isContentSafe|filterOutput)\b/i,
		confidence: "medium",
	},
	{
		id: "cs-nsfw-detection",
		category: "content-safety",
		description: "NSFW / adult content detection",
		pattern:
			/(?:nsfw|NSFW|nsfwDetect|nsfw_detect|adultContent|adult_content|explicitContent|explicit_content)\b/,
		confidence: "high",
	},
	{
		id: "cs-profanity-filter",
		category: "content-safety",
		description: "Profanity filter",
		pattern:
			/(?:profanity|badWords|bad_words|profanityFilter|profanity_filter|cleanText|clean_text|censorText)\b/i,
		confidence: "medium",
	},
	{
		id: "cs-guardrails",
		category: "content-safety",
		description: "AI guardrails / safety framework",
		pattern: /(?:guardrails|NeMoGuardrails|guardrails-ai|llm-guard|rebuff)/i,
		confidence: "high",
	},
];

// ─── AI Watermarking Patterns ───────────────────────────────────────────────

export const watermarkingPatterns: readonly SignalPatternDef[] = [
	{
		id: "wm-c2pa",
		category: "watermarking",
		description: "C2PA content credentials library",
		pattern: /(?:c2pa|C2PA|content.?credential|ContentCredential|c2pa-node|c2pa-js)/i,
		confidence: "high",
	},
	{
		id: "wm-ai-metadata",
		category: "watermarking",
		description: "AI-generated content metadata header",
		pattern:
			/(?:ai.generated|AI.Generated|x-ai-generated|artificialContent|synthetic.?content|ai.?watermark)/i,
		confidence: "medium",
	},
	{
		id: "wm-provenance",
		category: "watermarking",
		description: "Content provenance tracking",
		pattern: /(?:provenance|contentProvenance|content_provenance|originVerif|digitalProvenance)\b/i,
		confidence: "medium",
	},
	{
		id: "wm-steganography",
		category: "watermarking",
		description: "Steganographic watermarking",
		pattern: /(?:steganograph|watermarkEmbed|embed.?watermark|invisible.?watermark)\b/i,
		confidence: "high",
	},
];

// ─── Agentic AI Patterns ────────────────────────────────────────────────────

export const agenticPatterns: readonly SignalPatternDef[] = [
	// Tool/function definitions
	{
		id: "ag-tool-defs",
		category: "agentic",
		description: "Tool/function definitions for LLM",
		pattern: /(?:tools\s*:\s*\[|functions\s*:\s*\[|tool_choice\b|function_call\b|tool_use\b)/,
		confidence: "high",
	},
	// Agent orchestration frameworks
	{
		id: "ag-langchain",
		category: "agentic",
		description: "LangChain agent framework",
		pattern: /(?:langchain|@langchain\/core|LangChain|AgentExecutor|createReactAgent)/,
		confidence: "high",
	},
	{
		id: "ag-llamaindex",
		category: "agentic",
		description: "LlamaIndex agent framework",
		pattern: /(?:llamaindex|LlamaIndex|llama-index|llama_index)/,
		confidence: "high",
	},
	{
		id: "ag-crewai",
		category: "agentic",
		description: "CrewAI multi-agent framework",
		pattern: /(?:crewai|CrewAI|Crew\()/,
		confidence: "high",
	},
	{
		id: "ag-autogen",
		category: "agentic",
		description: "AutoGen multi-agent framework",
		pattern: /(?:autogen|AutoGen|AssistantAgent|UserProxyAgent)/,
		confidence: "high",
	},
	{
		id: "ag-semantic-kernel",
		category: "agentic",
		description: "Semantic Kernel agent framework",
		pattern: /(?:semantic-kernel|SemanticKernel|@microsoft\/semantic-kernel)/,
		confidence: "high",
	},
	// Action execution functions
	{
		id: "ag-action-email",
		category: "agentic",
		description: "Agent action: send email",
		pattern: /(?:sendEmail|send_email|sendMail|send_mail)\s*\(/,
		confidence: "medium",
	},
	{
		id: "ag-action-payment",
		category: "agentic",
		description: "Agent action: make payment",
		pattern:
			/(?:makePayment|make_payment|processPayment|process_payment|transferFunds|transfer_funds)\s*\(/,
		confidence: "high",
	},
	{
		id: "ag-action-db",
		category: "agentic",
		description: "Agent action: modify database",
		pattern:
			/(?:updateDatabase|update_database|deleteRecord|delete_record|insertRecord|insert_record)\s*\(/,
		confidence: "medium",
	},
	{
		id: "ag-action-code-exec",
		category: "agentic",
		description: "Agent action: execute code",
		pattern:
			/(?:executeCode|execute_code|runCode|run_code|evalCode|eval_code|sandbox\.run|CodeSandbox)\b/,
		confidence: "high",
	},
	{
		id: "ag-action-browse",
		category: "agentic",
		description: "Agent action: browse web",
		pattern: /(?:browseWeb|browse_web|puppeteer|playwright|selenium|webScrape|web_scrape)\b/,
		confidence: "medium",
	},
	// Kill switch / circuit breaker
	{
		id: "ag-kill-switch",
		category: "agentic",
		description: "Kill switch / circuit breaker pattern",
		pattern:
			/(?:killSwitch|kill_switch|circuitBreaker|circuit_breaker|maxIterations|max_iterations|emergencyStop|emergency_stop)\b/i,
		confidence: "medium",
	},
	// Approval gates
	{
		id: "ag-approval-gate",
		category: "agentic",
		description: "Human approval gate before action",
		pattern:
			/(?:requireApproval|require_approval|humanApproval|human_approval|confirmAction|confirm_action|awaitConfirmation)\b/i,
		confidence: "medium",
	},
	// Multi-step execution loop
	{
		id: "ag-execution-loop",
		category: "agentic",
		description: "Multi-step agent execution loop",
		pattern: /(?:agentLoop|agent_loop|stepLoop|runAgent|executeStep|planAndExecute)\b/,
		confidence: "medium",
	},
	// Action logging
	{
		id: "ag-action-log",
		category: "agentic",
		description: "Agent action audit logging",
		pattern:
			/(?:logAction|log_action|actionLog|action_log|auditTrail|audit_trail|agentLog|agent_log)\b/i,
		confidence: "medium",
	},
];

// ─── Financial Service Patterns ─────────────────────────────────────────────

export const financialServicePatterns: readonly SignalPatternDef[] = [
	// Payment SDKs
	{
		id: "fin-stripe",
		category: "financial-services",
		description: "Stripe payment SDK",
		pattern:
			/(?:stripe|@stripe\/stripe-js|Stripe\(|stripe\.customers|stripe\.charges|stripe\.paymentIntents)/,
		confidence: "high",
	},
	{
		id: "fin-plaid",
		category: "financial-services",
		description: "Plaid financial data SDK",
		pattern: /(?:plaid|PlaidClient|plaid-node|plaid\.link)/,
		confidence: "high",
	},
	{
		id: "fin-adyen",
		category: "financial-services",
		description: "Adyen payment SDK",
		pattern: /(?:@adyen|AdyenCheckout|adyen-api)/,
		confidence: "high",
	},
	{
		id: "fin-square",
		category: "financial-services",
		description: "Square payment SDK",
		pattern: /(?:square|Square\(|@square\/web-sdk|squareup)/,
		confidence: "high",
	},
	// Credit scoring
	{
		id: "fin-credit-score",
		category: "financial-services",
		description: "Credit scoring / creditworthiness logic",
		pattern:
			/(?:creditScore|credit_score|creditWorth|credit_worth|ficoScore|fico_score|creditRating|credit_rating|creditRisk|credit_risk)\b/i,
		confidence: "high",
	},
	{
		id: "fin-credit-bureau",
		category: "financial-services",
		description: "Credit bureau API integration",
		pattern: /(?:experian|equifax|transunion|creditBureau|credit_bureau)\b/i,
		confidence: "high",
	},
	// Insurance
	{
		id: "fin-insurance-rating",
		category: "financial-services",
		description: "Insurance rating/pricing engine",
		pattern:
			/(?:insuranceRate|insurance_rate|premiumCalc|premium_calc|underwriting|actuarial|riskPricing|risk_pricing|insurancePricing|insurance_pricing)\b/i,
		confidence: "high",
	},
	// Trading
	{
		id: "fin-trading",
		category: "financial-services",
		description: "Algorithmic/AI trading",
		pattern:
			/(?:tradingApi|trading_api|orderExecution|order_execution|portfolioOptimiz|portfolio_optimiz|algoTrading|algo_trading|marketData|market_data)\b/i,
		confidence: "high",
	},
	// AML/KYC
	{
		id: "fin-aml-kyc",
		category: "financial-services",
		description: "AML/KYC compliance service",
		pattern:
			/(?:ComplyAdvantage|Onfido|Jumio|sanctionsScreen|sanctions_screen|amlCheck|aml_check|kycVerif|kyc_verif|antiMoneyLaunder|transactionMonitor|transaction_monitor)\b/i,
		confidence: "high",
	},
	// Regulatory reporting
	{
		id: "fin-regulatory-reporting",
		category: "financial-services",
		description: "Regulatory reporting endpoint",
		pattern:
			/(?:regulatoryReport|regulatory_report|complianceReport|compliance_report|auditSubmit|audit_submit|sarFiling|sar_filing)\b/i,
		confidence: "medium",
	},
	// Lending
	{
		id: "fin-lending",
		category: "financial-services",
		description: "Lending / loan processing",
		pattern:
			/(?:loanApproval|loan_approval|loanDecision|loan_decision|lendingDecision|lending_decision|mortgageRate|mortgage_rate|interestRate|interest_rate.*calc)\b/i,
		confidence: "high",
	},
];

// ─── All Patterns Combined ──────────────────────────────────────────────────

export const allPatterns: readonly SignalPatternDef[] = [
	...dataCollectionPatterns,
	...dataStoragePatterns,
	...piiPatterns,
	...thirdPartyPatterns,
	...automatedDecisionPatterns,
	...userAuthPatterns,
	...trainingDataPatterns,
	...genAiPatterns,
	...ragPatterns,
	...contentSafetyPatterns,
	...watermarkingPatterns,
	...agenticPatterns,
	...financialServicePatterns,
];

/** Get patterns for a specific signal category */
export function getPatternsForCategory(category: SignalCategory): readonly SignalPatternDef[] {
	return allPatterns.filter((p) => p.category === category);
}

/** File extensions considered relevant for codebase analysis */
export const relevantExtensions: ReadonlySet<string> = new Set([
	".ts",
	".tsx",
	".js",
	".jsx",
	".mjs",
	".cjs",
	".py",
	".graphql",
	".gql",
	".prisma",
	".sql",
	".json",
	".yaml",
	".yml",
	".toml",
	".env",
	".env.example",
]);

/** Directories to skip during codebase analysis */
export const skipDirectories: ReadonlySet<string> = new Set([
	"node_modules",
	".git",
	"dist",
	"build",
	".next",
	".nuxt",
	"coverage",
	".turbo",
	".cache",
	"__pycache__",
	".venv",
	"venv",
	".tox",
	"vendor",
]);
