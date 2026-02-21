---
id: china-algorithm-filing
name: China CAC Algorithm Filing Application
jurisdiction: china
legalBasis: "Provisions on the Management of Algorithmic Recommendations (Articles 24-27), Interim Measures for the Management of Generative AI Services (Article 17)"
requiredSections:
  - algorithm-name-type
  - service-description
  - algorithm-mechanism
  - self-assessment
  - security-assessment
  - data-sources
  - user-rights
---

# China CAC Algorithm Filing Application (算法备案申请)

**Organisation (机构名称)**: {{organisation_name}}
**Unified Social Credit Code (统一社会信用代码)**: {{social_credit_code}}
**Filing type (备案类型)**: {{filing_type}}
**Date prepared (编制日期)**: {{date_prepared}}
**Prepared by (编制人)**: {{prepared_by}}
**Status**: DRAFT — Requires legal review and Chinese counsel approval

> **Regulatory context**: The Cyberspace Administration of China (CAC / 国家互联网信息办公室) requires algorithm filing under the Provisions on the Management of Algorithmic Recommendations in Internet Information Services (互联网信息服务算法推荐管理规定, effective 1 March 2022) and the Interim Measures for the Management of Generative AI Services (生成式人工智能服务管理暂行办法, effective 15 August 2023). Providers of algorithmic recommendation services, deep synthesis services, and generative AI services to the public in China must file with the CAC through the Internet Information Service Algorithm Filing System (互联网信息服务算法备案系统).

---

## 1. Algorithm Name and Type (算法名称及类型)

### 1.1 Algorithm Basic Information (算法基本信息)

| Field (字段) | Value (值) |
|-------------|-----------|
| Algorithm name (算法名称) | {{algorithm_name}} |
| Algorithm type (算法类型) | {{algorithm_type}} |
| Algorithm category (算法分类) | {{algorithm_category}} |
| Version number (版本号) | {{algorithm_version}} |
| Date of deployment (上线日期) | {{deployment_date}} |

### 1.2 Algorithm Type Classification (算法类型分类)

<!-- CAC classifies algorithms into categories. Select the applicable type(s). -->

| Type (类型) | Applicable? (是否适用) | Description (说明) |
|------------|----------------------|-------------------|
| Generative AI algorithm (生成合成类) | {{is_generative}} | Algorithms that generate text, images, audio, video, or other content |
| Recommendation algorithm (推荐类) | {{is_recommendation}} | Algorithms that recommend or push information to users based on user profiles or behavior |
| Sorting/ranking algorithm (排序精选类) | {{is_ranking}} | Algorithms that rank, sort, or prioritize content or search results |
| Retrieval/filtering algorithm (检索过滤类) | {{is_filtering}} | Algorithms that filter, detect, or retrieve information |
| Scheduling/decision algorithm (调度决策类) | {{is_scheduling}} | Algorithms that make or assist with decisions in service delivery |
| Deep synthesis algorithm (深度合成类) | {{is_deep_synthesis}} | Algorithms that use deep learning to generate or edit text, images, audio, video, or virtual scenes |

### 1.3 Service Domain (服务领域)

{{service_domain}}

---

## 2. Service Description (服务描述)

<!-- Describe the internet information service that uses the algorithm. Article 24 of the Algorithmic Recommendations Provisions requires a description of the algorithm's application scenario and purpose. -->

### 2.1 Service Overview (服务概述)

{{service_overview}}

### 2.2 Target Users (目标用户)

{{target_users}}

### 2.3 Application Scenarios (应用场景)

{{application_scenarios}}

### 2.4 Service Scale (服务规模)

| Metric (指标) | Value (值) |
|-------------|-----------|
| Registered users (注册用户数) | {{registered_users}} |
| Daily active users (日活跃用户数) | {{daily_active_users}} |
| Daily algorithm invocations (日均算法调用次数) | {{daily_invocations}} |
| Service regions (服务地域) | {{service_regions}} |

---

## 3. Algorithm Working Mechanism (算法工作机制)

<!-- Describe the technical principles and working mechanism of the algorithm. This is a key section for the CAC's technical review. The description should be detailed enough for regulators to understand the algorithm's functioning without revealing trade secrets. -->

### 3.1 Technical Principles (技术原理)

{{technical_principles}}

### 3.2 Algorithm Architecture (算法架构)

{{algorithm_architecture}}

### 3.3 Key Parameters (关键参数)

{{key_parameters}}

### 3.4 Training Process (训练过程)

<!-- For generative AI algorithms: describe the training methodology, including pre-training, fine-tuning, and RLHF/RLAIF if applicable. -->

{{training_process}}

### 3.5 Input and Output Description (输入输出说明)

| Aspect (方面) | Description (描述) |
|-------------|-------------------|
| Input types (输入类型) | {{input_types}} |
| Output types (输出类型) | {{output_types}} |
| Processing logic (处理逻辑) | {{processing_logic}} |

### 3.6 Human Intervention Mechanisms (人工干预机制)

<!-- Article 9 of the Algorithmic Recommendations Provisions: Providers shall establish and improve mechanisms for manual intervention in algorithm models and set up user model refresh functions. -->

{{human_intervention_mechanisms}}

---

## 4. Self-Assessment Report (自评估报告)

<!-- Providers must conduct a self-assessment of the algorithm's impact and risks before filing. Article 27 of the Algorithmic Recommendations Provisions requires algorithm safety self-assessment. -->

### 4.1 Algorithm Impact Assessment (算法影响评估)

#### 4.1.1 Impact on Public Opinion (对舆论的影响)

{{public_opinion_impact}}

#### 4.1.2 Impact on Social Mobilization (对社会动员的影响)

{{social_mobilization_impact}}

#### 4.1.3 Impact on Minors (对未成年人的影响)

