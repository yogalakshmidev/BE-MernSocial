import { User } from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import getDataUrl from "../utils/urlGenerator.js";
import bcrypt from "bcrypt";
import TryCatch from "../utils/Trycatch.js";
import { v2 as cloudinary } from "cloudinary";

export const registerUser = TryCatch(async (req, res) => {
  const { name, email, password, gender } = req.body;

  const file = req.file;

  if (!name || !email || !password || !gender || !file) {
    return res.status(400).json({
      message: "Please fill all the fields",
      success: false,
    });
  }
  let user = await User.findOne({ email });

  if (user)
    return res.status(400).json({
      message: "User Already exists",
      success: false,
    });

  const fileUrl = getDataUrl(file);

  const hashPassword = await bcrypt.hash(password, 10);

  const myCloud = await cloudinary.uploader.upload(fileUrl.content);

  user = await User.create({
    name,
    email,
    password: hashPassword,
    gender,
    profilePic: {
      id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  generateToken(user._id, res);

  res.status(201).json({
    message: "User Registration Successfully",
    success: true,
  });
});

export const loginUser = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(400).json({
      message: "No user found with this email id",
      success: false,
    });

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword)
    return res.status(400).json({
      message: "Invalid credentials",
      success: false,
    });

  generateToken(user._id, res);

  res.cookie("token", token, {
    httpOnly: true,
    secure: true, // set to true in production
    sameSite: "None", // if using cross-origin
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    message: "User Logged in successfully",
    success: true,
    data: user,
  });
});

export const logoutUser = TryCatch(async (req, res) => {
  res.cookie("token", "", { maxAge: 0 });

  res.json({
    message: "Logged Out Successfully",
    success: true,
  });
});
