import Department from '../models/Department.js';

export async function getDepartments(req, res) {
  try {
    const departments = await Department.find({ active: true });
    return res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