{{minors_impact}}

#### 4.1.4 Impact on Workers' Rights (对劳动者权益的影响)

{{workers_rights_impact}}

### 4.2 Compliance with Core Values (核心价值观合规)

<!-- CAC GenAI Measures Article 4: GenAI services must adhere to socialist core values (社会主义核心价值观). This is a mandatory compliance requirement for all GenAI services in China. -->

{{core_values_compliance}}

### 4.3 Compliance with Laws and Regulations (法律法规合规)

{{legal_compliance_assessment}}

### 4.4 Risk Mitigation Measures (风险缓解措施)

{{risk_mitigation_measures}}

---

## 5. Security Assessment (安全评估)

<!-- CAC GenAI Measures Article 17: Before providing generative AI services to the public, providers shall conduct a security assessment in accordance with relevant regulations, and perform algorithm filing procedures. -->

### 5.1 Content Safety Measures (内容安全措施)

{{content_safety_measures}}

### 5.2 Data Security Measures (数据安全措施)

{{data_security_measures}}

### 5.3 System Security Measures (系统安全措施)

{{system_security_measures}}

### 5.4 Emergency Response Plan (应急预案)

{{emergency_response_plan}}

### 5.5 Vulnerability and Incident History (漏洞及事件历史)

{{vulnerability_history}}

---

## 6. Data Sources (数据来源)

<!-- CAC GenAI Measures Article 7: Training data must be obtained through lawful means. Must not infringe upon others' intellectual property rights. Where personal information is involved, must obtain individual consent or comply with other circumstances provided by laws and regulations. -->

### 6.1 Training Data Sources (训练数据来源)

{{training_data_sources}}

### 6.2 Training Data Legality Verification (训练数据合法性验证)

| Verification Item (验证项目) | Status (状态) | Notes (备注) |
|---------------------------|-------------|------------|
| Lawful acquisition (合法获取) | {{lawful_acquisition}} | {{lawful_acquisition_notes}} |
| Intellectual property compliance (知识产权合规) | {{ip_compliance}} | {{ip_compliance_notes}} |
| Personal information compliance (个人信息合规) | {{personal_info_compliance}} | {{personal_info_compliance_notes}} |
| No prohibited content (无违禁内容) | {{no_prohibited_content}} | {{prohibited_content_notes}} |
| Data accuracy and quality (数据准确性和质量) | {{data_accuracy}} | {{data_accuracy_notes}} |

### 6.3 User-Generated Input Data (用户输入数据)

<!-- How user inputs are handled, stored, and whether they are used for training. Article 7(3): Must comply with personal information protection requirements. -->

{{user_input_data_handling}}

### 6.4 Data Annotation (数据标注)

<!-- Article 8: Where data annotation is needed, providers shall formulate clear, specific, and operable annotation rules. Carry out quality assessment of annotated data and conduct sampling checks on accuracy. Provide necessary training for annotation personnel. -->

{{data_annotation_description}}

---

## 7. User Rights Implementation (用户权利实现)

<!-- Articles 16-17 of the Algorithmic Recommendations Provisions and Articles 9-11 of the GenAI Measures require user-facing protections. -->

### 7.1 Algorithm Transparency (算法透明度)

<!-- Article 16: Providers shall inform users of their use of algorithmic recommendation services in a prominent manner, and publicize basic principles, purpose and intent, and main operating mechanisms of the algorithm. -->

{{algorithm_transparency_measures}}

### 7.2 User Opt-Out Rights (用户选择退出权)

<!-- Article 17: Providers shall provide users with convenient options to turn off algorithmic recommendation services. Users who choose to turn off shall be provided with options not targeted at their personal characteristics, or convenient options to delete user tags. -->

{{user_opt_out_implementation}}

### 7.3 Complaint and Reporting Mechanism (投诉举报机制)

<!-- CAC GenAI Measures Article 9: Providers shall establish mechanisms for accepting and handling complaints and reports, and set up convenient complaint and report entry points. -->

{{complaint_mechanism}}

### 7.4 Content Labeling (内容标识)

<!-- CAC GenAI Measures Article 12: Providers shall label generated content including images, videos, and text in accordance with relevant national standards. Deep Synthesis Provisions Articles 16-17: Must add identifiable marks. -->

{{content_labeling_implementation}}

### 7.5 Real-Name Registration (实名制)

<!-- Article 9(2): Providers shall require users to provide real identity information. -->

{{real_name_registration}}

---

## 8. Filing Submission Checklist (备案提交清单)

| Item (项目) | Prepared? (已准备) | Notes (备注) |
|-----------|-------------------|------------|
| Algorithm filing application form (算法备案申请表) | {{filing_form_ready}} | {{filing_form_notes}} |
| Business license (营业执照) | {{business_license_ready}} | {{business_license_notes}} |
| Algorithm self-assessment report (算法自评估报告) | {{self_assessment_ready}} | {{self_assessment_notes}} |
| Security assessment report (安全评估报告) | {{security_assessment_ready}} | {{security_assessment_notes}} |
| Content moderation system description (内容审核制度说明) | {{content_moderation_ready}} | {{content_moderation_notes}} |
| Technical documentation (技术文档) | {{tech_doc_ready}} | {{tech_doc_notes}} |

---

**REVIEW NOTES FOR LEGAL TEAM**:

{{review_notes}}

---

*This algorithm filing application was generated by LaunchClear. China's algorithm and GenAI regulations are complex and enforcement practices are evolving. Filing must be completed through the official CAC Internet Information Service Algorithm Filing System (互联网信息服务算法备案系统) at https://beian.cac.gov.cn. All content must be reviewed by qualified PRC legal counsel before submission. This template provides a framework for preparing the filing — the actual submission form and required attachments are defined by the CAC and may change.*
