---
id: china-genai-assessment
name: China Generative AI Safety Assessment
jurisdiction: china
legalBasis: "Interim Measures for the Management of Generative AI Services (Articles 4-17), Deep Synthesis Provisions, Cybersecurity Law, Data Security Law, Personal Information Protection Law"
requiredSections:
  - service-description
  - training-data-compliance
  - content-safety
  - labeling-implementation
  - user-management
  - complaint-mechanism
  - security-measures
---

# China Generative AI Safety Assessment (生成式人工智能安全评估)

**Organisation (机构名称)**: {{organisation_name}}
**Service name (服务名称)**: {{service_name}}
**Service URL / application (服务网址/应用)**: {{service_url}}
**Assessment date (评估日期)**: {{assessment_date}}
**Assessor (评估人)**: {{assessor_name}}
**Status**: DRAFT — Requires PRC legal counsel review

> **Regulatory context**: Pursuant to the Interim Measures for the Management of Generative AI Services (生成式人工智能服务管理暂行办法, effective 15 August 2023), providers offering generative AI services to the public in the People's Republic of China must conduct a security assessment before launching. This assessment covers content safety, training data legality, user management, and technical security. Article 17 requires providers to conduct security assessments and complete algorithm filing before providing services to the public.

---

## 1. Service Description (服务描述)

### 1.1 Service Overview (服务概述)

<!-- Article 2: These Measures apply to the use of generative AI technology to provide services for generating text, images, audio, video, and other content to the public within the People's Republic of China. -->

{{service_overview}}

### 1.2 Generative AI Capabilities (生成式AI能力)

| Capability (能力) | Supported? (是否支持) | Description (描述) |
|-----------------|--------------------|--------------------|
| Text generation (文本生成) | {{supports_text}} | {{text_description}} |
| Image generation (图像生成) | {{supports_image}} | {{image_description}} |
| Audio generation (音频生成) | {{supports_audio}} | {{audio_description}} |
| Video generation (视频生成) | {{supports_video}} | {{video_description}} |
| Code generation (代码生成) | {{supports_code}} | {{code_description}} |
| Multimodal generation (多模态生成) | {{supports_multimodal}} | {{multimodal_description}} |

### 1.3 Underlying Model Information (底层模型信息)

| Field (字段) | Value (值) |
|-------------|-----------|
| Model name (模型名称) | {{model_name}} |
| Model provider (模型提供方) | {{model_provider}} |
| Self-developed or third-party (自研或第三方) | {{model_source}} |
| Model type (模型类型) | {{model_type}} |
| Model version (模型版本) | {{model_version}} |

### 1.4 Service Mode (服务模式)

<!-- Article 2(2): These Measures do not apply to organizations that develop and use generative AI products internally without providing services to the public. Clarify whether the service is public-facing. -->

| Aspect (方面) | Description (描述) |
|-------------|-------------------|
| Public-facing (面向公众) | {{is_public_facing}} |
| API service (API服务) | {{is_api_service}} |
| Embedded in other products (嵌入其他产品) | {{is_embedded}} |
| Target user base (目标用户群) | {{target_user_base}} |

---

## 2. Training Data Compliance (训练数据合规)

<!-- Article 7: Providers of GenAI services shall carry out training data processing activities in compliance with laws and regulations, including: (1) Using data and basic models with lawful sources; (2) Not infringing upon others' intellectual property; (3) Where personal information is involved, obtaining consent or meeting other legal bases; (4) Capable of verifying the authenticity, accuracy, objectivity, and diversity of training data. -->

### 2.1 Training Data Legality (训练数据合法性)

| Requirement (要求) | Compliance Status (合规状态) | Evidence (依据) |
|------------------|--------------------------|---------------|
| Lawful data sources (数据来源合法) | {{lawful_sources_status}} | {{lawful_sources_evidence}} |
| No IP infringement (不侵犯知识产权) | {{ip_status}} | {{ip_evidence}} |
| Personal information compliance (个人信息合规) | {{pi_status}} | {{pi_evidence}} |
| Data accuracy and diversity (数据准确性和多样性) | {{accuracy_status}} | {{accuracy_evidence}} |

