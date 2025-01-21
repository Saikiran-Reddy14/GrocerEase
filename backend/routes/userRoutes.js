import { Router } from 'express';
import {
  registerUser,
  verifyEmailController,
} from '../controllers/userController.js';

const userRouter = Router();

userRouter.post('/register', registerUser);
userRouter.post('/verify-email', verifyEmailController);

export default userRouter;
