import jwt from "jsonwebtoken";

const generateToken = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  
  res.cookie("token", token, {
    httpOnly: true,
    secure: true, // set to true in production
    sameSite: "None", // if using cross-origin
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // res.cookie("token", token, {
  //   maxAge: 15 * 24 * 60 * 60 * 1000,
  //   httpOnly: true,
  //   sameSite: "strict",
  // });
};

export default generateToken;
