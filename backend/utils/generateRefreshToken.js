import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';

const generateRefreshToken = async (userId) => {
  let token = await jwt.sign(
    { id: userId },
    process.env.SECRET_KEY_ACCESS_TOKEN,
    {
      expiresIn: '7d',
    }
  );

  const updateRefreshToken = await UserModel.updateOne(
    {
      _id: userId,
    },
    { $set: { refresh_token: token } }
  );

  return token;
};

export default generateRefreshToken;
