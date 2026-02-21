---
id: "china-cac-recommendation-algo"
law: "Provisions on the Management of Algorithmic Recommendations"
articles: []
effectiveDate: "March 1, 2022"
generatedBy: "claude-opus-4"
sources:
  - id: "cn-cac-recommendation-algo"
verification:
  status: "unverified"
  lastAuditDate: null
  auditor: null
  issues: []
---
# China — Recommendation Algorithm Provisions

**Authority**: Cyberspace Administration of China (CAC), Ministry of Industry
and Information Technology (MIIT), Ministry of Public Security (MPS), State
Administration for Market Regulation (SAMR)
**Legal Basis**: Provisions on the Management of Algorithmic Recommendations
in Internet Information Services (互联网信息服务算法推荐管理规定)
**Status**: Effective March 1, 2022
**Scope**: Algorithmic recommendation systems used in internet information
services within the People's Republic of China

## Overview

The Provisions on the Management of Algorithmic Recommendations in Internet
Information Services are the foundational regulation in China's algorithm
governance framework. Enacted in March 2022, they were the first dedicated
algorithm regulation in the world and established the pattern for subsequent
regulations on deep synthesis and generative AI. The Provisions regulate
any internet information service that uses algorithms to recommend content,
products, services, or information to users, including search ranking,
personalised feeds, recommendation engines, dispatching/scheduling algorithms,
and decision-making algorithms.

## Article 3 — Definitions

### Algorithmic Recommendation Technology

Technology that uses generative or synthetic, personalised push,
ranking/selection, search filtering, scheduling/decision-making, or
other algorithmic techniques to provide information to users.

### Categories of Covered Algorithms

1. **Generative or synthetic algorithms** (生成合成类): Algorithms that
   generate or synthesise content (later regulated more specifically by
   the Deep Synthesis and GenAI Measures)
2. **Personalised push algorithms** (个性化推送类): Algorithms that
   recommend content, products, or services based on user profiles,
   preferences, or behaviour
3. **Ranking and selection algorithms** (排序精选类): Algorithms that rank,
   filter, or select information for display to users, including search
   ranking
4. **Search and filtering algorithms** (检索过滤类): Algorithms that filter
   search results or information feeds
5. **Scheduling and decision-making algorithms** (调度决策类): Algorithms
   used for task allocation, resource scheduling, or automated
   decision-making (e.g., ride-hailing dispatch, delivery scheduling,
   gig worker task assignment)

## Article 6 — General Provider Obligations

Providers of algorithmic recommendation services must:

- Establish and improve algorithm mechanism review, scientific and
  technological ethics review, user registration, information release
  review, data security, personal information protection, anti-telecom
  fraud, and security assessment management systems
- Formulate and publicly disclose management rules and platform conventions
- Not use algorithmic recommendation technology for activities prohibited
  by laws and administrative regulations

## Article 8 — Transparency Requirements

### Algorithm Transparency Disclosure

Providers must inform users of:

- The fact that algorithmic recommendation technology is being used
- The basic principles and main operational mechanism of the algorithm
- The purpose and intent of the algorithmic recommendation
- How the algorithm affects the content, products, or services presented
  to the user

This disclosure must be made in a **prominent and understandable** manner
accessible to ordinary users.

## Article 9 — User Opt-Out Rights

### Right to Disable Recommendations

Providers must offer users a **convenient option** to:

- **Turn off algorithmic recommendations** entirely (opt-out)
- **Select or delete** user tags (profile labels) used for personalisation
- **Manage algorithmic recommendation preferences**, including adjusting
  the degree of personalisation

When a user opts out of algorithmic recommendations, the provider must
immediately cease providing personalised content and instead display
non-personalised content.

### Non-Discriminatory Service

Providers must not impose unreasonable conditions or degrade service quality
for users who choose to opt out of algorithmic recommendations.

## Article 13 — Prohibition on Algorithmic Price Discrimination

Providers must not use algorithmic recommendation technology to engage in
**differential pricing** (差别定价) or **discriminatory pricing** based on
user characteristics, including:

- Charging different prices for the same goods or services based on user
  profiles, transaction history, or consumption habits (commonly known as
  "big data price gouging" / 大数据杀熟)
- Offering different transaction conditions based on algorithmic profiling
  that disadvantage certain users

This prohibition is particularly significant for e-commerce platforms,
ride-hailing services, travel booking platforms, and other services that
use algorithmic pricing.

## Article 14 — Special Protections for Minors

Providers of algorithmic recommendation services must not:

- Recommend to minors content that may negatively affect their physical
  or mental health
- Use algorithms to create user profiles of minors or push information
  to minors based on their personal characteristics

Providers must develop and apply algorithmic recommendation models
specifically designed for **minors mode** (未成年人模式), including:

- **Anti-addiction features**: Time limits, usage restriction settings
- **Content filtering**: Enhanced content filtering for age-inappropriate
  material
- **Recommendation restrictions**: Limitations on personalised content
  push for minor users

## Article 15 — Worker Protection from Algorithmic Management

Providers that use scheduling or decision-making algorithms to manage
workers (e.g., gig economy platforms, delivery platforms, ride-hailing
services) must:

- Establish and improve the rules for order distribution, compensation,
  rest, and other work-related management algorithms
- Ensure algorithms do not unreasonably restrict workers' earnings or
  impose excessive working intensity
- Provide workers with transparency regarding the algorithmic rules that
  affect their work allocation, compensation, and performance evaluation
- Not use algorithmic monitoring to impose unreasonable demands on workers'
  delivery speed, response time, or other performance metrics

This provision directly addresses concerns about algorithmic management in
the gig economy and platform labour contexts.

## Article 16 — Elderly Persons

Providers must take measures to ensure that algorithmic recommendation
services are accessible to and appropriate for **elderly persons**
(老年人), including:

- Simplified interfaces and interaction modes
- Avoidance of algorithmic practices that may exploit elderly users'
  unfamiliarity with technology
- Enhanced protection against algorithmic fraud targeting elderly users

## Article 18 — Prohibited Uses

Algorithmic recommendation technology must not be used to:

- Disseminate content prohibited by laws and regulations
- Create information filter bubbles or echo chambers that distort users'
  perception of public events
- Manipulate search results, recommendation lists, or trending topics to
  unfairly promote specific content or suppress legitimate content
- Engage in unfair competition through algorithmic means
- Facilitate illegal activities including fraud, money laundering, or
  gambling

## Articles 24-26 — Algorithm Filing

### Article 24 — Filing Requirement

Providers whose algorithmic recommendation services have **public opinion
properties** (舆论属性) or **social mobilization capabilities** (社会动员
能力) must file their algorithms with the CAC within **10 working days**
of providing the service. See `cac-algorithm-registry.md` for the detailed
filing process.

### Article 25 — Filing Changes

When material changes occur to a filed algorithm, providers must update
their filing within **10 working days**.

### Article 26 — De-Registration

When an algorithmic recommendation service is discontinued, providers must
cancel their algorithm filing within **20 working days**.

## Penalties

### Article 31 — Administrative Penalties

Violations of the Provisions may result in:

- **Warning** and order to rectify within a specified deadline
- **Fine of RMB 10,000 to RMB 100,000** (approximately USD 1,400 to
  USD 14,000) for failure to rectify
- **Suspension of algorithm recommendation function** for serious
  violations
- **Fines under the Cybersecurity Law, Data Security Law, and PIPL** for
  violations that also breach those laws (penalties can be significantly
  higher)

## Practical Implications for AI Product Teams

### Products with Recommendation Features

1. **Algorithm transparency**: Implement user-facing disclosures explaining
   how the recommendation algorithm works, in plain language
2. **Opt-out mechanism**: Build a user-accessible toggle to disable
   personalised recommendations entirely, with non-personalised fallback
3. **User tag management**: Allow users to view, edit, and delete profile
   tags used for personalisation
4. **Pricing fairness**: Audit algorithmic pricing for differential pricing
   based on user profiling; implement safeguards against "big data price
   gouging"
5. **Minor protections**: Implement minors mode with anti-addiction features,
   enhanced content filtering, and restricted personalisation
6. **Worker protections**: If the algorithm manages gig workers or
   platform labour, ensure transparency in dispatch/scheduling rules and
   fair work allocation
7. **Algorithm filing**: Determine whether the service has public opinion
   properties or social mobilization capabilities; if so, file with the
   CAC before launch

### Relationship to Other Chinese AI Regulations

The Algorithm Recommendation Provisions are the foundational layer. The
Deep Synthesis Provisions (January 2023) and GenAI Interim Measures
(August 2023) build upon this framework, extending algorithm filing and
content governance to synthetic media and generative AI respectively. A
product may need to comply with multiple overlapping regulations
simultaneously.

## Citations

- Provisions on the Management of Algorithmic Recommendations in Internet
  Information Services (互联网信息服务算法推荐管理规定), Articles 1-35
- Cybersecurity Law of the People's Republic of China, Articles 12, 47
- Data Security Law of the People's Republic of China, Articles 27-32
- Personal Information Protection Law (PIPL), Articles 24 (automated
  decision-making), 31 (minors' personal information)
- E-Commerce Law of the People's Republic of China, Article 18 (pricing
  transparency in algorithmic recommendations)
- Law on the Protection of Minors of the People's Republic of China,
  Articles 64-80 (online protection of minors)
