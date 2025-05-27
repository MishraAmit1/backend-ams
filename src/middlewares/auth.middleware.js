import { User } from "../models/user.model.js";
import { throwApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const tokenFromCookie = req.cookie?.accessToken;
  const tokenFromHeader = req.header("Authorization").replace("Bearer ", "");
  const token = tokenFromCookie || tokenFromHeader;
  if (!token) {
    throw throwApiError(401, "Access token missing");
  }
  try {
    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodeToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw throwApiError(401, "Invalid access token - User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Authentication error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token format",
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
      });
    } else if (error.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        message: "Access token not active",
      });
    }
  }
});
