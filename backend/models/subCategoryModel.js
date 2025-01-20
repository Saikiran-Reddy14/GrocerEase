import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Enter subcategory name'],
    },
    image: {
      type: String,
      default: '',
    },
    category: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'category',
      },
    ],
  },
  { timestamps: true }
);

const SubCategoryModel = mongoose.model('SubCategory', subCategorySchema);

export default SubCategoryModel;
