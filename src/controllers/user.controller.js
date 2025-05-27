import { User } from "../models/user.model.js";
import { throwApiError } from "../utils/apiError.js";
import { sendResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { cookieOptions, generateTokens } from "../utils/generateTokens.js";
import { validateUserInput } from "../validation/validateUserInput.js";

export const registerUser = asyncHandler(async (req, res) => {
  // Get data from body
  const { username, email, fullname, password } = req.body;

  // Validate data
  const validationErrors = validateUserInput({
    username,
    email,
    fullname,
    password,
  });
  if (validationErrors.length > 0) {
    throw throwApiError(400, validationErrors.join(", "));
  }
  // user already exsits or not
  const existingUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });
  if (existingUser) {
    throw throwApiError(409, "User with this email or username already exists");
  }
  // agr file wo sab hai toh usko handle karo first multer and then cloudinary

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw throwApiError(400, "Avatar file is missing");
  }
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // Upload to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;
  if (!avatar) {
    throw throwApiError(400, "Failed to upload avatar to Cloudinary");
  }
  // Create user
  try {
    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username,
      username: username.toLowerCase(),
    });
    const createdUser = user.toObject();
    delete createdUser.password;
    delete createdUser.refreshToken;
    return sendResponse(res, 201, createdUser, "User Registered Successfully");
  } catch (error) {
    throw throwApiError(500, "Something went wrong while creating the user");
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw throwApiError(400, "Username or email is required");
  }
  if (!password) {
    throw throwApiError(400, "Password is required");
  }
  try {
    const user = await User.findOne({
      $or: [{ username }, { email: email?.toLowerCase() }],
    });
    console.log("User found:", user ? "Yes" : "No");
    if (!user) {
      throw throwApiError(404, "User does not exist");
    }
    if (!user.isActive) {
      throw throwApiError(403, "Account is deactivated");
    }
    const isPasswordValid = await user.isPasswordCorrect(String(password));
    console.log("Password valid:", isPasswordValid);
    if (!isPasswordValid) {
      throw throwApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);
    console.log("Generated Tokens:", { accessToken, refreshToken });
    const login = user.toObject();
    delete login.password;
    delete login.refreshToken;
    return sendResponse(
      res
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions),
      200,
      {
        user: login,
      },
      "Login SuccessFully"
    );
  } catch (error) {
    console.log("Login Error", error);
    throw throwApiError(
      500,
      `Something went wrong during login: ${error.message}`
    );
  }
});

export const logOutUser = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: { refreshToken: undefined },
      },
      { new: true }
    );

    return sendResponse(
      res
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions),
      200,
      {},
      "User logged out successfully"
    );
  } catch (error) {
    console.error("Logout error:", error);
    throw throwApiError(500, "Something went wrong during logout");
  }
});
