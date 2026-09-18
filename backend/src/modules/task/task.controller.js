import TaskService from "./task.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { TASK_ENUMS } from "../../constants/task.constants.js";


class TaskController {


  static async getTaskConstants(req, res) {
            return res.json(ApiResponse.success(TASK_ENUMS, "Task constants fetched successfully"));
  }


  static async create(req, res, next) {
    try {
      const task = await TaskService.create(req.body, req.user);
      res.json(ApiResponse.success(task, "Task created"));
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const task = await TaskService.update(req.params.id, req.body, req.user);
      res.json(ApiResponse.success(task, "Task updated"));
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const result = await TaskService.list({
        page: req.query.page,
        limit: req.query.limit,
        filters: req.query,
        requester: req.user,
      });

      const paginatedResponse = ApiResponse.paginated(result, "Tasks fetched");

      const response = {
        ...paginatedResponse,
        completed: result.completed ?? 0,
        pending: result.pending ?? 0,
        reminderPending: result.reminderPending ?? 0,
      };
      return res.status(200).json(response);

      // res.json(ApiResponse.paginated(result, "Tasks fetched"));
    } catch (err) {
      next(err);
    }
  }

  static async softDelete(req, res, next) {
    try {
      const { id } = req.params;

      await TaskService.softDelete(id, req.user);
      res.json(ApiResponse.success(null, "Task deleted"));
    } catch (err) {
      next(err);
    }
  }

  static async complete(req, res, next) {
    try {
      const task = await TaskService.markCompleted(req.params.id, req.user);
      res.json(ApiResponse.success(task, "Task completed"));
    } catch (err) {
      next(err);
    }
  }
}

export default TaskController;
