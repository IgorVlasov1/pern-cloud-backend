const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Auth Error" });
    }
    const decoded = jwt.verify(token, "mern-secret-key");
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: `${e}` });
  }
};
