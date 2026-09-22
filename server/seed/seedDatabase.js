import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Ward from '../models/Ward.js';
import Worker from '../models/Worker.js';
import WorkerRequest from '../models/WorkerRequest.js';
import Ticket from '../models/Ticket.js';
import Notification from '../models/Notification.js';

export async function seedDatabase() {
  console.log('[Seed] Connecting to database...');
  await connectDB();

  console.log('[Seed] Cleaning old database records...');
  await User.deleteMany({});
  await Department.deleteMany({});
  await Ward.deleteMany({});
  await Worker.deleteMany({});
  await WorkerRequest.deleteMany({});
  await Ticket.deleteMany({});
  await Notification.deleteMany({});

  console.log('[Seed] Seeding municipal departments...');
  await Department.insertMany([
    {
      _id: 'dept_roads',
      name: 'Roads & Infrastructure Department',
      description: 'Maintains city asphalt roads, bridges, potholes, sidewalks, and civil structures.',
      active: true,
    },
    {
      _id: 'dept_electrical',
      name: 'Electrical Department',
      description: 'Manages municipal streetlights, illumination grids, high-mast lamps, and power poles.',
      active: true,
    },
    {
      _id: 'dept_water',
      name: 'Water & Drainage Department',
      description: 'Oversees municipal storm drains, sewage mains, wastewater culverts, and water logging.',
      active: true,
    },
    {
      _id: 'dept_sanitation',
      name: 'Sanitation Department',
      description: 'Directs municipal solid waste disposal, overflowing dumpsters, and public street cleanliness.',
      active: true,
    },
    {
      _id: 'dept_general',
      name: 'General Municipal Department',
      description: 'Administers public parks, city furniture, civic signboards, and unclassified municipal reports.',
      active: true,
    },
  ]);

  console.log('[Seed] Seeding municipal wards...');
  await Ward.insertMany([
    {
      _id: 'ward_101',
      name: 'Ward 101 — Central Business District',
      code: 'W101',
      centerCoordinates: { latitude: 12.9716, longitude: 77.5946 },
      radiusKm: 4.5,
      active: true,
    },
    {
      _id: 'ward_102',
      name: 'Ward 102 — Indiranagar Civic Zone',
      code: 'W102',
      centerCoordinates: { latitude: 13.01, longitude: 77.605 },
      radiusKm: 5.0,
      active: true,
    },
    {
      _id: 'ward_103',
      name: 'Ward 103 — Koramangala South Basin',
      code: 'W103',
      centerCoordinates: { latitude: 12.93, longitude: 77.58 },
      radiusKm: 4.8,
      active: true,
    },
    {
      _id: 'ward_104',
      name: 'Ward 104 — Whitefield Tech Corridor',
      code: 'W104',
      centerCoordinates: { latitude: 12.98, longitude: 77.67 },
      radiusKm: 6.2,
      active: true,
    },
    {
      _id: 'ward_105',
      name: 'Ward 105 — Jayanagar Heritage Sector',
      code: 'W105',
      centerCoordinates: { latitude: 12.955, longitude: 77.52 },
      radiusKm: 5.5,
      active: true,
    },
  ]);

  console.log('[Seed] Seeding authenticated system users...');
  const citizen = await User.create({
    _id: 'user_citizen_01',
    name: 'Aarav Patel',
    email: 'citizen@civicai.gov',
    password: 'password123',
    phone: '+91 98765 00001',
    role: 'citizen',
    status: 'active',
  });

  await User.create({
    _id: 'user_citizen_02',
    name: 'Pooja Sharma',
    email: 'citizen@civicai.org',
    password: 'password123',
    phone: '+91 98765 00008',
    role: 'citizen',
    status: 'active',
  });

  const generalAuthority = await User.create({
    _id: 'user_authority_01',
    name: 'Commissioner Meera Sen',
    email: 'authority@civicai.gov',
    password: 'password123',
    phone: '+91 98765 00002',
    role: 'authority',
    departmentId: 'all',
    department: 'Municipal Operations Headquarters',
    status: 'active',
  });

  const roadAuthority = await User.create({
    _id: 'user_authority_roads',
    name: 'Superintendent Vikram Joshi',
    email: 'road.authority@civicai.gov',
    password: 'password123',
    phone: '+91 98765 00003',
    role: 'authority',
    departmentId: 'dept_roads',
    department: 'Roads & Infrastructure Department',
    status: 'active',
  });

  const electricalAuthority = await User.create({
    _id: 'user_authority_electrical',
    name: 'Chief Inspector Rajesh Sharma',
    email: 'electrical.authority@civicai.gov',
    password: 'password123',
    phone: '+91 98765 00004',
    role: 'authority',
    departmentId: 'dept_electrical',
    department: 'Electrical Department',
    status: 'active',
  });

  const waterAuthority = await User.create({
    _id: 'user_authority_water',
    name: 'Executive Engineer Suresh Patil',
    email: 'water.authority@civicai.gov',
    password: 'password123',
    phone: '+91 98765 00005',
    role: 'authority',
    departmentId: 'dept_water',
    department: 'Water & Drainage Department',
    status: 'active',
  });

  const sanitationAuthority = await User.create({
    _id: 'user_authority_sanitation',
    name: 'Director Priya Menon',
    email: 'sanitation.authority@civicai.gov',
    password: 'password123',
    phone: '+91 98765 00006',
    role: 'authority',
    departmentId: 'dept_sanitation',
    department: 'Sanitation Department',
    status: 'active',
  });

  const genericGeneralAuthority = await User.create({
    _id: 'user_authority_general',
    name: 'Officer Anil Deshmukh',
    email: 'general.authority@civicai.gov',
    password: 'password123',
    phone: '+91 98765 00007',
    role: 'authority',
    departmentId: 'dept_general',
    department: 'General Municipal Department',
    status: 'active',
  });

  const sampleWorker = await User.create({
    _id: 'user_worker_01',
    name: 'Kavita Sharma',
    email: 'worker@civicai.gov',
    password: 'password123',
    phone: '+91 98765 43210',
    role: 'worker',
    departmentId: 'dept_roads',
    department: 'Roads & Infrastructure Department',
    wardId: 'ward_101',
    ward: 'Ward 101 — Central Business District',
    workerId: 'WRK-101',
    status: 'active',
  });

  await User.create({
    _id: 'user_worker_02',
    name: 'Anita Desai',
    email: 'anita.worker@civicai.gov',
    password: 'password123',
    phone: '+91 98765 43216',
    role: 'worker',
    departmentId: 'dept_electrical',
    department: 'Electrical Department',
    wardId: 'ward_102',
    ward: 'Ward 102 — Indiranagar Civic Zone',
    workerId: 'WRK-102',
    status: 'active',
  });

  await User.create({
    _id: 'user_worker_03',
    name: 'Suresh Patil',
    email: 'suresh.worker@civicai.gov',
    password: 'password123',
    phone: '+91 98765 43212',
    role: 'worker',
    departmentId: 'dept_water',
    department: 'Water & Drainage Department',
    wardId: 'ward_103',
    ward: 'Ward 103 — Koramangala South Basin',
    workerId: 'WRK-103',
    status: 'active',
  });

  await User.create({
    _id: 'user_worker_04',
    name: 'Manjunath Gowda',
    email: 'manjunath.worker@civicai.gov',
    password: 'password123',
    phone: '+91 98765 43213',
    role: 'worker',
    departmentId: 'dept_sanitation',
    department: 'Sanitation Department',
    wardId: 'ward_104',
    ward: 'Ward 104 — Whitefield Tech Corridor',
    workerId: 'WRK-104',
    status: 'active',
  });

  await User.create({
    _id: 'user_worker_05',
    name: 'Rajesh Varma',
    email: 'rajesh.worker@civicai.gov',
    password: 'password123',
    phone: '+91 98765 43214',
    role: 'worker',
    departmentId: 'dept_general',
    department: 'General Municipal Department',
    wardId: 'ward_105',
    ward: 'Ward 105 — Jayanagar Heritage Sector',
    workerId: 'WRK-105',
    status: 'active',
  });

  await User.create({
    _id: 'user_worker_06',
    name: 'Ramesh Kumar',
    email: 'ramesh.worker@civicai.gov',
    password: 'password123',
    phone: '+91 98765 43215',
    role: 'worker',
    departmentId: 'dept_roads',
    department: 'Roads & Infrastructure Department',
    wardId: 'ward_101',
    ward: 'Ward 101 — Central Business District',
    workerId: 'WRK-101',
    status: 'active',
  });

  console.log('[Seed] Seeding municipal field workers...');
  await Worker.insertMany([
    {
      _id: 'WRK-101',
      workerId: 'WRK-101',
      userId: sampleWorker._id,
      name: 'Kavita Sharma',
      phone: '+91 98765 43210',
      departmentId: 'dept_roads',
      departmentName: 'Roads & Infrastructure Department',
      wardId: 'ward_101',
      wardName: 'Ward 101 — Central Business District',
      skills: ['Pothole Repair', 'Asphalt Laying', 'Road Maintenance'],
      availabilityStatus: 'Available',
      currentLocation: { latitude: 12.9716, longitude: 77.5946 },
      active: true,
    },
    {
      _id: 'WRK-102',
      workerId: 'WRK-102',
      name: 'Anita Desai',
      phone: '+91 98765 43216',
      departmentId: 'dept_electrical',
      departmentName: 'Electrical Department',
      wardId: 'ward_102',
      wardName: 'Ward 102 — Indiranagar Civic Zone',
      skills: ['Streetlight Maintenance', 'Wiring', 'Transformer Inspection'],
      availabilityStatus: 'Available',
      currentLocation: { latitude: 13.0105, longitude: 77.6055 },
      active: true,
    },
    {
      _id: 'WRK-103',
      workerId: 'WRK-103',
      name: 'Suresh Patil',
      phone: '+91 98765 43212',
      departmentId: 'dept_water',
      departmentName: 'Water & Drainage Department',
      wardId: 'ward_103',
      wardName: 'Ward 103 — Koramangala South Basin',
      skills: ['Storm Drainage', 'Culvert Jetting', 'Wastewater'],
      availabilityStatus: 'Available',
      currentLocation: { latitude: 12.9305, longitude: 77.581 },
      active: true,
    },
    {
      _id: 'WRK-104',
      workerId: 'WRK-104',
      name: 'Manjunath Gowda',
      phone: '+91 98765 43213',
      departmentId: 'dept_sanitation',
      departmentName: 'Sanitation Department',
      wardId: 'ward_104',
      wardName: 'Ward 104 — Whitefield Tech Corridor',
      skills: ['Solid Waste Disposal', 'Dumpster Clearance', 'Street Sanitization'],
      availabilityStatus: 'Available',
      currentLocation: { latitude: 12.981, longitude: 77.671 },
      active: true,
    },
    {
      _id: 'WRK-105',
      workerId: 'WRK-105',
      name: 'Rajesh Varma',
      phone: '+91 98765 43214',
      departmentId: 'dept_general',
      departmentName: 'General Municipal Department',
      wardId: 'ward_105',
      wardName: 'Ward 105 — Jayanagar Heritage Sector',
      skills: ['Public Works', 'Tree Trimming', 'Park Infrastructure'],
      availabilityStatus: 'Available',
      currentLocation: { latitude: 12.956, longitude: 77.521 },
      active: true,
    },
  ]);

  console.log('[Seed] Seeding sample pending worker registration request...');
  await WorkerRequest.create({
    name: 'Devraj Singh',
    email: 'devraj.worker@civicai.gov',
    phone: '+91 98765 77889',
    departmentId: 'dept_roads',
    departmentName: 'Roads & Infrastructure Department',
    wardId: 'ward_101',
    wardName: 'Ward 101 — Central Business District',
    skills: ['Heavy Machinery', 'Asphalt Patching', 'Masonry'],
    status: 'pending',
  });

  console.log('[Seed] Database seeded successfully!');
}

if (process.argv[1]?.endsWith('seedDatabase.js')) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Seed script completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
