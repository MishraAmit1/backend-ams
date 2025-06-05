import { asyncHandler } from "../utils/asyncHandler.js";
import { Customer } from "../models/customer.model.js";
import { Project } from "../models/project.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendResponse } from "../utils/apiResponse.js";
import { throwApiError } from "../utils/apiError.js";

export const createCustomer = asyncHandler(async (req, res) => {
  // Get data from body
  const { name, email, phone, address, company, notes } = req.body;

  // Validate required fields
  if (!name || !email) {
    throw throwApiError(400, "Name and email are required");
  }

  // Check if customer already exists
  const existingCustomer = await Customer.findOne({
    email: email.toLowerCase(),
  });
  if (existingCustomer) {
    throw throwApiError(409, "Customer with this email already exists");
  }

  // Handle optional logo upload
  const logoLocalPath = req.files?.logo?.[0]?.path;
  const logo = logoLocalPath ? await uploadOnCloudinary(logoLocalPath) : null;
  if (logoLocalPath && !logo?.url) {
    throw throwApiError(400, "Failed to upload logo to Cloudinary");
  }

  // Create customer
  const customer = await Customer.create({
    name,
    email: email.toLowerCase(),
    phone,
    address,
    company,
    notes,
    logo: logo?.url || "",
  });

  sendResponse(res, 201, customer, "Customer created successfully");
});

export const getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({ isActive: true }).select(
    "name email phone company logo"
  );
  sendResponse(res, 200, customers, "Customers fetched successfully");
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).select("-__v");
  if (!customer) {
    throw throwApiError(404, "Customer not found");
  }
  sendResponse(res, 200, customer, "Customer fetched successfully");
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, address, company, notes } = req.body;

  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    throw throwApiError(404, "Customer not found");
  }

  // Check for email conflict
  if (email && email.toLowerCase() !== customer.email) {
    const existingCustomer = await Customer.findOne({
      email: email.toLowerCase(),
    });
    if (existingCustomer) {
      throw throwApiError(409, "Customer with this email already exists");
    }
  }

  // Handle optional logo upload
  const logoLocalPath = req.files?.logo?.[0]?.path;
  const logo = logoLocalPath ? await uploadOnCloudinary(logoLocalPath) : null;
  if (logoLocalPath && !logo?.url) {
    throw throwApiError(400, "Failed to upload logo to Cloudinary");
  }

  // Update fields
  customer.name = name || customer.name;
  customer.email = email ? email.toLowerCase() : customer.email;
  customer.phone = phone || customer.phone;
  customer.address = address || customer.address;
  customer.company = company || customer.company;
  customer.notes = notes || customer.notes;
  if (logo?.url) customer.logo = logo.url;

  await customer.save();
  sendResponse(res, 200, customer, "Customer updated successfully");
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const { action = "soft" } = req.body; // Default to soft delete
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    throw throwApiError(404, "Customer not found");
  }

  if (action === "hard") {
    // Hard delete: Delete customer and all linked projects
    await Project.deleteMany({ customer: req.params.id });
    await customer.deleteOne();
    sendResponse(
      res,
      200,
      null,
      "Customer and associated projects deleted successfully"
    );
  } else if (action === "soft") {
    // Soft delete: Set isActive to false
    customer.isActive = false;
    await customer.save();
    sendResponse(res, 200, null, "Customer deactivated successfully");
  } else {
    throw throwApiError(400, "Invalid action. Use 'hard' or 'soft'");
  }
});
