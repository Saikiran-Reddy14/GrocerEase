import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  try {
    // Get token from cookies or authorization header
    const token =
      req?.cookies?.accessToken ||
      (req?.header?.authorization && req.header.authorization.split(' ')[1]);

    if (!token) {
      return res.status(401).json({
        message: 'Authorization token is missing',
        error: true,
        success: false,
      });
    }

    const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

    req.userId = decode.id;

    next(); // Proceed to the next middleware/handler
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error?.message || 'Internal Server Error',
      error: true,
      success: false,
    });
  }
};

export default auth;
