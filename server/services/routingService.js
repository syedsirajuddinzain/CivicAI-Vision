import Department from '../models/Department.js';

export const DEPARTMENT_ROUTING_MAP = {
  'Road / Pothole': {
    departmentId: 'dept_roads',
    departmentName: 'Roads & Infrastructure Department',
  },
  'Electrical / Streetlight': {
    departmentId: 'dept_electrical',
    departmentName: 'Electrical Department',
  },
  'Garbage / Sanitation': {
    departmentId: 'dept_sanitation',
    departmentName: 'Sanitation Department',
  },
  'Drainage / Wastewater': {
    departmentId: 'dept_water',
    departmentName: 'Water & Drainage Department',
  },
  'Other / Unknown': {
    departmentId: 'dept_general',
    departmentName: 'General Municipal Department',
  },
  // Legacy aliases
  'Pothole / Road Damage': {
    departmentId: 'dept_roads',
    departmentName: 'Roads & Infrastructure Department',
  },
  'Streetlight / Electrical Issue': {
    departmentId: 'dept_electrical',
    departmentName: 'Electrical Department',
  },
  'Drainage / Wastewater Issue': {
    departmentId: 'dept_water',
    departmentName: 'Water & Drainage Department',
  },
  'Garbage / Sanitation Issue': {
    departmentId: 'dept_sanitation',
    departmentName: 'Sanitation Department',
  },
};

/**
 * Determine responsible municipal department for a given issue type
 */
export async function determineDepartment(issueType) {
  const mapped = DEPARTMENT_ROUTING_MAP[issueType] || DEPARTMENT_ROUTING_MAP['Other / Unknown'];

  // Check if department exists in Database
  try {
    const departments = await Department.find();
    const deptList = Array.isArray(departments) ? departments : [];
    const matched = deptList.find(
      (d) => String(d._id) === mapped.departmentId || d.name === mapped.departmentName
    );

    if (matched) {
      return {
        departmentId: String(matched._id),
        departmentName: matched.name,
      };
    }
  } catch (err) {
    console.warn('Could not query Department collection:', err.message);
  }

  return mapped;
}

export default {
  DEPARTMENT_ROUTING_MAP,
  determineDepartment,
};
