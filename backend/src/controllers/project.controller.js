import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Project } from "../models/project.model.js";
import { Customer } from "../models/customer.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendResponse } from "../utils/apiResponse.js";
import { throwApiError } from "../utils/apiError.js";

export const createProject = asyncHandler(async (req, res) => {
  // Get data from body
  const {
    title,
    description,
    customer,
    domainName,
    domainStartDate,
    status,
    budget,
  } = req.body;

  // Validate required fields
  if (!title) {
    throw throwApiError(400, "Title is required");
  }

  // Validate customer ID if provided
  if (customer && !mongoose.Types.ObjectId.isValid(customer)) {
    throw throwApiError(400, "Invalid customer ID");
  }

  // Handle optional document upload
  const documentLocalPath = req.files?.document?.[0]?.path;
  const document = documentLocalPath
    ? await uploadOnCloudinary(documentLocalPath)
    : null;
  if (documentLocalPath && !document?.url) {
    throw throwApiError(400, "Failed to upload document to Cloudinary");
  }

  // Create project
  const project = await Project.create({
    title,
    description,
    customer: customer || null, // Allow null for personal projects
    createdBy: req.user._id, // From JWT
    domainName,
    domainStartDate,
    status,
    budget,
    document: document?.url || "",
  });

  sendResponse(res, 201, project, "Project created successfully");
});

export const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ createdBy: req.user._id })
    .populate("customer", "name email")
    .populate("createdBy", "username fullname")
    .select("title domainName status startDate customer document");
  sendResponse(res, 200, projects, "Projects fetched successfully");
});

export const getPersonalProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    customer: null,
    createdBy: req.user._id,
  })
    .populate("createdBy", "username fullname")
    .select("title domainName status startDate document");
  sendResponse(res, 200, projects, "Personal projects fetched successfully");
});

export const getProjectsByCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw throwApiError(400, "Invalid customer ID");
  }

  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw throwApiError(404, "Customer not found");
  }

  const projects = await Project.find({
    customer: customerId,
    createdBy: req.user._id,
  })
    .populate("customer", "name email")
    .populate("createdBy", "username fullname")
    .select("title domainName status startDate document");
  sendResponse(res, 200, projects, "Customer projects fetched successfully");
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("customer", "name email")
    .populate("createdBy", "username fullname");
  if (!project) {
    throw throwApiError(404, "Project not found");
  }
  sendResponse(res, 200, project, "Project fetched successfully");
});

export const updateProject = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    customer,
    domainName,
    domainStartDate,
    status,
    budget,
  } = req.body;

  // Validate customer ID if provided
  if (customer && !mongoose.Types.ObjectId.isValid(customer)) {
    throw throwApiError(400, "Invalid customer ID");
  }

  const project = await Project.findById(req.params.id);
  if (!project) {
    throw throwApiError(404, "Project not found");
  }

  // Handle optional document upload
  const documentLocalPath = req.files?.document?.[0]?.path;
  const document = documentLocalPath
    ? await uploadOnCloudinary(documentLocalPath)
    : null;
  if (documentLocalPath && !document?.url) {
    throw throwApiError(400, "Failed to upload document to Cloudinary");
  }

  // Update fields
  project.title = title || project.title;
  project.description = description || project.description;
  project.customer =
    customer !== undefined ? customer || null : project.customer;
  project.domainName = domainName || project.domainName;
  project.domainStartDate = domainStartDate || project.domainStartDate;
  project.status = status || project.status;
  project.budget = budget || project.budget;
  if (document?.url) project.document = document.url;

  await project.save();
  sendResponse(res, 200, project, "Project updated successfully");
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    throw throwApiError(404, "Project not found");
  }
  await project.deleteOne();
  sendResponse(res, 200, null, "Project deleted successfully");
});
