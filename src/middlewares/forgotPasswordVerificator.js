const jwt = require("jsonwebtoken");

const verifyResetToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      status: 403,
      message: "No token provided.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    console.log("[Verification error]:",err);
    if (err) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized or token expired.",
      });
    }

    req.user = decoded;
    next();
  });
};

module.exports = verifyResetToken;
