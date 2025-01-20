import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    avatar: {
      type: String,
      default: '',
      trim: true,
    },
    mobile: {
      type: Number,
      default: null,
    },
    refresh_token: {
      type: String,
      default: '',
      trim: true,
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
        ref: 'Address',
      },
    ],
    shopping_cart: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'CartProduct',
      },
    ],
    orderHistory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Order',
      },
    ],
    forgot_password_otp: {
      type: String,
      default: null,
      trim: true,
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
