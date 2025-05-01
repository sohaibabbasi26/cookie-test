const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  console.log("[TOKEN]:",token); 

  if (!token) {
    return res
      .status(401)
      .json({ status: 401, message: "Access Denied, Token Missing." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    console.log("[USER]:", user);
    if (err) {
      return res
        .status(403)
        .json({ status: 403, message: "Invalid or Expired Token!" });
    }
    req.userId = user.id;
    next();
  });
};

module.exports = authenticateJWT;
