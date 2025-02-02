import { Router } from 'express';
import {
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  updateUserDetails,
  uploadAvatar,
  verifyEmailController,
  verifyOtp,
  resetPassword,
} from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/multerMiddleware.js';

const userRouter = Router();

userRouter.post('/register', registerUser);
userRouter.post('/verify-email', verifyEmailController);
userRouter.post('/login', loginUser);
userRouter.post('/logout', auth, logoutUser);
userRouter.put('/upload-avatar', auth, upload.single('avatar'), uploadAvatar);
userRouter.put('/update-user', auth, updateUserDetails);
userRouter.put('/forgot-password', forgotPassword);
userRouter.put('/verify-forgot-password-otp', verifyOtp);
userRouter.put('/reset-password', resetPassword);

export default userRouter;
