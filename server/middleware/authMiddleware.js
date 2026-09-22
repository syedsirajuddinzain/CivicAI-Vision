import { verifyToken } from '../utils/token.js';
import User from '../models/User.js';

/**
 * requireAuth middleware:
 * Verifies Bearer token, fetches user from database, and attaches to req.user.
 * Returns 401 for missing, invalid, or expired tokens.
 */
export async function requireAuth(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Not authorized: Invalid or expired authentication token',
        });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          code: 'USER_NOT_FOUND',
          message: 'Not authorized: User session does not exist',
        });
      }

      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
      return next();
    } catch (error) {
      console.error('Auth protect error:', error);
      return res.status(401).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'Not authorized: Token verification failed',
      });
    }
  }

  return res.status(401).json({
    success: false,
    code: 'NO_TOKEN',
    message: 'Not authorized: No authentication token provided',
  });
}

/**
 * Optional auth middleware:
 * If Bearer token is provided, attaches req.user; otherwise proceeds as anonymous.
 */
export async function optionalAuth(req, res, next) {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.id);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          req.user = userWithoutPassword;
        }
      }
    } catch (e) {
      // Proceed as unauthenticated
    }
  }
  next();
}

/**
 * requireRole middleware:
 * Restricts route access to specified roles (e.g. 'authority', 'worker', 'citizen').
 * Returns 401 if unauthenticated, 403 if role lacks permission.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Not authorized: Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
}

// Backward-compatibility aliases
export const protect = requireAuth;
export const authorize = requireRole;

export default {
  requireAuth,
  requireRole,
  optionalAuth,
  protect,
  authorize,
};
