import { Router } from 'express';
import {
  loginUser,
  registerUser,
  verifyEmailController,
} from '../controllers/userController.js';

const userRouter = Router();

userRouter.post('/register', registerUser);
userRouter.post('/verify-email', verifyEmailController);
userRouter.post('/login', loginUser);

export default userRouter;
