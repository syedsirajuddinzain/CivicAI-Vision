import Ward from '../models/Ward.js';

/**
 * Calculate distance in kilometers using Haversine formula
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
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
 * Determine municipal ward based on coordinates
 */
export async function determineWard(latitude, longitude) {
  const wards = await Ward.find({ active: true });
  const wardList = Array.isArray(wards) ? wards : [];

  if (wardList.length === 0) {
    return {
      wardId: 'ward_central',
      wardName: 'Central Municipal Zone',
    };
  }

  // If no GPS coordinates provided, default to first ward (e.g. Central)
  if (latitude == null || longitude == null) {
    return {
      wardId: String(wardList[0]._id),
      wardName: wardList[0].name,
    };
  }

  // Calculate nearest ward boundary center
  let nearestWard = wardList[0];
  let minDistance = Infinity;

  for (const ward of wardList) {
    if (ward.centerCoordinates?.latitude && ward.centerCoordinates?.longitude) {
      const distance = calculateHaversineDistance(
        latitude,
        longitude,
        ward.centerCoordinates.latitude,
        ward.centerCoordinates.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestWard = ward;
      }
    }
  }

  return {
    wardId: String(nearestWard._id),
    wardName: nearestWard.name,
    distanceKm: Number(minDistance.toFixed(2)),
  };
}
