import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export function sendResponse<T>(
  res: Response,
  code: number,
  success: boolean,
  message: string,
  data: T | null = null
): Response {
  const responsePayload: ApiResponse<T | null> = {
    success,
    code,
    message,
    data,
  };
  return res.status(code).json(responsePayload);
}

export function successResponse<T>(
  res: Response,
  data: T,
  message = 'Success',
  code = 200
): Response {
  return sendResponse(res, code, true, message, data);
}

export function errorResponse(
  res: Response,
  message: string,
  code = 400
): Response {
  return sendResponse(res, code, false, message, null);
}
