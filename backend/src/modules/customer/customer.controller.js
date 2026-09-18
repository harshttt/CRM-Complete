import { ApiResponse } from "../../utils/apiResponse.js";
import { CustomerService } from "./customer.service.js";

export class CustomerController {
  // Create customer
  static async create(req, res, next) {
    try {
      const customer = await CustomerService.create(
        req.body,
        req.user
      );

      return res
        .status(201)
        .json(ApiResponse.success(customer, "Customer created"));
    } catch (error) {
      next(error);
    }
  }

  // Update customer
  static async update(req, res, next) {
    try {
      const customer = await CustomerService.update(
        req.params.id,
        req.body,
        req.user
      );

      return res.json(
        ApiResponse.success(customer, "Customer updated")
      );
    } catch (error) {
      next(error);
    }
  }

  // Get customer by ID
  static async getById(req, res, next) {
    try {
      const customer = await CustomerService.getById(
        req.params.id
      );

      return res.json(
        ApiResponse.success(customer)
      );
    } catch (error) {
      next(error);
    }
  }

  // List customers with pagination/search
  static async list(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        q = "",
      } = req.query;

      const result = await CustomerService.list({
        page: Number(page),
        limit: Number(limit),
        q: q.trim(),
      });

      return res.json(
        ApiResponse.paginated(result)
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete customer
  static async remove(req, res, next) {
    try {
      const result = await CustomerService.remove(
        req.params.id,
        req.user
      );

      return res.json(
        ApiResponse.success(result, "Customer deleted")
      );
    } catch (error) {
      next(error);
    }
  }

  // Customers for Meeting dropdown
  static async dropdown(req, res, next) {
    try {
      const customers = await CustomerService.dropdown();

      return res.json(
        ApiResponse.success(customers)
      );
    } catch (error) {
      next(error);
    }
  }
}