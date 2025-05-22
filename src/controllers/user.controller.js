import { User } from "../models/user.model.js";
import { throwApiError } from "../utils/apiError.js";
import { sendResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const registerUser = asyncHandler(async (req, res) => {
  // body se data lana
  const { username, email, fullName, password } = req.body;
  // phir validate karna
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw throwApiError(400, "All fields are required");
  }
  // check karna user pehle se hai to nhi

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw throwApiError(409, "User with this email or username already exits");
  }

  // agr file wo sab hai toh usko handle karo first multer and then cloudinary

  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw throwApiError(400, "Avatar file is required");
  }
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw throwApiError(400, "Avatarrr file is required");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refersToken"
  );
  if (!createdUser) {
    throw throwApiError(500, "Some thing went wrong while creating the user");
  }
  return sendResponse(res, 201, createdUser, "User Registred Successfully");
});

export const loginUser = asyncHandler(async () => {
  return sendResponse(res, 201, createdUser, "User Registred Successfully");
});
