---
id: bias-audit-nyc
name: NYC LL144 Bias Audit Report
jurisdiction: us-ny
legalBasis: "NYC Local Law 144 (2021), NYC DCWP Rules (April 2023)"
requiredSections:
  - executive-summary
  - aedt-description
  - audit-methodology
  - selection-rate-analysis
  - scoring-analysis
  - intersectional-analysis
  - findings
  - remediation
---

# Bias Audit Report — Automated Employment Decision Tool (AEDT)

**Regulation**: NYC Local Law 144 of 2021, as implemented by NYC Department of Consumer and Worker Protection Rules (effective July 5, 2023)
**System name**: {{system_name}}
**Employer / Employment agency**: {{employer_name}}
**Independent auditor**: {{auditor_name}}
**Auditor qualifications**: {{auditor_qualifications}}
**Audit period**: {{audit_period}}
**Date of audit**: {{audit_date}}
**Date published**: {{publication_date}}
**Status**: DRAFT — Requires legal review

---

## 1. Executive Summary

<!-- LL144 requires that a summary of the results of the most recent bias audit and the distribution date of the AEDT be made publicly available on the employer's or employment agency's website prior to the use of an AEDT. -->

### 1.1 Purpose of This Audit

This bias audit was conducted in accordance with NYC Local Law 144 of 2021, which requires that any employer or employment agency that uses an automated employment decision tool (AEDT) to screen candidates or employees for an employment decision within New York City must ensure the tool has been subject to an independent bias audit no more than one year prior to the use of the AEDT.

### 1.2 Summary of Findings

{{executive_summary}}

### 1.3 Overall Assessment

| Metric | Result |
|--------|--------|
| Audit scope | {{audit_scope}} |
| Data source used | {{data_source_type}} |
| Number of applicants/employees in dataset | {{dataset_size}} |
| Adverse impact found (sex) | {{adverse_impact_sex}} |
| Adverse impact found (race/ethnicity) | {{adverse_impact_race}} |
| Adverse impact found (intersectional) | {{adverse_impact_intersectional}} |

---

## 2. Description of the AEDT

<!-- LL144 defines an AEDT as any computational process, derived from machine learning, statistical modeling, data analytics, or artificial intelligence, that issues a simplified output (score, classification, recommendation) used to substantially assist or replace discretionary decision making for employment decisions. -->

### 2.1 System Overview

{{system_overview}}

### 2.2 Employment Decision Type

<!-- Specify whether the AEDT is used for screening candidates for employment or employees for promotion. -->

| Field | Value |
|-------|-------|
| Decision type | {{decision_type}} |
| Job categories covered | {{job_categories}} |
| Stage of hiring/promotion process | {{hiring_stage}} |
| Role of AEDT output in decision | {{aedt_role_in_decision}} |

### 2.3 Input Data and Features

{{input_data_description}}

### 2.4 Output Description

<!-- Describe the simplified output: score, classification, or recommendation. -->

{{output_description}}

### 2.5 How the AEDT is Used

{{aedt_usage_description}}

---

## 3. Audit Methodology

### 3.1 Data Source

<!-- DCWP rules allow the audit to use either historical data from the AEDT's use or test data. State which was used and justify. -->

| Field | Value |
|-------|-------|
| Data type | {{data_type}} |
| Data period | {{data_period}} |
| Total records | {{total_records}} |
| Exclusions and rationale | {{data_exclusions}} |

### 3.2 Demographic Categories Analysed

<!-- LL144 requires analysis by sex, race/ethnicity, and intersectional categories. -->

**Sex categories**: Male, Female

**Race/ethnicity categories**: Hispanic or Latino, White (not Hispanic or Latino), Black or African American (not Hispanic or Latino), Native Hawaiian or Other Pacific Islander (not Hispanic or Latino), Asian (not Hispanic or Latino), Native American or Alaska Native (not Hispanic or Latino), Two or More Races (not Hispanic or Latino)

**Intersectional categories**: Each combination of the above sex and race/ethnicity categories.

### 3.3 Statistical Methods

{{statistical_methods}}

### 3.4 Impact Ratio Calculation

<!-- The impact ratio is the selection rate (or scoring rate) for a given category divided by the selection rate (or scoring rate) for the most-selected (or highest-scored) category. -->

{{impact_ratio_methodology}}

### 3.5 Threshold for Adverse Impact

<!-- The four-fifths (80%) rule is commonly used: an impact ratio below 0.80 may indicate adverse impact. Note that LL144 does not mandate a specific threshold, but requires disclosure of the impact ratios. -->

{{adverse_impact_threshold}}

---

## 4. Selection Rate Analysis

<!-- Required when the AEDT selects candidates for the employment decision (binary: selected / not selected). -->

### 4.1 Selection Rates by Sex

| Sex Category | # Applicants | # Selected | Selection Rate | Impact Ratio |
|-------------|-------------|-----------|----------------|--------------|
| Male | {{male_applicants}} | {{male_selected}} | {{male_selection_rate}} | {{male_impact_ratio}} |
| Female | {{female_applicants}} | {{female_selected}} | {{female_selection_rate}} | {{female_impact_ratio}} |

### 4.2 Selection Rates by Race/Ethnicity

