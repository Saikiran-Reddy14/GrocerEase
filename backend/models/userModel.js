import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      maxlength: [20, 'Password must be less than or equal to 20 characters'],
    },
    avatar: {
      type: String,
      default: '',
    },
    mobile: {
      type: Number,
      default: null,
    },
    refresh_token: {
      type: String,
      default: '',
    },
    verify_Email: {
      type: Boolean,
      default: false,
    },
    last_login_date: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
    address_details: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'address',
      },
    ],
    shopping_cart: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'cartProduct',
      },
    ],
    orderHistory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'order',
      },
    ],
    forgot_password_otp: {
      type: String,
      default: null,
    },
    forgot_password_expiry: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ['Admin', 'User'],
      default: 'User',
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
