import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
    }

    // For now, verify with Supabase JWT secret
    // In production, you might want to verify against Supabase directly
    const secret = process.env.SUPABASE_JWT_SECRET;

    if (!secret) {
      console.error('SUPABASE_JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
      });
    }

    try {
      const decoded = jwt.verify(token, secret) as any;
      req.user = decoded;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
}

export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      const secret = process.env.SUPABASE_JWT_SECRET;
      if (secret) {
        try {
          const decoded = jwt.verify(token, secret) as any;
          req.user = decoded;
        } catch (e) {
          // Silently fail - user just won't be authenticated
        }
      }
    }

    next();
  } catch (error) {
    // Continue without auth
    next();
  }
}
