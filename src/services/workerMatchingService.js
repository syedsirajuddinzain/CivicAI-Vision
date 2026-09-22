/**
 * CivicAI - Intelligent Worker Recommendation Service
 * 
 * Scores and recommends suitable field workers for a civic issue ticket based on:
 * - Same Department (+40)
 * - Same Ward (+30)
 * - Matching Skill (+20)
 * - Worker Availability (+10)
 * - Distance / Proximity (up to +10)
 */

import { getWorkers } from './workerService.js';

/**
 * Calculates distance in kilometers between two GPS coordinates
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Checks if a worker's skills match the issue type
 */
function checkSkillMatch(skills = [], issueType = '') {
  const normalizedType = issueType.toLowerCase();
  return skills.some((skill) => {
    const s = skill.toLowerCase();
    if (normalizedType.includes('pothole') && (s.includes('pothole') || s.includes('asphalt') || s.includes('road'))) return true;
    if (normalizedType.includes('light') && (s.includes('light') || s.includes('cable') || s.includes('voltage'))) return true;
    if (normalizedType.includes('drain') && (s.includes('drain') || s.includes('sewer') || s.includes('pump') || s.includes('desilting'))) return true;
    if (normalizedType.includes('garbage') && (s.includes('waste') || s.includes('dumpster') || s.includes('sweeping') || s.includes('clearance'))) return true;
    if (normalizedType.includes('other') && (s.includes('civic') || s.includes('general') || s.includes('public'))) return true;
    return false;
  });
}

/**
 * Recommends workers for a specific ticket.
 * 
 * @param {Object} ticket
 * @returns {{ recommendations: Array, allDepartmentWorkers: Array, hasAvailable: boolean }}
 */
export function getRecommendedWorkers(ticket) {
  const allWorkers = getWorkers();
  const ticketDept = ticket.department || 'General Municipal Department';
  const ticketWard = ticket.ward;
  const ticketLat = ticket.latitude;
  const ticketLng = ticket.longitude;
  const ticketIssue = ticket.issueType;

  // Filter strictly by same department
  const departmentWorkers = allWorkers.filter((w) => w.department === ticketDept);

  // If no workers in this department (rare), fallback to all workers
  const candidatePool = departmentWorkers.length > 0 ? departmentWorkers : allWorkers;

  const scoredWorkers = candidatePool.map((worker) => {
    let score = 0;
    const scoreBreakdown = [];

    // 1. Same Department (+40)
    if (worker.department === ticketDept) {
      score += 40;
      scoreBreakdown.push('Same Department (+40)');
    }

    // 2. Same Ward (+30)
    if (worker.ward === ticketWard) {
      score += 30;
      scoreBreakdown.push('Same Ward (+30)');
    }

    // 3. Matching Skill (+20)
    const hasSkill = checkSkillMatch(worker.skills, ticketIssue);
    if (hasSkill) {
      score += 20;
      scoreBreakdown.push('Relevant Skill (+20)');
    }

    // 4. Availability (+10)
    const isAvailable = worker.status === 'Available';
    if (isAvailable) {
      score += 10;
      scoreBreakdown.push('Available (+10)');
    }

    // 5. Distance Proximity
    const distanceKm = calculateDistanceKm(
      ticketLat,
      ticketLng,
      worker.currentLocation?.latitude,
      worker.currentLocation?.longitude
    );

    if (distanceKm !== null) {
      if (distanceKm < 3.0) {
        score += 10;
        scoreBreakdown.push(`< 3km Away (+10)`);
      } else if (distanceKm < 6.0) {
        score += 5;
        scoreBreakdown.push(`< 6km Away (+5)`);
      }
    }

    return {
      ...worker,
      matchScore: score,
      scoreBreakdown,
      distanceKm: distanceKm !== null ? `${distanceKm} km away` : 'Distance unknown',
      rawDistanceKm: distanceKm !== null ? distanceKm : 999,
      isAvailable,
    };
  });

  // Sort available workers first, then by match score
  const availableWorkers = scoredWorkers
    .filter((w) => w.isAvailable)
    .sort((a, b) => b.matchScore - a.matchScore);

  const allSorted = [...scoredWorkers].sort((a, b) => b.matchScore - a.matchScore);

  return {
    recommendations: availableWorkers.slice(0, 3),
    allDepartmentWorkers: allSorted,
    hasAvailable: availableWorkers.length > 0,
  };
}
