import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../../utils/response";
import { JWTPayload } from "./auth.types";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Extract token from HttpOnly cookies, with fallback to Bearer header
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return errorResponse(
      res,
      "Access denied. Missing session cookie or authorization token.",
      401,
    );
  }

  try {
    const secret =
      process.env.JWT_SECRET || "super_secret_jwt_key_task_manager_123";
    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;
    return next();
  } catch (err) {
    return errorResponse(res, "Access denied. Invalid or expired token.", 401);
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return errorResponse(
      res,
      "Forbidden. This resource requires administrator privileges.",
      403,
    );
  }
  return next();
};