### 2.2 Training Data Sources (训练数据来源)

{{training_data_sources}}

### 2.3 Personal Information in Training Data (训练数据中的个人信息)

<!-- Must comply with the Personal Information Protection Law (个人信息保护法, PIPL). Article 7(3): Where personal information is involved, providers shall obtain individual consent or comply with other circumstances provided by laws and administrative regulations. -->

{{personal_information_assessment}}

### 2.4 Data Annotation Compliance (数据标注合规)

<!-- Article 8: Where data annotation is needed, providers shall: (1) Formulate clear, specific, and operable annotation rules; (2) Carry out quality assessment of annotated data, conduct sampling checks on accuracy; (3) Provide necessary training for annotation personnel. -->

| Requirement (要求) | Implementation (实施情况) |
|------------------|------------------------|
| Clear annotation rules (明确标注规则) | {{annotation_rules}} |
| Quality assessment (质量评估) | {{quality_assessment}} |
| Accuracy sampling (准确性抽检) | {{accuracy_sampling}} |
| Annotator training (标注人员培训) | {{annotator_training}} |

---

## 3. Content Safety Measures (内容安全措施)

<!-- Article 4: Provision of GenAI services shall adhere to socialist core values (社会主义核心价值观), and shall not generate content that: (1) Incites subversion of state power or overthrow of the socialist system; (2) Endangers national security and interests or damages the national image; (3) Incites separatism or undermines national unity and social stability; (4) Promotes terrorism or extremism; (5) Promotes ethnic hatred or discrimination; (6) Violence, obscenity, or pornography; (7) False or harmful information; (8) Content that may cause discrimination; (9) Other content prohibited by laws and regulations. -->

### 3.1 Prohibited Content Prevention (违禁内容防范)

| Prohibited Category (禁止类别) | Prevention Measure (防范措施) | Effectiveness Assessment (有效性评估) |
|------------------------------|--------------------------|----------------------------------|
| Subversion of state power (颠覆国家政权) | {{subversion_measures}} | {{subversion_effectiveness}} |
| National security threats (危害国家安全) | {{national_security_measures}} | {{national_security_effectiveness}} |
| Separatism (分裂国家) | {{separatism_measures}} | {{separatism_effectiveness}} |
| Terrorism / extremism (恐怖主义/极端主义) | {{terrorism_measures}} | {{terrorism_effectiveness}} |
| Ethnic hatred / discrimination (民族仇恨/歧视) | {{ethnic_hatred_measures}} | {{ethnic_hatred_effectiveness}} |
| Violence / obscenity (暴力/淫秽) | {{violence_measures}} | {{violence_effectiveness}} |
| False information (虚假信息) | {{false_info_measures}} | {{false_info_effectiveness}} |
| Discrimination (歧视) | {{discrimination_measures}} | {{discrimination_effectiveness}} |

### 3.2 Content Review System (内容审核制度)

<!-- Article 9(1): Providers shall carry out pre-training data, optimization training data, and generated content management in accordance with the law. -->

{{content_review_system}}

### 3.3 Keyword Filtering and Blocklists (关键词过滤和屏蔽词库)

{{keyword_filtering}}

### 3.4 Model Output Safety Testing (模型输出安全测试)

<!-- Describe testing methodology for evaluating whether the model generates prohibited content. Include red-teaming, adversarial testing, and benchmark results. -->

{{output_safety_testing}}

### 3.5 Real-Time Content Monitoring (实时内容监控)

{{real_time_monitoring}}

### 3.6 Content Correction Mechanism (内容纠正机制)

<!-- Article 14: When discovering that generated content does not comply with these Measures, providers shall take measures including: stopping generation, correcting the model through optimization training, and reporting to competent authorities. -->

