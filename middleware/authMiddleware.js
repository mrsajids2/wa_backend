const jwt = require("jsonwebtoken");
const User = require("../models/User");
const response = require("../utils/responseManager");

module.exports = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return response.forbidden(res, "No token provided");

  try {
    const decoded = jwt.verify(token, process.env.JWTTOKEN);
    console.log(decoded);

    const user = await User.find({ email: decoded.email }).select("-password");
    if (!user) return response.notFound(res, "User not found");

    req.user = user[0]; // <== IMPORTANT
    next();
  } catch {
    response.unauthorized(res, "Invalid token");
  }
};
