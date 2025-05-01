const jwt = require("jsonwebtoken");

const validateRefreshToken = (req, res, next) => {
  try {
    // const { refreshToken } = req.body;

    const refreshToken = req.headers["authorization"]?.split(" ")[1];

    console.log("[REFRESH TOKEN]:", refreshToken);

    if (!refreshToken) {
      return res.status(401).json({status: 404, message: "Refresh token is required." });
    }
    
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({status: 200, message: "Invalid or expired refresh token." });
      }

      req.user = decoded;
      next(); 
    });

  } catch (error) {
    console.error("[ERROR IN REFRESH TOKEN VALIDATION]:", error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};

module.exports = {validateRefreshToken};
