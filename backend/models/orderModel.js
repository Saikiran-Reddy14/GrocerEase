import mongoose, { mongo } from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    orderId: {
      type: String,
      required: [true, 'Provide Order ID'],
      unique: true,
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
    product_details: {
      name: String,
      image: Array,
    },
    paymentId: {
      type: String,
      default: null,
    },
    payment_status: {
      type: String,
      default: null,
    },
    delivery_address: {
      type: mongoose.Schema.ObjectId,
      ref: 'Address',
    },
    subTotalAmt: {
      type: Number,
      default: 0,
      min: [0, 'Subtotal amount cannot be negative'],
    },
    totalAmt: {
      type: Number,
      default: 0,
      min: [0, 'Total amount cannot be negative'],
    },
    invoice_receipt: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model('Order', orderSchema);

export default OrderModel;
