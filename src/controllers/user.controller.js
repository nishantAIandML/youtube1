import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullname, email, password } = req.body;
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }
  console.log(req.files);
  const avatarLocalPath = req.files?.avatar?.[0].path;
  const coverLocalPath = req.files?.coverImage?.[0].path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image are required");
  }
  const avatar = await uploadCloudinary(avatarLocalPath);
  //   const cover = await uploadCloudinary(coverLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar image");
  }
  let coverImage = null;
  if (coverLocalPath) {
    coverImage = await uploadCloudinary(coverLocalPath);
  }
  const user = await User.create({
    username: username.toLowerCase(),
    fullname,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage ? coverImage.url : null,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});
export { registerUser };
