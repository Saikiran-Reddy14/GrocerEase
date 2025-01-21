import sendEmail from '../config/sendEmail.js';
import UserModel from '../models/userModel.js';
import bcryptjs from 'bcryptjs';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required',
        error: true,
        success: false,
      });
    }
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists',
        error: true,
        success: false,
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${newUser?._id}`;

    const verifyEmail = await sendEmail({
      sendTo: email,
      subject: 'Verification email from GrocerEase',
      html: verifyEmailTemplate({
        name,
        url: verifyEmailUrl,
      }),
    });

    res.status(201).json({
      message: 'User registered successfully',
      name,
      email,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Internal Server Error',
      error: true,
      success: false,
    });
  }
};
