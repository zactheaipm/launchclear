# Illinois — Biometric Information Privacy Act (BIPA)

**Authority**: Illinois Legislature; Illinois courts (private right of action)
**Legal Basis**: Biometric Information Privacy Act, 740 ILCS 14/1 et seq.
**Status**: In effect since October 2008; actively enforced through private
litigation and landmark settlements

## Overview

The Illinois Biometric Information Privacy Act (BIPA) is the strongest biometric
privacy law in the United States and the only state biometric privacy statute
with a **private right of action**. BIPA regulates the collection, use, storage,
and dissemination of biometric identifiers and biometric information by private
entities. It has generated billions of dollars in settlements and jury verdicts,
making it the highest-risk US state law for companies deploying AI systems that
process biometric data.

## Biometric Identifiers — Definition

BIPA defines **biometric identifier** as:
- Retina or iris scan
- Fingerprint
- Voiceprint
- Scan of hand or face geometry

**Excluded**: Writing samples, written signatures, photographs, human biological
samples used for valid scientific testing or screening, demographic data, tattoo
descriptions, physical descriptions (height, weight, hair color, eye color).

**Biometric information** means any information, regardless of how it is
captured, converted, stored, or shared, based on a biometric identifier used
to identify an individual.

## Consent Requirements (Section 15(b))

Before collecting or otherwise obtaining a person's biometric identifier or
biometric information, a private entity must:

1. **Inform** the person in writing that biometric data is being collected
   or stored
2. **Inform** the person in writing of the specific purpose and length of
   time for which the data is being collected, stored, and used
3. **Receive a written release** from the person (or their legally
   authorized representative) for the collection and storage

All three requirements must be satisfied before any biometric data collection
occurs. Implied consent, click-through consent, or oral consent is insufficient.

## Retention and Destruction (Section 15(a))

Private entities in possession of biometric data must:

- Develop a **written policy**, made available to the public, establishing a
  **retention schedule** and guidelines for permanently destroying biometric
  data
- Destroy biometric data when the initial purpose for collection has been
  satisfied, OR within **3 years** of the individual's last interaction with
  the entity — whichever occurs first

## Prohibition on Sale and Profit (Section 15(c))

No private entity in possession of biometric data may **sell, lease, trade,
or otherwise profit** from a person's biometric identifier or biometric
information.

## Prohibition on Disclosure (Section 15(d))

No private entity in possession of biometric data may **disclose, redisclose,
or otherwise disseminate** the data unless:
- The individual (or their authorized representative) consents
- Disclosure completes a financial transaction authorized by the individual
- Disclosure is required by law (state or federal) or municipal ordinance
- Disclosure is required pursuant to a valid warrant or subpoena

## Private Right of Action and Damages (Section 20)

**This is the critical enforcement mechanism.** Any person aggrieved by a
BIPA violation may bring a private action and recover:

- **Negligent violation**: The greater of $1,000 per violation or actual
  damages
- **Intentional or reckless violation**: The greater of $5,000 per violation
  or actual damages
- Reasonable attorney's fees and costs
- Injunctive relief

### Per-Scan vs. Per-Person Accrual

Following the Illinois Supreme Court's decision in *Cothron v. White Castle*
(2023), each individual scan or collection constitutes a separate violation.
This means damages accrue per scan, not per person, dramatically increasing
potential exposure for entities that repeatedly collect biometric data (e.g.,
facial recognition for employee time clocks, repeated fingerprint scans).

## Key Litigation and Settlements

- **Facebook/Meta** (2021): $650 million class action settlement for facial
  recognition tag suggestions
- **BNSF Railway** (2022): $228 million jury verdict for fingerprint
  scanning of truck drivers without consent
- **TikTok** (2021): $92 million settlement for facial geometry collection
- **Google** (2022): $100 million settlement for face grouping in Google
  Photos
- **Clearview AI**: Multiple BIPA actions pending; $52 million proposed
  settlement (2024)

## AI-Specific Implications

BIPA applies to AI systems that process biometric identifiers, including:
- **Facial recognition** systems (face geometry constitutes a biometric
  identifier)
- **Voice analysis / voice authentication** systems (voiceprint is a
  biometric identifier)
- **Emotion recognition** systems that analyze facial geometry or voice
  patterns
- **Liveness detection** systems that capture face geometry

Any AI product that collects, stores, or processes face geometry, voiceprints,
fingerprints, or iris/retina scans of Illinois residents must comply with BIPA's
consent, retention, and disclosure requirements.

## Citations

- 740 ILCS 14/1 et seq. (Biometric Information Privacy Act)
- 740 ILCS 14/15 (Consent, retention, sale, and disclosure requirements)
- 740 ILCS 14/20 (Right of action and damages)
- *Rosenbach v. Six Flags Entertainment Corp.*, 2019 IL 123186 (standing
  does not require actual harm)
- *Cothron v. White Castle System, Inc.*, 2023 IL 128004 (per-scan accrual)
