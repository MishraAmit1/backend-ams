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
if (!process.env.MONGODB_URI) {
  console.error("MONGO_URI is not defined in environment variables");
  process.exit(1);
}
if (!process.env.PORT) {
  console.warn("PORT is not defined, defaulting to 5000");
}

// intiliaze the express app
const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARES start
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
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
  throw new Error("Nopeeee");
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
