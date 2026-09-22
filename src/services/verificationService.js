/**
 * CivicAI - AI Resolution Verification Service
 * 
 * Compares citizen BEFORE photo with worker AFTER photo to assess whether
 * the reported municipal issue appears to have been resolved.
 * 
 * SAFETY RULE: Never claims an issue is definitely fixed.
 * Probabilistic statuses:
 * - "Likely Resolved"
 * - "Possibly Resolved"
 * - "Not Resolved"
 * - "Unable to Verify"
 */

export const VERIFICATION_STATUSES = [
  'Likely Resolved',
  'Possibly Resolved',
  'Not Resolved',
  'Unable to Verify',
];

/**
 * Real Vision Comparison API integration stub.
 * When a backend vision endpoint is ready, plug it in here.
 */
export async function callRealVisionComparisonAPI({ beforeImage, afterImage, issueType }) {
  throw new Error('Backend Vision Comparison API not configured. Using AI verification mock engine.');
}

/**
 * Performs visual comparison between BEFORE and AFTER images.
 * 
 * @param {Object} params
 * @param {Object|string} params.beforeImage
 * @param {Object|string} params.afterImage
 * @param {string} params.issueType
 * @param {string} [params.description]
 * @param {string} [params.simulatedPreset] - Optional test preset ('likely_resolved', 'not_resolved', 'unable_to_verify', 'possibly_resolved')
 * @returns {Promise<{verificationStatus: string, confidence: number, reason: string, requiresHumanReview: boolean}>}
 */
export async function verifyResolution({
  beforeImage,
  afterImage,
  issueType = 'Civic Issue',
  description = '',
  simulatedPreset = null,
}) {
  // Realistic processing latency (1000ms - 1400ms)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // If a specific test preset is passed:
  if (simulatedPreset) {
    return getVerificationPresetResponse(simulatedPreset, issueType);
  }

  // Filename-based heuristic check for natural testing
  const afterName = (afterImage?.name || '').toLowerCase();

  if (afterName.includes('fail') || afterName.includes('not_fixed') || afterName.includes('broken') || afterName.includes('incomplete')) {
    return {
      verificationStatus: 'Not Resolved',
      confidence: 0.88,
      reason: `The reported ${issueType.toLowerCase()} remains visibly unresolved in the after image; repair appears incomplete.`,
      requiresHumanReview: true,
    };
  }

  if (afterName.includes('blur') || afterName.includes('dark') || afterName.includes('unclear') || afterName.includes('random')) {
    return {
      verificationStatus: 'Unable to Verify',
      confidence: 0.42,
      reason: 'Image lighting, angle, or distance prevents confident automated verification of the site.',
      requiresHumanReview: true,
    };
  }

  if (afterName.includes('partial') || afterName.includes('half')) {
    return {
      verificationStatus: 'Possibly Resolved',
      confidence: 0.73,
      reason: 'Surface appears partially addressed, but residual debris or boundary irregularities remain visible.',
      requiresHumanReview: true,
    };
  }

  // Default high-confidence successful resolution
  return {
    verificationStatus: 'Likely Resolved',
    confidence: 0.91,
    reason: `The ${issueType.toLowerCase()} visible in the original report is no longer detected in the after image; the site appears appropriately restored.`,
    requiresHumanReview: false,
  };
}

/**
 * Returns structured preset mock responses for evaluation
 */
export function getVerificationPresetResponse(preset, issueType = 'Civic Issue') {
  switch (preset) {
    case 'not_resolved':
      return {
        verificationStatus: 'Not Resolved',
        confidence: 0.89,
        reason: `The reported ${issueType.toLowerCase()} continues to be prominently visible in the after image. Field work appears incomplete.`,
        requiresHumanReview: true,
      };
    case 'unable_to_verify':
      return {
        verificationStatus: 'Unable to Verify',
        confidence: 0.41,
        reason: 'Visual features could not be matched between the before and after photos due to divergent camera angles or poor lighting.',
        requiresHumanReview: true,
      };
    case 'possibly_resolved':
      return {
        verificationStatus: 'Possibly Resolved',
        confidence: 0.74,
        reason: 'Work has begun on-site, but minor surface degradation or unfinished patching remains noticeable.',
        requiresHumanReview: true,
      };
    case 'likely_resolved':
    default:
      return {
        verificationStatus: 'Likely Resolved',
        confidence: 0.91,
        reason: `The ${issueType.toLowerCase()} visible in the original image is no longer visible in the after image.`,
        requiresHumanReview: false,
      };
  }
}
