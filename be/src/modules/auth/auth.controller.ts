import { Request, Response } from 'express';
import { authService } from './auth.service';
import { successResponse, errorResponse } from '../../utils/response';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return errorResponse(res, 'Email and password are required fields.', 400);
      }

      const result = await authService.register({ email, password });
      return successResponse(res, result, 'User registered successfully.', 201);
    } catch (err) {
      console.error('Registration error:', err);
      const message = err instanceof Error ? err.message : 'Failed to register user.';
      return errorResponse(res, message, 400);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return errorResponse(res, 'Email and password are required fields.', 400);
      }

      const result = await authService.login({ email, password });
      return successResponse(res, result, 'User logged in successfully.', 200);
    } catch (err) {
      console.error('Login error:', err);
      const message = err instanceof Error ? err.message : 'Invalid credentials.';
      return errorResponse(res, message, 401);
    }
  }
}
export const authController = new AuthController();
