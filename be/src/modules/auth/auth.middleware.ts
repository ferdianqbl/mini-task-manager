import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from './auth.types';
import { errorResponse } from '../../utils/response';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Access denied. Missing authorization token.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_habit_shaper_123';
    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;
    return next();
  } catch (err) {
    return errorResponse(res, 'Access denied. Invalid or expired token.', 401);
  }
};
