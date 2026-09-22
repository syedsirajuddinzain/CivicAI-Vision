import Worker from '../models/Worker.js';
import User from '../models/User.js';
import WorkerRequest from '../models/WorkerRequest.js';
import Notification from '../models/Notification.js';
import { getRecommendedWorkers } from '../services/workerRecommendationService.js';

export const DEFAULT_WORKERS = [
  {
    _id: 'WRK-101',
    workerId: 'WRK-101',
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
  {
    _id: 'WRK-106',
    workerId: 'WRK-106',
    name: 'Ramesh Kumar',
    phone: '+91 98765 43215',
    departmentId: 'dept_roads',
    departmentName: 'Roads & Infrastructure Department',
    wardId: 'ward_101',
    wardName: 'Ward 101 — Central Business District',
    skills: ['Pothole Repair', 'Heavy Machinery', 'Asphalt Patching'],
    availabilityStatus: 'Available',
    currentLocation: { latitude: 12.9716, longitude: 77.5946 },
    active: true,
  },
];

export async function getWorkers(req, res) {
  try {
    const { departmentId, wardId, status } = req.query;
    let count = await Worker.countDocuments({ active: true });
    if (count === 0) {
      await Worker.insertMany(DEFAULT_WORKERS);
    }

    const filter = { active: true };

    if (req.user?.role === 'authority' && req.user.departmentId && req.user.departmentId !== 'all') {
      filter.departmentId = req.user.departmentId;
    } else if (departmentId) {
      filter.departmentId = departmentId;
    }

    if (wardId) filter.wardId = wardId;
    if (status) filter.availabilityStatus = status;

    let workers = await Worker.find(filter);
    let workerList = Array.isArray(workers) ? workers : [];

    // Fallback to all workers if department-specific returned empty
    if (workerList.length === 0) {
      workers = await Worker.find({ active: true });
      workerList = Array.isArray(workers) ? workers : [];
    }

    return res.status(200).json({
      success: true,
      data: workerList,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getWorkerById(req, res) {
  try {
    const id = req.params.id;
    let worker = await Worker.findById(id);
    if (!worker) {
      worker = await Worker.findOne({ workerId: id });
    }
    if (!worker) {
      worker = await Worker.findOne({ _id: id });
    }
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    return res.status(200).json({
      success: true,
      data: worker,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createWorker(req, res) {
  try {
    const { name, email, password, phone, departmentId, departmentName, wardId, wardName, skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const targetDeptId = departmentId || req.user?.departmentId || 'dept_roads';
    const targetDeptName = departmentName || req.user?.department || 'Roads & Infrastructure Department';
    const targetWardId = wardId || 'ward_101';
    const targetWardName = wardName || 'Ward 101 — Central Business District';

    const randId = Math.floor(100 + Math.random() * 900);
    const workerId = `WRK-${randId}`;

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone || '',
      role: 'worker',
      departmentId: targetDeptId,
      department: targetDeptName,
      wardId: targetWardId,
      ward: targetWardName,
      workerId,
      status: 'active',
      approvedBy: req.user?.name || 'Authority',
      approvedAt: new Date(),
    });

    const newWorker = await Worker.create({
      userId: newUser._id,
      workerId,
      name: newUser.name,
      phone: newUser.phone,
      departmentId: targetDeptId,
      departmentName: targetDeptName,
      wardId: targetWardId,
      wardName: targetWardName,
      skills: Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map(s => s.trim()) : ['General Maintenance']),
      availabilityStatus: 'Available',
      active: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Worker added successfully',
      data: newWorker,
    });
  } catch (err) {
    console.error('Create worker error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function removeWorker(req, res) {
  try {
    const { id } = req.params;

    const worker = await Worker.findById(id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Check department authority authorization
    if (req.user?.role === 'authority' && req.user.departmentId && req.user.departmentId !== 'all') {
      if (worker.departmentId !== req.user.departmentId) {
        return res.status(403).json({ success: false, message: 'You can only remove workers in your own department' });
      }
    }

    await Worker.findByIdAndDelete(worker._id || id);

    if (worker.userId) {
      await User.findByIdAndUpdate(worker.userId, { status: 'rejected' });
    }

    return res.status(200).json({
      success: true,
      message: `Worker ${worker.name} has been removed from active roster`,
    });
  } catch (err) {
    console.error('Remove worker error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getWorkerRequests(req, res) {
  try {
    const filter = { status: 'pending' };

    if (req.user?.role === 'authority' && req.user.departmentId && req.user.departmentId !== 'all') {
      filter.departmentId = req.user.departmentId;
    }

    const requests = await WorkerRequest.find(filter);
    return res.status(200).json({
      success: true,
      data: Array.isArray(requests) ? requests : [],
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function approveWorkerRequest(req, res) {
  try {
    const { id } = req.params;
    const request = await WorkerRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Worker registration request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    const randId = Math.floor(100 + Math.random() * 900);
    const workerId = `WRK-${randId}`;

    // Update request
    const updatedRequest = await WorkerRequest.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        reviewedBy: req.user?.name || 'Authority',
        reviewedAt: new Date(),
      },
      { new: true }
    );

    // Update user account to active
    if (request.userId) {
      await User.findByIdAndUpdate(request.userId, {
        status: 'active',
        workerId,
        approvedBy: req.user?.name || 'Authority',
        approvedAt: new Date(),
      });
    }

    // Create active Worker record in Worker collection
    const newWorker = await Worker.create({
      userId: request.userId,
      workerId,
      name: request.name,
      phone: request.phone,
      departmentId: request.departmentId,
      departmentName: request.departmentName,
      wardId: request.wardId,
      wardName: request.wardName,
      skills: request.skills || ['General Maintenance'],
      availabilityStatus: 'Available',
      active: true,
    });

    // Notify worker
    if (request.userId) {
      await Notification.create({
        userId: String(request.userId),
        ticketId: 'SYS-AUTH',
        title: 'Worker Registration Approved',
        message: `Congratulations ${request.name}! Your request to join the ${request.departmentName} has been approved by ${req.user?.name || 'Authority'}. You can now access your Worker Task Dashboard.`,
        type: 'info',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Worker registration for ${request.name} approved successfully!`,
      data: newWorker,
    });
  } catch (err) {
    console.error('Approve worker error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function rejectWorkerRequest(req, res) {
  try {
    const { id } = req.params;
    const request = await WorkerRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Worker registration request not found' });
    }

    const updatedRequest = await WorkerRequest.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        reviewedBy: req.user?.name || 'Authority',
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (request.userId) {
      await User.findByIdAndUpdate(request.userId, {
        status: 'rejected',
      });

      await Notification.create({
        userId: String(request.userId),
        ticketId: 'SYS-AUTH',
        title: 'Worker Registration Rejected',
        message: `Your worker registration request for ${request.departmentName} was not approved at this time.`,
        type: 'alert',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Worker registration for ${request.name} has been rejected.`,
      data: updatedRequest,
    });
  } catch (err) {
    console.error('Reject worker error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getRecommended(req, res) {
  try {
    const { ticketId } = req.params;
    const recommended = await getRecommendedWorkers(ticketId);
    return res.status(200).json({
      success: true,
      data: recommended,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}
