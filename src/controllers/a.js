import { User } from "../models/user.model";
import { throwApiError } from "../utils/apiError";
import { sendResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
const validateUserInput = (userInput) => {
  let errors = [];
  const { username, email, password, fullname } = userInput;
  if (!username?.trim()) errors.push("Username is required");
  if (!email?.trim()) errors.push("Email is required");
  if (!fullname?.trim()) errors.push("fullName is required");
  if (!password?.trim()) errors.push("Password is required");
  return errors;
};
export const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, password, fullname } = req.body;
  let validation = validateUserInput({
    username,
    email,
    password,
    fullname,
  });
  if (validation.length > 0) {
    throw throwApiError(409, validation.join(", "));
  }
  const existingUser = User.findOne({
    $or: [{ username: username.toLowercase() }, { email: email.toLowercase() }],
  });
  if (existingUser) {
    throw throwApiError(
      400,
      "User with this email and username already exista"
    );
  }
  const avatarLocalPath = await req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw throwApiError(400, "Avatar file is missing");
  }
  const coverImageLocalPath = await req.files?.coverIamge?.[0]?.path;
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw throwApiError(400, "Failed to upload avatar to Cloudinary");
  }
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
    const userCreate = user.toObject();
    delete userCreate.password;
    delete userCreate.refreshToken;
    return sendResponse(res, 201, createdUser, "User Registered Successfully");
  } catch (error) {
    throw throwApiError(500, "Something went wrong while creating the user");
  }
});
