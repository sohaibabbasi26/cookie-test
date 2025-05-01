const jwt = require('jsonwebtoken'); 

const isAdmin = (req, res, next) => {


  console.log("[Request]:", req.cookies.accessToken)
  const token = req.cookies.accessToken;  
  // const token = req?.cookies.accessToken;
  // console.log("[request]:",req);

  if (!token) {
    return res.status(401).json({  status: 403, message: 'Access Denied. Token missing.'  });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    if (decoded.user_type === 'Admin') {

      req.user = decoded; 
      return next();
    } else {
      return res.status(403).json({ status: 403, message: 'Unauthorized Access.' });
    }
  } catch (error) {
    console.error('JWT error:', error);
    return res.status(403).json({ status: 403, message: 'Invalid or expired token.' });
  }
};

module.exports = {isAdmin};
