import Worker from '../models/Worker.js';
import Ticket from '../models/Ticket.js';

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 5.0; // fallback avg 5km
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

export async function getRecommendedWorkers(ticketId) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new Error('Ticket not found for worker recommendation');
  }

  const workers = await Worker.find({ active: true });
  const workerList = Array.isArray(workers) ? workers : [];

  const scoredWorkers = workerList.map((worker) => {
    let score = 0;
    const matchReasons = [];

    // 1. Department Match (+40 points)
    const deptMatch =
      worker.departmentId === ticket.departmentId ||
      (worker.departmentName &&
        ticket.departmentName &&
        worker.departmentName.toLowerCase() === ticket.departmentName.toLowerCase());

    if (deptMatch) {
      score += 40;
      matchReasons.push('Department match');
    }

    // 2. Ward Match (+25 points)
    const wardMatch =
      worker.wardId === ticket.wardId ||
      (worker.wardName &&
        ticket.wardName &&
        worker.wardName.toLowerCase() === ticket.wardName.toLowerCase());

    if (wardMatch) {
      score += 25;
      matchReasons.push('Local ward specialist');
    }

    // 3. Skills Match (+20 points)
    const issueLower = (ticket.issueType || '').toLowerCase();
    const skills = worker.skills || [];
    const hasSkillMatch = skills.some((skill) => {
      const s = skill.toLowerCase();
      if (issueLower.includes('pothole') && (s.includes('road') || s.includes('pothole') || s.includes('asphalt'))) return true;
      if (issueLower.includes('streetlight') && (s.includes('electrical') || s.includes('lamp') || s.includes('lighting'))) return true;
      if (issueLower.includes('drainage') && (s.includes('drainage') || s.includes('water') || s.includes('pipe'))) return true;
      if (issueLower.includes('garbage') && (s.includes('sanitation') || s.includes('waste') || s.includes('garbage'))) return true;
      return false;
    });

    if (hasSkillMatch) {
      score += 20;
      matchReasons.push('Skill competency match');
    }

    // 4. Availability Status (+15 for Available, +5 for Assigned)
    if (worker.availabilityStatus === 'Available') {
      score += 15;
      matchReasons.push('Immediately available');
    } else if (worker.availabilityStatus === 'Assigned') {
      score += 5;
    } else if (worker.availabilityStatus === 'Offline') {
      score -= 50;
    }

    // 5. Distance Proximity
    let distanceKm = 3.5;
    if (worker.currentLocation?.latitude && ticket.latitude) {
      distanceKm = calculateDistance(
        ticket.latitude,
        ticket.longitude,
        worker.currentLocation.latitude,
        worker.currentLocation.longitude
      );
    }

    if (distanceKm < 2.0) {
      score += 10;
      matchReasons.push(`Nearby (${distanceKm} km)`);
    } else if (distanceKm < 5.0) {
      score += 5;
    }

    const matchPercentage = Math.min(100, Math.max(10, score));

    return {
      workerId: String(worker._id),
      name: worker.name,
      phone: worker.phone,
      departmentId: worker.departmentId,
      departmentName: worker.departmentName,
      wardId: worker.wardId,
      wardName: worker.wardName,
      skills: worker.skills,
      availabilityStatus: worker.availabilityStatus,
      distanceKm,
      score: matchPercentage,
      matchReasons,
    };
  });

  // Sort by score descending
  scoredWorkers.sort((a, b) => b.score - a.score);
  return scoredWorkers;
}
