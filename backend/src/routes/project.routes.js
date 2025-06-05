import express from "express";
import {
  createProject,
  getAllProjects,
  getPersonalProjects,
  getProjectsByCustomer,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create a project (with optional customer and document upload)
router.route("/").post(verifyJWT, createProject);

// Get all projects (external + personal)
router.route("/").get(verifyJWT, getAllProjects);

// Get personal projects (customer: null)
router.route("/personal").get(verifyJWT, getPersonalProjects);

// Get projects for a specific customer
router.route("/customer/:customerId").get(verifyJWT, getProjectsByCustomer);

// Get a specific project by ID
router.route("/:id").get(verifyJWT, getProjectById);

// Update a project
router.route("/:id").patch(verifyJWT, updateProject);

// Delete a project
router.route("/:id").delete(verifyJWT, deleteProject);

export default router;
