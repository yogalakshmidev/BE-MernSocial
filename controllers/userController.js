import { User } from "../models/userModel.js";
import TryCatch from "../utils/Trycatch.js";
import getDataUrl from "../utils/urlGenerator.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";
import Notification from "../models/notificationModel.js"

export const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.json({
    message: "User Profile details are successful",
    data: user,
  });
});

export const userProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return res.status(400).json({
      message: "No user with its id",
      success: false,
    });
  }

  res.status(200).json({
    message: "User profile details",
    success: true,
    data: user,
  });
});

export const followandUnfollowUser = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);
  const loggedInUser = await User.findById(req.user._id);

  if (!user)
    return res.status(400).json({
      message: "No User with this id",
      success: false,
    });

  if (user._id.toString() === loggedInUser._id.toString())
    return res.status(400).json({
      message: "You can't follow yourself",
      success: false,
    });
  if (user.followers.includes(loggedInUser._id)) {
    const indexFollowing = loggedInUser.followings.indexOf(user._id);
    const indexFollower = user.followers.indexOf(loggedInUser._id);

    loggedInUser.followings.splice(indexFollowing, 1);
    user.followers.splice(indexFollower, 1);

    await loggedInUser.save();
    await user.save();
    // create notification
    const newNotification = new Notification({
      type: "Follow",
      from: loggedInUser._id,
      to: user._id,
    });
    await newNotification.save();
    

    
    res.json({
      message: `${user.name} unfollowed successfully`,
      success: true,
       data: user,
    });

    

    
  } else {
    loggedInUser.followings.push(user._id);
    user.followers.push(loggedInUser._id);

    await loggedInUser.save();
    await user.save();

    // create notification
    const newNotification = new Notification({
      type: "Follow",
      from: loggedInUser._id,
      to: user._id,
    });
    await newNotification.save();

    res.json({
      message: `${user.name} followed successfully`,
      success: true,
      data: user,
    });
  }
});

export const userFollowerandFollowingData = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("followers", "-password")
    .populate("followings", "-password");

  const followers = user.followers;
  const followings = user.followings;

  res.json({
    message: "User's both followers and following details",
    success: true,
    followers,
    followings,
  });
});

export const updateProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name} = req.body;
  if (name) {
    user.name = name;
  }
const file= req.file;
  if (file) {
    const fileUrl = getDataUrl(file);
    await cloudinary.uploader.destroy(user.profilePic.id);
    const myCloud = await cloudinary.uploader.upload(fileUrl.content);
    user.profilePic.id = myCloud.public_id;
    user.profilePic.url = myCloud.secure_url;
  }

  await user.save();
  res.status(200).json({
    message: "Profile Details Updated",
    success: true,
  });
});

export const updatePassword = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  const { oldPassword, newPassword } = req.body;

  const comparePassword = await bcrypt.compare(oldPassword, user.password);

  if (!comparePassword)
    return res.status(400).json({ message: " Wrong Password", success: false });

  user.password = await bcrypt.hash(newPassword, 10);

  await user.save();

  res
    .status(200)
    .json({ message: "password updated successfully", success: true });
});

// export const getAllUsers = TryCatch(async (req,res) => {
//   const users = await User.find().populate({path:"users",select:"name",}).select("-password");

//   res.status(200).json({message:"All Users are displayed",success:true,data:users});

// })
