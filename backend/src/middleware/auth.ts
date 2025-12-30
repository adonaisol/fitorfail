import { Request, Response, NextFunction } from 'express';
import { verifyToken, findUserById, UserPublic, toPublicUser } from '../services/authService.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserPublic;
      userId?: number;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT
 * Requires valid Bearer token in Authorization header
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header' });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Invalid authorization format' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Verify token
    const payload = verifyToken(token);

    // Get user from database
    const user = findUserById(payload.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Attach user to request
    req.user = toPublicUser(user);
    req.userId = user.id;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({ error: 'Token expired' });
        return;
      }
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
    }
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if valid token present, but doesn't fail if no token
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    if (!token) {
      next();
      return;
    }

    const payload = verifyToken(token);
    const user = findUserById(payload.userId);

    if (user) {
      req.user = toPublicUser(user);
      req.userId = user.id;
    }

    next();
  } catch {
    // Token invalid, but that's okay for optional auth
    next();
  }
}

export default { authenticate, optionalAuth };
