const jwt = require("jsonwebtoken");
const { User } = require("../database/index");

async function userMiddleware(req, res, next) {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    console.log("Recieved token:", token);

    if (!token) {
      return res.status(401).json({
        msg: "Unauthorised token",
      });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -accessToken"
    );

    if (!user) {
      return res.status(401).json({
        msg: "Invalid Access Token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      msg: error?.message,
    });
  }
}

module.exports = userMiddleware;
