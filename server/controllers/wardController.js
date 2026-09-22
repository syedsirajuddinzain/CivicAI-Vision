import Ward from '../models/Ward.js';

export async function getWards(req, res) {
  try {
    const wards = await Ward.find({ active: true });
    return res.status(200).json({
      success: true,
      data: wards,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
