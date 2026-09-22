/**
 * CivicAI - Location-Based Ward Routing Service
 * 
 * Uses GPS coordinates (latitude, longitude) to identify the closest municipal ward.
 * NOTE: For this MVP, proximity is determined via great-circle distance (Haversine formula)
 * relative to mock municipal ward centers. Real shapefile boundary/GIS polygon lookups
 * can be plugged in here in future steps.
 */

import { MOCK_WARDS, DEFAULT_FALLBACK_WARD } from '../config/wards.js';

/**
 * Calculates great-circle distance between two points in kilometers (Haversine formula)
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Determines the assigned municipal ward based on coordinates.
 * 
 * @param {number|null} latitude 
 * @param {number|null} longitude 
 * @returns {{ wardId: string, wardName: string, zone: string, distanceKm: number|null, isFallback: boolean }}
 */
export function determineWardByLocation(latitude, longitude) {
  if (latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) {
    return {
      wardId: DEFAULT_FALLBACK_WARD.id,
      wardName: DEFAULT_FALLBACK_WARD.name,
      zone: DEFAULT_FALLBACK_WARD.zone,
      distanceKm: null,
      isFallback: true,
    };
  }

  let closestWard = null;
  let minDistance = Infinity;

  for (const ward of MOCK_WARDS) {
    const dist = calculateHaversineDistance(
      latitude,
      longitude,
      ward.centerLat,
      ward.centerLng
    );

    if (dist < minDistance) {
      minDistance = dist;
      closestWard = ward;
    }
  }

  return {
    wardId: closestWard ? closestWard.id : DEFAULT_FALLBACK_WARD.id,
    wardName: closestWard ? closestWard.name : DEFAULT_FALLBACK_WARD.name,
    zone: closestWard ? closestWard.zone : DEFAULT_FALLBACK_WARD.zone,
    distanceKm: Number(minDistance.toFixed(2)),
    isFallback: false,
  };
}
