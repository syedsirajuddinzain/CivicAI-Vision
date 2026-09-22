/**
 * CivicAI - Department Routing Configuration
 * 
 * Maps civic issue categories directly to responsible municipal departments.
 */

export const DEPARTMENT_ROUTING_MAP = {
  'Pothole / Road Damage': 'Roads & Infrastructure Department',
  'Streetlight / Electrical Issue': 'Electrical Department',
  'Drainage / Wastewater Issue': 'Water & Drainage Department',
  'Garbage / Sanitation Issue': 'Sanitation Department',
  'Other / Unknown': 'General Municipal Department',
};

export const DEPARTMENT_METADATA = {
  'Roads & Infrastructure Department': {
    code: 'RID',
    description: 'Maintains city asphalt, bridges, road medians, and pothole patching.',
    expectedSlaHours: 48,
    contact: 'roads-dispatch@citygov.org',
  },
  'Electrical Department': {
    code: 'ELD',
    description: 'Manages street lighting fixtures, grid cables, and public electrical units.',
    expectedSlaHours: 24,
    contact: 'electrical-ops@citygov.org',
  },
  'Water & Drainage Department': {
    code: 'WDD',
    description: 'Resolves sewage backflow, storm water drains, and flood clearing.',
    expectedSlaHours: 24,
    contact: 'drainage-rapid@citygov.org',
  },
  'Sanitation Department': {
    code: 'SND',
    description: 'Handles municipal garbage pickup, street cleaning, and dumpster clearance.',
    expectedSlaHours: 12,
    contact: 'sanitation-desk@citygov.org',
  },
  'General Municipal Department': {
    code: 'GMD',
    description: 'Triage and investigation unit for uncategorized public works issues.',
    expectedSlaHours: 72,
    contact: 'municipal-triage@citygov.org',
  },
};

/**
 * Pure function to retrieve department for a given issue type
 * @param {string} issueType
 * @returns {string} Assigned department name
 */
export function getDepartmentForIssue(issueType) {
  if (!issueType) {
    return DEPARTMENT_ROUTING_MAP['Other / Unknown'];
  }
  return DEPARTMENT_ROUTING_MAP[issueType] || DEPARTMENT_ROUTING_MAP['Other / Unknown'];
}

/**
 * Retrieve metadata for a department
 * @param {string} departmentName
 */
export function getDepartmentMetadata(departmentName) {
  return DEPARTMENT_METADATA[departmentName] || DEPARTMENT_METADATA['General Municipal Department'];
}
