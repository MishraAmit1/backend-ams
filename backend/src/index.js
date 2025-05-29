import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { connectDB } from "./database/db.js";

// load the env variable
dotenv.config();

// validate the env variables
const requiredEnvVars = [
  "MONGODB_URI",
  "PORT",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Error: ${varName} is not defined in environment variables`);
    process.exit(1);
  }
});

// intiliaze the express app
const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARES start
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(helmet());
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";

// routes
app.use("/api/v1/users", userRouter);
app.get("/", async (req, res, next) => {
  res.json({
    message: "Running",
  });
});
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found 404",
    errorMessage: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      error: err.message,
    });
  }
  console.error("Server Error:", err.stack);
  return res.status(500).json({
    message: "Internal Server Error",
    errorMessage: err.message,
  });
});

const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app
      .listen(PORT, () => {
        console.log(`Server is running on PORT ${process.env.PORT}`);
      })
      .on("error", (error) => {
        console.log("Error starting server", error);
        process.exit(1);
      });
  } catch (error) {
    console.log("Error starting server", error);
    process.exit(1);
  }
};
startServer();
