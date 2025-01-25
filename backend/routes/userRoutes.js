import { Router } from 'express';
import {
  loginUser,
  logoutUser,
  registerUser,
  updateUserDetails,
  uploadAvatar,
  verifyEmailController,
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

export default userRouter;
