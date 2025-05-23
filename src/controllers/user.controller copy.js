import { User } from "../models/user.model.js";
import { throwApiError } from "../utils/apiError.js";
import { sendResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
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

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { username: username.toLowerCase().trim() },
      { email: email.toLowerCase().trim() },
    ],
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
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
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
    }).select("-password -refreshToken");
    return sendResponse(res, 201, user, "User Registered Successfully");
  } catch (error) {
    if (error.code === 11000) {
      throw throwApiError(
        409,
        "User with this email or username already exists"
      );
    }
    throw throwApiError(500, "Something went wrong while creating the user");
  }
});

export const loginUser = asyncHandler(async () => {
  return sendResponse(res, 201, createUser, "User Registred Successfully");
});

// Remove password and refresh token from response
// const createdUser = await User.findById(user._id).select(
//   "-password -refreshToken"
// );
