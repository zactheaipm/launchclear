# Bias Testing for AI Systems

## Overview

Bias testing evaluates whether an AI system produces systematically different
outcomes for different demographic groups, particularly along legally protected
characteristics. Testing should be conducted before deployment and repeated
on a regular schedule.

## Protected Characteristics

Testing should cover all legally protected characteristics relevant to the
system's deployment jurisdictions. Common categories:

- **Race / ethnicity** (US: Title VII, EU: non-discrimination directives)
- **Sex / gender** (all jurisdictions)
- **Age** (US: ADEA, EU: Employment Equality Directive)
- **Disability** (US: ADA, EU: Employment Equality Directive, UK: Equality Act)
- **Religion** (all jurisdictions)
- **National origin** (US, EU)
- **Pregnancy / family status** (US: PDA, EU: various directives)
- **Sexual orientation** (EU, UK, select US jurisdictions)

For employment AI (NYC LL144), intersectional analysis is required — test
for disparities at the intersection of sex and race/ethnicity categories.

## Fairness Metrics

No single metric captures all dimensions of fairness. Select metrics based
on the system's use case and legal context:

- **Demographic parity**: Selection/approval rates are equal across groups.
  Use when the base rate should be independent of group membership.
- **Equal opportunity**: True positive rates are equal across groups.
  Use for screening systems (hiring, lending) where you want equal
  chances for qualified individuals.
- **Equalised odds**: Both true positive and false positive rates are equal.
  Stricter than equal opportunity.
- **Predictive parity**: Positive predictive values are equal across groups.
  Use when the cost of false positives is high.
- **Calibration**: For scoring systems, predicted probabilities should align
  with actual outcomes across groups.

## Testing Methodology

### 1. Data Preparation

- Collect demographic data for test population (with appropriate consent
  and data protection measures)
- If demographic data is unavailable, consider proxy methods (BISG for
  race/ethnicity imputation) with documented limitations
- Ensure test data is representative of the deployment population
- Maintain separate test sets (not used in training)

### 2. Disaggregated Analysis

- Run the AI system on test data
- Disaggregate results by each protected characteristic
- Calculate selection/approval rates, error rates, and chosen fairness
  metrics for each group
- For NYC LL144: calculate impact ratios (group rate / highest rate)
  for sex, race/ethnicity, and intersectional categories

### 3. Statistical Significance

- Use appropriate statistical tests to determine whether observed
  disparities are significant (chi-squared, Fisher's exact, bootstrap
  confidence intervals)
- Document sample sizes and statistical power
- Small sample sizes for minority groups may require pooling or
  alternative methods

### 4. Root Cause Analysis

- If disparities found, investigate whether they stem from:
  - Training data imbalances
  - Feature selection (proxies for protected characteristics)
  - Label bias in training data
  - Model architecture choices
  - Threshold selection

### 5. Remediation

- Techniques: re-sampling training data, removing proxy features,
  adversarial debiasing, calibrated thresholds, post-processing
  adjustments
- Document the trade-offs of each remediation approach
- Re-test after remediation to verify improvement

## Testing Schedule

- **Pre-deployment**: Full bias audit before any production deployment
- **Post-deployment**: Ongoing monitoring with periodic full audits
- **Trigger-based**: Re-test when model is updated, training data changes,
  or user population shifts
- **NYC LL144**: Annual independent bias audit required, published on website

## Documentation

- Testing methodology (reproducible)
- Metrics used and justification for selection
- Disaggregated results for each protected group
- Statistical significance analysis
- Remediation actions taken
- Reviewer / auditor identity and independence
- Date of testing and model version tested

## Common Pitfalls

- **Testing only on training data**: Test on held-out data representative
  of the deployment population
- **Single metric obsession**: One fairness metric can improve while
  another worsens — track multiple metrics
- **Ignoring intersectionality**: A system can be fair on race and fair
  on gender but unfair for Black women specifically
- **Proxy variables**: Removing "race" from features does not eliminate
  racial bias — ZIP code, name, school attended can all be proxies
- **Static testing**: A model that was fair at deployment can drift into
  unfairness as the world changes
