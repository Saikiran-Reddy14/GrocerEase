import mongoose, { disconnect } from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Enter product name'],
    },
    image: {
      type: [String],
      default: [],
    },
    category: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'category',
      },
    ],
    subCategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'subCategory',
      },
    ],
    unit: {
      type: String,
      default: null,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      validate: {
        validator: function (v) {
          return v <= this.price;
        },
        message: 'Discount cannot exceed the product price',
      },
    },
    description: {
      type: String,
      default: null,
    },
    more_details: {
      type: Object,
      default: {},
    },
    publish: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model('Product', productSchema);

export default ProductModel;
