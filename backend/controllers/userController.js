import sendEmail from '../config/sendEmail.js';
import UserModel from '../models/userModel.js';
import bcryptjs from 'bcryptjs';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';
import generateAccessToken from '../utils/generateAccessToken.js';
import generateRefreshToken from '../utils/generateRefreshToken.js';

// User Register Controller
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

// Email Verification Controller
export const verifyEmailController = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        message: 'Verification code is required',
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(code);

    if (!user) {
      return res.status(404).json({
        message: 'Invalid or expired verification link',
        error: true,
        success: false,
      });
    }

    // Check if already verified
    if (user.verify_Email) {
      return res.status(400).json({
        message: 'Email already verified',
        error: true,
        success: false,
      });
    }

    // Update user status to verified
    const result = await UserModel.updateOne(
      { _id: code },
      { $set: { verify_Email: true } }
    );

    // Check the result of update operation
    if (result.acknowledged && result.modifiedCount === 0) {
      return res.status(400).json({
        message: 'Error verifying email. It may already be verified.',
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: 'Email successfully verified',
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error?.message || 'Internal Server Error',
      error: true,
      success: false,
    });
  }
};

// Login Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User does not exist',
        error: true,
        success: false,
      });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({
        message: 'Account is inactive or suspended. Contact Admin',
        error: true,
        success: false,
      });
    }

    const result = await bcryptjs.compare(password, user.password);

    if (!result) {
      return res.status(401).json({
        message: 'Invalid password',
        error: true,
        success: false,
      });
    }

    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
    };
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      message: 'User logged in successfully',
      data: {
        accessToken,
        refreshToken,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error?.message || 'Internal Server Error',
      error: true,
      success: false,
    });
  }
};
