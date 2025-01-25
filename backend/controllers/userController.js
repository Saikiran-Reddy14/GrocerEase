import sendEmail from '../config/sendEmail.js';
import UserModel from '../models/userModel.js';
import bcryptjs from 'bcryptjs';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';
import generateAccessToken from '../utils/generateAccessToken.js';
import generateRefreshToken from '../utils/generateRefreshToken.js';
import uploadImage from '../utils/uploadImage.js';

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

    if (!email || !password) {
      return res.status(400).json({
        message: 'All the fields are required',
        error: true,
        success: false,
      });
    }
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

// Logout Controller
export const logoutUser = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
    };
    const userId = req.userId;
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    const removeRefreshToken = await UserModel.findByIdAndUpdate(userId, {
      $set: { refresh_token: '' },
    });

    return res.status(200).json({
      message: 'User logged out',
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error?.message || error,
      error: true,
      success: false,
    });
  }
};

// Upload User Avatar
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.userId;
    const image = req.file;

    if (!image) {
      return res.status(400).json({
        message: 'No image file uploaded',
        error: true,
        success: false,
      });
    }

    const upload = await uploadImage(image);

    const updateUserAvatar = await UserModel.findByIdAndUpdate(userId, {
      $set: { avatar: upload.url },
    });

    return res.status(200).json({
      message: 'Avatar uploaded successfully',
      data: {
        _id: userId,
        avatar: upload.url,
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

// Update User Details
export const updateUserDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: true,
        success: false,
      });
    }

    const updatedData = {};

    // Compare fields and update only if they are different
    if (req.body.password) {
      const isPasswordMatch = await bcryptjs.compare(
        req.body.password,
        user.password
      );
      if (!isPasswordMatch) {
        const hashedPassword = await bcryptjs.hash(req.body.password, 12);
        updatedData.password = hashedPassword;
      }
    }

    if (req.body.name && req.body.name !== user.name) {
      updatedData.name = req.body.name;
    }
    if (req.body.email && req.body.email !== user.email) {
      updatedData.email = req.body.email;
    }
    if (req.body.mobile && req.body.mobile !== user.mobile) {
      updatedData.mobile = req.body.mobile;
    }

    // If no fields are updated, return a message
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        message: 'No changes detected to update',
        error: true,
        success: false,
      });
    }

    const updatedUser = await UserModel.updateOne(
      { _id: userId },
      { $set: updatedData },
      { new: true }
    );

    return res.status(200).json({
      message: 'User details updated successfully',
      error: false,
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error?.message || 'Internal Server Error',
      error: true,
      success: false,
    });
  }
};
