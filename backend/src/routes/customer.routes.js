import express from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create a customer (with optional logo upload)
router.route("/").post(verifyJWT, createCustomer);

// Get all customers
router.route("/").get(verifyJWT, getAllCustomers);

// Get a specific customer by ID
router.route("/:id").get(verifyJWT, getCustomerById);

// Update a customer
router.route("/:id").patch(verifyJWT, updateCustomer);

// Delete a customer
router.route("/:id").delete(verifyJWT, deleteCustomer);

export default router;