{{content_correction_mechanism}}

---

## 4. Labeling Implementation (标识实施)

<!-- Article 12: Providers shall mark generated content including images, videos, and text in accordance with the Provisions on the Management of Deep Synthesis Internet Information Services and relevant national standards. Deep Synthesis Provisions Articles 16-17: Must add identifiable marks to generated/edited content. -->

### 4.1 Labeling Methods (标识方式)

| Content Type (内容类型) | Labeling Method (标识方式) | Standard Followed (遵循标准) |
|----------------------|-------------------------|--------------------------|
| Text (文本) | {{text_labeling_method}} | {{text_labeling_standard}} |
| Images (图像) | {{image_labeling_method}} | {{image_labeling_standard}} |
| Audio (音频) | {{audio_labeling_method}} | {{audio_labeling_standard}} |
| Video (视频) | {{video_labeling_method}} | {{video_labeling_standard}} |

### 4.2 Visible Labels (显性标识)

<!-- User-facing labels indicating content is AI-generated. -->

{{visible_labels}}

### 4.3 Invisible / Machine-Readable Labels (隐性/机器可读标识)

<!-- Metadata, watermarks, and other machine-readable identifiers embedded in AI-generated content. -->

{{invisible_labels}}

### 4.4 Label Persistence (标识持久性)

<!-- Describe measures to ensure labels cannot be easily removed. -->

{{label_persistence}}

---

## 5. User Management (用户管理)

<!-- Article 9(2): Providers shall require users providing input for generative AI to provide real identity information in accordance with the Cybersecurity Law of the People's Republic of China. -->

### 5.1 Real-Name Registration (实名注册)

| Requirement (要求) | Implementation (实施情况) |
|------------------|------------------------|
| Real-name verification method (实名验证方式) | {{real_name_method}} |
| Identity information collected (收集的身份信息) | {{identity_info_collected}} |
| Verification timing (验证时间) | {{verification_timing}} |
| Compliance with Cybersecurity Law (网安法合规) | {{cybersecurity_law_compliance}} |

### 5.2 Minor User Protection (未成年人保护)

<!-- Article 10: Providers shall take effective measures to prevent minors from over-reliance or addiction to generative AI services, and comply with the provisions of laws and regulations such as the Law on the Protection of Minors. -->

{{minor_protection_measures}}

### 5.3 User Agreement and Service Terms (用户协议和服务条款)

<!-- Article 11: Providers shall fulfill obligations such as entering into service agreements with users that register for generative AI services. Guide users to use AI-generated content scientifically and rationally. -->

{{user_agreement_description}}

### 5.4 User Input Management (用户输入管理)

<!-- How user inputs are monitored, filtered, and managed to prevent misuse. -->

{{user_input_management}}

---

## 6. Complaint Mechanism (投诉机制)

<!-- Article 15: Providers shall establish mechanisms for accepting and handling user complaints and reports, and set up convenient complaint and report entry points. Upon receiving complaints and reports regarding violations of these Measures, providers shall handle them in a timely manner and report to the competent authorities. -->

### 6.1 Complaint Channels (投诉渠道)

| Channel (渠道) | Available? (是否可用) | Response Time (响应时间) |
|-------------|--------------------|-----------------------|
| In-app reporting (应用内举报) | {{in_app_reporting}} | {{in_app_response_time}} |
| Email (电子邮件) | {{email_reporting}} | {{email_response_time}} |
| Phone hotline (电话热线) | {{phone_reporting}} | {{phone_response_time}} |
| Online form (在线表单) | {{form_reporting}} | {{form_response_time}} |

### 6.2 Complaint Processing Procedures (投诉处理流程)

{{complaint_processing_procedures}}

### 6.3 Regulatory Reporting (监管报告)

