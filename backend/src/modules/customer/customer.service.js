import Customer from "./customer.model.js";
import { AppError } from "../../utils/appError.js";
import { deepTransform } from "../../utils/transform.js";

export class CustomerService {
  static _transform(doc) {
    return deepTransform(doc);
  }

  // Create customer
  static async create(payload, user) {
    const customer = await Customer.create({
      ...payload,
      createdBy: user._id,
      updatedBy: user._id,
    });

    return CustomerService._transform(customer.toObject());
  }

  // Update customer
  static async update(id, payload, user) {
    const customer = await Customer.findById(id);

    if (!customer) {
      throw AppError.notFound("Customer not found");
    }

    Object.assign(customer, payload);

    customer.updatedBy = user._id;

    await customer.save();

    return CustomerService._transform(customer.toObject());
  }

  // Get customer
  static async getById(id) {
    const customer = await Customer.findById(id).lean();

    if (!customer) {
      throw AppError.notFound("Customer not found");
    }

    return CustomerService._transform(customer);
  }

  // List customers
  static async list({ page = 1, limit = 20, q = "" }) {
    const filter = {};

    if (q?.trim()) {
      filter.$text = {
        $search: q.trim(),
      };
    }

    const result = await Customer.paginate({
      page: Number(page),
      limit: Number(limit),
      filter,
      sort: { createdAt: -1 },
    });

    return {
      data: result.data.map((customer) =>
        CustomerService._transform(
          customer.toObject
            ? customer.toObject()
            : customer
        )
      ),
      page: result.page,
      totalPages: result.totalPages,
      total: result.total,
    };
  }

  // Delete customer
  static async remove(id, user) {
    const customer = await Customer.findById(id);

    if (!customer) {
      throw AppError.notFound("Customer not found");
    }

    customer.updatedBy = user._id;

    await customer.softDelete();

    return { id };
  }

  // Customer dropdown for Meeting Create/Edit
  static async dropdown() {
    const customers = await Customer.find({})
      .select("_id name companyName contactPerson")
      .sort({ name: 1 })
      .lean();

    return customers.map((customer) =>
      CustomerService._transform(customer)
    );
  }
}