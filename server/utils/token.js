import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'civic_ai_super_secret_jwt_key_2026_production';

export function generateToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
