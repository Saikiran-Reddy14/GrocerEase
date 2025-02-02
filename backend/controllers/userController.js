import sendEmail from '../config/sendEmail.js';
import UserModel from '../models/userModel.js';
import bcryptjs from 'bcryptjs';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';
import generateAccessToken from '../utils/generateAccessToken.js';
import generateRefreshToken from '../utils/generateRefreshToken.js';
import uploadImage from '../utils/uploadImage.js';
import generateOtp from '../utils/generateOtp.js';
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js';

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

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: 'Please provide your registered email address.',
        error: true,
        success: false,
      });
    }

    const userExist = await UserModel.findOne({ email });
    if (!userExist) {
      return res.status(400).json({
        message:
          'We could not find an account associated with this email address.',
        error: true,
        success: false,
      });
    }

    const otp = generateOtp();
    const expireTime = new Date(Date.now() + 60 * 60 * 1000);

    const updatedData = await UserModel.findByIdAndUpdate(
      userExist._id,
      {
        $set: {
          forgot_password_otp: otp,
          forgot_password_expiry: new Date(expireTime).toISOString(),
        },
      },
      { new: true }
    );

    await sendEmail({
      sendTo: email,
      subject: 'Password Reset Request from GrocerEase',
      html: forgotPasswordTemplate({
        name: userExist.name,
        otp,
      }),
    });

    return res.json({
      message:
        'A one-time password (OTP) has been sent to your email. Please check your inbox to proceed.',
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error?.message ||
        'Something went wrong while processing your request. Please try again later.',
      error: true,
      success: false,
    });
  }
};

// Verify Otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        message: 'Please provide both your registered email address and OTP.',
        error: true,
        success: false,
      });
    }

    const userExist = await UserModel.findOne({ email });
    if (!userExist) {
      return res.status(400).json({
        message:
          'No account found with the provided email address. Please check and try again.',
        error: true,
        success: false,
      });
    }

    const currentTime = new Date();

    // if otp has expired
    if (new Date(userExist.forgot_password_expiry) < currentTime) {
      return res.status(400).json({
        message: 'Your OTP has expired.',
        error: true,
        success: false,
      });
    }

    // Check if the OTP matches
    if (String(otp) !== String(userExist.forgot_password_otp)) {
      return res.status(400).json({
        message: 'The OTP you entered is incorrect. Please try again.',
        error: true,
        success: false,
      });
    }

    // OTP is correct and not expired
    return res.status(200).json({
      message:
        'Your OTP has been successfully verified. You can now reset your password.',
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error?.message ||
        'Something went wrong while processing your request. Please try again later.',
      error: true,
      success: false,
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message:
          'Please provide an email, a new password, and confirm the password.',
        error: true,
        success: false,
      });
    }

    // Check if the user exists with the provided email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found with the provided email.',
        error: true,
        success: false,
      });
    }

    // check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New password and confirm password must match.',
        error: true,
        success: false,
      });
    }

    await UserModel.findByIdAndUpdate(
      user._id,
      { $set: { password: await bcryptjs.hash(newPassword, 12) } },
      { new: true }
    );

    return res.status(200).json({
      message: 'Password updated successfully.',
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error?.message ||
        'An unexpected error occurred. Please try again later.',
      error: true,
      success: false,
    });
  }
};
