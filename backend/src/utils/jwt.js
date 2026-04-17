const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      branchId: user.branchId
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

module.exports = { generateTokens, verifyToken };
