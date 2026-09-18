import express from "express";

import { CustomerController } from "./customer.controller.js";

import { permit } from "../../middlewares/permission.middleware.js";
import { validate } from "../../middlewares/validate.js";

import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customer.validation.js";

const router = express.Router();

// Customer dropdown for Meeting Create/Edit
router.get(
  "/dropdown",
  permit("customer:read"),
  CustomerController.dropdown
);

// List customers
router.get(
  "/",
  permit("customer:read"),
  CustomerController.list
);

// Get customer by ID
router.get(
  "/:id",
  permit("customer:read"),
  CustomerController.getById
);

// Create customer
router.post(
  "/",
  permit("customer:create"),
  validate(createCustomerSchema),
  CustomerController.create
);

// Update customer
router.put(
  "/:id",
  permit("customer:update"),
  validate(updateCustomerSchema),
  CustomerController.update
);

// Delete customer
router.delete(
  "/:id",
  permit("customer:delete"),
  CustomerController.remove
);

export default router;