import User from '../models/User.js';
import Worker from '../models/Worker.js';
import WorkerRequest from '../models/WorkerRequest.js';
import { generateToken } from '../utils/token.js';

export async function register(req, res) {
  try {
    const { name, email, password, phone, role, departmentId, department, wardId, ward, skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const userRole = role || 'citizen';
    const isWorker = userRole === 'worker';
    const initialStatus = isWorker ? 'pending_approval' : 'active';

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : '',
      role: userRole,
      departmentId: departmentId || (department ? department.toLowerCase().replace(/\s+/g, '_') : null),
      department: department || null,
      wardId: wardId || 'ward_101',
      ward: ward || 'Ward 101 — Central Business District',
      status: initialStatus,
    });

    if (isWorker) {
      // Create pending worker request record for relevant authority review
      await WorkerRequest.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        departmentId: user.departmentId || 'dept_roads',
        departmentName: user.department || 'Roads & Infrastructure Department',
        wardId: user.wardId || 'ward_101',
        wardName: user.ward || 'Ward 101 — Central Business District',
        skills: Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map(s => s.trim()) : ['General Maintenance']),
        status: 'pending',
      });

      return res.status(201).json({
        success: true,
        pendingApproval: true,
        message: 'Worker registration submitted successfully! Your account will be active once reviewed and approved by the department authority.',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          department: user.department,
        },
      });
    }

    const token = generateToken({ id: String(user._id), role: user.role });

    return res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        department: user.department,
        wardId: user.wardId,
        ward: user.ward,
        status: user.status,
        token,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await User.matchPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Worker Approval Check
    if (user.role === 'worker') {
      if (user.status === 'pending_approval') {
        return res.status(403).json({
          success: false,
          code: 'WORKER_PENDING_APPROVAL',
          message: 'Your worker account is currently pending approval by the municipal authority. Please wait for an official to approve your registration.',
        });
      }
      if (user.status === 'rejected') {
        return res.status(403).json({
          success: false,
          code: 'WORKER_REJECTED',
          message: 'Your worker registration request was rejected by the municipal authority. Please contact your department supervisor.',
        });
      }
    }

    const token = generateToken({ id: String(user._id), role: user.role });

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        departmentId: user.departmentId,
        department: user.department,
        wardId: user.wardId,
        ward: user.ward,
        workerId: user.workerId || String(user._id),
        status: user.status || 'active',
        token,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
