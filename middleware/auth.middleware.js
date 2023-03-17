const jwt = require("jsonwebtoken");

require("dotenv").config();
module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Auth Error" });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    console.log("User :" + req.user);
    next();
  } catch (e) {
    return res.status(401).json({ message: `${e}` });
  }
};
