import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/response";
import { authService } from "./auth.service";

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return errorResponse(
          res,
          "Username and password are required fields.",
          400,
        );
      }

      const result = await authService.register({ username, password });

      // Set token as secure, HttpOnly cookie
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return successResponse(
        res,
        { user: result.user },
        "User registered successfully.",
        201,
      );
    } catch (err) {
      console.error("Registration error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to register user.";
      return errorResponse(res, message, 400);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return errorResponse(
          res,
          "Username and password are required fields.",
          400,
        );
      }

      const result = await authService.login({ username, password });

      // Set token as secure, HttpOnly cookie
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return successResponse(
        res,
        { user: result.user },
        "User logged in successfully.",
        200,
      );
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err instanceof Error ? err.message : "Invalid credentials.";
      return errorResponse(res, message, 401);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return successResponse(res, null, "Logged out successfully.", 200);
    } catch (err) {
      console.error("Logout error:", err);
      return errorResponse(res, "Failed to log out.", 500);
    }
  }
}
export const authController = new AuthController();
