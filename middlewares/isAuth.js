import {jwt} from 'jsonwebtoken';
import { User } from '../models/userModel.js';

export const isAuth = async(req,res,next)=>{
  try {
    const token = req.cookies.token;

    if(!token)
      return res.status(400).json({message:"Unauthorized", success:false});

    const decodedData = jwt.verify(token,process.env.JWT_SECRET);

    if(!decodedData)
      return res.status(400).json({
    message:"Token Expired", success:false
    })

  req.userId = decodedData.userId;
  console.log("request user id from isAuth",req.userId);
req.user = await User.findById(decodedData.id);
console.log("request  user id by findby method from isAuth",req.userId);

next();
  } catch (error) {
    res.status(500).json({
      message:"Error in Authentication middleware",
      success: false
    })
  }
}