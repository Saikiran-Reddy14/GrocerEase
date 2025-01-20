import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
      required: [true, 'Enter category name'],
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model('Category', categorySchema);

export default CategoryModel;
