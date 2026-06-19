import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/response";
import { userService } from "./user.service";

export class UserController {
  async getMe(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return errorResponse(res, "Unauthorized user context.", 401);
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        return errorResponse(res, "User profile not found.", 404);
      }

      // Return user without password_hash
      const { password_hash, ...profile } = user;
      return successResponse(
        res,
        { user: profile },
        "User profile retrieved successfully.",
        200,
      );
    } catch (err) {
      console.error("Error fetching user profile:", err);
      const message =
        err instanceof Error ? err.message : "Internal server error.";
      return errorResponse(res, message, 500);
    }
  }
}
export const userController = new UserController();
