import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const isAuth = async (req, res, next) => {
  //   try {
  //     const token = req.cookies.token;

  //     if(!token)
  //       return res.status(400).json({message:"Unauthorized", success:false});

  //     const decodedData = jwt.verify(token,process.env.JWT_SECRET);

  //     if(!decodedData)
  //       return res.status(400).json({
  //     message:"Token Expired", success:false
  //     })
  // req.user = await User.findById(decodedData.id);

  // next();
  //   } catch (error) {
  //     res.status(500).json({
  //       message:"Error in Authentication middleware",
  //       success: false
  //     })
  //   }

  if (!req.headers.authorization)
    return res.status(400).json({ msg: "Not Authorized" });

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if (err) return res.status(400).json({ msg: "Token expired" });
      else {
        req.user = data;
        next();
      }
    });
  }
};