<!-- Describe the process for reporting serious incidents or systemic issues to the CAC and other competent authorities. Article 15: Providers shall report to competent authorities upon receiving complaints about legal violations. -->

{{regulatory_reporting_process}}

### 6.4 User Feedback Integration (用户反馈整合)

<!-- How user complaints and feedback are used to improve the model and service. Article 14: Providers shall correct the model through optimization training based on discovered issues. -->

{{user_feedback_integration}}

---

## 7. Security Measures (安全措施)

### 7.1 Cybersecurity Measures (网络安全措施)

<!-- Compliance with the Cybersecurity Law (网络安全法) and the Data Security Law (数据安全法). -->

{{cybersecurity_measures}}

### 7.2 Data Security Classification (数据安全分级)

<!-- Data Security Law requires data classification and graded protection. -->

| Data Category (数据类别) | Classification Level (分级等级) | Protection Measures (保护措施) |
|------------------------|------------------------------|----------------------------|
| Training data (训练数据) | {{training_data_level}} | {{training_data_protection}} |
| User input data (用户输入数据) | {{user_input_level}} | {{user_input_protection}} |
| Generated output (生成输出) | {{output_level}} | {{output_protection}} |
| User identity data (用户身份数据) | {{identity_level}} | {{identity_protection}} |
| Model parameters (模型参数) | {{model_level}} | {{model_protection}} |

### 7.3 Personal Information Protection (个人信息保护)

<!-- Compliance with the Personal Information Protection Law (个人信息保护法, PIPL). -->

{{pipl_compliance_measures}}

### 7.4 Cross-Border Data Transfer (数据跨境传输)

<!-- If data is transferred outside China, compliance with CAC cross-border data transfer regulations is required. -->

{{cross_border_assessment}}

### 7.5 Incident Response Plan (事件响应预案)

<!-- Article 14: When discovering illegal content, providers must take measures including stopping generation, model correction, and reporting. -->

{{incident_response_plan}}

### 7.6 Logging and Audit Trail (日志与审计追踪)

<!-- Article 13: Providers shall retain input information and log information of users. Input information shall be retained for no less than six months. -->

| Requirement (要求) | Implementation (实施情况) |
|------------------|------------------------|
| User input logging (用户输入日志) | {{input_logging}} |
| Output logging (输出日志) | {{output_logging}} |
| Log retention period (日志保留期限) | {{log_retention_period}} |
| Access controls (访问控制) | {{log_access_controls}} |

---

## 8. Assessment Summary (评估总结)

### 8.1 Overall Compliance Status (总体合规状态)

| Area (领域) | Status (状态) | Key Gaps (主要差距) |
|-----------|-------------|-------------------|
| Training data compliance (训练数据合规) | {{training_compliance_status}} | {{training_compliance_gaps}} |
| Content safety (内容安全) | {{content_safety_status}} | {{content_safety_gaps}} |
| Labeling (内容标识) | {{labeling_status}} | {{labeling_gaps}} |
| User management (用户管理) | {{user_management_status}} | {{user_management_gaps}} |
| Complaint mechanism (投诉机制) | {{complaint_status}} | {{complaint_gaps}} |
| Security measures (安全措施) | {{security_status}} | {{security_gaps}} |

### 8.2 Remediation Plan (整改计划)

{{remediation_plan}}

### 8.3 Timeline (时间线)

| Milestone (里程碑) | Target Date (目标日期) | Status (状态) |
|-------------------|---------------------|-------------|
{{timeline_table}}

---

**REVIEW NOTES FOR LEGAL TEAM**:

{{review_notes}}

---

*This safety assessment was generated by LaunchClear. China's generative AI regulations are among the most prescriptive globally, with specific requirements around socialist core values compliance, content safety, and real-name registration that have no direct equivalent in other jurisdictions. All content must be reviewed by qualified PRC legal counsel with expertise in CAC regulatory requirements. The actual assessment format and requirements may change as the CAC issues additional implementation guidance and national standards.*
