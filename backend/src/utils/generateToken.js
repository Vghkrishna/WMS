import jwt from 'jsonwebtoken';

/**
 * Sign a JWT for the given user id and role.
 */
const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

export default generateToken;
