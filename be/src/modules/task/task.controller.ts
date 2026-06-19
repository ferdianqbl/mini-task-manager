import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/response";
import { taskService } from "./task.service";
import { TaskStatus } from "./task.types";

export class TaskController {
  async list(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;

      const tasks = await taskService.listTasks(userId, role);
      return successResponse(
        res,
        tasks,
        "Tasks list retrieved successfully.",
        200,
      );
    } catch (err) {
      console.error("Error fetching tasks list:", err);
      const message =
        err instanceof Error ? err.message : "Failed to fetch tasks.";
      return errorResponse(res, message, 500);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const username = req.user!.username;
      const { title, description } = req.body;

      if (!title) {
        return errorResponse(res, "Task title is required.", 400);
      }

      const task = await taskService.createTask(
        userId,
        username,
        title,
        description,
      );
      return successResponse(res, task, "Task created successfully.", 201);
    } catch (err) {
      console.error("Error creating task:", err);
      const message =
        err instanceof Error ? err.message : "Failed to create task.";
      return errorResponse(res, message, 400);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const username = req.user!.username;
      const role = req.user!.role;
      const taskId = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(taskId)) {
        return errorResponse(res, "Invalid task ID.", 400);
      }
      if (!status) {
        return errorResponse(res, "Status is required.", 400);
      }

      const updatedTask = await taskService.updateTaskStatus(
        taskId,
        userId,
        username,
        role,
        status as TaskStatus,
      );
      return successResponse(
        res,
        updatedTask,
        "Task status updated successfully.",
        200,
      );
    } catch (err) {
      console.error("Error updating task status:", err);
      const message =
        err instanceof Error ? err.message : "Failed to update task status.";
      const statusCode = message.includes("not found")
        ? 404
        : message.includes("denied")
          ? 403
          : 400;
      return errorResponse(res, message, statusCode);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const taskId = parseInt(req.params.id);

      if (isNaN(taskId)) {
        return errorResponse(res, "Invalid task ID.", 400);
      }

      await taskService.deleteTask(taskId, userId, role);
      return successResponse(
        res,
        { id: taskId },
        "Task deleted successfully.",
        200,
      );
    } catch (err) {
      console.error("Error deleting task:", err);
      const message =
        err instanceof Error ? err.message : "Failed to delete task.";
      const statusCode = message.includes("not found")
        ? 404
        : message.includes("denied")
          ? 403
          : 500;
      return errorResponse(res, message, statusCode);
    }
  }

  async getLogs(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const username = req.user!.username;
      const role = req.user!.role;
      const taskId = parseInt(req.params.id);

      if (isNaN(taskId)) {
        return errorResponse(res, "Invalid task ID.", 400);
      }

      const logs = await taskService.getTaskAuditLogs(
        taskId,
        userId,
        username,
        role,
      );
      return successResponse(
        res,
        logs,
        "Audit logs retrieved successfully.",
        200,
      );
    } catch (err) {
      console.error("Error fetching task audit logs:", err);
      const message =
        err instanceof Error ? err.message : "Failed to fetch audit logs.";
      const statusCode = message.includes("not found")
        ? 404
        : message.includes("denied")
          ? 403
          : 500;
      return errorResponse(res, message, statusCode);
    }
  }

  async getGlobalLogs(req: Request, res: Response) {
    try {
      const role = req.user!.role;

      const logs = await taskService.getGlobalAuditLogs(role);
      return successResponse(
        res,
        logs,
        "Global audit logs retrieved successfully.",
        200,
      );
    } catch (err) {
      console.error("Error fetching global audit logs:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch global audit logs.";
      const statusCode = message.includes("denied") ? 403 : 500;
      return errorResponse(res, message, statusCode);
    }
  }
}

export const taskController = new TaskController();
