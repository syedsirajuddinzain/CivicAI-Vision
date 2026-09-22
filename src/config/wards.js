/**
 * CivicAI - Municipal Wards Dataset
 * Synchronized with server municipal GIS ward partitions
 */

export const MOCK_WARDS = [
  {
    id: 'ward_101',
    name: 'Ward 101 — Central Business District',
    code: 'W101',
    zone: 'Zone 1 (Central Business District)',
    centerLat: 12.9716,
    centerLng: 77.5946,
    assignedDepartments: [
      'Roads & Infrastructure Department',
      'Electrical Department',
      'Water & Drainage Department',
      'Sanitation Department',
      'General Municipal Department',
    ],
    supervisor: 'Officer R. Verma',
  },
  {
    id: 'ward_102',
    name: 'Ward 102 — Indiranagar Civic Zone',
    code: 'W102',
    zone: 'Zone 2 (Indiranagar / East)',
    centerLat: 13.0100,
    centerLng: 77.6050,
    assignedDepartments: [
      'Roads & Infrastructure Department',
      'Electrical Department',
      'Water & Drainage Department',
      'Sanitation Department',
    ],
    supervisor: 'Officer S. Mehta',
  },
  {
    id: 'ward_103',
    name: 'Ward 103 — Koramangala South Basin',
    code: 'W103',
    zone: 'Zone 3 (Koramangala / South)',
    centerLat: 12.9300,
    centerLng: 77.5800,
    assignedDepartments: [
      'Roads & Infrastructure Department',
      'Electrical Department',
      'Water & Drainage Department',
      'Sanitation Department',
    ],
    supervisor: 'Officer A. Patil',
  },
  {
    id: 'ward_104',
    name: 'Ward 104 — Whitefield Tech Corridor',
    code: 'W104',
    zone: 'Zone 4 (Whitefield / Tech Park)',
    centerLat: 12.9800,
    centerLng: 77.6700,
    assignedDepartments: [
      'Roads & Infrastructure Department',
      'Electrical Department',
      'Water & Drainage Department',
      'Sanitation Department',
    ],
    supervisor: 'Officer K. Nair',
  },
  {
    id: 'ward_105',
    name: 'Ward 105 — Jayanagar Heritage Sector',
    code: 'W105',
    zone: 'Zone 5 (Jayanagar / Heritage Belt)',
    centerLat: 12.9550,
    centerLng: 77.5200,
    assignedDepartments: [
      'Roads & Infrastructure Department',
      'Electrical Department',
      'Water & Drainage Department',
      'Sanitation Department',
      'General Municipal Department',
    ],
    supervisor: 'Officer D. Roy',
  },
];

export const DEFAULT_FALLBACK_WARD = MOCK_WARDS[0];
