import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Enter category name'],
      default: null,
      trim: true,
    },
    image: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model('Category', categorySchema);

export default CategoryModel;
