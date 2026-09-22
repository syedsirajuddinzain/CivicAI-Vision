/**
 * CivicAI - Unified Routing Service
 * 
 * Orchestrates issue category mapping and ward assignment.
 * Implements safety checks to prevent erroneous automatic routing
 * when confidence is low or issue type is unknown.
 */

import { getDepartmentForIssue, getDepartmentMetadata } from '../config/departmentRouting.js';
import { determineWardByLocation } from './locationRouting.js';

export const MINIMUM_CONFIDENCE_THRESHOLD = 0.60;

/**
 * Evaluates report attributes and determines department and ward routing.
 * 
 * @param {Object} params
 * @param {string} params.issueType
 * @param {number|null} params.confidence
 * @param {number|null} params.latitude
 * @param {number|null} params.longitude
 * @param {boolean} [params.isManualSelection]
 * @returns {Object} Routing decision
 */
export function determineRouting({
  issueType,
  confidence = 1.0,
  latitude = null,
  longitude = null,
  isManualSelection = false,
}) {
  const isUnknown = !issueType || issueType === 'Other / Unknown';
  const isLowConfidence = confidence !== null && confidence < MINIMUM_CONFIDENCE_THRESHOLD;

  const needsManualReview = !isManualSelection && (isUnknown || isLowConfidence);

  const department = getDepartmentForIssue(issueType);
  const departmentMeta = getDepartmentMetadata(department);
  const wardResult = determineWardByLocation(latitude, longitude);

  let routingNote = 'Automated AI Department & Ward Match';
  if (isManualSelection) {
    routingNote = 'Citizen Verified Category Match';
  } else if (needsManualReview) {
    routingNote = 'Needs manual category verification due to low confidence/unknown issue';
  }

  return {
    department,
    departmentCode: departmentMeta.code,
    departmentDescription: departmentMeta.description,
    expectedSlaHours: departmentMeta.expectedSlaHours,
    ward: wardResult.wardId,
    wardName: wardResult.wardName,
    zone: wardResult.zone,
    distanceToWardCenterKm: wardResult.distanceKm,
    isLocationFallback: wardResult.isFallback,
    isConfident: !needsManualReview,
    needsManualReview,
    routingNote,
  };
}