| Race/Ethnicity | # Applicants | # Selected | Selection Rate | Impact Ratio |
|---------------|-------------|-----------|----------------|--------------|
| Hispanic or Latino | {{hispanic_applicants}} | {{hispanic_selected}} | {{hispanic_rate}} | {{hispanic_ratio}} |
| White (not Hispanic or Latino) | {{white_applicants}} | {{white_selected}} | {{white_rate}} | {{white_ratio}} |
| Black or African American (not Hispanic or Latino) | {{black_applicants}} | {{black_selected}} | {{black_rate}} | {{black_ratio}} |
| Native Hawaiian or Other Pacific Islander (not Hispanic or Latino) | {{nhpi_applicants}} | {{nhpi_selected}} | {{nhpi_rate}} | {{nhpi_ratio}} |
| Asian (not Hispanic or Latino) | {{asian_applicants}} | {{asian_selected}} | {{asian_rate}} | {{asian_ratio}} |
| Native American or Alaska Native (not Hispanic or Latino) | {{native_applicants}} | {{native_selected}} | {{native_rate}} | {{native_ratio}} |
| Two or More Races (not Hispanic or Latino) | {{two_or_more_applicants}} | {{two_or_more_selected}} | {{two_or_more_rate}} | {{two_or_more_ratio}} |

---

## 5. Scoring Analysis

<!-- Required when the AEDT provides a score for candidates (continuous or ordinal output). The median score for each category is compared. -->

### 5.1 Scoring Distribution by Sex

| Sex Category | # Scored | Median Score | Scoring Rate at Median | Impact Ratio |
|-------------|---------|-------------|----------------------|--------------|
| Male | {{male_scored}} | {{male_median}} | {{male_scoring_rate}} | {{male_scoring_ratio}} |
| Female | {{female_scored}} | {{female_median}} | {{female_scoring_rate}} | {{female_scoring_ratio}} |

### 5.2 Scoring Distribution by Race/Ethnicity

| Race/Ethnicity | # Scored | Median Score | Scoring Rate at Median | Impact Ratio |
|---------------|---------|-------------|----------------------|--------------|
| Hispanic or Latino | {{hispanic_scored}} | {{hispanic_median}} | {{hispanic_scoring_rate}} | {{hispanic_scoring_ratio}} |
| White (not Hispanic or Latino) | {{white_scored}} | {{white_median}} | {{white_scoring_rate}} | {{white_scoring_ratio}} |
| Black or African American (not Hispanic or Latino) | {{black_scored}} | {{black_median}} | {{black_scoring_rate}} | {{black_scoring_ratio}} |
| Native Hawaiian or Other Pacific Islander (not Hispanic or Latino) | {{nhpi_scored}} | {{nhpi_median}} | {{nhpi_scoring_rate}} | {{nhpi_scoring_ratio}} |
| Asian (not Hispanic or Latino) | {{asian_scored}} | {{asian_median}} | {{asian_scoring_rate}} | {{asian_scoring_ratio}} |
| Native American or Alaska Native (not Hispanic or Latino) | {{native_scored}} | {{native_median}} | {{native_scoring_rate}} | {{native_scoring_ratio}} |
| Two or More Races (not Hispanic or Latino) | {{two_or_more_scored}} | {{two_or_more_median}} | {{two_or_more_scoring_rate}} | {{two_or_more_scoring_ratio}} |

---

## 6. Intersectional Analysis

<!-- DCWP rules require intersectional disaggregation: impact ratios calculated for each combination of sex and race/ethnicity categories. -->

### 6.1 Intersectional Selection Rates

| Sex | Race/Ethnicity | # Applicants | # Selected | Selection Rate | Impact Ratio |
|-----|---------------|-------------|-----------|----------------|--------------|
{{intersectional_selection_table}}

### 6.2 Intersectional Scoring Rates

| Sex | Race/Ethnicity | # Scored | Median Score | Scoring Rate | Impact Ratio |
|-----|---------------|---------|-------------|-------------|--------------|
{{intersectional_scoring_table}}

### 6.3 Categories with Insufficient Data

<!-- Note any intersectional categories where sample size was too small for reliable analysis. -->

{{insufficient_data_categories}}

---

## 7. Findings

### 7.1 Summary of Impact Ratios

{{findings_summary}}

### 7.2 Categories Where Adverse Impact Was Identified

{{adverse_impact_findings}}

### 7.3 Potential Sources of Bias

{{bias_sources}}

### 7.4 Comparison to Prior Audits (If Applicable)

{{prior_audit_comparison}}

---

## 8. Remediation Recommendations

### 8.1 Recommended Actions

{{remediation_actions}}

### 8.2 Feature Review

{{feature_review_recommendations}}

### 8.3 Data Quality Improvements

{{data_quality_recommendations}}

### 8.4 Monitoring Recommendations

{{monitoring_recommendations}}

### 8.5 Re-Audit Timeline

{{re_audit_timeline}}

---

## 9. Notice Requirements Compliance

<!-- LL144 requires employers to provide notice to candidates/employees that an AEDT will be used at least 10 business days before use, including information about the job qualifications and characteristics that the AEDT will assess, the data sources, and the data retention policy. -->

### 9.1 Candidate/Employee Notice

{{candidate_notice_status}}

### 9.2 Published Summary

<!-- The employer must make a summary of the most recent bias audit and the distribution date publicly available on their website. -->

{{published_summary_status}}

---

## 10. Auditor Certification

I, {{auditor_name}}, certify that this bias audit was conducted independently in accordance with the requirements of NYC Local Law 144 of 2021 and the rules promulgated by the NYC Department of Consumer and Worker Protection.

| Field | Value |
|-------|-------|
| Auditor name | {{auditor_name}} |
| Auditor organisation | {{auditor_organisation}} |
| Date | {{certification_date}} |

---

**REVIEW NOTES FOR LEGAL TEAM**:

{{review_notes}}

---

*This bias audit report was generated by LaunchClear. NYC Local Law 144 requires bias audits to be conducted by an independent auditor. The statistical analysis, data interpretation, and remediation recommendations in this document should be reviewed by a qualified statistician and employment lawyer. Impact ratios should be validated against the actual AEDT output data. This template does not constitute independent auditor certification.*
