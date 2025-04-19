import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/db.js";
import {v2 as cloudinary} from 'cloudinary';
import cookieParser from "cookie-parser";
import {Chat} from './models/ChatModel.js';
import {User} from "./models/userModel.js"
import {isAuth} from './middlewares/isAuth.js'
import cors from "cors";


// importing routes
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";


dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


const port = process.env.PORT || 7000;

// use middleware
const app = express();
app.use(express.json());
// app.use(cors);
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL , credentials: true }));
// to get all users
app.get("/api/user/all",isAuth,async (req,res) => {
try {
  const search=req.query.search || ""
  const users =  await User.find({
    name:{
      $regex:search,
      $options:"i",
    },
    _id:{$ne:req.user._id},
  }).select("-password");

  res.status(200).json({message:"All user details are displayed", success:true,data: users});
} catch (error) {
  res.status(500).json({
    message: error.message,
  });
}
  
})
// to get all chats of users
app.get("/api/messages/chats",isAuth,async (req,res) => {
  try {
    const chats = await Chat.find({
      users:req.user._id,
    }).populate({
      path:"users",
      select:"name profilePic"
    })

    chats.forEach((e)=>{
      e.users = e.users.filter(
        (user)=>user._id.toString() !== req.user._id.toString())
    });

    res.status(200).json({message:"All chats are displayed", success:true,data:chats})
  } catch (error) {
    res.status(500).json({message:error.message,success:false});
  }
  
});


// using routes
app.use("/api/user",userRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/post",postRoutes);
app.use("/api/messages",messageRoutes);




app.listen(port, () => {
  console.log(`server is running on port no ${port}`);
  connectDB();
});
